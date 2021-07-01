
### ReadLimiter限流
`ReadLimiter` 是 `Guava` 提供的一中限流工具，限流算法有两种：漏桶算法和令牌桶算法。`ReadLimiter` 使用的是令牌桶算法。

#### 限流算法

- 漏桶算法
>利用一个缓冲区，当有请求进入系统时，都先在缓存区保存，然后以固定速度流出缓冲区进行处理。

- 令牌桶算法
>令牌桶算法是一种反向的漏桶算法，在令牌桶算法中，桶中存放的不是请求，而是令牌。处理程序只有在拿到令牌之后，才会对请求进行处理。如果没有令牌，那么处理程序要不等待令牌，要不丢弃请求。为了限流，该算法在每个单位会生成一定量的令牌存入桶中。通常桶的容量是有限的，为了限制流速，该算法在每个单位时间产生一定量的令牌存入桶中，但是令牌总数不会超过桶的容量。比如，若要求程序一秒处理一个请求，那么令牌桶一秒会生成一个令牌。

#### 参考练习

[ReadLimiter限流工具的练习](https://gitee.com/zztiyjw/concurrent-practice/blob/master/src/test/java/com/albert/concurrent/book/chapterthree/RateLimiter_11.java)

