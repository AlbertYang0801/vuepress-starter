# transmittable-thread-local

线程池中的线程是可以复用的，假如第一个线程对  ThreadLocal 变量进行了操作，如果没有及时清理，下一个线程就会受到影响。因为 ThreadLocal  是在每个线程上维护了一个 ThreadLocalMap ，所以在线程复用的情况下，之后的线程会获取到  ThreadLocal  里之前线程设置的值。

## ThreadLocal多线程问题

在多线程场景下传递ThreadLocal，如果线程池是池化的话，可能会导致复用ThreadLocal里面的值。

> 线程池中的线程是可以复用的，假如第一个线程对  ThreadLocal 变量进行了操作，如果没有及时清理，下一个线程就会受到影响。因为 ThreadLocal  是在每个线程上维护了一个 ThreadLocalMap ，所以在线程复用的情况下，之后的线程会获取到  ThreadLocal  里之前线程设置的值。

## 需求场景

在使用线程池等池化复用线程的情况下，传递ThreadLoca值。

1. 分布式跟踪 trace 或者全链路压测。
2. 日志收集系统记录上下文。

## 使用

- 跨线程复用

```Java
/**
 * TransmittableThreadLocal跨线程传递值
 * @author yangjunwei
 * @date 2024/7/29
 */
@Slf4j
public class TtlTest {

    ThreadLocal<String> originThreadLocal = new InheritableThreadLocal<>();

    //跨线程复用
    TransmittableThreadLocal<String> threadLocal = new TransmittableThreadLocal<>();

    public void trace(){
        originThreadLocal.set("origin");
        threadLocal.set("traceId");

        log.info("origin-父线程:{}", originThreadLocal.get());
        log.info("父线程:{}", threadLocal.get());

        ThreadUtil.execAsync(()->{
            log.info("origin-子线程:{}", originThreadLocal.get());
            log.info("子线程:{}", threadLocal.get());

            ThreadUtil.execAsync(()->{
                log.info("origin-子线程的子线程:{}", originThreadLocal.get());
                //子线程的子线程依然可以获取到父线程的threadLocl的值
                log.info("子线程的子线程:{}", threadLocal.get());
            });

        });
    }

    public static void main(String[] args) {
        new TtlTest().trace();
    }


}

15:44:50.782 [main] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - origin-父线程:origin
15:44:50.785 [main] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - 父线程:traceId
15:44:50.821 [pool-1-thread-1] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - origin-子线程:origin
15:44:50.822 [pool-1-thread-1] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - 子线程:traceId
15:44:50.822 [pool-1-thread-2] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - origin-子线程的子线程:origin
15:44:50.822 [pool-1-thread-2] INFO com.albert.concurrent.threadlocal.ttl.TtlTest - 子线程的子线程:traceId
```

- 修饰线程池

```Java
/**
 * 修饰线程池
 *
 * @author yangjunwei
 * @date 2024/7/29
 */
@Slf4j
public class TtlExecutorsTest {

    private static ExecutorService executorService = Executors.newFixedThreadPool(10);

    private static TransmittableThreadLocal<String> ttl = new TransmittableThreadLocal<>();

    public static void init() {
        //使用ttl修饰executorService
        executorService = TtlExecutors.getTtlExecutorService(executorService);
    }

    public void test() {
        ttl.set("parent-set-value");
        Runnable task = new Runnable() {
            @Override
            public void run() {
                log.info("ttl value -> {}", ttl.get());
            }
        };
        executorService.submit(task);
    }

    public static void main(String[] args) {
        new TtlExecutorsTest().test();
    }


}

 ttl value -> parent-set-value
```

## 原理

1. 修饰Runnable，将主线程的TTL传入到TtlRunnable的构造方法中。
2. 执行TtlRunnable时，将子线程的Ttl值进行备份。将主线程的Ttl设置到子线程中（value是对象饮用，存在线程安全问题）。
3. 执行子线程逻辑。
4. 删除子线程新增的TTL，将备份还原重新设置到子线程的TTL中。

## 参考链接
[transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local)
[TransmittableThreadLocal原理解析 - 掘金](https://juejin.cn/post/6998552093795549191)
[Java 多线程上下文传递在复杂场景下的实践_java多线程数据传递-CSDN博客](https://blog.csdn.net/vivo_tech/article/details/113500269)