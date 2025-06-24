# Sentinel原理

[Sentinel工作主流程](https://github.com/alibaba/Sentinel/wiki/Sentinel%E5%B7%A5%E4%BD%9C%E4%B8%BB%E6%B5%81%E7%A8%8B)

[滑动窗口实现原理 · 吾爱开源 · 看云](https://www.kancloud.cn/mr_zihan/fix_error/2783766)

## 限流算法

### 计数器算法

计数器算法统计某个时间段的请求量，判断是否超过阈值。

![](https://s2.loli.net/2025/06/10/zj4MxIZRYkhfU1E.png)

存在的问题：

如上图中，在时间段的临界处加起来其实QPS 超过了阈值，但是平均到单个时间段未发生。

单纯的计数器算法存在 **临界统计不准确** 的问题。

### 滑动窗口计数器算法

解决滑动窗口存在的问题，引入了滑动窗口计数器。

我们将统计时间细分，比如将 1s 统计时长分为 5个 时间窗口，通过 **滚动统计所有时间窗口的QPS 作为系统实际的 QPS** 的方式，就能解决上述 **临界统计** 问题。

![](https://s2.loli.net/2025/06/10/IHrOeQ8f2qWBvmo.png)

### 漏斗算法

类似一个队列，每隔10ms从队列头部取出流量进行放行，而我们的队列也就是漏桶，当流量大于队列的长度的时候，我们就可以拒绝超出的部分。

存在的问题：

由于漏斗要求请求比较均匀，不适合突发流量。

适合消费 MQ 这种请求均匀的情况，达到控制请求速率的场景。

### 令牌桶算法

令牌桶存放一定数量的令牌，请求过来获取到令牌才会放行。

可以应对突发流量的情况。

## 滑动窗口算法的实现-LeapArray

![](https://s2.loli.net/2025/06/10/rpU3iKyY7NAbxqd.png)

![](https://s2.loli.net/2025/06/10/esKcDpR8oH1divG.png)

滑动窗口将一段时间间隔（`intervalInMs`）划分成了由 N个（`sampleCount`）桶（`Bucket`）组成的时间片数组，每个桶的时间长度是 `windowLengthInMs`，桶里面保存了统计的相关数据。

对所有有效桶内的 QP（请求量）求和就能得出单位有效时间内的 QPS。

![](https://s2.loli.net/2025/06/10/vLcPUjtGTQBnof2.png)

- 情况一：缺少桶，需要创建新桶并更新到数组。
  
    判断当前时间段的桶是否存在，如果不存在，则创建一个新的桶，并尝试使用 CAS 操作将其更新到滑动窗口的桶数组中，如果更新成功，则返回新的桶。
    
    ![](https://s2.loli.net/2025/06/10/t9juXv5csD1VMme.png)
    
- 情况二：最新桶，直接返回。
  
    如果桶已经存在，并且与当前时间段的起始时间相同，则说明这个桶是最新的，可以直接返回。
    
    ![](https://s2.loli.net/2025/06/10/SNMPL9FWq3CgJmr.png)

    
- 情况三：桶被丢弃，需要重置
  
    如果桶已经存在，但其起始时间已经过期，则需要更新这个桶。
    
    ![](https://s2.loli.net/2025/06/10/kD9oMFEzpq6SlWi.png)
    

## 关键类

- `StatisticNode`
- `StatisticSlot`
- `ArrayMetric`
- `LeapArray`

当 Sentinel 监控系统对某个资源进行监控时，会创建一个对应的 StatisticNode 节点。

该节点通过 StatisticSlot 统计槽收集和处理数据。

并通过 ArrayMetric 数组度量器来维护收集的数据。

LeapArray 则相当于一个滑动时间窗口，用于按照时间周期将各个 ArrayMetric 链接起来，以形成一个时间线的统计图。

![](https://s2.loli.net/2025/06/10/mkrRENuLOba5FH9.png)

## 同类组件功能对比

|  | Sentinel | Hystrix | resilience4j |
| --- | --- | --- | --- |
| 隔离策略 | 信号量隔离（并发控制） | 线程池隔离/信号量隔离 | 信号量隔离 |
| 熔断降级策略 | 基于慢调用比例、异常比例、异常数 | 基于异常比例 | 基于异常比例、响应时间 |
| 实时统计实现 | 滑动窗口（LeapArray） | 滑动窗口（基于 RxJava） | Ring Bit Buffer |
| 动态规则配置 | 支持近十种动态数据源 | 支持多种数据源 | 有限支持 |
| 扩展性 | 多个扩展点 | 插件的形式 | 接口的形式 |
| 基于注解的支持 | 支持 | 支持 | 支持 |
| 单机限流 | 基于 QPS，支持基于调用关系的限流 | 有限的支持 | Rate Limiter |
| 集群流控 | 支持 | 不支持 | 不支持 |
| 流量整形 | 支持预热模式与匀速排队控制效果 | 不支持 | 简单的 Rate Limiter 模式 |
| 系统自适应保护 | 支持 | 不支持 | 不支持 |
| 热点识别/防护 | 支持 | 不支持 | 不支持 |
| 多语言支持 | Java/Go/C++ | Java | Java |
| Service Mesh 支持 | 支持 Envoy/Istio | 不支持 | 不支持 |
| 控制台 | 提供开箱即用的控制台，可配置规则、实时监控、机器发现等 | 简单的监控查看 | 不提供控制台，可对接其它监控系统 |

![](https://s2.loli.net/2025/06/10/C5wsJjVGdoDgl91.png)

- 线程池隔离：
    1. 调用线程和 hystrixCommand 线程不是同一个线程，并发请求数受到线程池（不是容器 tomcat 的线程池，而是 hystrixCommand 所属于线程组的线程池）中的线程数限制，默认是10。
    2. 这个是默认的隔离机制。
    3. hystrixCommand 线程无法获取到调用线程中的 ThreadLocal 中的值。
- 信号量隔离：
    1. 调用线程和 hystrixCommand 线程是同一个线程，默认最大并发请求数是10。
    2. 调用数度快，开销小，由于和调用线程是处于同一个线程，所以必须确保调用的微服务可用性足够高并且返回快才用。

注意：如果发生找不到上下文的运行时异常，可考虑将隔离策略设置为 SEMAPHONE。

## 参考链接

[【RuoYi-Cloud-Plus】学习笔记 06 - Sentinel（一）关于 StatisticSlot 以及 LeapArray_sentinel leaparray-CSDN博客](https://blog.csdn.net/Michelle_Zhong/article/details/131144748)

[Sentinel 1.8.4 规则持久化源码分析| ProcessOn免费在线作图,在线流程图,在线思维导图](https://www.processon.com/view/link/62e24778e0b34d06e56ab4b9)

## 思考

### 告警压缩功能可以用滑动窗口去做吗

- 告警压缩也是用滑动窗口实现。
    - 比如一分钟内同机器CPU超过80告警。针对机器生成一个时间桶，写入数据时判断桶内数据是否达到阈值。