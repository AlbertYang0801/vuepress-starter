# NIO

NIO 是 JDK1.4 引入，为了解决 BIO 阻塞的问题，又称 `no-blocking io`。

同步非阻塞

### NIO特点

- 面向缓冲区
  
    **BIO 是面向流的，NIO 是面向缓冲区的。**
    
    > JAVA IO 是面向流的，每次从流中读取数据然后处理，而不会将数据缓存到其它地方。

- 非阻塞模式
  
    NIO 的非阻塞模式，使其线程从 Channel 获取数据时，即使获取不到数据也不会阻塞线程。
    

## NIO 核心组件

![](https://s2.loli.net/2025/05/29/UuXeaBj4hWVoF1Y.png)

### Selector-**轮询选择器**

Java NIO 的选择器**允许一个单独的线程来监视多个输入通道（Channel）。**

选择器用于检测一个或多个通道的状态，并且可以根据通道状态进行**非阻塞**选择操作。

> JDK使用 epoll 代替了传统的 select。
> 

**NIO**中的多路复用器**Selector**

- 当调用**Selector**的**select()** 方法后，会进入监听状态。
- 当从**select()** 方法返回时，会得到**SelectionKey**的一个集合。
- 而每一个**SelectionKey**中就保存着有事件发生的**Socket**管道；

### SelectionKey-**选择键**

选择键则是一种将通道（Channel）和选择器（Selector）进行关联的机制。

| **操作类型** | **就绪条件及说明** |
| --- | --- |
| OP_READ | 当操作系统读缓冲区有数据可读时就绪。并非时刻都有数据可读，所以一般需要注册该操作，仅当有就绪时才发起读操作，有的放矢，避免浪费 CPU。 |
| OP_WRITE | 当操作系统写缓冲区有空闲空间时就绪。一般情况下写缓冲区都有空闲空间，小块数据直接写入即可，没必要注册该操作类型，否则该条件不断就绪浪费 CPU；但如果是写密集型的任务，比如文件下载等，缓冲区很可能满，注册该操作类型就很有必要，同时注意写完后取消注册。 |
| OP_ACCEPT | 当接收到一个客户端连接请求时就绪。该操作只给服务器使用。 |
| OP_CONNECT | 当 SocketChannel.connect()请求连接成功后就绪。该操作只给客户端使用。 |

### Channel-**通道**

Channel 是 Java NIO 中网络通信和文件 IO 操作的抽象，支持双向读写操作，并且可以通过缓冲区来直接进行数据读取或写入。

NIO 中主要提供了以下几种类型的 Channel：

- FileChannel：用于文件读写操作；
- DatagramChannel：用于UDP协议的网络通信；
- SocketChannel：用于TCP协议的网络通信；
- ServerSocketChannel：用于监听TCP连接请求；

> 通道中的数据总是要先读到一个 Buffer，或者总是要从一个 Buffer 中写入。
> 
- 非阻塞
- 事件通知机制

### Buffer

缓冲区。实际上是一个数组，通常是字节数组`ByteBuffer`。

也有其它类型的字节数组。

![](https://s2.loli.net/2025/05/29/N7mriECDjx6hLdl.png)

NIO库中，所有的数据都是用 Buffer 处理的。

### 测试代码

客户端和服务端的关系

![](https://s2.loli.net/2025/05/29/mroaJCpO8wjz3vT.png)

```java

    /**
     * 使用 Selecotr 监听两个 Channel
     *
     * @param args
     */
    public static void main(String[] args) {
        try {
            //Selector
            Selector selector = Selector.open();

            //ChannelA
            ServerSocketChannel socketChannelA = ServerSocketChannel.open();
            socketChannelA.configureBlocking(false);
            socketChannelA.socket().bind(new InetSocketAddress("127.0.0.1", 9999), 1024);

            //Selector 管理 Channel
            //监听ACCEPT事件
            socketChannelA.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                System.out.println("等待事件发生");
                //监听Selector，判断是否有ACCEPT或者READ事件，有的话就会将Channel对应的SelectedKey加入到集合中
                selector.select();
                System.out.println("有事件发生了");

                //遍历就绪的 SelectedKey
                Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();
                while (iterator.hasNext()) {
                    SelectionKey next = iterator.next();
                    iterator.remove();
                    //1.先监听ACCEPT事件
                    //2.添加客户端Channel对应的SelectedKey到 keys,Selecotr触发READ事件
                    handler(next);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handler(SelectionKey selectionKey) throws IOException {
        if (selectionKey.isAcceptable()) {
            System.out.println("连接事件发生");

            ServerSocketChannel channel = (ServerSocketChannel) selectionKey.channel();

            //2.监听到ACCEPT事件后，获取客户端连接Channel
            //获取连接
            SocketChannel socketChannel = channel.accept();
            socketChannel.configureBlocking(false);
            // 客户端Channel可以读数据，添加到 Selector中
            // 注册Read事件
            socketChannel.register(selectionKey.selector(), SelectionKey.OP_READ);
        } else if (selectionKey.isReadable()) {
            //3.监听到READ事件
            System.out.println("可读事件发生");
            //获取到客户端连接
            SocketChannel socketChannel = (SocketChannel) selectionKey.channel();

            //读取到客户端发送的内容
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            //读取过程是阻塞的（返回读取数据的长度）
            int len = socketChannel.read(buffer);
            String reqContent = new String(buffer.array(), 0, len);
            if(len!=-1){
                System.out.println("读取到客户端发送的数据:" + new String(buffer.array(), 0, len));
            }

            //写入客户端Channel
            ByteBuffer wrap = ByteBuffer.wrap((reqContent + " hello world").getBytes(StandardCharsets.UTF_8));
            socketChannel.write(wrap);
            selectionKey.interestOps(SelectionKey.OP_READ | SelectionKey.OP_WRITE);

            //关闭客户端连接
            socketChannel.close();
        }
    }

```

```java
    @SneakyThrows
    public static void main(String[] args) {
        Socket socket = null;
        OutputStream output = null;
        InputStream input = null;

        InetSocketAddress inetSocketAddress = new InetSocketAddress("127.0.0.1", 9999);
        try {
            socket = new Socket();
            socket.connect(inetSocketAddress);
            System.out.println("Connect Success!");

            output = socket.getOutputStream();
            input = socket.getInputStream();

            System.out.println("A ready send msg");

            //发送给服务端
            output.write("zhangsan".getBytes(StandardCharsets.UTF_8));
            output.flush();

            byte[] bytes = new byte[64];
            //读取服务端返回结果
            while (input.read(bytes) != -1) {
                System.out.println("client: " + new String(bytes));
            }
        } finally {
            if (socket != null) {
                socket.close();
            }
            if (input != null) {
                input.close();
            }
            if (output != null) {
                output.close();
            }
        }
    }
```


## AIO

AIO 是JDK1.7对NIO的升级，支持异步IO。

AIO 是**异步非阻塞**的，而 NIO 是同步非阻塞的。