# Handler的共享和并发安全性

服务端为Channel设置pipeline的时候，可以选择设置共享的还是Channel独有的。

```java
private void start() throws InterruptedException {
        final MsgCountHandler msgCountHandler = new MsgCountHandler();
        //线程组
        EventLoopGroup boss = new NioEventLoopGroup();
        EventLoopGroup work = new NioEventLoopGroup();

        ServerBootstrap serverBootstrap = new ServerBootstrap();
        try {
            //父子EventLoop
            serverBootstrap.group(boss,work)
                    //指定使用NIO的通信模式
                    .channel(NioServerSocketChannel.class)
                    .localAddress(new InetSocketAddress(port))
                    //设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {
                            //为每个Channel添加一个共享的Handler
                            socketChannel.pipeline().addLast(msgCountHandler);
                            socketChannel.pipeline().addLast(new EchoServceHandler());
                        }
                    });
            //异步绑定到服务器，sync()会阻塞到完成
            ChannelFuture sync = serverBootstrap.bind().sync();
            //阻塞当前线程，直到服务器的ServerChannel被关闭
            sync.channel().closeFuture().sync();
        } finally {
            boss.shutdownGracefully().sync();
            work.shutdownGracefully().sync();
        }
    }
```

### 实现共享ChannelHandler

添加注解 `@ChannelHandler.Sharable`，在设置pipline的时候，

注意不要 new Handler，而实要添加相同的 Handler，即可实现共享。

> 共享 Handler 要注意线程安全问题。
> 

```java
@ChannelHandler.Sharable
@Slf4j
//能同时处理入站和出战数据
public class MsgCountHandler extends ChannelDuplexHandler {

    /**
     * 多eventLoop共享，注意线程安全
     */
    private AtomicLong inCount = new AtomicLong(0);
    private AtomicLong outCount = new AtomicLong(0);

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        log.info("收到报文总数："+inCount.incrementAndGet());
        super.channelRead(ctx, msg);
    }

    @Override
    public void flush(ChannelHandlerContext ctx) throws Exception {
        log.info("发出报文总数："+outCount.incrementAndGet());
        super.flush(ctx);
    }

}
```