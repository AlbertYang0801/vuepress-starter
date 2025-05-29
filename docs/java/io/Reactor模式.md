# Reactor模式

[Reactor模式详解＋源码实现](https://www.jianshu.com/p/188ef8462100)

整个 reactor 模式解决的主要问题就是在接收到任务后根据分发器快速进行分发给相应的事件处理器，不需要从**开始状态就阻塞**。

基于事件驱动模型，当接收到请求后会**将请求封装成事件**，并将**事件分发给相应处理事件的Handler**，handler处理完成后将事件状态修改为下一个状态，再由Reactor将事件分发给能够处理下一个状态的handler进行处理。

![](https://s2.loli.net/2025/05/29/Tut6MdNnG7Zlz8i.png)

1. EventHandler：事件处理器，可以根据事件的不同状态创建处理不同状态的处理器；
   
    ```java
    public abstract class EventHandler {
    
        /**
         * 事件处理
         * @param event
         */
        public abstract void handle(Event event);
    
    }
    ```
    
    - ReadEventHandler
    - AcceptEventHandler
2. Handle：可以理解为事件，在网络编程中就是一个Socket，在数据库操作中就是一个DBConnection；
    - Event
3. InitiationDispatcher：用于管理EventHandler，分发event的容器，也是一个事件处理调度器，Tomcat 的 Dispatcher 就是一个很好的实现，用于接收到网络请求后进行第一步的任务分发，分发给相应的处理器去异步处理，来保证吞吐量；
   
    ```java
        public void handlerEvents(){
            ExecutorService executorService = ThreadUtil.newExecutor(1);
            //同步非阻塞
            //线程池异步提交
            executorService.execute(this::dispatch);
        }
    
        public void dispatch(){
            while (true){
                //从 selector 中阻塞获取数据
                List<Event> events = selector.select();
                for (Event event : events) {
                    //分发处理
                    EventHandler eventHandler = eventHandlerMap.getOrDefault(event.getEventType(),null);
                    if(Objects.isNull(eventHandler)){
                        continue;
                    }
                    //处理事件
                    eventHandler.handle(event);
                }
            }
        }
    ```
    
4. Demultiplexer：阻塞等待一系列的 Handle 中的事件到来，如果阻塞等待返回，即表示在返回的 Handle 中可以不阻塞的执行返回的事件类型。这个模块一般使用操作系统的select来实现。在 Java NIO 中用 Selector 来封装，当 `Selector.select()` 返回时，可以调用 Selector的 `selectedKeys()` 方法获取 `Set<SelectionKey>`，一个SelectionKey 表达一个有事件发生的 Channel 以及该 Channel 上的事件类型。

**源码**

[Albert.Yang/JavaAdvance](https://gitee.com/zztiyjw/JavaAdvance/tree/master/moudle-netty/netty-practice)

## 单线程Reactor

![](https://s2.loli.net/2025/05/29/NP3aIjnBZrl62Fc.png)

- Reactor是一个线程对象，它会开始事件循环，内部使用 Selector（JDK内部使用epoll） 实现 IO多路复用。
- Dispatch事件分发器，负责 event 分发以及 eventHandler 的维护。
- 注册AcceptorEventHandler处理器到Reactor，负责处理Accept类型事件。
- READ、WRITE有自己的事件处理器。

> 这里的单线程指的是IO操作都在一个线程上，比如accept、wirte、read、connect等操作。
> 

### 工作者线程池

将非IO操作放到线程池。

![](https://s2.loli.net/2025/05/29/MiDOgCkPHtKNZBG.png)

### 多线程主从Reactor模式

![](https://s2.loli.net/2025/05/29/8uWltxMVkL47T92.png)

- mainReactor：由主线程接收客户端连接请求。
- subReactor：连接建立之后将通信转给subReactor。
- ThreadPool：非IO操作还是放到线程池。