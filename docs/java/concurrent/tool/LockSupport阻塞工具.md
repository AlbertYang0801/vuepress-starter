
### LockSupport 阻塞工具
---
`LockSupport` 是一个非常方便实用的线程阻塞工具，它可以在线程内任意位置让线程阻塞。不需要获取任何锁，也不会抛出中断异常。

#### 常用方法

- 阻塞方法
    - `park()` ：直接阻塞
    - `parkNaors()` ：限时阻塞

`LockSupport.park()` 方法可实现限时等待，还能支持中断响应，但是并不会抛出 `InterruptedException` 异常，它只会默默返回。

- 取消阻塞
    - `unpark()` ：取消线程阻塞状态

#### 总结

与 `Thread.suspend()` 方法相比，推荐使用该方法进行线程阻塞。因为 `Thread.suspend()` 阻塞当前线程时，可能会产生死锁。

而 `LockSupport` 内部使用的是类似信号量的机制，每个线程都有一个许可，若许可可用，则  `park()` 方法会立即返回消费该许可，将许可变为不可用，对应线程会阻塞。而 `unpark()` 方法会使一个许可变为可用，所以即使先调用 `unpark()` 方法， `park()`方法也会顺利执行并结束，而不会造成死锁。

### 源码中的应用

1. `FutureTask` 的 `get()` 方法

   `FutureTask` 的 `get()` 方法在获取结果时，若结果未完成计算，就会阻塞等待，实现阻塞使用的就是 `LockSupport`。

   ```java
   public class FutureTask<V> implements RunnableFuture<V> {
     	//构造方法Callable
       public FutureTask(Callable<V> callable) {
           if (callable == null)
               throw new NullPointerException();
           this.callable = callable;
           this.state = NEW;       // ensure visibility of callable
       }
     	//构造方法Runnable
       public FutureTask(Runnable runnable, V result) {
           this.callable = Executors.callable(runnable, result);
           this.state = NEW;       // ensure visibility of callable
       }
     
     	//get()方法阻塞
       public V get() throws InterruptedException, ExecutionException {
           int s = state;
           if (s <= COMPLETING)
             	//阻塞等待
               s = awaitDone(false, 0L);
           return report(s);
       }
     
     	//阻塞的方法
     	private int awaitDone(boolean timed, long nanos)
           throws InterruptedException {
           final long deadline = timed ? System.nanoTime() + nanos : 0L;
           WaitNode q = null;
           boolean queued = false;
         	//自旋
           for (;;) {
               if (Thread.interrupted()) {
                   removeWaiter(q);
                   throw new InterruptedException();
               }
   
               int s = state;
               if (s > COMPLETING) {
                   if (q != null)
                       q.thread = null;
                   return s;
               }
               else if (s == COMPLETING) // cannot time out yet
                 	//让出线程资源
                   Thread.yield();
               else if (q == null)
                   q = new WaitNode();
               else if (!queued)
                 	//CAS
                   queued = UNSAFE.compareAndSwapObject(this, waitersOffset,
                                                        q.next = waiters, q);
               else if (timed) {
                   nanos = deadline - System.nanoTime();
                   if (nanos <= 0L) {
                       removeWaiter(q);
                       return state;
                   }
                 	//阻塞工具LockSupport，实现限时阻塞
                   LockSupport.parkNanos(this, nanos);
               }
               else
                 	//直接阻塞
                   LockSupport.park(this);
           }
       }
     
     
   }
   ```

   







#### 参考练习

[LockSupport的简单练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/LockSupport_10.java)

