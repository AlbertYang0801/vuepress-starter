# HTTP服务和SSL/TLS

## 服务端

按照 pipline 执行。

```java
@Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        ChannelPipeline pipeline = socketChannel.pipeline();
        //TODO ssl

        //服务端
        //对请求内容解码
        pipeline.addLast("decoder", new HttpRequestDecoder());
        //对响应内容编码
        pipeline.addLast("encoder", new HttpResponseEncoder());

        //聚合 http 为一个完整的报文
        pipeline.addLast("aggregator", new HttpObjectAggregator(10 * 1024 * 1024));
        //压缩应答报文
        pipeline.addLast("compressor", new HttpContentCompressor());

        //自定义 ChannelHandler
        pipeline.addLast(new BusiHandler());

    }
```

## 客户端

```java
public void connect(String host, int port) throws Exception {
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(workerGroup);
            b.channel(NioSocketChannel.class);
            b.handler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) throws Exception {

                    ch.pipeline().addLast(new HttpClientCodec());
                    /*聚合http为一个完整的报文*/
                    ch.pipeline().addLast("aggregator", new HttpObjectAggregator(10*1024*1024));
                    /*解压缩*/
                    ch.pipeline().addLast("decompressor", new HttpContentDecompressor());
                    ch.pipeline().addLast(new HttpClientInboundHandler());
                }
            });

            // Start the client.
            ChannelFuture f = b.connect(host, port).sync();
            f.channel().closeFuture().sync();
        } finally {
            workerGroup.shutdownGracefully();
        }
    }
```