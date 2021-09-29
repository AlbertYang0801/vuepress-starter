### 线程安全的Map

#### 一、Hashtable

采用`synchronized`在方法级别加锁，效率低。

```java
public synchronized V put(K key, V value) {
        // Make sure the value is not null
        if (value == null) {
            throw new NullPointerException();
        }

        // Makes sure the key is not already in the hashtable.
        Entry<?,?> tab[] = table;
        int hash = key.hashCode();
        int index = (hash & 0x7FFFFFFF) % tab.length;
        @SuppressWarnings("unchecked")
        Entry<K,V> entry = (Entry<K,V>)tab[index];
        for(; entry != null ; entry = entry.next) {
            if ((entry.hash == hash) && entry.key.equals(key)) {
                V old = entry.value;
                entry.value = value;
                return old;
            }
        }

        addEntry(hash, key, value, index);
        return null;
    }
```



#### 二、Collections包装HashMap

`Collections`类维护了一个`SynchronizedMap`类，该类把有关`Map`的所有操作都被加上了锁，在执行任何方法之前都要获取锁对象`mutex`，实现了线程安全。

```java
Map<String, String> oldMap = Maps.newHashMap();
//使用Collections对map进行线程同步封装
Map<String,String> safeMap = Collections.synchronizedMap(oldMap);
```

虽然这个包装的`Map`实现了线程安全，但是在多线程的环境并不算太好。无论是读取还是写入操作，都需要先获取锁对象，这样会导致其它操作进入等待状态，效率较低。若并发量不高，可以使用，在并发量高的时候，性能不太好，`不推荐使用`。

```java


//------------源码
public static <K,V> Map<K,V> synchronizedMap(Map<K,V> m) {
    return new SynchronizedMap<>(m);
}

//------------Collects内部的SynchronizedMap类
private static class SynchronizedMap<K,V> implements Map<K,V>, Serializable {
        private static final long serialVersionUID = 1978198479659022715L;

        private final Map<K,V> m;     // Backing Map
        //锁对象mutex
        final Object  mutex;        // Object on which to synchronize

        ......
        
         public int size() {
            //在执行任何方法之前，都要获取mutex锁对象
            synchronized (mutex) {return m.size();}
        }
        public boolean isEmpty() {
            synchronized (mutex) {return m.isEmpty();}
        }
        public boolean containsKey(Object key) {
            synchronized (mutex) {return m.containsKey(key);}
        }
        public boolean containsValue(Object value) {
            synchronized (mutex) {return m.containsValue(value);}
        }
  
  			......
          
		}
```



#### 三、ConcurrentHashMap

ConcurrentHashMap 位于 `Java.util.concurrent` 包内，专门对并发进行了优化，更适合多线程的场合。

```java
//线程安全的Map
ConcurrentMap<Object, Object> map = Maps.newConcurrentMap();
```

要特别注意，ConcurrentHashMap 中的 key 或者 value 为 null 时会直接抛出空指针异常，在源码中有所体现。

```java
 public class ConcurrentHashMap<K,V> extends AbstractMap<K,V>
    implements ConcurrentMap<K,V>, Serializable {
    private static final long serialVersionUID = 7249069246763182397L;
   
		/** Implementation for put and putIfAbsent */
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) throw new NullPointerException();
       
       ......
       
    }
   
   	......
 
 }
```



这里记录一下 JDK1.8 之后 ConcurrentHashMap 新增的一些方法。JDK 1.8 之后新增了一些支持 lambda表达式的方法。

- `foreach()`

  ```java
      @Test
      public void testForeach() {
          ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
          for (int i = 0; i < 5; i++) {
              concurrentHashMap.put(Integer.toString(i), i);
          }
          concurrentHashMap.forEach((k, v) -> {
              System.out.println("K:" + k + ";V:" + v);
          });
      }
  ```

- `reduce`

  `reduce()` 方法可以对 `ConcurrentHashMap` 内部元素进行计算。

  - parallelismThreshold：并行数
  - transformer：该函数是计算元素（K，V）的结果。
  - reducer：该函数是各个元素计算结果之间的元素规则（加减乘除）。

  ```java
      public <U> U reduce(long parallelismThreshold,
                          BiFunction<? super K, ? super V, ? extends U> transformer,
                          BiFunction<? super U, ? super U, ? extends U> reducer) {
          if (transformer == null || reducer == null)
              throw new NullPointerException();
          return new MapReduceMappingsTask<K,V,U>
              (null, batchFor(parallelismThreshold), 0, 0, table,
               null, transformer, reducer).invoke();
      }
  ```

  练习代码：

  ```java
      @Test
      public void testReduce() {
          ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
          for (int i = 1; i <= 5; i++) {
              concurrentHashMap.put(Integer.toString(i), i);
          }
          //并行计算map的总和
          //这里的2是并行数量
          // transformer函数是计算元素结果（K，V），reducer是元素之间的运算规则
          Integer count = concurrentHashMap.reduce(2,
                  (k, v) -> Integer.valueOf(k) + v - 1, (value1, value2) -> value1 * value2);
          System.out.println(count);
      }
  ```

- `reduceValues`

  只对元素的 value 进行计算。

  ```java
      @Test
      public void testReduceValues() {
          ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
          for (int i = 0; i < 5; i++) {
              concurrentHashMap.put(Integer.toString(i), i);
          }
          //并行计算map的总和
          //这里的2是并行数量
          //reduceValues只对value进行运算
          Integer count = concurrentHashMap.reduceValues(2, Integer::sum);
          System.out.println(count);
      }
  ```

  

- `search`

  集合的搜索方法

  ```java
      /**
       * 测试search方法
       */
      @Test
      public void testSearch() {
          ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
          for (int i = 0; i < 5; i++) {
              concurrentHashMap.put(Integer.toString(i), i);
          }
          //这里的2是并行数
          String value = concurrentHashMap.search(2, (k, v) -> {
              //搜索逻辑
              if (v % 4 == 0) {
                  return k + "---";
              }
              return null;
          });
          System.out.println(value);
      }
  
  ```

  

- `computeIfAbsent`

  - 若map存在指定key，直接返回结果。
  - 若map中不存在指定key，则先插入后返回结果。

  ```java
      /**
       * 测试map的computeIfAbsent方法
       * 1.若map存在指定key，直接返回;
       * 2.若map中不存在指定key，则先插入后返回;
       */
      @Test
      public void testComputeIfAbsent() {
          ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
          for (int i = 0; i < 5; i++) {
              concurrentHashMap.put(Integer.toString(i), i);
          }
          Integer value = 100;
          //map中若存在该key，直接返回数据。若不存在该key，先put再返回。
          Integer count = concurrentHashMap.computeIfAbsent("100", v -> value);
          System.out.println(count);
      }
  ```

  















