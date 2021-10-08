

### ThreadLocal总结

* [概念](#概念)
* [简单例子](#简单例子)
* [源码阅读](#源码阅读)
* [为什么使用弱引用](#为什么使用弱引用)
* [怎样防止内存泄漏](#怎样防止内存泄漏)
* [相关问题](#相关问题)
* [参考链接](#参考链接)


#### 概念

ThreadLocal 提供了线程的局部变量，只有当前线程可以操作，不会和其它线程的局部变量产生冲突，实现了变量的线程安全。`ThreadLocal<T>` 位于 `java.lang` 包下，可以封装各种类型的变量。ThradLocal 是除了实现同步以外的一种保证多线程变量访问的线程安全的方式。

#### 简单例子

```java
public class ThreadLocalDemo {

    private static ThreadLocal<String> threadLocal = new ThreadLocal<>();

    public static void main(String[] args) {
        //主线程
        threadLocal.set("main");
        new Thread(()->{
            //新线程
            threadLocal.set("thread");
            System.out.println(threadLocal.get());
        }).start();
        System.out.println( threadLocal.get());
    }
    
    
}

//output
//main
//thread
```

从代码中可以看到，新线程和主线程之间对  ThreadLocal 的修改不会互相影响。

对例子的内存图分析如下，可以看到两个线程其实指向的是同一个 ThreadLocal  对象，而每个线程都会在内存中维护一个 ThreadLocalMap ，需要注意 ThreadLocalMap 存放的 key 是 ThreadLocal 对象的弱引用，value 存放的是设置的值。(具体可见源码阅读)

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210508141039.png)

#### 源码阅读

ThreadLocal 内部维护了一个静态类 ThreadLocalMap , ThreadLocalMap  内部维护了一个 Entry  类用来存储数据。 key 值存放的就是 ThreadLocal 对象，而 value 存放的就是 ThreadLocal 里需要存放的变量。

- set方法

  将数据添加到 ThreadLocalMap 中，  key 是 ThreadLocal 对象 ，而 value 是需要设置的 ThreadLocal 里需要存放的变量。

  ```java
  public class ThreadLocal<T> {
    
      ThreadLocal.ThreadLocalMap threadLocals = null;
    
    	//set方法
      public void set(T value) {
          //获取当前线程
          Thread t = Thread.currentThread();
          //获取当前线程拥有的局部变量map，对应threadLocals
          ThreadLocalMap map = getMap(t);
          if (map != null)
              //将ThreadLocal作为key，传入value保存到map中
              map.set(this, value);
          else
              //若map为空，新建一个
              createMap(t, value);
      }
  
      ThreadLocalMap getMap(Thread t) {
          return t.threadLocals;
      }
    
      void createMap(Thread t, T firstValue) {
        	//调用ThreadLocalMap的构造方法
          t.threadLocals = new ThreadLocalMap(this, firstValue);
      }
  
  
      static class ThreadLocalMap {
        
        			private Entry[] table;
  
           		//ThreadLocalMap内存封装的Entry用于保存数据（弱引用）
              static class Entry extends WeakReference<ThreadLocal<?>> {
                  /** The value associated with this ThreadLocal. */
                  Object value;
  								
                	//key值是ThreadLocal
                  Entry(ThreadLocal<?> k, Object v) {
                      super(k);
                      value = v;
                  }
              }
        
              ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
                	//初始化数组
                  table = new Entry[INITIAL_CAPACITY];
                  int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);
                	//保存ThreadLocal对象
                  table[i] = new Entry(firstKey, firstValue);
                  size = 1;
                  setThreshold(INITIAL_CAPACITY);
          		}
  
              ......
  
       }
    
  }
  ```

- get方法

  首先根据当前线程获取对应的 ThreadLocalMap 实例，该实例存放了对应的变量值，其中 key 是 ThreadLocal 对象。根据 ThreadLocal  对象从 ThreadLocalMap  中获取 ThreadLocal 对应的 Entry ，返回Entry 里的 value 值，即为 ThreadLocal 对应的变量值。

  ```java
  public class ThreadLocal<T> {
    
    	ThreadLocal.ThreadLocalMap threadLocals = null;
    
      public T get() {
          //获取当前线程
          Thread t = Thread.currentThread();
        	//获取当前线程维护的ThreadLocalMap
          ThreadLocalMap map = getMap(t);
          if (map != null) {
            	//根据ThreadLocal对象（key）从ThreadLocalMap获取对应存放的实体类
              ThreadLocalMap.Entry e = map.getEntry(this);
              if (e != null) {
                  @SuppressWarnings("unchecked")
                	//从Entry获取value值
                  T result = (T)e.value;
                  return result;
              }
          }
          return setInitialValue();
      }
    
    	//根据线程获取ThreadLocalMap
      ThreadLocalMap getMap(Thread t) {
          return t.threadLocals;
      }
    
      static class ThreadLocalMap {
        
        			private Entry[] table;
  
           		//ThreadLocalMap内存封装的Entry用于保存数据（弱引用）
              static class Entry extends WeakReference<ThreadLocal<?>> {
                  /** The value associated with this ThreadLocal. */
                  Object value;
  								
                	//key值是ThreadLocal
                  Entry(ThreadLocal<?> k, Object v) {
                      super(k);
                      value = v;
                  }
              }
        
        			//根据ThreadLocal获取对应Entry
              private Entry getEntry(ThreadLocal<?> key) {
              		int i = key.threadLocalHashCode & (table.length - 1);
                  Entry e = table[i];
                  if (e != null && e.get() == key)
                      return e;
                  else
                      return getEntryAfterMiss(key, i, e);
          		}
  
              ......
  
       }
    
    
  }
  ```



#### 为什么使用弱引用

> 弱引用：如果一个对象仅被一个弱引用指向，那么在下一次内存回收的时候，这个对象就会被垃圾回收器回收掉。

实际保存  ThreadLocal 变量值的是 Entry 类，该类是 ThreadLocal  内部类 ThreadLocalMap 里的内部类。通过源码可以看到  key 的赋值使用了弱引用。

```java
        static class Entry extends WeakReference<ThreadLocal<?>> {
            /** The value associated with this ThreadLocal. */
            Object value;

            Entry(ThreadLocal<?> k, Object v) {
              	//调用父类的方法
                super(k);
                value = v;
            }
        }
```



继续分析上方的例子，如果我们在使用 ThreadLocal  结束之后，将线程中的 ThreadLocal引用 指向 `null`，即释放 ThreadLocal 对象。

```java
ThreadLocalDemo.threadLocal = null;
```

- 假设 ThreadLocalMap 的 key 对应的引用是 `强引用`。

> 强引用：指创建一个对象并把这个对象赋给一个引用变量， 强引用有引用变量指向时永远不会被垃圾回收。即使内存不足的时候宁愿报OOM也不被垃圾回收器回收，我们new的对象都是强引用

此时如图所示，虽然线程不会拥有对  ThreadLocal  对象的引用，但是线程内部的 ThreadLocalMap 会一直持有对  ThreadLocal 的引用，而这个时候 ThreadLocal  就无法被真正释放，占用着内存直到线程结束。由于  ThreadLocal 没有被线程引用而且占据着内存，就造成了 `内存泄漏` 的问题。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210508141057.png)

- 而如果 ThreadLocalMap 的 key 对应的引用是 `弱引用`，根据 `弱引用` 的定义，如果一个对象仅被一个弱引用指向，那么在下一次内存回收的时候，这个对象就会被垃圾回收器回收掉。所以当设置 ThreadLocal  为 `null` 之后，线程对象不再指向 ThreadLocal 对象 ，此时指向 ThreadLocal 对象的只有 ThreadLocalMap 里的 key  对它的弱引用，这样 ThreadLocal  就会在下一次内存回收的时候被回收掉，进而避免了 `内存泄漏` 的发生。

**总结**

使用 `弱引用` 的作用是为了防止 ThreadLocal 对象无法回收造成的 `内存泄漏`。



#### 怎样防止内存泄漏

有了`弱引用` 的加入之后，虽然可以避免 ThreadLocal  对象无法回收造成的 `内存泄漏`，但此时使用 ThreadLocal 还是会存在 `内存泄漏` 的问题。

**原因分析**

当 key 值的 ThreadLocal 对象为 `null` 时，因为 `弱引用` 的原因，ThreadLocal 对象会被内存回收。但此时 ThreadLocalMap 里对应的 value 值的引用还存在，由于 key 已被回收，所以 value 无法被访问并占据内存，进而产生了 `内存泄漏`。

**解决办法**

ThreadLocal 提供了 `remove()` 方法，可以将 ThreadLocalMap 里对应的 `key` 和 `value` 都清空掉。

```java
     public void remove() {
       	 //获取当前线程的ThreadLocalMap
         ThreadLocalMap m = getMap(Thread.currentThread());
         if (m != null)
           	 //根据ThreadLocal对象从ThreadLocalMap清除
             m.remove(this);
     }


```

**总结**

每次在操作完 ThreadLocal  之后，在适当的位置调用 `remove()` 方法。



#### 相关问题

1. 线程池使用 Threadlocal 的问题？

   线程池中的线程是可以复用的，假如第一个线程对  ThreadLocal 变量进行了操作，如果没有及时清理，下一个线程就会受到影响。因为 ThreadLocal  是在每个线程上维护了一个 ThreadLocalMap ，所以在线程复用的情况下，之后的线程会获取到  ThreadLocal  里之前线程设置的值。

   ```java
   		//对ThreadLocal设置初始值0
   		private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);
   
       public static void main(String[] args) {
           ExecutorService executorService = Executors.newFixedThreadPool(2);
           for (int i = 0; i < 5; i++) {
               executorService.submit(() -> {
                   Integer before = threadLocal.get();
                 	//初始值+1
                   threadLocal.set(threadLocal.get() + 1);
                   Integer after = threadLocal.get();
                   System.out.println("before :" + before + "，after：" + after);
               });
           }
           executorService.shutdown();
       }
   
   
   //output
   //before :0，after：1
   //before :0，after：1
   //before :1，after：2
   //before :1，after：2
   //before :2，after：3
   ```

   由于不对  ThreadLocal  进行及时清理，对后面线程会产生影响。所以在当前线程使用完 ThreadLocal 之后，应及时清理。

   ```java
   		//对ThreadLocal设置初始值0
   		private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);
   
       public static void main(String[] args) {
           ExecutorService executorService = Executors.newFixedThreadPool(2);
           for (int i = 0; i < 5; i++) {
               executorService.submit(() -> {
                   try {
                       Integer before = threadLocal.get();
                       threadLocal.set(threadLocal.get() + 1);
                       Integer after = threadLocal.get();
                       System.out.println("before :" + before + "，after：" + after);
                   } finally {
                       //当前线程使用完及时回收
                       threadLocal.remove();
                   }
               });
           }
           executorService.shutdown();
       }
   
   
   //output
   //before :0，after：1
   //before :0，after：1
   //before :0，after：1
   //before :0，after：1
   //before :0，after：1
   ```

   

2. 为什么 ThreadLocal 内部使用弱引用可以防止内存泄露？

   [为什么使用弱引用](#为什么使用弱引用)



#### 参考链接

[掘金：ThreadLocal与弱引用](https://juejin.cn/post/6932762461414096904)

[ThreadLocal与线程池使用的问题](https://www.cnblogs.com/westlin/p/10645217.html)

