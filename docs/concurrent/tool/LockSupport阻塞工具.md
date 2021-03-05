
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

#### 参考练习

[LockSupport的简单练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/LockSupport_10.java)

