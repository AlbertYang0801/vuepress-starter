# 基于netty实现RPC

## 源码地址

[Albert.Yang/JavaAdvance](https://gitee.com/zztiyjw/JavaAdvance/tree/master/moudle-netty/rpc-netty-server)

## 服务端

### ServerBootstrap

```java
@Service
@Slf4j
public class RpcServerFrame implements Runnable {

    @Autowired
    private ServerInit serverInit;

    private EventLoopGroup bossGroup = new NioEventLoopGroup();
    private EventLoopGroup workGroup = new NioEventLoopGroup();

    private void bind() throws InterruptedException {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap.group(bossGroup, workGroup)
                .channel(NioServerSocketChannel.class)
                .childHandler(serverInit)
                //等待建联的 socket 队列长度
                .option(ChannelOption.SO_BACKLOG, 1024);

        serverBootstrap.bind(NettyConstant.SERVER_PORT).sync();
        log.info("网络服务已准备好，可以进行业务操作了....... :  {}:{} ", NettyConstant.SERVER_IP, NettyConstant.SERVER_PORT);
    }

    /**
     * 类销毁关闭 netty 的 eventLoopGroup
     *
     * @throws InterruptedException
     */
    @PreDestroy
    public void stop() throws InterruptedException {
        bossGroup.shutdownGracefully().sync();
        workGroup.shutdownGracefully().sync();
    }

    @Override
    public void run() {
        try {
            bind();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void start() {
        // 改为注解扫描统一注册类名
//        registerService.regRemote(SendSms.class.getName(), SendSmsImpl.class);
        //开启服务
        ThreadUtil.newSingleExecutor().execute(this);
    }

}
```

### ChannelInitializer

```java
@Component
public class ServerInit extends ChannelInitializer<SocketChannel> {

    @Autowired
    ServerBusiHandler serverBusiHandler;

    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {

        socketChannel.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));

        //1.解决粘包半包
        //包最大长度、包长度字段偏移量、包长度字段的长度、长度的修正值、丢弃的长度数量、是否快速失败-true
        socketChannel.pipeline().addLast("frameDecoder",new LengthFieldBasedFrameDecoder(65535,
                0,2,0,2));
        //在发送消息之前向消息的开头添加长度字段，确定消息边界
        //处理器会将消息的原始内容前面附加一个2字节的长度字段，这两个字节用来表示后续消息体的长度
        socketChannel.pipeline().addLast("frameEncoder",new LengthFieldPrepender(2));

        //序列化，将消息实体转换为字节数组准备进行网络传输
        socketChannel.pipeline().addLast("MessageEncoder",new KryoEncoder());
        //反序列化
        socketChannel.pipeline().addLast("MessageDecoder",new KryoDecoder());

        //处理心跳超时，超时会抛出异常ReadTimeoutException
        socketChannel.pipeline().addLast(new ReadTimeoutHandler(50));

        //登录认证
        socketChannel.pipeline().addLast(new LoginAuthRespHandler());
        //心跳
        socketChannel.pipeline().addLast(new HeartBeatRespHandler());
        //业务处理
        //需要添加一个共享的 Handler
        socketChannel.pipeline().addLast(serverBusiHandler);
    }

}
```

### ServerBusiHandler

基于反射处理调用 RPC 的逻辑

```java
@Slf4j
@Service
@ChannelHandler.Sharable //实现共享
public class ServerBusiHandler extends SimpleChannelInboundHandler<MyMessage> {

    @Autowired
    RegisterService registerService;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, MyMessage msg) throws Exception {
        //基于反射处理 rpc 调用的逻辑
        log.info("netty server receiver msg:{}", msg);

        //反射调用对应接口
        HashMap<String, Object> bodyMap = (HashMap<String, Object>) msg.getBody();

        //className、methodName、paramType、param
        String className = bodyMap.get("className").toString();
        String methodName = bodyMap.get("methodName").toString();
        Class<?>[] parmTypes = (Class<?>[]) bodyMap.get("paramType");
        Object[] args = (Object[]) bodyMap.get("param");

        //获取 class
        Class localService = registerService.getLocalService(className);
        if (localService == null) {
            throw new ClassNotFoundException(localService + " Not Found");
        }
        Method method = localService.getMethod(methodName, parmTypes);
        //使用当前实例仅需反射调用
        Object result = method.invoke(localService.newInstance(), args);

        MyMessage respMessage = buildRespMsg(msg, result);
        ctx.writeAndFlush(respMessage);
    }

    private MyMessage buildRespMsg(MyMessage reqMessage, Object result) {
        MsgHeader reqHeader = reqMessage.getMsgHeader();

        MyMessage respMsg = new MyMessage();
        MsgHeader respHeader = new MsgHeader();
        respHeader.setSessionID(reqHeader.getSessionID());
        respHeader.setType(MessageType.SERVICE_RESP.value());
        respMsg.setMsgHeader(respHeader);
        respMsg.setBody(result);
        return respMsg;
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + " 主动断开了连接!");
    }

}
```

### processAnnotatedBeans

通过扫描自定义注解将提供远程服务的接口添加到缓存中。

```java
    /**
     * 扫描注解，自动加载 RpcServerInterface
     */
    @PostConstruct
    public void processAnnotatedBeans() {
        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String beanDefinitionName : beanDefinitionNames) {
            MyRpcServer myRpcServer = applicationContext.findAnnotationOnBean(beanDefinitionName, MyRpcServer.class);
            if (myRpcServer != null) {
                Class<?> type = applicationContext.getType(beanDefinitionName);
                log.info("register service cache {}:{}", myRpcServer.className(), type.getName());
                //添加远程服务方法到本地缓存
                if (SERVICE_CACHE.containsKey(myRpcServer.className())) {
                    throw new RuntimeException("rpcMethod className Cannot be repeated! className:" + myRpcServer.className());
                }
                SERVICE_CACHE.put(myRpcServer.className(), type);
            }
        }
    }
```

```java
@MyRpcServer(className = "sendMail")
public interface SendMail {

    boolean sendMail(UserInfo userInfo);

}

```

## 客户端

### Bootstrap

```java
@Slf4j
@Service
public class RpcClientFrame implements Runnable {

    private EventLoopGroup group = new NioEventLoopGroup();
    private Channel channel;

    //负责重连的线程池
    private ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);

    /*是否用户主动关闭连接的标志值*/
    private volatile boolean userClose = false;
    /*连接是否成功关闭的标志值*/
    private volatile boolean connected = false;

    private volatile AtomicLong retryConnectCount = new AtomicLong(0);

    private int maxRetry = 2;

    @Autowired
    private ClientInit clientInit;

    public void connect(String host, int port) throws InterruptedException {
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .handler(clientInit);
            ChannelFuture future = bootstrap.connect(new InetSocketAddress(host, port)).sync();
            log.info("已经连接服务器");
            channel = future.sync().channel();
            //连接成功后通知等待线程，连接已经建立
            synchronized (this) {
                this.connected = true;
                //通知业务client
                this.notifyAll();
            }
            future.channel().closeFuture().sync();
        } finally {
            //非用户主动关闭，说明发生了网络问题，需要进行重连操作*
            if (!userClose) {
                log.info("发现异常，可能发生了服务器异常或网络问题，准备进行重连......");
//                long andIncrement = retryConnectCount.getAndIncrement();
//                if (andIncrement > maxRetry) {
//                    log.warn("达到最大重试次数 {}，放弃连接!", maxRetry);
//                    retryConnectCount.set(0);
//                } else {
                    executor.execute(() -> {
                        try {
                            TimeUnit.SECONDS.sleep(3);
                            //重连
                            connect(NettyConstant.SERVER_IP, NettyConstant.SERVER_PORT);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    });
//                }
            } else {
                //正常关闭，不需要通知，改状态即可
                channel = null;
                group.shutdownGracefully().sync();
                this.connected = false;
//                synchronized (this) {
//                    this.connected = false;
//                    this.notifyAll();
//                }
            }
        }
    }

    @Override
    public void run() {
        try {
            connect(NettyConstant.SERVER_IP, NettyConstant.SERVER_PORT);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void close() {
        userClose = true;
        channel.close();
    }

    public boolean isConnected() {
        return connected;
    }

    @PostConstruct
    public void startNetty() throws InterruptedException {
        ThreadUtil.newSingleExecutor().execute(this);
        //等待其余线程断开连接
        while (!this.isConnected()) {
            synchronized (this) {
                //手动唤醒
                this.wait();
            }
        }
        log.info("网络通信已准备好，可以进行业务操作了........");
    }

    @PreDestroy
    public void stopNetty() {
        log.info("PreDestory销毁客户端");
        close();
    }

}
```

### ChannelInitializer

```java
@Service
public class ClientInit extends ChannelInitializer<SocketChannel> {

    @Autowired
    ClientBusiHandler clientBusiHandler;

    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        socketChannel.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));

        //1.解决粘包半包
        //包最大长度、包长度字段偏移量、包长度字段的长度、长度的修正值、丢弃的长度数量、是否快速失败-true
        socketChannel.pipeline().addLast("frameDecoder",new LengthFieldBasedFrameDecoder(65535,
                0,2,0,
                2));
        //在发送消息之前向消息的开头添加长度字段，确定消息边界
        //处理器会将消息的原始内容前面附加一个2字节的长度字段，这两个字节用来表示后续消息体的长度
        socketChannel.pipeline().addLast("frameEncoder",new LengthFieldPrepender(2));

        //序列化，将消息实体转换为字节数组准备进行网络传输
        socketChannel.pipeline().addLast("MessageEncoder",new KryoEncoder());
        //反序列化
        socketChannel.pipeline().addLast("MessageDecoder",new KryoDecoder());

        //处理心跳超时，超时会抛出异常ReadTimeoutException
        socketChannel.pipeline().addLast(new ReadTimeoutHandler(10));

        //登录认证
        socketChannel.pipeline().addLast(new LoginAuthReqHandler());
        //心跳
        socketChannel.pipeline().addLast(new HeartBeatReqHandler());

        //业务处理
        socketChannel.pipeline().addLast(clientBusiHandler);
    }

}
```

### ClientBusiHandler

1. 利用 BolckQueue 实现调用服务端时**同步**。

```java
@Slf4j
@Service
@ChannelHandler.Sharable
public class ClientBusiHandler extends SimpleChannelInboundHandler<MyMessage> {

    private ChannelHandlerContext ctx;

    private final ConcurrentHashMap<Long, BlockingQueue<Object>> respMap = new ConcurrentHashMap<>();

    /**
     * 当初始化该 Handler 时执行该方法
     *
     * @param ctx
     * @throws Exception
     */
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        super.handlerAdded(ctx);
        this.ctx = ctx;
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, MyMessage msg) throws Exception {
        log.info("业务应答消息：" + msg.toString());
        if (msg.getMsgHeader() != null && msg.getMsgHeader().getType() == MessageType.SERVICE_RESP.value()) {
            MsgHeader msgHeader = msg.getMsgHeader();
            long sessionId = msgHeader.getSessionID();
            //应答消息时候添加到 queue，实现请求远程服务的同步
            BlockingQueue<Object> blockingQueue = respMap.get(sessionId);
            blockingQueue.put(msg.getBody());
        }
    }

    /**
     * 实现同步
     * 1.调用远程服务
     * 2.同步等待响应，利用 BlockQueue，等待 Netty 的 resp 结果写入 BlockQueue。
     *
     * @param message
     * @return
     * @throws InterruptedException
     */
    public Object send(Object message) throws InterruptedException {
        if (ctx.channel() == null || !ctx.channel().isActive()) {
            throw new IllegalStateException("和服务器还未未建立起有效连接！请稍后再试！！");
        }
        MyMessage myMessage = new MyMessage();

        MsgHeader msgHeader = new MsgHeader();
        msgHeader.setType(MessageType.SERVICE_REQ.value());
        Random r = new Random();
        long sessionId = r.nextLong() + 1;
        msgHeader.setSessionID(sessionId);

        myMessage.setMsgHeader(msgHeader);
        myMessage.setBody(message);
        //利用 BlockQueue 实现同步
        BlockingQueue<Object> blockingQueue = new ArrayBlockingQueue<>(1);
        respMap.put(sessionId, blockingQueue);
        ctx.writeAndFlush(myMessage);

        //阻塞等待响应结果，channelRead处理返回数据的时候，添加到 Queue
        return blockingQueue.poll(10,TimeUnit.SECONDS);
    }

}
```

### 接口动态代理

通过 ImportBeanDefinitionRegistrar 的方式对接口类进行扫描。

1. 基于自定义注解扫描类。
2. 对类进行动态代理。
3. 将动态代理后的类注册到 Spring 容器中。

```java
@Component
@Slf4j
public class RpcClientsRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware, EnvironmentAware {

    private ResourceLoader resourceLoader;

    private Environment environment;

    @Autowired
    ApplicationContext applicationContext;

    /**
     * 实现ImportBeanDefinitionRegistrar的方法，在配置类 import 时生效
     *
     * @param importingClassMetadata
     * @param registry
     * @param importBeanNameGenerator
     */
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry, BeanNameGenerator importBeanNameGenerator) {
        registerRpcClients(importingClassMetadata, registry);
    }

    public void registerRpcClients(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        //资源加载器，扫描包
        ClassPathScanningCandidateComponentProvider scanner = getScanner();
        scanner.setResourceLoader(this.resourceLoader);
        //扫描类路径
        Set<String> basePackages = getBasePackages(metadata);
        //扫描指定注解
        AnnotationTypeFilter annotationTypeFilter = new AnnotationTypeFilter(MyRpcClient.class);
        scanner.addIncludeFilter(annotationTypeFilter);

        for (String basePackage : basePackages) {
            //获取当前包下符合条件的BeanDefinition
            Set<BeanDefinition> candidateComponents = scanner.findCandidateComponents(basePackage);
            for (BeanDefinition bean : candidateComponents) {
                try {
                    //获取接口Class
                    Class<?> clazz = Class.forName(bean.getBeanClassName());
                    //必须是接口加 MyRpcClient 注解
                    if (clazz.isInterface() && clazz.isAnnotationPresent(MyRpcClient.class)) {
                        // 获取注解
                        MyRpcClient annotation = clazz.getAnnotation(MyRpcClient.class);
                        log.info(" MyRpcClient 接口名 {} 加载进来 {}", clazz.getName(), annotation.value());
                        //加到 Spring 容器
                        BeanDefinitionBuilder beanDefinitionBuilder =
                                //动态代理
                                BeanDefinitionBuilder.genericBeanDefinition(clazz, () -> getRemoteProxyObject(clazz, annotation.value()));
                        beanDefinitionBuilder.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
                        BeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();
                        //注册单例bean
                        registry.registerBeanDefinition(annotation.value(), beanDefinition);
                    }
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    protected ClassPathScanningCandidateComponentProvider getScanner() {
        return new ClassPathScanningCandidateComponentProvider(false, this.environment) {
            @Override
            protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
                boolean isCandidate = false;
                if (beanDefinition.getMetadata().isIndependent()) {
                    if (!beanDefinition.getMetadata().isAnnotation()) {
                        isCandidate = true;
                    }
                }
                return isCandidate;
            }
        };
    }

    protected Set<String> getBasePackages(AnnotationMetadata importingClassMetadata) {
        Set<String> basePackages = new HashSet<>();
        //EnableRpcClients 类路径
        basePackages.add(ClassUtils.getPackageName(importingClassMetadata.getClassName()));
        return basePackages;
    }

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    /**
     * 对接口进行动态代理
     * 最终调用实现了 InvocationHandler 的 DynProxy 类
     *
     * @param serviceInterface
     * @param <T>
     * @return
     */
    public <T> T getRemoteProxyObject(final Class<?> serviceInterface, String annotationValue) {
        return (T) Proxy.newProxyInstance(serviceInterface.getClassLoader(), new Class<?>[]{serviceInterface},
                new DynProxy(annotationValue));
    }

}
```

动态代理类，在这里**进行远程服务调用的逻辑**。

```java
public class DynProxy implements InvocationHandler {

    private final String annotationValue;

    public DynProxy(String annotationValue) {
        this.annotationValue = annotationValue;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //组装 body
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("className", annotationValue);
        dataMap.put("methodName", method.getName());
        dataMap.put("paramType", method.getParameterTypes());
        dataMap.put("param", args);
        //调用远程服务
        //懒加载模式
        return SpringUtil.getBean(ClientBusiHandler.class).send(dataMap);
    }

}
```