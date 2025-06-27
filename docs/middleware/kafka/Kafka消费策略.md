# Kafka消费策略

Kafka消费者-主动批量拉取

> Apache Kafka的消费者模型并不是基于传统的推（push）模型，而是采用了拉（pull）模型。
> 
1. kafka配置类

```java
@Configuration
@Slf4j
public class KafkaConfig {

    @Bean
    public KafkaListenerContainerFactory<?> batchFactory(ConsumerFactory consumerFactory){
        ConcurrentKafkaListenerContainerFactory<Integer,String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setConcurrency(10);
        factory.getContainerProperties().setPollTimeout(1500);
        //设置为批量消费，每个批次数量在Kafka配置参数中设置
        factory.setBatchListener(true);
        return factory;
    }

}
```

1. 消费者配置文件内容

```xml
# 最早未被消费的offset
spring.kafka.consumer.auto-offset-reset=earliest
# 批量一次最大拉取数据量
spring.kafka.consumer.max-poll-records=1000
# 批量拉取数据总大小最大数量
spring.kafka.consumer.properties.max.partition.fetch.bytes=20485760
# 等待拉取的最大时间，防止超时
spring.kafka.consumer.fetch-max-wait=10000
```

- spring.kafka.consumer.max-poll-records
  
    批量一次最大拉取数据数量。默认是500，该数量受到max.partition.fetch.bytes配置的影响。
    
- spring.kafka.consumer.properties.max.partition.fetch.bytes
  
    批量拉取数据总大小最大数量。该值默认为1MB。若单条数据大小过大，可以适当将该值调大一点。比如有100条数据，总大小为1MB，则消费者单次消费数据总条数最大为100条，达不到500甚至是1000条。
    
    注意：这时就可以将该值调大一点。这个参数是如果一个分区的数据可以达到配置的这个值 就是1个分区的数据，如果超过单个分区的值，则会从另一个分区拿数据。
    
- spring.kafka.consumer.fetch-max-wait
  
    等待拉取的最大时间，和前两个配置搭配使用。若单次数据量过大，拉取数据时间超过该配置时间，则会报异常。所以，在调大**`spring.kafka.consumer.max-poll-records`**参数的同时，应该将该值适当调大。