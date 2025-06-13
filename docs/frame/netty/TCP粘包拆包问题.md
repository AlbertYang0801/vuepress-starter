# TCP粘包拆包问题

## TCP 粘包

由于 TCP 协议本身的机制（面向连接的可靠地协议-三次握手机制）客户端与服务器会维持一个连接（Channel），数据在连接不断开的情况下，可**以持续不断地将多个数据包发往服务器。**

但是如果发送的网络数据包太小，那么他本身会启用 Nagle 算法（可配置是否启用）对**较小的数据包进行合并**（基于此，TCP 的网络延迟要 UDP 的高些）然后再发送（超时或者包大小足够）。

那么这样的话，服务器在接收到消息（数据流）的时候就无法区分哪些数据包是客户端自己分开发送的，这样产生了粘包。

服务器在接收到数据库后，放到缓冲区中，如果消息没有被及时从缓存区取走，下次在取数据的时候可能就会出现一次取出多个数据包的情况，造成粘包现象。

### 粘包原因

1. TCP 发送数据包太小时，有合并机制。
2. 服务端无法区分数据包哪些是分开的。

### 拆包原因

数据如果太大的时候，会被分成多个数据包发送。

1. 应用程序写入数据的字节大小大于套接字发送缓冲区的大小。（滑动窗口）
2. 数据分段，进行 MSS 大小的 TCP 分段。
   
    MSS 是最大报文段长度的缩写。MSS 是 TCP 报文段中的数据字段的最大长度。数据字段加上 TCP 首部才等于整个的 TCP 报文段。所以 MSS 并不是TCP 报文段的最大长度，而是：**MSS=TCP 报文段长度-TCP 首部长度**。
    

### UDP没有粘包

本身作为无连接的不可靠的传输协议（适合频繁发送较小的数据包），他不会对数据包进行合并发送（也就没有 Nagle 算法之说了），他直接是一端发送什么数据，直接就发出去了，不会对数据合并，**每一个数据包都是完整的**（数据+UDP 头+IP 头等等发一次数据封装一次）也就没有粘包一说了。

## Netty解决粘包拆包问题

传输层的 TCP 无法理解上层业务数据，底层是无法保证数据包不被拆分和重组。所以只能依赖应用层去解决。

1. 在包尾增加分割符，比如回车换行符进行分割，例如 FTP 协议；
2. 读取回车换行符，以换行符作为结束为止。从开始字节到换行符之间组成一行。
3. 消息定长，例如每个报文的大小为固定长度 200 字节，如果不够，空位补空格；
4. 将消息分为消息头和消息体，消息头中包含表示消息总长度（或者消息体长度）的字段，通常设计思路为消息头的第一个字段使用 int32 来表示消息的总长度。

### 分隔符处理器-DelimiterBasedFrameDecoder

```java
          serverBootstrap.group(eventLoopGroup)
                    //指定使用NIO的通信模式
                    .channel(NioServerSocketChannel.class)
                    .localAddress(new InetSocketAddress(port))
                    //设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {

                            //处理器的作用是根据前面定义的delimiter来分割接收到的数据流，将其切分成多个完整的消息。
                            //每个完整的消息是一个ByteBuf对象，它包含了从上一个分隔符到当前分隔符之间的所有数据。
                            //参数1024是单个消息的最大长度，如果接收到的数据超过了这个长度但仍然没有遇到分隔符，那么将会抛出一个异常。
                            ByteBuf byteBuf = Unpooled.copiedBuffer(DELIMITER_SYMBOL.getBytes());
                            socketChannel.pipeline().addLast(new DelimiterBasedFrameDecoder(1024, byteBuf));

                            //添加自定义的eventHandler
                            socketChannel.pipeline().addLast(new EchoServceHandler());
                        }
                    });
            //异步绑定到服务器，sync()会阻塞到完成
            ChannelFuture sync = serverBootstrap.bind().sync();
            //阻塞当前线程，直到服务器的ServerChannel被关闭
            sync.channel().closeFuture().sync();
```

比如客户端发送数据，按顺序将数据写到缓冲区 A#B#CA#B#CA#B。

```java
new Thread(() -> {
            ByteBuf msg = null;

            List<String> userNames = new ArrayList<>();
            userNames.add("A");
            userNames.add("B");
            userNames.add("C");

            String request = userNames.stream().collect(Collectors.joining(EchoServer.DELIMITER_SYMBOL));

            for (int i = 0; i < 10; i++) {
                msg = Unpooled.buffer(request.length());
                msg.writeBytes(request.getBytes());
                ctx.writeAndFlush(msg);
                System.out.println("发送数据到服务器");
            }
        }).start();
```

服务端按照分隔符有效分割。

```java
Server Accept[A] and the counter is:1
Server Accept[B] and the counter is:2
Server Accept[CA] and the counter is:3
Server Accept[B] and the counter is:4
Server Accept[CA] and the counter is:5
Server Accept[B] and the counter is:6
```

### 回车换行符 - LineBasedFrameDecoder

LineBasedFrameDecoder 的工作原理是它依次遍历 ByteBuf 中的可读字节，判断看是否有 “” 或者 “”，如果有，就以此位置为结束位置，从可读索引到结束位置区间的字节就组成了一行。它是以换行符为结束标志的解码器，支持携带结束符或者不携带结束符两种解码方式，同时支持配置单行的最大长度。如果连续读取到最大长度后仍然没有发现换行符，就会抛出异常，同时忽略掉之前读到的异常码流。

StringDecoder 的功能非常简单，就是将接收到的对象转换成字符串，然后继续调用后面的 Handler。LineBasedFrameDecoder + StringDecoder 组合 就是按行切换的文本解码器，它被设计用来支持 TCP 的粘包和拆包。

```java
    private void start() throws InterruptedException {
        //线程组
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        try {
            serverBootstrap.group(eventLoopGroup)
                    //指定使用NIO的通信模式
                    .channel(NioServerSocketChannel.class)
                    .localAddress(new InetSocketAddress(port))
                    //设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {

                            //LineBasedFrameDecoder依次遍历ByteBuf的可读字节，判断看是否有 "\n" 或者 "\r\n"。如果有，就以此位置为结束位置。
                            //以换行符为结束标志的解码器
                            socketChannel.pipeline().addLast(new LineBasedFrameDecoder(1024));
                            //将接收到的对象转换成字符串
                            socketChannel.pipeline().addLast(new StringDecoder());
                            //添加自定义的eventHandler
                            socketChannel.pipeline().addLast(new EchoServceHandler());
                        }
                    });
            //异步绑定到服务器，sync()会阻塞到完成
            ChannelFuture sync = serverBootstrap.bind().sync();
            //阻塞当前线程，直到服务器的ServerChannel被关闭
            sync.channel().closeFuture().sync();
        } finally {
            eventLoopGroup.shutdownGracefully().sync();
        }
    }
```

### 消息定长 - FixedLengthFrameDecoder

将接收到的数据按照固定长度分割，特定场景有效。

适用于那些**消息长度固定且长度较短**的通信协议。

```java
private void start() throws InterruptedException {
        //线程组
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        try {
            serverBootstrap.group(eventLoopGroup)
                    //指定使用NIO的通信模式
                    .channel(NioServerSocketChannel.class)
                    .localAddress(new InetSocketAddress(port))
                    //设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {

                            //用于将接收到的字节数据（ByteBuf）分割成固定长度的帧。
                            socketChannel.pipeline().addLast(new FixedLengthFrameDecoder(REQUEST.length() + 1));

                            //添加自定义的eventHandler
                            socketChannel.pipeline().addLast(new EchoServceHandler());
                        }
                    });
            //异步绑定到服务器，sync()会阻塞到完成
            ChannelFuture sync = serverBootstrap.bind().sync();
            //阻塞当前线程，直到服务器的ServerChannel被关闭
            sync.channel().closeFuture().sync();
        } finally {
            eventLoopGroup.shutdownGracefully().sync();
        }
    }
```

### 消息头 - LengthFieldBasedFrameDecoder

消息头指定消息长度，消息体包含业务数据。

这样业务在读取数据的时候，根据消息头的长度信息，按照长度读取数据即可获取业务数据。解决粘包拆包问题。

```java
      //解决粘包半包
        //包最大长度、包长度字段偏移量、包长度字段的长度、长度的修正值、
        socketChannel.pipeline().addLast(new LengthFieldBasedFrameDecoder(65535,
                0,2,0,
                2));
```

```java
    public LengthFieldBasedFrameDecoder(
            int maxFrameLength,
            int lengthFieldOffset, int lengthFieldLength,
            int lengthAdjustment, int initialBytesToStrip) {
        this(
                maxFrameLength,
                lengthFieldOffset, lengthFieldLength, lengthAdjustment,
                initialBytesToStrip, true);
    }
```

- maxFrameLength：表示的是包的最大长度。
- lengthFieldOffset：指的是长度域的偏移量，表示跳过指定个数字节之后的才是长度域。
- lengthFieldLength：记录该帧数据长度的字段，也就是长度域本身的长度。
- lengthAdjustment：长度的一个修正值，可正可负，Netty 在读取到数据包的长度值 N 后，认为接下来的 N 个字节都是需要读取的，但是根据实际情况，有可能需要增加 N 的值，也有可能需要减少 N 的值，具体增加多少，减少多少，写在这个参数里。
- initialBytesToStrip：从数据帧中跳过的字节数，表示得到一个完整的数据包之后，扔掉这个数据包中多少字节数，才是后续业务实际需要的业务数据。
- failFast：如果为 true，则表示读取到长度域，TA 的值的超过 maxFrameLength，就抛出一个 TooLongFrameException，而为 false 表示只有当真正读取完长度域的值表示的字节之后，才会抛出 TooLongFrameException，默认情况下设置为 true，建议不要修改，否则可能会造成内存溢出。

![](https://s2.loli.net/2025/06/13/6X7fWnypcYg9ECV.png)

![](https://s2.loli.net/2025/06/13/aRKdnWzhXN96DbA.png)

![](https://s2.loli.net/2025/06/13/bwFI9tWSlMsCEou.png)

![](https://s2.loli.net/2025/06/13/rPpyDeXwhozAFZ2.png)

![](https://s2.loli.net/2025/06/13/XSNCdYnWcL8JkVU.png)