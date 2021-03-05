
### 循环栅栏 CyclicBarrier
---
`CyclicBarrier` 是一种多线程并发控制工具，可循环利用，作用是让所有线程都等待完成后才会进行下一步行动。

#### 构造方法

```
public CyclicBarrier(int parties)
public CyclicBarrier(int parties, Runnable barrierAction)
```
- 第一个构造方法可指定参与线程的个数。

- 第二种构造方法可以指定当 `CyclicBarrier` 完成一次计数之后，需要执行的任务。

#### 重要方法

```
//到达栅栏，等待
public int await() throws InterruptedException, BrokenBarrierException
//设置等待的超时事件
public int await(long timeout, TimeUnit unit) throws InterruptedException, BrokenBarrierException, TimeoutException
```
`await()` 方法，表示线程已经到达栅栏，准备执行。等到约定的线程数都到达之后，即计数完成，开始往下执行。
若有指定需要在计数完成后指定的任务，则先执行指定的任务。

#### CyclicBarrier 和 CountDownLatch 的区别

- `CountDownLatch` 是一次性的，而 `CyclicBarrier` 是可循环利用的。
- `CountDownLatch` 参与线程的职责是不一样的，`await()` 是在等待倒计时结束，`countDown()` 是进行一次倒计时。

- `CyclicBarrier` 参与的线程的职责都是在等待计数结束。

#### 练习例子

[循环栅栏并发控制工具 CyclicBarrier 的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/CyclicBarrier_09.java)

