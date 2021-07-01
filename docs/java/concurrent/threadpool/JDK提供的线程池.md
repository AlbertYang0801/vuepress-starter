
## JDK提供的线程池
---
Java 从 `JDK1.5` 开始提供了线程池的四种类型：分别为`CachedThreadPool`、`FixedThreadPool`、`ScheduledThreadPool`、`SingleThreadExecutor`；
从 `JDK1.8` 开始提供了`WorkStealingPool`。这 5 种线程池都位于`Executors`线程池工厂中。`ThreadPoolExecutor`表示一个线程池，里面包含了创建线程池的实现。

注意：由于 `Executors` 线程池工厂创建出的线程存在一定弊端（具体见各个线程池的分析）,推荐使用手动创建的方式来创建线程池。（出自阿里规约）

---


### 缓存型线程池：CachedThreadPool

可灵活创建线程，如果线程池长度超过任务长度，可灵活回收线程。

```java
//源码
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}

public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>(),
                                  threadFactory);
}
```

**创建原理**

1. 指定核心线程数为 0，即线程池最小的线程数为 0；
2. 指定线程池最大允许存在的线程数为 `Integer.MAX_VALUE`；
3. 指定空闲线程的销毁时间是 `60s` ；
4. 指定任务队列为同步队列 `SynchronousQueue` 只能包含一个任务的队列；
5. 线程工厂可使用默认的或自定义的线程工程；
6. 任务拒绝策略使用默认的 `ThreadPoolExecutor.AbortPolicy` （对于新增任务，拒绝处理，直接抛出`RejectedExecutionException` 异常）。

**缓存型线程池使用**

任务队列只允许存放一个任务，线程池中若有任务进来，则立刻新建线程去执行任务。若有大量任务同时进来，则在线程池中新建对应的线程，若线程空闲 60s，则会自动回收。

- `CachedThreadPool()` 的好处：由于 `CachedThreadPool()` 线程池允许线程数量很大，并且会自动回收，非常适合执行数量很大的短期任务。

- `CachedThreadPool()` 的弊端：允许的创建线程数量为 `Integer.MAX_VALUE` ，可能会创建大量的线程，从而导致 `OOM(内存溢出)` 。（出自阿里规约）

---

### 定长型线程池： FixedThreadPool

固定线程池的线程数量，控制线程数，多余的任务在任务队列中等待。

```java
//源码
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}

public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>(),
                                  threadFactory);
}
```

**创建原理**

1. 指定核心线程数和最大线程数都为 `n` ，即线程池一直保持拥有着 `n` 个线程；
2. 指定空闲线程的销毁时间是 0；
3. 指定任务队列为无界队列 `LinkedBlockingQueue` ，队列长度为 `Integer.MAX_VALUE的队列` ；
4. 线程工厂可使用默认的或自定义的线程工程；
5. 任务拒绝策略使用默认的 `ThreadPoolExecutor.AbortPolicy` 对于新增任务，拒绝处理，直接抛出 `RejectedExecutionException` 异常。

**定长型线程池使用**

线程池从初始化开始便恒定拥有 `n` 个线程，不存在线程个数的增减，任务队列允许放接近无穷的任务，即线程池没有线程可以处理新任务时，会将新任务加入任务队列中，该线程池任务的拒绝策略不会执行，因为任务队列被允许一直放入任务。

- `FixedThreadPool()` 线程池的好处：由于 `FixedThreadPool()` 线程池线程数量恒定，非常适合执行时间长且任务量固定的任务。
- `FixedThreadPool()` 线程池的弊端：允许的任务队列长度为 `Integer.MAX_VALUE` ，可能会堆积大量的任务请求，从而导致 `OOM(内存溢出)`。（出自阿里规约）

---


### 单线程线程池：SingleThreadExecutor

线程池只有一个线程，若因为任务失败而终止当前线程，则新的线程会替代它继续执行后续任务。

```java
//源码
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}

public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>(),
                                threadFactory));
}
```

**创建原理**

1. 指定核心线程数和最大线程数都为 `1`，即线程池一直保持拥有着 `1` 个线程；
2. 指定空闲线程的销毁时间是 0；
3. 指定任务队列为队列长度为 `Integer.MAX_VALUE` 的队列；
4. 线程工厂可使用默认的或自定义的线程工程；
5. 任务拒绝策略使用默认的 `ThreadPoolExecutor.AbortPolicy` 对于新增任务，拒绝处理，直接抛出 `RejectedExecutionException` 异常。

**单线程线程池的使用**

线程池只初始化并维护一个线程，并设置 `LinkedBlockingQueue` 为任务队列。

- `SingleThreadExecutor()` 线程池的好处：使用 `SingleThreadExecutor` 来自动维护一个单线程。
- `SingleThreadExecutor()` 线程池的弊端：允许的任务队列长度为 `Integer.MAX_VALUE`，可能会堆积大量的任务请求，从而导致 `OOM(内存溢出)`。（出自阿里规约）

---


### 定时线程池：ScheduledThreadPool

可以定时执行任务。

```java
//源码
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}

public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue) {
    this(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue,
         Executors.defaultThreadFactory(), defaultHandler);
}
```

**创建原理**

1. 可指定核心线程数。
2. 最大线程数为 `Integer.MAX_VALUE` 。
3. 指定空闲线程的销毁时间是 0；
4. 指定任务队列为专门延时队列 `DelayedWorkQueue` ，来实现定时任务的执行。
5. 线程工厂可使用默认的或自定义的线程工程。 
6. 任务拒绝策略使用默认的 `ThreadPoolExecutor.AbortPolicy` 对于新增任务，拒绝处理，直接抛出 `RejectedExecutionException` 异常。

**定时线程池的使用**

可实现定时执行任务，或延时执行任务。


- `ScheduledThreadPool()` 线程池的好处：可以定时周期的执行任务。
- `ScheduledThreadPool()` 线程池的弊端：允许的线程最大长度为 `Integer.MAX_VALUE`，可能会创建大量的线程，从而导致 `OOM(内存溢出)` 。（出自阿里规约）

---


### 抢占式线程池：WorkStealingPool

抢占式的线程池，能合理的使用 CPU 进行任务处理，适合很耗时的任务。

```java
//源码
public static ExecutorService newWorkStealingPool() {
    return new ForkJoinPool
        (Runtime.getRuntime().availableProcessors(),
         ForkJoinPool.defaultForkJoinWorkerThreadFactory,
         null, true);
}

public static ExecutorService newWorkStealingPool(int parallelism) {
    return new ForkJoinPool
        (parallelism,
         ForkJoinPool.defaultForkJoinWorkerThreadFactory,
         null, true);
}
```

**创建原理**

1. 实际上是创建了一个 `ForkJoinPool()` 对象。
2. 传入参数则使用传入的线程数量，若不传入，则默认使用当前计算机可用的 CPU 数量。

---

