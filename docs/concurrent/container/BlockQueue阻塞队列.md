### 阻塞队列BlockQueue

阻塞队列`BlockQueue`比起传统的`Queue`多了阻塞的功能，适合用于多线程之间的数据共享。阻塞主要发生在队列为空和队列满的情况。

- 在队列为空的时候，操作元素出队的线程会进行循环等待，直到队列变为非空。
- 在队列满的时候，操作元素入队的线程会进行循环等待，直到队列变为非满。

#### 常见方法

`BlockQueue入队`的方法有如下几种：

- `offer()`方法，如果队列已满，无法存放，直接返回false。

- `add()`方法，实际调用了offer()方法，增加了（Queue Full）的异常信息返回。
- `put()`方法，若队列已满，会进行线程等待，直到队列有空余位置，会将线程唤醒，进行插入操作。

`BlockQueue出队`的方法有如下几种：

- `poll()`方法，若队列为空，则返回null.

 * `take()`方法，若队列为空，会进行线程等待，直到队列不为空，会将等待线程唤醒，进行获取操作。

#### 队列类型

`BlockQueue`是一个接口，其实现类有`ArrayBlockingQueue`、`LinkedBlockingQueue`、`SynchronousQueue`、`DelayQueue`、`PriorityBlockingQueue`等。下面以`ArrayBlockingQueue`为例，主要分析`put()`方法和`take()`方法的阻塞实现。

##### 1.ArrayBlockingQueue（有界队列）

是一个基于数组结构的有界阻塞队列，此队列按 FIFO（先进先出）原则对元素进行排序，由于结构基于数组，所以在创建的时候需要指定长度。

```java
ArrayBlockingQueue<Integer> blockingQueue = new ArrayBlockingQueue<>(5);
```

结合源码，查看`队列空`和`队列满`时，阻塞的发生。

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



##### 2.LinkedBlockingQueue（无界队列）

一个基于链表结构的阻塞队列，此队列按FIFO （先进先出） 排序元素，吞吐量通常要高于ArrayBlockingQueue。静态工厂方法Executors.newFixedThreadPool()使用了这个队列。

##### 3.SynchronousQueue（同步队列）

一个不存储元素的阻塞队列。每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于LinkedBlockingQueue，静态工厂方法Executors.newCachedThreadPool使用了这个队列。

##### 4.DelayQueue（延迟队列）

一个任务定时周期的延迟执行的队列。根据指定的执行时间从小到大排序，否则根据插入到队列的先后排序。

##### 5.PriorityBlockingQueue（优先级队列）

一个具有优先级的无限阻塞队列。

