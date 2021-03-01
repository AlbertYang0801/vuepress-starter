### 重入锁的好搭档：Condition

---

`Condition`是和`重入锁`搭配使用的，类似于`wait()`和`notify()`方法。`Object.wait()`和`Object.notify()`方法是与`synchronized`搭配使用的，而`Condition`是与`重入锁`搭配使用的。通过`lock`接口的`newCondition()`方法即可创建一个与当前锁绑定的`Condition`对象，利用该对象，就可以实现让线程在合适时机等待或得到通知。

#### 主要方法

```java
void await() throws InterruptedException;

void awaitUninterruptibly();

boolean await(long time, TimeUnit unit) throws InterruptedException;

boolean awaitUntil(Date deadline) throws InterruptedException;

void signal();

void signalAll();
```

- `await()`方法会使当前线程等待，并`释放锁`。当其他线程使用`signal()`方法或者`signalAll()`方法时，线程会被唤醒并开始竞争锁资源。当线程被中断时，也能跳出等待。
- `awaitUninterruptibly()`和`await()`方法基本一致，区别是在等待过程中不会响应中断。
- `signal()`用于唤醒一个在等待中的线程，调用该方法的线程必须拥有锁对象，否则会报异常。
- `signalAll()`方法会唤醒所有在等待中的线程。

#### 参考练习

[Condition的练习](https://gitee.com/zztiyjw/concurrent-practice/tree/master/src/test/java/com/albert/concurrent/book/chapterthree/Condition_06.java)

#### 源码应用

在阻塞队列`BlockQueue`实现阻塞的`put()`方法和`take()`里，就使用了`Condition`，下面以`ArrayBlockQueue`源码为例。

```java

  public class ArrayBlockingQueue<E> extends AbstractQueue<E>
        implements BlockingQueue<E>, java.io.Serializable {  

		/** The queued items */
    final Object[] items;

    /** items index for next take, poll, peek or remove */
    int takeIndex;

    /** items index for next put, offer, or add */
    int putIndex;
    
    /** Number of elements in the queue */
    int count;

    /*
     * Concurrency control uses the classic two-condition algorithm
     * found in any textbook.
     */

    /** Main lock guarding all access */
    final ReentrantLock lock;

    /** Condition for waiting takes */
    private final Condition notEmpty;

    /** Condition for waiting puts */
    private final Condition notFull;

    public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
    }
    
    public ArrayBlockingQueue(int capacity, boolean fair) {
        if (capacity <= 0)
            throw new IllegalArgumentException();
      	//根据传入的长度创建数组
        this.items = new Object[capacity];
      	//在构造方法中初始化锁（可指定公平/非公平）
        lock = new ReentrantLock(fair);
      	//在构造方法中初始化锁的Condition
        notEmpty = lock.newCondition();
        notFull =  lock.newCondition();
    }

    //******************************入队*********************************
    
    
		public void put(E e) throws InterruptedException {
      	//判断为空抛出空指针异常
        checkNotNull(e);
      	//获取全局锁
        final ReentrantLock lock = this.lock;
      	//加锁，响应中断
        lock.lockInterruptibly();
        try {
          	//当队列数据长度为内部数组的长度的时候，即队列满的情况，进行等待。
            while (count == items.length)
              	//使用Condition的await()方法进行等待，会使当前线程等待，并释放锁。当其他线程使用signal()方法或者signalAll()方法时，线程会被唤醒并开始竞争锁资源。当线程被中断时，也能跳出等待。
                notFull.await();
          	//添加元素
            enqueue(e);
        } finally {
          	//释放锁
            lock.unlock();
        }
    }
    
     /**
     * Inserts element at current put position, advances, and signals.
     * Call only when holding lock.
     */
    private void enqueue(E x) {
        // assert lock.getHoldCount() == 1;
        // assert items[putIndex] == null;
        final Object[] items = this.items;
      	//添加元素
        items[putIndex] = x;
        if (++putIndex == items.length)
            putIndex = 0;
      	//总数+1
        count++;
      	//通知队列为空时候，调用的notEmpty的await()方法。
        notEmpty.signal();
    }
    
    //******************************出队*********************************
    
    public E take() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
          	//当队列长度为0的时候进行等待。
            while (count == 0)
              	//await()方法进行等待，会使当前线程等待，并释放锁。当其他线程使用signal()方法或者signalAll()方法时，线程会被唤醒并开始竞争锁资源。notEmpty对应的signal()方法在enqueue()方法内部。
                notEmpty.await();
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
    
     /**
     * Extracts element at current take position, advances, and signals.
     * Call only when holding lock.
     */
    private E dequeue() {
        // assert lock.getHoldCount() == 1;
        // assert items[takeIndex] != null;
        final Object[] items = this.items;
        @SuppressWarnings("unchecked")
      	//获取出队元素
        E x = (E) items[takeIndex];
      	//将出队元素位置置为null
        items[takeIndex] = null;
        if (++takeIndex == items.length)
            takeIndex = 0;
        count--;
        if (itrs != null)
            itrs.elementDequeued();
      	//唤醒notFull.await()
        notFull.signal();
        return x;
    }
    ......
      
}     
```

