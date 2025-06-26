# BulkProcessor死锁问题

## 问题原因

- 定时flush
- bulk操作
- retryHandler：失败重试
1. 定时 flush 和 retryHandler 用的是一个定时线程池，而该线程池只有一个线程。
2. 定时 flush 的方法用的锁和 bulk 操作时的锁是同一把锁。都是类对象级别的锁。
   
    ![image.png](https://s2.loli.net/2025/06/26/DWVgLbxTH2i3wz7.png)
    
    ![image.png](https://s2.loli.net/2025/06/26/K4RkUbMVdv1luGn.png)
    
3. 当bluk失败后，会触发默认的重试逻辑。
4. 如果重试时候 flush 刚好运行，就会出现这种死锁情况。
    1. bulk持有对象锁`BulkProcessor.class`，进行重试逻辑。
    2. flush占有线程池的线程，等待对象锁`BulkProcessor.class`。
    3. 而 retryHandler 提交到线程池，等待线程释放。
    
    ![image.png](https://s2.loli.net/2025/06/26/RwbMuo3FvhWqPLy.png)
    

## **解决方案**

取消失败重试

```java
xxx.setBackoffPolicy(BackoffPolicy.noBackoff())
```

### issue

[BulkProcessor can deadlock when bulk requests fail · Issue #47599 · elastic/elasticsearch](https://github.com/elastic/elasticsearch/issues/47599)

### 博客

[Elasticsearch-BulkProcessor-死锁分析_elasticsearch bulk failed-CSDN博客](https://blog.csdn.net/baichoufei90/article/details/108468223)

[ElasticSearch - 批量更新bulk死锁问题排查 - 腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/news/1129702)

## 排查过程

- jstack 查看堆栈

```java
elasticsearch[scheduler][T#1]" #56 daemon prio=5 os_prio=0 tid=0x00007fa04001e000 nid=0x7425 waiting on condition [0x00007fa00bcfd000]
   java.lang.Thread.State: WAITING (parking)
        at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x0000000090b4e670> (a java.util.concurrent.Semaphore$NonfairSync)
        at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer.parkAndCheckInterrupt(AbstractQueuedSynchronizer.java:836)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer.doAcquireSharedInterruptibly(AbstractQueuedSynchronizer.java:997)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquireSharedInterruptibly(AbstractQueuedSynchronizer.java:1304)
        at java.util.concurrent.Semaphore.acquire(Semaphore.java:312)
        at org.elasticsearch.action.bulk.BulkRequestHandler.execute(BulkRequestHandler.java:59)
        at org.elasticsearch.action.bulk.BulkProcessor.execute(BulkProcessor.java:339)
        at org.elasticsearch.action.bulk.BulkProcessor.access$300(BulkProcessor.java:51)
        at org.elasticsearch.action.bulk.BulkProcessor$Flush.run(BulkProcessor.java:373)
        - locked <0x0000000090aeacd0> (a org.elasticsearch.action.bulk.BulkProcessor)
        at org.elasticsearch.threadpool.Scheduler$ReschedulingRunnable.doRun(Scheduler.java:182)
        at org.elasticsearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:37)
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
        at java.util.concurrent.FutureTask.run(FutureTask.java:266)
        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180)
        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:748)
```

- 对应源码位置
  
    ![image.png](https://s2.loli.net/2025/06/26/19hrEbVZdLoXWjB.png)