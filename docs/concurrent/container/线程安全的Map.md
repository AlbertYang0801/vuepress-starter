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

ConcurrentHashMap位于 `Java.util.concurrent` 包内，专门对并发进行了优化，更适合多线程的场合。

```java
//线程安全的Map
ConcurrentMap<Object, Object> map = Maps.newConcurrentMap();
```

##### 常见问题

-  `key`或者`value`若为`null`就会报空指针。

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

   