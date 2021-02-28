### 读写锁ReadWriteLock
---
锁可分为排他锁和共享锁。`synchronized`和`ReentrantLock`都是排他锁，只允许线程独占资源。而在多个线程进行读操作的时候，单个线程占用资源进行读取，其他需要读取的线程会进行等待，而这种等待是不合理的。读写锁`ReadWriteLock`就是针对读操作和写操作进行的锁优化。

#### 读写锁互斥规则

- `读-读不互斥`：并发执行读操作，提高效率。
- `读-写互斥`：读会阻塞写，写也会阻塞读。
- `写-写互斥`：写线程会独占。

#### 注意事项

读写锁需要注意：

1. 读锁与读锁之间是不互斥的，读锁与写锁之间是互斥的。
2. 写锁与其它锁都是互斥的。
3. 保证写锁是独占资源的。
4. 读线程之间是并发执行的，而写线程执行的时候是独占的。能提高读线程的执行效率。



#### 读写锁的练习和可重入锁的效率对比

与可重入锁比较：

- 可重入锁是互斥的。
- 将读线程和写线程的锁换成可重入锁，之后线程会按照顺序执行，执行效率变慢。

```java
public class ReadWriteLock_08 {

    /**
     * 读写锁
     */
    private final static ReentrantReadWriteLock readWriteLock = new ReentrantReadWriteLock();

    /**
     * 读锁
     */
    private final static Lock readLock = readWriteLock.readLock();

    /**
     * 写锁
     */
    private final static Lock writeLock = readWriteLock.writeLock();

    /**
     * 可重入锁，用来和读写锁比较效率
     */
    private final static Lock lock = new ReentrantLock();

    private int value;

    /**
     * 模拟读操作
     */
    public int handleRead(Lock lock) throws InterruptedException {
        try {
            lock.lock();
            Thread.sleep(1000);
            //返回读取到的值
            return value;
        } finally {
            lock.unlock();
        }
    }

    /**
     * 模拟写操作
     */
    public void handleWrite(Lock lock, int index) throws InterruptedException {
        try {
            lock.lock();
            Thread.sleep(1000);
            //修改值
            this.value = index;
            System.out.println("修改的值为：" + index);
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        ReadWriteLock_08 readWriteLock08 = new ReadWriteLock_08();

        //读线程（与写线程互斥，与读线程可并行）
        Runnable readRunnable = () -> {
            try {
                //读操作（指定锁为读锁）
                int i = readWriteLock08.handleRead(readLock);
                System.out.println("读取到的数值为：" + i);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        //写线程（与其它线程互斥）
        Runnable writeRunnable = () -> {
            try {
                //写操作（指定锁为写锁）
                readWriteLock08.handleWrite(writeLock, new Random().nextInt());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        for (int i = 0; i < 2; i++) {
            //写线程执行，执行时是互斥的，写线程执行时会独占资源。
            new Thread(writeRunnable).start();
        }

        for (int i = 0; i < 18; i++) {
            //读线程执行，执行时是并发的。遇到写线程执行会阻塞，等待写线程执行完毕释放资源。
            new Thread(readRunnable).start();
        }


    }


}
```


