# Netty实现通信框架

## 功能点

1. 基于Netty的NIO通信框架。
2. 提供消息的编码解码框架，实现对象的序列化和反序列化。
3. 消息内容的放篡改机制。
4. 提供基于IP的白名单认证机制。
5. 链路的有效性机制（心跳）。
6. 链路的断连重连机制。

## 通信模型

![](https://s2.loli.net/2025/06/13/hGfgzNHy9uWjl8r.png)

## 调用链路

![](https://s2.loli.net/2025/06/13/7cRHUs9pZQayJTP.png)

粘包半包是最前面先要解决的问题。

### 写空闲检测

```java
public class CheckWriteIdleHandler extends IdleStateHandler {

    /**
     * 0 表示读空闲时间不进行检测，即不对读空闲做任何处理。
     * 8 表示写空闲时间设置为8秒。如果在这8秒内，没有数据被写入到Channel（即向远端发送数据），则会触发一个写空闲事件。
     * 0 同样表示全空闲时间不进行检测，即不关心读和写都没有活动的时间段。
     */
    public CheckWriteIdleHandler() {
        //IdleStateHandler触发的事件会被userEventTriggered捕获到
        super(0, 8, 0);
    }

}
```

### 解决粘包拆包

```java
        //1.解决粘包半包
        //包最大长度、包长度字段偏移量、包长度字段的长度、长度的修正值、丢弃的长度数量、是否快速失败-true
        socketChannel.pipeline().addLast(new LengthFieldBasedFrameDecoder(65535,
                0,2,0,
                2));
        //在发送消息之前向消息的开头添加长度字段，确定消息边界
        //处理器会将消息的原始内容前面附加一个2字节的长度字段，这两个字节用来表示后续消息体的长度
        socketChannel.pipeline().addLast(new LengthFieldPrepender(2));
```