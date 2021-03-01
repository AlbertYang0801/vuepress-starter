### 重入锁ReentrantLock

>特点：可重入、可中断、可实现公平锁、可获取锁状态。

#### 特点

 1. 可重入

>可多次获取锁对象，但是释放锁的次数要和获取锁的次数保持一致。

- 若获取锁对象比释放的次数多。则当前线程会一直持有锁对象而不释放，其他线程会因为拿不到锁对象而无法进入临界区。

- 若释放锁的次数比获取锁对象的次数多，则会产生IllegalMonitorStateException异常。

  [可重入的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/ReenterLock_01.java)

 2. 可中断

>提供了lockInterruptibly()方法；获取锁之后，若有中断发生，会响应中断，停止获取锁对象，并释放已有锁。

**中断可有效解决线程间的死锁问题，线程限时等待请求锁也可以有效解决死锁问题。**

[使用中断解除死锁的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/main/java/com/albert/concurrent/lock/deadlock/InterruptDeadLock.java)

3. 可实现公平锁。

```
//创建锁对象时，指定为true，即可实现公平锁。
ReentrantLock fairLock = new ReentrantLock(true);
```

扩展：

- 公平锁：多个线程会按照顺序执行。
  - 优点：不会造成饥饿。
  - 缺点：需要维护一个有序队列，实现成本高，性能低下。
- 非公平锁：已经获取锁对象的线程有更大概率继续持有锁对象。
  -  优点：执行效率高。
  - 容易造成饥饿现象。

#### 主要方法

- lock()方法：获得锁，如果锁已经被占用，则等待。
- unlock()方法：释放锁。
- tryLock()方法：尝试获得锁，如果成功返回true，失败返回false。该方法不等待，立即返回。
- tryLock(long timeout, TimeUnitunit)方法：在指定时间内尝试获得锁，如果成功返回true，失败返回false。**(使用此方法申请锁，可有效避免死锁问题)**
- isHeldByCurrentThread()方法：判断当前线程是否持有该锁。

#### 参考练习

- [重入锁的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/ReenterLock_01.java)
- [重入锁中断特性的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/LockInterrupt_02.java)
- [限时等待的练习-指定等待时间](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/LockTime_03.java)
- [限时等待的练习-不指定等待时间](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/LockTime_04.java)
- [公平锁的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/FairLock_05.java)
