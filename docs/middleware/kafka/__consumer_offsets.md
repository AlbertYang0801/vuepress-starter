# __consumer_offsets

**将 Consumer 的位移数据作为一条条普通的 Kafka 消息，提交到 consumer*offsets 中。可以这么说，consumer*offsets 的主要作用是保存 Kafka 消费者的位移信息。**

**_*consumer*offsets也是一个 topic，也有分区。和 kafka 的 topic 基本一致支持自定义写入。但是它是内部的 topic，一般最好不要自动修改。**

## 消息格式

1. **分区消费的 offset**
    
    **位移主题的 Key 中应该保存 3 部分内容：**
    
    标识某个消费者组里面某个 topic 的某个分区，已经被消费的位置，即offset。
    

> key 是 consumerGroupId+topic+分区号，value就是当前offset的值。
> 
1. 用于保存 Consumer Group 信息的消息。
    
    注册 Consumer Group 时的信息。
    
2. 用于删除 Group 过期位移甚至是删除 Group 的消息。

> 一旦某个 Consumer Group 下的所有 Consumer 实例都停止了，而且它们的位移数据都已被删除时，Kafka 会向位移主题的对应分区写入 tombstone 消息，表明要彻底删除这个 Group 的信息。
> 

## 创建过程

**当 Kafka 集群中的第一个 Consumer 程序启动时，Kafka 会自动创建位移主题。**

创建的位移主题  `__consumer_offset` 默认 50 个分区，3 个副本。

## 更新过程

在 Consumer 端有个参数 `enable.auto.commit`，来控制是否自动提交 offset。

- 自动提交
    
    如果设置为 true，Consumer 端就会自动提交消费数据的位移。提交间隔由 `auto.commit.interval.ms`来控制。
    

> 自动提交可能导致重复消费的产生。
> 
- 手动提交
    
    设置为 false，需要在消费完数据之后手动调用 api 来提交位移，如`consumer.commitSync`。
    

> 手动提交可以业务控制提交位移，减少重复消费的产生。
> 

## 过期消息清除

消费者提交位移的过程，就是向位移主题`__consumer_offset`发一条消息，消息内容就是当前消费分区的位移。

如果当前分区没有新消息，这样会导致发的消息内容都是相同的位移。

其实这时候只需要留最新一条数据即可，原来的数据都需要被清除掉。

### 删除策略

`Compaction`

对于同一个 Key 的两条消息 M1 和 M2，如果 M1 的发送时间早于 M2，那么 M1 就是过期消息。Compact 的过程就是**扫描日志的所有消息，剔除那些过期的消息，然后把剩下的消息整理在一起。**

![image.png](https://tc-cdn.flowus.cn/oss/a3038ac0-ec7d-4645-85ec-2629854056fa/image.png?time=1750932000&token=503e5ffc8d07b70af0f4dfa185c0870a13213b5373aed114c6e4fb6f60fa1451&role=free)

**Kafka 提供了专门的后台线程定期地巡检待 Compact 的主题，看看是否存在满足条件的可删除数据**。这个后台线程叫 Log Cleaner。

> Log Cleaner 不仅会检查位移主题__Consumer_offset的日志段，业务 topic 同样也会检查。
>