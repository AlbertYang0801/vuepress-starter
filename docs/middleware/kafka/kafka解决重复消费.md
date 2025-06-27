# kafka解决重复消费

[技术干货分享 | Kafka重复消费场景及解决方案](https://zhuanlan.zhihu.com/p/112745985)

## 导致重复消费的原因

- enable.auto.commit 默认值true，表示消费者会周期性自动提交消费的offset
- auto.commit.interval.ms 在enable.auto.commit 为true的情况下， 自动提交的间隔，默认值5000ms
- max.poll.records 单次消费者拉取的最大数据条数，默认值 500
- max.poll.interval.ms 默认值5分钟，表示若5分钟之内消费者没有消费完上一次poll的消息，那么consumer会主动发起离开group的请求
1. 第一种情况，在`enable.auto.commit=true`时
    
    Consumer 每次 poll 数据是批量 poll 的，当消费完之后，会提交 offset。
    
    如果在消费一半数据未提交 offset 的情况下，Consumer 异常。重启之后会从上次的 offset 开始消费，就会重复消费到部分数据。
    
2. 第二种情况，假如 Consumer 消费能力太弱，单次 poll的数据在 `max.poll.interval.ms`范围内还未消费完成， 导致 Consumer 离开 ConsumerGroup，并且触发了 Rebalance。此时 offset 并未更新。
    
    Rebalance 结束后，重新分配的分区会从之前的 offset 读取数据，导致重复消费。
    

## 解决重复消费的思路

以上两种情况只能通过优化来尽量避免重复消费。

1. 引入单独去重机制，将消息的接口幂等性处理。
    - 比如查询操作，具有天然幂等性，不需要处理。
    - 更新或者新增操作，通过设置唯一 key，达到幂等效果。（比如 mysql 设置唯一索引，保证单次插入和多次插入效果一致）
2. 提高消费者的消费能力，解决因消费时间过长导致的重复消费问题。
    
    提高消费者的能力，如果消费逻辑比较重的话，可以采用异步方式去处理。
    
    如果消费者消费能力有限，可以通过调整配置来减少单次消费的数据。
    
    - `max.poll.interval.ms`
        
        默认值 5 分钟，可以适当加大。
        
    - `max.poll.records`
        
        默认值 500，可以适当减少。