# Netty常用组件

## Bootstrap

Netty的启动类

- Bootstrap

    客户端启动类

- ServerBootstrap

    服务端启动类

    

![image.png](https://s2.loli.net/2025/06/13/XHBZvTLrlwQxGj7.png)

#### 第一个区别

- 客户端需要连接到远程主机和端口即可。

- 服务端需要绑定端口。

#### 第二个区别

- 服务端需要两个 EventLoopGroup。

    原因是使用了多线程主从的Reactor模式。

    - 第一个EventLoopGroup，只有一个EventLoop，负责为传入的Accept请求建立连接。一旦建立连接后续，将该 Channel 放到第二个 Group中进行请求处理。

    - 第二个EventLoopGroup，存在多个EventLoop，为每个Channel都分配了EventLoop。



## EventLoopGroup

- EventLoop 是线程

    服务于Channel的 I/O 和事件。一个Channel会被分配一个 EventLoop，而EventLoop可以被同时分配多个Channel，一个线程可以处理多个Channel的数据。

- EventLoopGroup 是线程组

    - 对于`bossGroup`，由于它只负责接收连接请求，所以线程数通常设置为1（`new NioEventLoopGroup(1)`）。

    - 对于`workerGroup`，线程数的默认值依赖于CPU的核心数。考虑到IO密集型操作的特点，Netty通常将`workerGroup`的线程数设置为CPU核心数的两倍（即`2 * 处理器线程数`），以便充分利用多核CPU的并行处理能力，并且考虑到可能有线程会处于等待状态，而其他线程可以继续运行，从而避免CPU的空闲。

    ![image.png](https://s2.loli.net/2025/06/13/tOFUTa1cVnbLYsP.png)



## ChannelFuture

Netty中所有IO都是异步的。

Netty自己实现了 ChannelFuture，在出站 I/O 时会返回一个 ChannelFuture。





## Channel

基本的 I/O 操作 bind()、connect()、read()和 write(）依赖于底层网络传输所提供的原

语。在基于 Java 的网络编程中，其基本的构造是类 Socket。

**Netty 的 Channel 接口所提供的 API，被用于所有的 I/O 操作**。大大地降低了直接使用 Socket 类的复杂性。





## ChannelPipline

每个Channel都有自己的 ChannelPipline。

就是ChannelHandler的事件流。底层以双向链表维护Handler。

![image.png](https://s2.loli.net/2025/06/13/ANGdbHC7ao9EweF.png)



## ChannelHandler

ChannelHandler 是用来处理入站和出站数据的，开发人员主要关注的是这个类。

因为这个类里面可以去写业务逻辑。

Netty 定义了下面两个重要的 ChannelHandler 子接口：

ChannelInboundHandler —— 处理入站数据以及各种状态变化；

ChannelOutboundHandler —— 处理出站数据并且允许拦截所有的操作。



### ChannelInboundHandler 

- channelRegistered

    当 Channel 已经注册到它的 EventLoop 并且能够处理 I/O 时被调用

- channelUnregistered

    当 Channel 从它的 EventLoop 注销并且无法处理任何 I/O 时被调用

- **channelActive**

    当 Channel 处于活动状态时被调用；Channel 已经连接/绑定并且已经就绪

- channelInactive

    当 Channel 离开活动状态并且不再连接它的远程节点时被调用

- channelReadComplete

    当 Channel 上的一个读操作完成时被调用

- **channelRead**

    当从 Channel 读取数据时被调用





## ChannelOption

- **ChannelOption.SO_BACKLOG**

    ChannelOption.SO_BACKLOG 对应的是 tcp/ip 协议 listen 函数中的 backlog 参数，服务端处理客户端连接请求是顺序处理的，所以同一时间只能处理一个客户端连接，多个客户端来的时候，服务端将不能处理的客户端连接请求放在队列中等待处理。所以操作系统里一般有两个队列，一个是 ACCEPT 队列，保存着已经完成了 TCP 的三次握手的连接，一个 SYN 队列，服务器正在等待 TCP 的三次握手完成的队列。

    BSD派生系统里**backlog指的就是SYN队列的大小**，在Linux的实现里backlog相对来说，就含糊不清了，有些内核版本指的是 ACCEPT 队列+SYN 队列合起来的大小，有的是指 SYN队列的大小。

    但是从 Linux 2.2 开始，backlog 的参数行为在 Linux 2.2 中发生了变化，现在它指定**等待接受的完全建立的套接字的队列长度**，而不是不完整的连接请求的数量。 

- **ChannelOption.SO_REUSEAD**

    ChanneOption.SO_REUSEADDR 对应于套接字选项中的 SO_REUSEADDR，这个参数表示允许重复使用本地地址和端口，比如，多网卡（IP）绑定相同端口，比如某个进程非正常退出，该程序占用的端口可能要被占用一段时间才能允许其他进程使用，而且程序死掉以后，内核一需要一定的时间才能够释放此端口，不设置 SO_REUSEADDR 就无法正常使用该端口。

    但是注意，这个参数无法做到让应用绑定完全相同 IP + Port 来重复启动。

- **ChannelOption.SO_KEEPALIVE**

    Channeloption.SO_KEEPALIVE 参数对应于套接字选项中的 SO_KEEPALIVE，该参数用于设置 TCP 连接，当设置该选项以后，连接会测试链接的状态，这个选项用于可能长时间没有数据交流的连接。当设置该选项以后，如果在两小时内没有数据的通信时，TCP 会自动发送一个活动探测数据报文。

- **ChannelOption.SO_SNDBUF 和 ChannelOption.SO_RCVBUF**

    ChannelOption.SO_SNDBUF 参数对应于套接字选项中的 SO_SNDBUF，

    ChannelOption.SO_RCVBUF 参数对应于套接字选项中的 SO_RCVBUF 这两个参数用于操作接收缓冲区和发送缓冲区的大小，接收缓冲区用于保存网络协议站内收到的数据，直到应用程序读取成功，发送缓冲区用于保存发送数据，直到发送成功。

- **ChannelOption.SO_LINGER**

    ChannelOption.SO_LINGER 参数对应于套接字选项中的 SO_LINGER,Linux 内核默认的处理方式是当用户调用 close（）方法的时候，函数返回，在可能的情况下，尽量发送数据，不一定保证会发生剩余的数据，造成了数据的不确定性，使用 SO_LINGER 可以阻塞 close()的调用时间，直到数据完全发送

- **ChannelOption.TCP_NODELAY**

    ChannelOption.TCP_NODELAY 参数对应于套接字选项中的 TCP_NODELAY,该参数的使用与 Nagle 算法有关，Nagle 算法是将小的数据包组装为更大的帧然后进行发送，而不是输入一次发送一次,因此在数据包不足的时候会等待其他数据的到了，组装成大的数据包进行发送，虽然该方式有效提高网络的有效负载，但是却造成了延时，而该参数的作用就是禁止使用 Nagle 算法，使用于小数据即时传输，于 TCP_NODELAY 相对应的是 TCP_CORK，该选项是需要等到发送的数据量最大的时候，一次性发送数据，适用于文件传输。

