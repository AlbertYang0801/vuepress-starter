# Kakfa和RocketMQ的区别

## 消费者组

RocketMQ和Kafka虽然都使用了Consumer Group的概念来实现消息的分发和负载均衡，但两者在具体实现和一些特性上存在一些差异：

1. **Rebalance机制**：
    - **RocketMQ**：RocketMQ的Consumer Group在成员增减或Topic队列发生变化时会触发Rebalance，旨在重新分配队列到各个消费者实例，确保消息的公平消费。RocketMQ的Rebalance更加灵活，支持多种分配策略，例如平均分配、广播消费等，可以根据业务需求进行配置。
    - **Kafka**：Kafka同样在Consumer Group中进行Rebalance，当有新的消费者加入或离开时，或订阅的Topic分区发生变化时，Kafka会通过Coordinator进行协调重平衡。Kafka的Rebalance机制在较新版本中得到了改进，提高了效率和稳定性，但也存在一定的延迟问题，尤其是在消费者组成员频繁变化时。
2. **消费模式**：
    - **RocketMQ**：支持多种消费模式，包括集群消费（Clustering）和广播消费（Broadcasting）。
        - 集群消费模式下，相同Consumer Group内的消费者共同消费Topic的所有消息，每条消息只被消费一次；
        - 而在广播消费模式下，每个消费者实例都会收到全部消息，适用于需要对每条消息进行独立处理的场景。
    - **Kafka**：主要采用分区消费模型，即每个分区的消息只能被一个Consumer Group内的一个消费者消费，但不直接支持广播消费模式。**若需类似广播的效果，需要为每个消费者单独创建Consumer Group。**
3. **消息顺序性**：
    - **RocketMQ**：在单个队列（Queue）或主题（Topic）下，RocketMQ原生支持顺序消息，保证消息的严格顺序传递，这对于某些需要严格顺序处理的业务场景（如金融交易）非常重要。
      
        > MessageQueue是一个FIFO队列，所以是顺序消费。
        > 
    - **Kafka**：Kafka保证了在**单个分区内的消息顺序（offset）**，但跨分区则无法保证消息的全局顺序。这意味着，如果一个Topic设置了多个分区，消息的顺序性将依赖于消息是如何被分区的（消息根据ParitationKey路由到不同的Paritation）。
4. **可靠性保障**：
    - **RocketMQ**：在可靠性方面，RocketMQ提供了更丰富的选项，如**同步刷盘、同步复制**等，这使得RocketMQ在单机可靠性上往往被认为比Kafka更优，尤其是在金融等对数据安全要求极高的场景中。
        - 同步刷盘：消息写到内存之后，直接写到磁盘。等待磁盘写完之后再响应客户端。
        - 异步刷盘：消息写到内存之后直接响应客户端，等待内存缓冲区满或者到达指定时间后再落磁盘。
    - **Kafka**：虽然Kafka也提供了高可用性方案，如副本机制，但其默认采用**异步刷盘和复制**，这在某些情况下**可能会导致数据丢失**的风险。

### 架构

### kafka

![Screenshot_20240701_234230_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/ZCBjlgtupMfWJ8w.jpg)

### RocketMQ

![Screenshot_20240701_234009_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/IKhMuYl6jrkOwN4.jpg)

![Screenshot_20240701_234219_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/YJT8WfAZ9PgaV54.jpg)

### Partition和Queue

kafka的Partition上有完整数据。

而RocketMQ的Queue上是简要信息，比如offset，更类似于一个索引文件。

![Screenshot_20240701_233712_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/QdyiqSgmKsx3NCv.jpg)

![Screenshot_20240701_233727_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/YEKnWXTfVCuIgDB.jpg)

### 写数据问题

### Kafka

Kafka的效率高的一点就是写Partition的log文件是并发顺序写的，但是当Partition数量多之后。

- 磁盘IO瓶颈。
- 多Partition同时写磁盘，退化为磁盘随机写。
  
    每个Partition写自己的，数量上来之后在磁盘上就不是顺序写了。
    

![Screenshot_20240701_233855_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/pGM5oBj4gDnbPtV.jpg)

### RocketMQ

- 同一个Borker所有数据顺序写commitLog。
  
    同步写效率低。
    
- Topic的Queue保存offset，类似索引的回表查询。
  
    多进行一次回表操作。
    

![Screenshot_20240701_233921_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/YMpCj8lS3cOWPqo.jpg)

![Screenshot_20240701_233747_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/6xVs8D7a1pfRHtU.jpg)

### 事务消息

### Kafka

kafka的事务消息，指的是生产者发消息，保证同一批数据的原子性。

而不是本地事务和生产者消息的结合。

![Screenshot_20240701_234416_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/xwoUPasVkgHtOMI.jpg)

![Screenshot_20240701_234352_tv.danmaku.bili.jpg](https://s2.loli.net/2025/06/27/vNLzxOJWFsSXnBR.jpg)

### RocketMQ

RocketMQ的事务消息能够保证本地事务和kafka事务的一致性。

本质上用到了二阶段提交。