# 批量操作Bulk和BulkProcessor

es的批量操作，6.x版本的es中high-rest-client中可以用到以下三种。

- bulk
- bulkAsync
- bulkProcessor

### Bulk

bulk api 以此按顺序执行所有的 action（动作）。如果一个单个的动作因任何原因失败，它将继续处理它后面剩余的动作。当 bulk api 返回时，它将提供每个动作的状态（与发送的顺序相同），所以您可以检查是否一个指定的动作是否失败了。

es可以通过 _bulk 的API实现批量操作。

```java
POST _bulk
{"create":{"_index":"article", "_type":"_doc", "_id":3}}
{"id":3,"title":"fox老师","content":"fox老师666","tags":["java", "面向对象"],"create_time":1554015482530}
{"create":{"_index":"article", "_type":"_doc", "_id":4}}
{"id":4,"title":"mark老师","content":"mark老师NB","tags":["java", "面向对象"],"create_time":1554015482530}
```

### BulkProcessor

BulkProcessor是一个线程安全的批量处理类。

可以根据提交 **action 数量、时间**等进行批量请求。很容易控制并发的数量。

客户端创建

```java
BulkProcessor bulkProcessor = BulkProcessor.builder(
        client,  
        new BulkProcessor.Listener() {
            @Override
            public void beforeBulk(long executionId,
                                   BulkRequest request) { 	
                                   request.numberOfActions() } 

            @Override
            public void afterBulk(long executionId,
                                  BulkRequest request,
                                  BulkResponse response) {
                                  response.hasFailures() } 

            @Override
            public void afterBulk(long executionId,
                                  BulkRequest request,
                                  Throwable failure) { 
                                  failure.getMessage() } 
        })
        // 每10000个request flush一次
        .setBulkActions(10000) 
        // bulk数据每达到5MB flush一次
        .setBulkSize(new ByteSizeValue(5, ByteSizeUnit.MB)) 
        // 每5秒flush一次
        .setFlushInterval(TimeValue.timeValueSeconds(5)) 
        // 0代表同步提交即只能提交一个request；
        // 1代表当有一个新的bulk正在累积时，1个并发请求可被允许执行
        .setConcurrentRequests(1) 
        // 设置当出现代表ES集群拥有很少的可用资源来处理request时抛出
        // EsRejectedExecutionException造成N个bulk内request失败时
        // 进行重试的策略,初始等待100ms，后面指数级增加，总共重试3次.
        // 不重试设为BackoffPolicy.noBackoff()
        .setBackoffPolicy(
            BackoffPolicy.exponentialBackoff(TimeValue.timeValueMillis(100), 3)) 
        .build();
```

使用时，只需要向bulkProcessor提交action即可。**批量任务交给bulkProcessor进行异步处理**。

```java

// add a IndexRequest to bulkprocessor
bulkProcessor.add(new IndexRequest("twitter", "_doc", "1").source(/* your doc here */));
// add a DeleteRequest to bulkprocessor
bulkProcessor.add(new DeleteRequest("twitter", "_doc", "2"));

// await close the bulkprocessor
bulkProcessor.awaitClose(10, TimeUnit.MINUTES);

```

### 原理分析

[](https://www.jianshu.com/p/4ddf2db5c290)