### 倒计数器CountdownLatch

---

>CountDownLatch是线程相关的一个计数器，CountDownLatch计数器的操作是原子性的，同时只有一个线程去操作这个计数器，所以同时只能有一个线程能减少这个计数器里面的值。可以通过为CountDownLatch设置初始值，任何对象都可以调用await()方法，直到这个计数器的初始值被其他的线程减到0为止，调用await()方法的线程即可继续执行。

- CountDownLatch 位于java.util.concurrent.CountDownLatch

主要方法：

```
//指定初始值
public CountDownLatch(int count);
//计时器倒数，即计数器减1
public void countDown();
//线程休眠，等到计数器countDownLatch为0时唤醒线程，继续执行
public void await() throws InterruptedException ;
```

**倒计数器CountDownLatch例子练习：**

例1：老板监督工人练习。

>有三个工人为老板干活，这个老板会在三个工人全部干完活之后，检查工作。

* 设计Worker类为工人，Boss类为老板类。
* 在调用时指定计数器个数，Worker类调用countDown()方法，使计数器减1。Boss类调用await()方法，使Boss线程休眠，等待计数器减少到0时唤醒Boss类。
* 测试类为CountDownLatchTest，方法为testBossWatchWorker()。

例2：使用CountDownLatch实现多线程按照顺序执行。

>进行读写操作，读操作必须在写操作完成之后进行。

* 设计Read类为读操作，Write类为写操作。
* 测试类为CountDownLatchTest，方法为testRead()方法。


参考：[CountDownLatch例子练习](