# Kafka手动重新分区

[kafka重分配分区_kafka重新分配分区-CSDN博客](https://blog.csdn.net/weixin_43046724/article/details/109821062)

1. 确定需要重新分区的 topic
   
    vi topics-to-move.json
    
    ```java
    
    {
      "topics": [{
         "topic": "test-topic"
       }],
       "version": 1
    }
    ```
    
    - topic 可以批量设置
2. 根据 topic 生成执行计划
   
    ```java
    bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --topics-to-move-json-file topics-to-move.json --broker-list "1,2,3,4,5" --generate
    ```
    
    - –zookeeper：指定一个 zk 地址。
    - –broker-list：指定 borker 的 borkerId
3. 保存执行计划
   
    将第 2 步执行完后的 `Proposed partition reassignment configuration` 结果保存到一个 json 文件中。比如 `reassignment.json`
    
    ```java
    #bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --topics-to-move-json-file topics-to-move.json --broker-list "1,2,3,4,5" --generate
    Current partition replica assignment
    {"version":1,"partitions":[{"topic":"test-topic","partition":2,"replicas":[2,1],"log_dirs":["any","any"]},{"topic":"test-topic","partition":3,"replicas":[3,2],"log_dirs":["any","any"]},{"topic":"test-topic","partition":6,"replicas":[2,3],"log_dirs":["any","any"]},{"topic":"test-topic","partition":4,"replicas":[0,1],"log_dirs":["any","any"]},{"topic":"test-topic","partition":1,"replicas":[1,0],"log_dirs":["any","any"]},{"topic":"test-topic","partition":9,"replicas":[1,3],"log_dirs":["any","any"]},{"topic":"test-topic","partition":5,"replicas":[1,2],"log_dirs":["any","any"]},{"topic":"test-topic","partition":7,"replicas":[3,0],"log_dirs":["any","any"]},{"topic":"test-topic","partition":0,"replicas":[0,3],"log_dirs":["any","any"]},{"topic":"test-topic","partition":8,"replicas":[0,2],"log_dirs":["any","any"]}]}
     
    Proposed partition reassignment configuration
    {"version":1,"partitions":[{"topic":"test-topic","partition":4,"replicas":[3,4],"log_dirs":["any","any"]},{"topic":"test-topic","partition":7,"replicas":[1,3],"log_dirs":["any","any"]},{"topic":"test-topic","partition":1,"replicas":[5,1],"log_dirs":["any","any"]},{"topic":"test-topic","partition":9,"replicas":[3,5],"log_dirs":["any","any"]},{"topic":"test-topic","partition":6,"replicas":[5,2],"log_dirs":["any","any"]},{"topic":"test-topic","partition":3,"replicas":[2,3],"log_dirs":["any","any"]},{"topic":"test-topic","partition":8,"replicas":[2,4],"log_dirs":["any","any"]},{"topic":"test-topic","partition":0,"replicas":[4,5],"log_dirs":["any","any"]},{"topic":"test-topic","partition":5,"replicas":[4,1],"log_dirs":["any","any"]},{"topic":"test-topic","partition":2,"replicas":[1,2],"log_dirs":["any","any"]}]}
    ```
    
4. 执行执行计划进行重新分区
   
    ```
    bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file reassignment.json --execute
    ```