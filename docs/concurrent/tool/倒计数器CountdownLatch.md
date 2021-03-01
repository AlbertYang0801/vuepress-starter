### 倒计数器CountdownLatch

---

`CountDownLatch`是线程相关的一个倒计数器。位于`java.util.concurrent.CountDownLatch`。

#### 主要方法

```java
//指定初始值
public CountDownLatch(int count);
//计时器倒数，即计数器减1
public void countDown();
//线程休眠，等到计数器countDownLatch为0时唤醒线程，继续执行
public void await() throws InterruptedException ;
```



在创建的时候，可以为`CountDownLatch`设置初始值`n`，线程可进行倒数操作`countDown()`和等待操作`await()`。

`CountDownLatch`计数器的操作是原子性的，同时只能有一个线程去操作这个计数器，所以同时只能有一个线程能减少这个计数器里面的值。任何线程都可以调用对应的`await()`方法，直到这个计数器的初始值被其他的线程减到0为止，调用`await()`方法的线程即可继续执行。

#### 练习例子

例1：老板监督工人练习。

>有三个工人为老板干活，这个老板会在三个工人全部干完活之后，检查工作。

* 设计`Worker`类为工人。

  ```java
  @Slf4j
  public class Worker implements Runnable {
  
      private CountDownLatch countDownLatch;
      private String workerName;
  
      public Worker(CountDownLatch countDownLatch, String workerName) {
          this.countDownLatch = countDownLatch;
          this.workerName = workerName;
      }
  
      @Override
      public void run() {
          //开始工作
          this.doWorker();
          //计时器倒数，即计数器减1
          this.countDownLatch.countDown();
      }
  
      private void doWorker(){
          log.info(this.workerName+"工人开始工作");
          //当前线程休眠5秒, 即工人工作5秒
          try {
              TimeUnit.SECONDS.sleep(new Random().nextInt(3));
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
          log.info(this.workerName+"工人工作结束！");
      }
  
  
  }
  ```

* 设计`Boss`类为老板。

  ```java
  public class Boss implements Runnable{
  
      private CountDownLatch countDownLatch;
  
      public Boss(CountDownLatch countDownLatch) {
          this.countDownLatch = countDownLatch;
      }
  
      @Override
      public void run() {
          log.info("老板等待所有工人完成工作，准备视察工作");
          try {
              //线程休眠，等到计数器countDownLatch为0时唤醒线程，继续执行
              this.countDownLatch.await();
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
          log.info("工人工作都做完了，老板开始视察工作！");
      }
  
  
  }
  ```

* 在调用时指定计数器个数，`Worker`类调用`countDown()`方法，使计数器减1。`Boss`类调用`await()`方法，使`Boss`线程休眠，等待计数器减少到0时唤醒`Boss`类。

  ```java
  		/**
       * 测试老板检查工人工作的例子
       */
      @Test
      public void testBossWatchWorker() {
  
          //创建自定义线程工厂
          ThreadFactory myThreadFactory = new ThreadFactoryBuilder().setNameFormat("albert-pool-%d").build();
  
          //使用线程池的构造函数进行创建线程池
          ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(3,10,
                  0L,TimeUnit.MILLISECONDS,new LinkedBlockingDeque<Runnable>(),
                  myThreadFactory,new ThreadPoolExecutor.DiscardPolicy());
  
          //创建一个为3的计时器
          CountDownLatch countDownLatch = new CountDownLatch(3);
  
          //创建Boss线程对象
          Boss boss = new Boss(countDownLatch);
  
          //创建3个工人线程对象
          Worker workerA = new Worker(countDownLatch, "孙圆圆");
          Worker workerB = new Worker(countDownLatch, "艾伯特");
          Worker workerC = new Worker(countDownLatch, "杨依惠");
  
          //线程添加到线程池中执行
          threadPoolExecutor.execute(workerA);
          threadPoolExecutor.execute(workerB);
          threadPoolExecutor.execute(workerC);
          threadPoolExecutor.execute(boss);
  
          try {
              //线程休眠，休眠结束关闭线程池
              TimeUnit.SECONDS.sleep(8);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
  
          //关闭线程池
          threadPoolExecutor.shutdown();
  
      }
  ```

  

例2：使用`CountDownLatch`实现多线程之间按照顺序执行。

>进行读写操作，读操作必须在写操作完成之后进行。

* 设计`Read`类为读操作。

  ```java
  public class Read implements Runnable{
  
      private CountDownLatch countDownLatch;
  
      public Read(CountDownLatch countDownLatch) {
          this.countDownLatch = countDownLatch;
      }
  
      @SneakyThrows
      @Override
      public void run() {
          log.info("用户准备读取文件");
          this.countDownLatch.await();
          log.info("用户读取文件成功！");
      }
  
  }
  ```

* 设计`Write`类为写操作。

  ```java
  public class Write implements Runnable {
  
      private final CountDownLatch countDownLatch;
  
      public Write(CountDownLatch countDownLatch) {
          this.countDownLatch = countDownLatch;
      }
  
      @SneakyThrows
      @Override
      public void run() {
          log.info("用户开始写入");
          //线程休眠，模拟写操作
          TimeUnit.SECONDS.sleep(new Random().nextInt(2));
          log.info("用户写入完成");
          this.countDownLatch.countDown();
      }
  
  
  }
  ```

* 测试读写操作，读操作必须在写操作之后。

  ```java
  		@SneakyThrows
      @Test
      public void testRead(){
          //创建线程池
          ExecutorService executorService = Executors.newCachedThreadPool();
  
          //创建计数器
          CountDownLatch countDownLatch = new CountDownLatch(1);
  
          Write write = new Write(countDownLatch);
          Read read = new Read(countDownLatch);
  
          executorService.execute(write);
          executorService.execute(read);
  
          //休眠5秒
          TimeUnit.SECONDS.sleep(new Random().nextInt(5));
          //关闭线程池
          executorService.shutdown();
  
      }
  ```

  


例3：LeetCode题目 [1114. 按序打印](https://leetcode-cn.com/problems/print-in-order/)


> 使三个线程按照顺序调用。

- 题解

  ```java
  public class PrintFooCountDownLatch {
  
        private CountDownLatch secondCountDownLatch = new CountDownLatch(1);
  
        private CountDownLatch thirdCountDownLatch = new CountDownLatch(1);
  
        public PrintFooCountDownLatch() {
  
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
            secondCountDownLatch.countDown();
        }
  
        public void second(Runnable printSecond) throws InterruptedException {
            secondCountDownLatch.await();
            // printSecond.run() outputs "second". Do not change or remove this line.
            printSecond.run();
            thirdCountDownLatch.countDown();
        }
  
        public void third(Runnable printThird) throws InterruptedException {
            // printThird.run() outputs "third". Do not change or remove this line.
            thirdCountDownLatch.await();
            printThird.run();
        }
  
  
    }
  ```

  

