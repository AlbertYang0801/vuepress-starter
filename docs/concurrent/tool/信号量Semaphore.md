### 信号量 Semaphore
---
信号量是锁的增强，位于 `java.util.concurrent.Semaphore`。无论是内部锁 `synchronized` 和重入锁 `ReentrantLock`，一次都只是允许一个线程访问一个资源。而信号量可以指定多个线程，同时访问某一个资源。信号量既提供了同步机制，又可以控制同时最大访问的个数。

#### 构造方法

```java
//指定同时最大访问个数
Semaphore semaphore = new Semaphore(5);
//可以指定同时最大访问个数和是否公平
Semaphore semaphore = new Semaphore(5, true);
```

- 公平信号量：
指的是获得锁的顺序与调用 `semaphore.acquire()` 的顺序有关，但不代表百分百获得信号量，仅仅在概率上能得到保证。
#### 常用方法

```java
//请求获取许可，如果未响应，则线程会等待。直到线程有释放许可或者中断发生。
public void acquire()
//和acquire()方法类似，但是不响应中断。
public void acquireUninterruptibly()
//尝试获取许可，若成功返回true，获取不成功返回false。不会等待，立即返回。
public Boolean tryAcquire()
//尝试在指定时间内获取许可，若成功返回true，获取不成功返回false。超过指定时间则不继续等待，立即返回。
public Boolean tryAcquire(long timeout, TimeUnit unit)
//释放一个许可，让其它等待的线程可以访问资源。（可以使信号量的许可总数加1）
public void release()
//返回信号量当前可用许可个数
public int availablePermits()
```

​	参考：[信号量 Semaphore 的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/Semaphore_07.java)

#### 练习例子

- 例 1：停车场问题。

>停车场只有10个车位，现在有30辆车去停车。当车位满时出来一辆车才能有一辆车进入停车。

​	参考：[停车场问题的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/main/java/com/albert/concurrent/expand/semaphore/ParkingCars.java)

- 例 2：使用信号量 `Semaphore` 实现多线程按照顺序执行。

>产品、开发、测试同时来上班，产品给需求之后，开发才可以开始开发，开发完成之后，测试才可以开始测试。按照产品->开发->测试的顺序执行。

​	参考：[信号量 Semaphore 实现多线程按照顺序执行的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/main/java/com/albert/concurrent/expand/semaphore/SemaphoreOrder.java)

- 例 3：LeetCode题目 [1114. 按序打印](https://leetcode-cn.com/problems/print-in-order/)

```java
public class PrintFooSemaphore {

    private Semaphore one = new Semaphore(0);

    private Semaphore two = new Semaphore(0);

    public PrintFooSemaphore() {

    }

    public void one() {
        log.info("one");
        System.out.println("one");
    }

    public void two() {
        log.info("two");
        System.out.println("two");
    }

    public void three() {
        log.info("three");
        System.out.println("three");
    }

    public void first(Runnable printFirst) throws InterruptedException {
        // printFirst.run() outputs "first". Do not change or remove this line.
        printFirst.run();
        one.release();
    }

    public void second(Runnable printSecond) throws InterruptedException {
        one.acquire();
        // printSecond.run() outputs "second". Do not change or remove this line.
        printSecond.run();
        two.release();
        one.release();
    }

    public void third(Runnable printThird) throws InterruptedException {
        // printThird.run() outputs "third". Do not change or remove this line.
        two.acquire();
        printThird.run();
        two.release();
    }

```

