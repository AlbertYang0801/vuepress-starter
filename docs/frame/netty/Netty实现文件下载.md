# Netty实现文件下载

[实例：如何使用 Netty 下载文件_channelhandlercontext下载文件-CSDN博客](https://blog.csdn.net/cj_csdn326/article/details/44916427?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-44916427-blog-103705185.235%5Ev43%5Epc_blog_bottom_relevance_base7&spm=1001.2101.3001.4242.1&utm_relevant_index=3)

### ChannelHandler

自定义 ChannelHandler ，用来处理 Channel 里面的事件，写数据处理逻辑的。

- ChannelInboundHandlerAdapter
- SimpleChannelInboundHandler
    
    是 ChannelInboundHandlerAdapter 的子类，能够指定类型。
    

Netty 里面预设了很多 ChannelHandler

```java
ch.pipeline().addLast("decoder",new HttpRequestDecoder());
ch.pipeline().addLast("encoder",new HttpResponseEncoder());
ch.pipeline().addLast("inflater",new HttpContentCompressor());
ch.pipeline().addLast("deflater",new HttpContentDecompressor());
ch.pipeline().addLast("aggregator", new HttpObjectAggregator(10*1024*1024));
//文件下载需要用到该 ChannelHandler，用来处理chunked类型请求
ch.pipeline().addLast("http-chunked", new ChunkedWriteHandler());
```

> 下载文件用到了 ChunkedWriteHandler
> 

```java
@ChannelHandler.Sharable
public class BootNettyChannelInboundHandlerAdapter extends SimpleChannelInboundHandler<FullHttpRequest> {

    private FullHttpRequest request;

    @Override
    protected void channelRead0(ChannelHandlerContext channelHandlerContext, FullHttpRequest fullHttpRequest) throws Exception {
        //处理进来的网络数据
        this.request = fullHttpRequest;
        System.out.println("请求进来了");
        String uri = request.uri();
        if (uri.contains("down")) {
            downloadFile(channelHandlerContext);
        }
    }

    /*连接建立以后*/
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(Unpooled.copiedBuffer(
                "Hello Netty", CharsetUtil.UTF_8));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause)
            throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

    @SneakyThrows
    public void downloadFile(ChannelHandlerContext ctx) {
        String path = "D:\\IdeaWorkSpace\\JavaAdvanced\\netty-practice\\file\\test.txt";
        File file = new File(path);
        RandomAccessFile raf;
        raf = new RandomAccessFile(file, "r");
        long fileLength = raf.length();

        HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        HttpUtil.setContentLength(response, fileLength);
        //设置请求头部
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/octet-stream; charset=UTF-8");
        response.headers().add(HttpHeaderNames.CONTENT_DISPOSITION,
                "attachment; filename=\"" + URLEncoder.encode(file.getName(), "UTF-8") + "\";");
        ctx.write(response);

        // Write the content.
        ChannelFuture sendFileFuture;
        sendFileFuture = ctx.writeAndFlush(new HttpChunkedInput(new ChunkedFile(raf, 0, fileLength, 8192)),ctx.newProgressivePromise());

        sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture future, long progress, long total) {
                if (total < 0) { // total unknown
                    System.err.println(future.channel() + " Transfer progress: " + progress);
                } else {
                    System.err.println(future.channel() + " Transfer progress: " + progress + " / " + total);
                }
            }

            @Override
            public void operationComplete(ChannelProgressiveFuture future) {
                System.err.println(future.channel() + " Transfer complete.");
            }
        });

        //刷新缓冲区数据，文件结束标志符
        ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
    }

}
```

```java
public class HttpDataHandlerAdapter extends ChannelInboundHandlerAdapter{
    private static final Logger logger = LogManager.getLogger(HttpDataHandlerAdapter.class);
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        //判断类型，然后强转
        if(msg instanceof FullHttpRequest){
            FullHttpRequest req = (FullHttpRequest)msg;
            try {
                String uri = req.getUri();
                ByteBuf buf = req.content();
                byte[] reqBody = new byte[buf.readableBytes()];
                buf.readBytes(reqBody);

                FullHttpResponse resp;
                HttpHeaders headers = req.headers();
                String contentType = headers.get("Content-Type");

                if (StringUtils.isNotBlank(uri) && uri.contains(Constants.downLoadFile)) {
                    logger.info("获取请求url:{},headers:{}", uri, headers);
                    downloadFile(ctx, uri);
                    return;
                }
                if (StringUtils.isNotBlank(uri) && uri.contains(Constants.detectDownLoadFile)) {
                    logger.info("获取请求url:{},headers:{}", uri, headers);
                    detectTask(ctx, uri);
                    return;
                }
                HttpDataHandler handler = HttpDataHandlerFactory.getHandlerByContentType(contentType);
                if (handler==null){
                    logger.warn("Receiver a HttpMessage from endpoint:{},contentType{},but No Handler can process this",uri,contentType);
                    resp = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,HttpResponseStatus.UNSUPPORTED_MEDIA_TYPE);
                }else{
                    Boolean ok = handler.processHttpDataAsync(uri,reqBody,headers);
                    if (!ok) {
                        resp = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,
                                HttpResponseStatus.TOO_MANY_REQUESTS);
                    } else {
                        resp = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,
                                HttpResponseStatus.OK);
                    }
                }
                // close channel
                ctx.writeAndFlush(resp).addListener(ChannelFutureListener.CLOSE);
            } catch (Exception e) {
                logger.info("发生异常:" + e.getMessage());
            } finally {
                req.release();
            }
        }
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) { // (4)
        // 当出现异常就关闭连接
        logger.warn("Handler Http Message Failed! exception:\n{}",cause);
        ctx.close();
    }

    private void downloadFile(ChannelHandlerContext ctx, String uri) throws IOException {
        HttpResponse resp;
        String filePath = uri.split("path=")[1];
        Integer index = filePath.lastIndexOf("/");
        String fileName = filePath.substring(index + 1);
        String path = Configuration
                .FILE_UPLOAD_PATH + filePath;
        File file = new File(CleanPathUtil.cleanString(path));

        if (!file.exists()) {
            logger.error("未找到指定文件：{}", path);
            resp = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST);
            ctx.writeAndFlush(resp).addListener(ChannelFutureListener.CLOSE);
        }

        RandomAccessFile raf = new RandomAccessFile(file, "r");
        long fileLength = raf.length();
        resp = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
                HttpResponseStatus.OK);
        resp.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);
        resp.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/octet-stream");
        resp.headers().set(HttpHeaderNames.CONTENT_DISPOSITION, "attachment;filename=\"" + URLEncoder.encode(fileName, "UTF-8") + "\";");
        ctx.write(resp);
        ChannelFuture sendFileFuture = ctx.write(new HttpChunkedInput(new ChunkedFile(raf, 0, fileLength, 8192)), ctx.newProgressivePromise());
        sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture channelProgressiveFuture, long progress, long total) throws Exception {
                if (total < 0) {
                    logger.info("file {} transfer progress: ", progress);
                } else {
                    logger.info("file transfer progress: {}/{}", progress, total);
                }
            }

            @Override
            public void operationComplete(ChannelProgressiveFuture channelProgressiveFuture) throws Exception {
                System.out.println("文件传输完成");
                raf.close();
            }
        });
        ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
    }
    private void detectTask(ChannelHandlerContext ctx, String uri) throws IOException {
        String fileName = uri.split("key=")[1];

        String dateStr;

        try {
            String yyMMdd = fileName.split("\\.")[4];
            dateStr = "20" + yyMMdd.substring(0, 6) + "/";
        } catch (Exception exception) {
            logger.error("detect 文件命名不正确;准备返回空,fileName={}", fileName);
            HttpResponse resp = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST);
            ctx.writeAndFlush(resp).addListener(ChannelFutureListener.CLOSE);
            return;
        }

        String path = Configuration.FILE_UPLOAD_PATH + dateStr + fileName + ".log";

        logger.info("start HttpDataHandlerAdapter.detectTask download or see  => file path :{}", path);

        File file = new File(CleanPathUtil.cleanString(path));
        if (!file.exists()) {
            logger.error("探测任务未找到指定文件：{}", path);
            HttpResponse resp = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST);
            ctx.writeAndFlush(resp).addListener(ChannelFutureListener.CLOSE);
            return;
        }

        if (uri.contains("down") && uri.contains("key")) {
            HttpResponse resp = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
            RandomAccessFile raf = new RandomAccessFile(file, "r");
            long fileLength = raf.length();
            resp.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);
            resp.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/octet-stream");
            resp.headers().set(HttpHeaderNames.CONTENT_DISPOSITION, "attachment;filename=\"" + URLEncoder.encode(path, "UTF-8") + "\";");
            ctx.write(resp);
            ctx.write(new HttpChunkedInput(new ChunkedFile(raf, 0, fileLength, 8192)), ctx.newProgressivePromise());
            ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
        } else if (uri.contains("see") && uri.contains("key")) {
            FileReader fileReader = new FileReader(CleanPathUtil.cleanString(path));
            StringBuilder stringBuffer = new StringBuilder();
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            int line = 0;
            stringBuffer.append("<div>");
            while (line <= 50) {
                String s = bufferedReader.readLine();
                if (null == s) {
                    break;
                }
                s = s.replace(" ", "&nbsp;");
                s = s.replace("\t", "&nbsp;");
                stringBuffer.append("<p>").append(s).append("</p>");
                line++;
            }
            stringBuffer.append("</div>");
            HttpResponse resp = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, Unpooled.wrappedBuffer(stringBuffer.toString().getBytes()));
            resp.headers().set(HttpHeaders.Names.CONTENT_TYPE, "text/plain;charset=UTF-8");
            ctx.writeAndFlush(resp);
            ctx.close();
        } else {
            logger.error(" end HttpDataHandlerAdapter.detectTask 不识别的探测流表获取方式");
        }
    }
}
```

### Pipeline

Pipeline 指 Netty 中处理网络事件的流水线机制，它基于责任链设计模式设计，内部是一个双向链表结构，能够支持动态地添加和删除Handler业务处理器。

当 Channel 事件触发后，该事件会沿着 Pipeline 传递，被相应的 ChannelHandler 处理。

```java
public class BootNettyChannelInitializer<SocketChannel> extends ChannelInitializer<Channel> {

    @Override
    protected void initChannel(Channel channel) throws Exception {
        channel.pipeline().addLast("http-decoder", new HttpRequestDecoder());
        channel.pipeline().addLast("http-aggregator", new HttpObjectAggregator(65536));
        channel.pipeline().addLast("http-encoder", new HttpResponseEncoder());
        channel.pipeline().addLast("http-chunked", new ChunkedWriteHandler());
        /**
         * 自定义ChannelInboundHandlerAdapter
         */
        channel.pipeline().addLast(new BootNettyChannelInboundHandlerAdapter());
    }

}
```

### 启动类

```java
public class NettyPracticeApplication{

    @SneakyThrows
    public static void main(String[] args ) {
        new BootNettyServer().bind(8088);
    }

}
```

### 服务端

```java
public class BootNettyServer {

    public void bind(int port) throws Exception {

        /**
         * 配置服务端的NIO线程组
         * NioEventLoopGroup 是用来处理I/O操作的Reactor线程组
         * bossGroup：用来接收进来的连接，workerGroup：用来处理已经被接收的连接,进行socketChannel的网络读写，
         * bossGroup接收到连接后就会把连接信息注册到workerGroup
         * workerGroup的EventLoopGroup默认的线程数是CPU核数的二倍
         */
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            /**
             * ServerBootstrap 是一个启动NIO服务的辅助启动类
             */
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            /**
             * 设置group，将bossGroup， workerGroup线程组传递到ServerBootstrap
             */
            serverBootstrap = serverBootstrap.group(bossGroup, workerGroup);
            /**
             * ServerSocketChannel是以NIO的selector为基础进行实现的，用来接收新的连接，这里告诉Channel通过NioServerSocketChannel获取新的连接
             */
            serverBootstrap = serverBootstrap.channel(NioServerSocketChannel.class);
            /**
             * option是设置 bossGroup，childOption是设置workerGroup
             * netty 默认数据包传输大小为1024字节, 设置它可以自动调整下一次缓冲区建立时分配的空间大小，避免内存的浪费最小初始化最大 (根据生产环境实际情况来定)
             * 使用对象池，重用缓冲区
             */
            serverBootstrap = serverBootstrap.option(ChannelOption.RCVBUF_ALLOCATOR, new AdaptiveRecvByteBufAllocator(64, 10496, 1048576));
            serverBootstrap = serverBootstrap.childOption(ChannelOption.RCVBUF_ALLOCATOR, new AdaptiveRecvByteBufAllocator(64, 10496, 1048576));
            /**
             * 设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
             */
            serverBootstrap = serverBootstrap.childHandler(new BootNettyChannelInitializer<SocketChannel>());

            log.info("netty server start success!");
            /**
             * 绑定端口，同步等待成功
             */
            ChannelFuture f = serverBootstrap.bind(port).sync();
            /**
             * 等待服务器监听端口关闭
             */
            f.channel().closeFuture().sync();

        } catch (InterruptedException e) {

        } finally {
            /**
             * 退出，释放线程池资源
             */
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

}
```