# 资源管理和SimpleChannelInboundHandler

NIO中读写Channel数据，都使用了 Buffer，读写数据都是从 Buffer里面读取的。

而 Netty在读写网络数据时，同样也需要 Buffer。

但是这样就涉及到 Buffer的内存释放，不然会造成内存泄漏。

### SimpleChannelInboundHandler

Netty实现了SimpleChannelInboundHandler类，提供 `channelRead0()` 方法，保证数据被该方法消费后自动释放数据。

```java
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        boolean release = true;

        try {
            if (this.acceptInboundMessage(msg)) {
               //读取数据
                this.channelRead0(ctx, msg);
            } else {
                release = false;
                ctx.fireChannelRead(msg);
            }
        } finally {
            if (this.autoRelease && release) {
              //最终手动释放内存
                ReferenceCountUtil.release(msg);
            }

        }

    }
```