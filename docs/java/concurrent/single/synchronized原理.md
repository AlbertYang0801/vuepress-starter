# synchronized原理

[synchronized原理详解（通俗易懂超级好）-CSDN博客](https://blog.csdn.net/qq_43061290/article/details/124187639)

## 特性

- 原子性

  synchronized 修饰的对象或类所有操作都是原子性的。线程需要获取锁，保证整个操作过程的原子性。

  比如 i++这种赋值操作。

- 可见性

  一个线程如果要访问该类或对象必须先获得它的锁，而这个**锁的状态对于其他任何线程都是可见**的，并且在**释放锁之前会将对变量的修改刷新到主存当中**，**保证资源变量的可见性。**

  如果某个线程占用了该锁，其他线程就必须在锁池中等待锁的释放。

- 有序性

  保证只有一个线程访问，确保了有序性。

- 可重入性

  支持同一个线程对资源的重复加锁。

### synchronized和volatile区别

1. 都具备可见性。
2. 都具备有序性。
3. synchronized 具备原子性，但是volatile 不具备原子性。

------

### volatile

- 可见性

  被volatile修饰的变量，每当**值需要修改时都会立即更新主存**，**主存是共享的**，所有线程可见，所以确保了其他线程读取到的变量永远是最新值，保证可见性。

- 有序性

  **禁止指令重排**，保证指令有序性。

## 用法

### 同步代码块

重点是保证多个线程的锁对象是一致的。

- this作为锁对象

```java
//this的锁对象指当前类的实例
synchronized (this) {
    i++;
}
```

- 当前类作为锁对象

```java
//使用当前类作为锁对象
synchronized (SynchrodizedCodebolck.class) {
    x++;
}
```

- 不变对象作为锁对象

```java
static final Object OBJECT = new Object();
//正确使用对象作为锁
synchronized (OBJECT) {
    n++;
}
```

------

### 同步方法

synchronized 加在普通方法上或者静态方法上，可实现同步方法。

- 同步普通方法 普通同步方法，锁对象为当前类的实例对象等同于this。

```java
    public synchronized void increaseI() {
        i++;
    }
    等价于
    public void increase() {
        synchronized (this) {
            i++;
        }
    }
```

- 同步静态方法 静态同步方法，锁对象为当前类对象

```java
    private synchronized static void increaseM() {
        m++;
    }
    等价于
    private static void increase() {
        synchronized (NumberOperatingStatic.class) {
            m++;
        }
    }
```

## 底层原理

### 实例对象头

堆里面的对象包含三部分：

- 对象头

  1. Mark Word：存储的是对象的 hashCode、**锁信息**、或分代年龄、GC标注等信息。

     ![image-20250528163142320](https://s2.loli.net/2025/05/28/wEZqSUj4CBtlibD.png)

  2. Class Metadata Address： **存储对象所属类(元数据) 的指针**，JVM通过这个确定这个对象属于哪个类。

- 对象实例数据

- 对齐填充

  ![image-20250528163154481](https://s2.loli.net/2025/05/28/jIr2yAmUBJegiRc.png)



### Monitor对象（重量级锁）

每一个锁都对应一个**Monitor对象**，每个对象都有一个与之关联的Monitor对象，在HotSpot虚拟机中它是由ObjectMonitor实现的(C++实现)。

Monitor 对象**存在于每个Java对象的对象头里** (存储的指针的指向)。

> 当一个线程执行synchronized(obj)这段代码时，obj对象就会与操作系统提供的Monitor对象相关联，即用一个指针指向Monitor 对象，其地址存储在MarkWord里。

```
//详细介绍重要变量的作用
ObjectMonitor() {
    _header       = NULL;
    _count        = 0;   // 重入次数
    _waiters      = 0,   // 等待线程数
    _recursions   = 0;
    _object       = NULL;
    _owner        = NULL;  // 当前持有锁的线程
    _WaitSet      = NULL;  // 调用了 wait 方法的线程被阻塞 放置在这里
    _WaitSetLock  = 0 ;
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ;
    FreeNext      = NULL ;
    _EntryList    = NULL ; // 等待锁 处于block的线程 有资格成为候选资源的线程
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
  }
```

- `_owner`：指向获得 `ObjectMonitor` 对象的线程。（即获得锁的线程）

- `_EntryList`：处于等待锁 `block` 状态的线程，会被加入到这里。

- `_WaitSet`：处理 `wait` 状态的线程，会被加入到这里。（调用同步对象 `wait` 方法）

  > wati状态线程已经获取锁然后主动等待，在业务完成后，等待 notify 唤醒。block 是阻塞状态，指的是没获取到锁。

> 这里 synchronized 是以 monitor 对象为基础实现的同步，加锁的对象里面存了指向 monitor 对象的指针。而在并发情况下时，线程会竞争 monitor，只有竞争到monitor 的才持有锁。其它线程会进入 wait 或者 block 状态。

## 锁升级

无锁 < 偏向锁 < 轻量级锁 < 重量级锁

![image-20250528163326356](https://s2.loli.net/2025/05/28/CQpo2cP4rubh3kN.png)

### 重量级锁

monitor 是互斥锁，持有锁线程会阻塞其它线程。是一个重量级锁。

**缺点是线程开销很大。**

> 在线程获取锁之后，会阻塞其它需要锁的线程。线程阻塞情况下是不消耗资源的，但是将线程阻塞和将线程唤醒的过程是比较消耗资源的。因为线程是系统资源，需要从用户态切换到用户态执行阻塞和唤醒。

原理就是依赖锁的 moniotr对象来保证只有一个线程能获取锁，而且会阻塞其它线程。

### 偏向锁

偏向锁假定将来只有第一个申请锁的线程会使用锁。

只需要在对象头的 Mark Word 中进行一次 CAS 记录 owner。

如果记录成功，则偏向锁获取成功，记录**锁状态为偏向锁**，以后当前线程等于owner就可以零成本的直接获得锁；否则，说明有其他线程竞争，升级**为轻量级锁**。

### 为什么要引入偏向锁

引入偏向锁是为了在**无多线程竞争的情况下尽量减少不必要**的CAS 操作，因为轻量级锁的获取及释放**依赖多次 CAS 原子指令**，而偏向锁只需要在置换 ThreadID 的时候依赖一次 CAS 原子指令，代价就是一旦出现多线程竞争的情况就必须撤销偏向锁。

### 轻量级锁

当有别的线程参与到偏向锁的竞争中时，会先判断 markword 中的线程ID与这个线程是否一致，如果不一致，则会立即撤销偏向锁，升级为**轻量级锁**。

### 加锁原理

每个线程都会在自己的栈中维护一个 `LockRecord(LR)`，然后每个线程在竞争锁时，都试图将锁对象头中的`markword` 设置为指向自己LR的指针，哪个线程设置成功，则意味着哪个线程成功获取到锁。

**Lock record就是栈中的锁记录。**

轻量级锁是多线程并发的，如果获取锁失败，表示有其他线程竞争锁，当前线程便**尝试使用自旋来获取锁**。如果在**自旋一定次数后仍未获得锁，那么轻量级锁将会升级成重量级锁**。

> 当线程的自旋次数过长依旧没获取到锁，为避免CPU无端耗费，锁由轻量级锁升级为重量级锁。

![image-20250528163340960](https://s2.loli.net/2025/05/28/wEZqSUj4CBtlibD.png)

## 可见性

### synchronized怎么保证可见性

在Java内存模型（JMM）中，每个线程都有自己的工作内存，里面保存了使用变量的副本。

主内存保存着原始变量。

当代码进入 synchronized 快时，会从主内存加载最新变量到工作内存。而结束之后会把工作内存的变量刷新回主内存。

这样就保证了可见性。