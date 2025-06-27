# Producer发布消息机制

## 写入机制

Producer 通过**push模式**将消息发给 Broker，每条消息都被追加到对应的 Partition。而且是采用顺序写磁盘的方式（顺序写比随机写效率高，保障 Kafka 高吞吐量）。

## 消息路由模式

Producer 如何确认消息发到哪个 Partition 上？

1. 指定了 Partition，直接使用。
2. 如果未指定 Partition，指定了 Key。根据 Key 的 Hash 值计算 Partition。
   
    Hash(key) % num(Partition)
    
3. 如果未指定 Partition，也未指定 key。则采用**轮询策略**选出一个 Partition**。**

## 写入流程

![image.png](https://s2.loli.net/2025/06/26/gZ6jyFw2N45aWXq.png)

1. Producerr 先从 zookeeper 的 “/brokers/…/state” 节点找到该 partition 的 leader。
2. Producer 将消息发给该 Leader。
3. Leader 将消息写入本地 Log。
4. Followers 从Leader 采用 pull 的方式同步消息，写入本地 log 后将 ACK 传给 Leader。
5. Leader 收到 LSR 中所有 Followers 的 ACK 标志后，增加 HW。然后向 Producer 发送 ACK。
   
    > 假如 acks=1，这个时候消息只发送给了 Leader，并不能确保每个 Follower同步了消息。如果 Leader 此时挂了，从 LSR中重新选举了 Leader，这部分消息就有可能丢失。