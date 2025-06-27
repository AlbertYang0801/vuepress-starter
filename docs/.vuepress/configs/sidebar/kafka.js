// 为以下路由添加左侧边栏
module.exports = [
    {
        "title": "Kafka配置",
        "collapsable": false,
        "children": [
            "/middleware/kafka/Kafka消费策略.md",
            "/middleware/kafka/Kafka生产者参数.md",
            "/middleware/kafka/kafka的分区副本规划.md"
        ]
    },{
        "title": "Kafka原理总结",
        "collapsable": false,
        "children": [
            "/middleware/kafka/kafka消费模型.md",
            "/middleware/kafka/kafka-ACK应答机制.md",
            "/middleware/kafka/kafka解决重复消费.md",
            "/middleware/kafka/Kafka分区机制策略.md",
            "/middleware/kafka/kafka保证消息不丢失.md",
            "/middleware/kafka/消费者组.md",
            "/middleware/kafka/__consumer_offsets.md",
            "/middleware/kafka/Kafka总控制器Controller.md",
            "/middleware/kafka/Kafka副本机制.md",
            "/middleware/kafka/Producer发布消息机制.md",
            "/middleware/kafka/高水位HW和LEO.md",
            "/middleware/kafka/数据日志分段存储.md",
            "/middleware/kafka/Kafka高性能的原因.md"
        ]
    },{
        "title": "使用问题",
        "collapsable": false,
        "children": [
            "/middleware/kafka/Kafka手动重新分区.md"
        ]
    }
]


