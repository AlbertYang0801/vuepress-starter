# kafka生产者保证消息不丢失-ACK应答机制

kafka 生产者写入数据的时候，引入了 ACK 应答机制。

```java
            Properties props = new Properties();
            props.put("bootstrap.servers", Configuration.KAFKA_ADDRESS);
						//1:leader应答就可以发送下一条，确保发送成功。
            props.put("acks", "1");
						......
            props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
            props.put("value.serializer", "org.apache.kafka.common.serialization.ByteArraySerializer");
            producer = new KafkaProducer<String, byte[]>(props);
```

acks：用来指定分区中必须要有多少个副本收到这条消息，之后生产者才会认为这条消息是成功写入的。

- acks = 1, 默认值即为1。生产者发送消息之后，只要分区的leader副本成功写入消息，那么它就会收到来自服务端的成功响应。如果消息无法写入leader副本，比如在leader副本崩溃、重新选举新的leader副本的过程中，那么生产者就会收到一个错误的响应，为了避免消息丢失，生产者可以选择重发消息。如果消息写入leader副本并返回成功响应给生产者，且在被其他follower副本拉取之前leader副本崩溃，那么此时消息还是会丢失，因为新选举的leader副本中并没有这条对应的消息。acks设置为1，是消息可靠性和吞吐量之间的折中方案。
- acks = 0, 生产者发送消息之后不需要等待任何服务的相应。如果在消息从发送到写入kafka的过程中出现某些异常，导致kafka并没有收到这条消息，那么生产者也无从得知，消息也就丢失了。在其他配置环境相同的情况下，acks设置为0可以达到最大的吞吐量。
- acks = -1 或acks = all。 生产者在消息发送之后，需要等待 ISR 中的所有副本都成功写入消息之后才能够对来自服务端的成功响应。在其他配置环境相同的情况下，acks设置为-1（all）可以达到最强的可靠性。但这并不意味着消息就一定可靠，因为 ISR 中可能只有 leader 副本，这样就退化成了acks = 1 的情况。要获得更高的消息可靠性需要配合 min.insync.replicas 等参数的联动。

![20220526151029.png](https://s2.loli.net/2025/06/26/eKEfFP5HjQqN73x.png)