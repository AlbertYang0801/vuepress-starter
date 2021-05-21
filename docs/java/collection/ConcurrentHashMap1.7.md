# ConcurrentHashMap - 1.7

## 类简介

ConcurrentHashMap 是一个线程安全的 HashMap，在 JDK 1.7 HashMap的基础上实现了 `分段锁` 来保证线程安全。在 HashMap 的基础上，默认分为 16 个段，每个段都拥有独立的锁，来保证各个段的线程安全。

### 扩展 - 线程安全的 HashMap

[Map实现线程安全的三种方式](https://albertyang0801.github.io/blog/concurrent/container/%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%E7%9A%84Map.html)

### Unsafe方法总结



## 主要参数

```java
public class ConcurrentHashMap<K, V> extends AbstractMap<K, V>
        implements ConcurrentMap<K, V>, Serializable {
  	
  	//默认初始化容量
    static final int DEFAULT_INITIAL_CAPACITY = 16;
	
  	//默认加载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

  	//默认并发级别
    static final int DEFAULT_CONCURRENCY_LEVEL = 16;

  	//最大容量
    static final int MAXIMUM_CAPACITY = 1 << 30;

  	//Segment最小容量
    static final int MIN_SEGMENT_TABLE_CAPACITY = 2;

    static final int MAX_SEGMENTS = 1 << 16; // slightly conservative

    static final int RETRIES_BEFORE_LOCK = 2;
  
    final int segmentMask;

    final int segmentShift;
   
  	//ConcurrentHashMap底层数组
    final Segment<K,V>[] segments;

    transient Set<K> keySet;
    transient Set<Map.Entry<K,V>> entrySet;
    transient Collection<V> values;
```



### 1. Segment是什么？

Segment 是 ConcurretnHashMap的一个内部类，继承于 ReentrantLock，可实现同步操作保证线程安全。作为 ConcurrentHashMap 的底层数组结构，各个 Segment 之间的锁互不影响，称这种锁机制为**分段锁**。

```java
static final class Segment<K,V> extends ReentrantLock implements Serializable {
	
  //真正存放数据的数组
  transient volatile HashEntry<K,V>[] table;
  
  transient int count;

  transient int modCount;
  
  transient int threshold;
  
  final float loadFactor;
  
  Segment(float lf, int threshold, HashEntry<K,V>[] tab) {
            this.loadFactor = lf;
            this.threshold = threshold;
            this.table = tab;
        }
  
  ......

}
```



### 2. HashEntry是什么？

HashEntry 是 ConcurrentHashMap 中实际存放数据的对象。其实体类于 HashMap 中的 Entry 实体类一样，是一个链表结构。不同的是 ConcurrentHashMap 的 `value` 和 `next` 字段都增加了 `volatile` 字段来保证字段的可见性，防止多线程情况出现并发问题。

```java
    static final class HashEntry<K,V> {
      	//hash值
        final int hash;
      	//key值
        final K key;
        volatile V value;
      	//下一节点
        volatile HashEntry<K,V> next;

        HashEntry(int hash, K key, V value, HashEntry<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }

        final void setNext(HashEntry<K,V> n) {
          	//原子操作
            UNSAFE.putOrderedObject(this, nextOffset, n);
        }

        static final sun.misc.Unsafe UNSAFE;
        static final long nextOffset;
        static {
            try {
                UNSAFE = sun.misc.Unsafe.getUnsafe();
                Class k = HashEntry.class;
                nextOffset = UNSAFE.objectFieldOffset
                    (k.getDeclaredField("next"));
            } catch (Exception e) {
                throw new Error(e);
            }
        }
    }
```



### 3. concurrencyLevel是什么？

意为并发级别。实际作用是用来限制底层数组 Segment[] 的大小，来保证 ConcurrentHashMap 同时支持的并发数。

在构造方法中，存在一个局部变量 `ssize`，初始化 segments 时传入的容量为 `ssize`。

` Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];`

而 `ssize` 的结果为第一个大于等于 concurrencyLevel 的2次方幂值。

```java
//循环结束，得到 ssize 的结果为第一个大于等于concurrencyLevel的2次方幂值
while (ssize < concurrencyLevel) {
    ++sshift;
    //向左移一位，增大两倍
    ssize <<= 1;
}
```

## 构造方法

ConcurrentHashMap 默认底层数组是长度为 16 的 Segment[]，每个 Segment 对象包含了默认长度为 2 的 HashEntry[]，HashEntry 是实际保存数据的对象，所以 **ConcurrentHashMap 默认初始可保存元素长度为32个**，而不是 16个。

### 默认构造方法

```java
        /**
     * The default initial capacity for this table,
     * used when not otherwise specified in a constructor.
     */
		//默认长度
    static final int DEFAULT_INITIAL_CAPACITY = 16;

    /**
     * The default load factor for this table, used when not
     * otherwise specified in a constructor.
     */
		//默认负载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /**
     * The default concurrency level for this table, used when not
     * otherwise specified in a constructor.
     */
		//默认并发级别
    static final int DEFAULT_CONCURRENCY_LEVEL = 16;

		public ConcurrentHashMap() {
      	//传入默认参数值，调用有参构造
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR, DEFAULT_CONCURRENCY_LEVEL);
    }
```



### 有参构造 - 主要构造方法

```java
public ConcurrentHashMap(int initialCapacity,
                             float loadFactor, int concurrencyLevel) {
        if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
            throw new IllegalArgumentException();
        if (concurrencyLevel > MAX_SEGMENTS)
            concurrencyLevel = MAX_SEGMENTS;
        // Find power-of-two sizes best matching arguments
        int sshift = 0;
      	//Segment[]长度。
        int ssize = 1;
      	//找到第一个大于等于 concurrencyLevel 的 2次幂（Segment[]长度）
        while (ssize < concurrencyLevel) {
            ++sshift;
          	//向左移一位，增大两倍
            ssize <<= 1;
        }
  			//segmentShift和segmentMask用来计算segment的下标位置
        this.segmentShift = 32 - sshift;
        this.segmentMask = ssize - 1;
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        //初始容量 / Segment[]长度 = 每个Segment的容量
        int c = initialCapacity / ssize;
        if (c * ssize < initialCapacity)
            ++c;
      	//Segment最小容量为2
        int cap = MIN_SEGMENT_TABLE_CAPACITY;
      	//控制Segment容量大小为2次幂
        while (cap < c)
            cap <<= 1;
        // create segments and segments[0]
      	//初始化一个Segment模版
        Segment<K,V> s0 =
            new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                             (HashEntry<K,V>[])new HashEntry[cap]);
      	//根据Segment[]容量初始化
        Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
      	//使用UNSAFE类，根据模版初始化Segment[]
        UNSAFE.putOrderedObject(ss, SBASE, s0); // ordered write of segments[0]
        this.segments = ss;
    }
```

### 扩展问题

1. **底层数组 segments 长度必须是2次方幂值的原因？**

   创建时指定长度为 ssize。

   因为在 put 方法时，计算索引的下标时需要用到与运算。

   ```java
   public V put(K key, V value) {
       Segment<K,V> s;
       if (value == null)
           throw new NullPointerException();
       //基于key，计算hash值
       int hash = hash(key);
       //因为一个键要计算两个数组的索引，为了避免冲突，这里取高位计算Segment[]的索引
       int j = (hash >>> segmentShift) & segmentMask;
       //判断该索引位的Segment对象是否创建，没有就创建
       if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
            (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
           s = ensureSegment(j);
       //调用Segmetn的put方法实现元素添加
       return s.put(key, hash, value, false);
   }
   ```

   在构造方法中，指定了 segmentShift 和 segmentMask 的值。

   ```java
           ......
             
   				int sshift = 0;
         	//Segment[]长度。
           int ssize = 1;
         	//找到第一个大于等于 concurrencyLevel 的 2次幂（Segment[]长度）
           while (ssize < concurrencyLevel) {
               ++sshift;
             	//向左移一位，增大两倍
               ssize <<= 1;
           }
     			//segmentShift和segmentMask用来计算segment的下标位置
           this.segmentShift = 32 - sshift;
           this.segmentMask = ssize - 1;
   
     			......
   ```

   计算索引元素的公式 ：

   `index = (hash >>> segmentShift) & segmentMask）` 等价于 `index = hash(key) & (ssize- 1）`。

   由于是与运算，所以需要保证 ssize 的值为 2次方幂值（参考 JDK1.7HashMap）。

2. **segment 的 HashEntry 数组的最小长度是 2？**

   因为 ConcurrentHashMap 的扩容是更新单个 Segment。而不是整个数组。这就要求 Segment 长度是 2次方幂值，而 2 是最小的 2 次方幂值。由于 ConcurrentHashMap 默认拥有 16 个段，所以单个段发生扩容的几率较低，若 segment 过大，资源浪费较大。



## 存储元素的原理

采用 `数组 + 链表` 的形式存储。

结合 1.7 的 HashMap 来看，ConcurrentHashMap 的底层数据结构是 Segment[]，而每一个 Segment 包含了一个 HashEntry[]，而 HashEntry[] 里的每个 HashEntry 才是存储数据的位置。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210424235121.png)

1. 通过特定 Hash 算法计算 Key 的 Hash 值。

2. 根据  Key 的 Hash 值和 Segment[] 长度 - 1 的与运算结果，得到新增元素对应的 Segment。

3. 调用对应 Segment 的 put 方法。

4. 根据 Key 的 Hash 值和 HashEntry[] 长度 - 1 的与运算结果，得到新增元素对应的 HashEntry。

5. 

6. 若数组对应的 index 位置为 NULL，将 Entry 存放到数组的 index 位置上。

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210407113537.png)

7. 若数组对应的 index 位置不为 NULL，即发生了索引冲突，此时采用链表的方式来保存元素，新增的元素会保存在链表的头部，并存放到数组对应的 index 位置上（头插法）。

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210407113812.png)

### 为什么引入链表？

通过 Hash 算法计算元素在数组中的位置时，会发生 Hash 冲突，即多个元素对应同一个位置。

此时在发生冲突的索引位置上，生成一个链表按照一定顺序保存元素，来解决 Hash 冲突。

### 为什么采用头插法？

- 头插法

  在链表增加新增元素时，默认添加到首位。

- 尾插法

  在链表增加新增元素时，默认添加到末尾。

当发生 Hash 冲突时，向链表插入元素的过程为：

1. 计算元素所在索引位置 index

2. 遍历 index 位置对应的链表，判断是否包含和插入元素相同 Key 值的元素。（从 index 位置保存的元素开始循环）

   - 若在链表中找到相同 Key 值，将新 Value 值赋值给 Value，并返回 Key 对应的旧的 Value值。

   ```java
   public V put(K key, V value) {
     			//初始容量扩容
           if (table == EMPTY_TABLE) {
               inflateTable(threshold);
           }
     			//允许存为null的key
           if (key == null)
               return putForNullKey(value);
     			//对key进行hash算法
           int hash = hash(key);
     			//通过hash和数组长度的位运算来计算索引位置
           int i = indexFor(hash, table.length);
     			//从index位置开始遍历链表
           for (Entry<K,V> e = table[i]; e != null; e = e.next) {
               Object k;
             	//若hash值一致，key一致的话，则替换元素
               if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                   V oldValue = e.value;
                 	//更新元素value值
                   e.value = value;
                   e.recordAccess(this);
                 	//返回元素对应旧值
                   return oldValue;
               }
           }
   				//修改次数+1（用于迭代器判断并发修改异常）
           modCount++;
     			//添加元素
           addEntry(hash, key, value, i);
     			//首次新增，返回null
           return null;
       }
   ```

3. 若遍历链表未找到相同元素，则开始插入元素。

   ```java
       void addEntry(int hash, K key, V value, int bucketIndex) {
         	//底层数组扩容
           if ((size >= threshold) && (null != table[bucketIndex])) {
               resize(2 * table.length);
               hash = (null != key) ? hash(key) : 0;
               bucketIndex = indexFor(hash, table.length);
           }
   				//创建新元素
           createEntry(hash, key, value, bucketIndex);
       }
   		
   		//bucketIndex；对应数组中的索引。
       void createEntry(int hash, K key, V value, int bucketIndex) {
         	//获取数组中索引对应的旧元素（即链表的首位）
           Entry<K,V> e = table[bucketIndex];
         	//将插入元素初始化，设置链表旧的头部元素为Next，并将生成的 Entry 存放到数组对应的索引位置。（头插法）
           table[bucketIndex] = new Entry<>(hash, key, value, e);
           size++;
       }
   ```

整个链表的插入过程分为两部分。

1. 如果链表已经存在相同的 Key，直接覆盖，此时 头插法和尾插法效率一致。
2. 如果链表不存在相同的 Key，头插法和尾插法都会将链表循环遍历，将链表中所有元素和要插入的元素都比较了一遍。由于插入之前链表已经被遍历了，此时头插法和尾插法效率是一致的。

综上所述：

头插法和尾插法在效率上是一致的，1.7之所以采用头插法，是因为热点数据的原因。在使用 HashMap 的时候，更倾向于获取最新插入的数据，所以将新数据插入到链表头部，方便获取最新插入的数据。

注意：JDK 1.8 已改为尾插法。





## 底层扩容原理？

扩容是更新单个Segment。而不是整个数组。





# 这是个书签！

### 底层数组初始化

HashMap 底层数组采用的是懒加载，新建时不会初始化底层数组，只有在第一次新增时才会初始化底层数组，分配内存空间。

1. 在新建 HashMap 的时候，并不会初始化底层数组。

```java
    //默认底层数组容量为16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

    //默认负载因子为0.75
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

		//扩容临界值
    int threshold;

    //负载因子
    final float loadFactor;

		public HashMap() {
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR);
    }
    
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
				//指定扩容因子
        this.loadFactor = loadFactor;
      	//指定扩容临界值
        threshold = initialCapacity;
        init();
    }
```

2. 在第一次调用 `put()` 方法添加元素时，会对底层数据进行初始化。

```java
    public V put(K key, V value) {
      	//判断是否首次扩容
        if (table == EMPTY_TABLE) {
          	//执行扩容
            inflateTable(threshold);
        }
      
        ......
        modCount++;
      	//添加Entry（非首次扩容发生在这个方法里面）
        addEntry(hash, key, value, i);
        return null;
    }
		
		//扩容方法
    private void inflateTable(int toSize) {
        // Find a power of 2 >= toSize
      	// 计算离数组容量值最近的2次幂值。比如 10 =》16；16=》16
        int capacity = roundUpToPowerOf2(toSize);
				//第一次赋值扩容临界值。等于数组容量*扩容因子
        threshold = (int) Math.min(capacity * loadFactor, MAXIMUM_CAPACITY + 1);
      	//初始化数组容量
        table = new Entry[capacity];
        initHashSeedAsNeeded(capacity);
    }
```

3. 在首次初始化底层数组的时候，会赋值扩容临界值 `threshold`，用于之后判断底层数组是否需要扩容。

   首次扩容临界值 = 初始数组长度 16 * 默认负载因子 0.75 = 12 

```java
 //扩容临界值 = 初始数组长度 16 * 默认负载因子 0.75 = 12 
threshold = (int) Math.min(capacity * loadFactor, MAXIMUM_CAPACITY + 1);
```

### 发生扩容

在每次添加新的 Entry 的时候，都会判断是否达到扩容条件，如果达到条件，就会发生扩容。

**发生扩容的条件？**

在数组内部元素 >= 扩容临界值 threshold ，并且新增元素对应索引位置不为空时，即发生扩容。

（临界值 = 数组长度 * 负载因子）

底层数组初始化的时候会指定扩容临界值 threshold 为 12 （初始数组长度 16 * 默认负载因子 0.75 = 12 ），所以当底层数组存放第 13 个元素的时候，就会发生第一次扩容，以此类推。

| 扩容次数 | 临界值（默认负载因子 0.75） | 扩容后的长度（每次扩容2倍） |
| -------- | --------------------------- | --------------------------- |
| 第 1 次  | 16 * 0.75 = 12              | 16 * 2 = 32                 |
| 第 2 次  | 32 * 0.75 = 24              | 32 * 2 = 64                 |
| 第 3 次  | 64 * 0.75 = 48              | 64 * 2 = 128                |

**扩容的长度是 2 倍的原因？**

首先数组默认长度是 16，而数组底层长度需要满足是 2 的非零次幂，所以扩容长度是 2 倍能够满足数组长度为 2 的 非零次幂的要求。

[数组默认长度是 16 的原因？](数组默认长度是 16 的原因？)

[数组长度为什么限制为 2 的非零次幂？](#数组长度为什么限制为 2 的非零次幂？)

数组扩容倍数若过大，则会有比较多的空闲空间，为了减少内存空间的浪费，扩容倍数应越小越好，所以选择倍数为 2 。

**扩容的步骤**

1. 按照旧数组长度的 2 倍初始化新数组。
2. 将旧数组的元素全部转移到新数组中。（需要重新计算元素所在索引位置）
   - 遍历旧数组上的每一个 Entry 链表 （Entry 内部维护了 next字段，指向下一节点的 Entry）。
     - 循环每个 Entry 链表的 每个Entry 实体类，根据新数组长度重新计算索引位置（索引位置受数组长度的影响，数组长度改变，对应索引也需要改变）。
     - 采用`头插法`将每个 Entry 插入到 新数组中。
     - 直到链表循环结束。
   - 旧数组遍历结束，即旧数组元素转移到新数组完毕。
3. 将新数组（长度为旧数组的 2 倍）赋值给底层数组。
4. 赋值扩容临界值（新数组长度 * 负载因子）。

```java
 		public V put(K key, V value) {
      	//判断是否首次扩容
        if (table == EMPTY_TABLE) {
          	//执行扩容
            inflateTable(threshold);
        }
      
        ......
        modCount++;
      	//添加Entry（非首次扩容发生在这个方法里面）
        addEntry(hash, key, value, i);
        return null;
    }
    
		//添加Entry
    void addEntry(int hash, K key, V value, int bucketIndex) {
      	//数组内部长度 >= 临界值 && 元素索引位置不为空
        if ((size >= threshold) && (null != table[bucketIndex])) {
          	//扩容（底层数组的二倍）
            resize(2 * table.length);
          	//对新增元素进行 Hash
            hash = (null != key) ? hash(key) : 0;
          	//计算新增元素在新数组中的索引位置
            bucketIndex = indexFor(hash, table.length);
        }
        createEntry(hash, key, value, bucketIndex);
    }

    void resize(int newCapacity) {
      	//旧的底层数组
        Entry[] oldTable = table;
        int oldCapacity = oldTable.length;
      	//是否数组最大值
        if (oldCapacity == MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return;
        }
				//按照旧数组长度的二倍初始化新的数组
        Entry[] newTable = new Entry[newCapacity];
      	//将旧数组的元素全部转移到新数组（需要重新 Hash）
        transfer(newTable, initHashSeedAsNeeded(newCapacity));
      	//将新数组赋值给底层数组
        table = newTable;
      	//根据新数组长度，修改扩容临界值。（新数组长度*负载因子）
        threshold = (int)Math.min(newCapacity * loadFactor, MAXIMUM_CAPACITY + 1);
    }
		
		//将旧数组所有元素移动到新数组
    void transfer(Entry[] newTable, boolean rehash) {
      	//新数组长度
        int newCapacity = newTable.length;
      	//遍历旧数组每个元素
        for (Entry<K,V> e : table) {
          	//遍历每个元素的链表结构
            while(null != e) {
              	//获取节点的下一节点
                Entry<K,V> next = e.next;
              	//重新 Hash
                if (rehash) {
                  	//key ！= null 时计算 key 的 Hash 值
                    e.hash = null == e.key ? 0 : hash(e.key);
                }
              	//通过 key 的 Hash 值和新数组长度的与运算来计算元素所在索引。（重新计算的目的，是因为数组长度发生了变化）
                int i = indexFor(e.hash, newCapacity);
              	//头插法，当前节点下一节点执行新数组的头节点
                e.next = newTable[i];
              	//头插法，将当前节点作为头节点赋值给数组索引位置
                newTable[i] = e;
              	//将下一节点值赋值给 e ，开始下一轮循环，直到链表循环结束。
                e = next;
            }
        }
    }

    static int indexFor(int h, int length) {
        // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
        return h & (length-1);
    }

    void createEntry(int hash, K key, V value, int bucketIndex) {
      	//获取索引位置上原来的Entry
        Entry<K,V> e = table[bucketIndex];
      	//索引执行新建的Entry。（新建的Entry的next执行原来的Entry，实现头插）
        table[bucketIndex] = new Entry<>(hash, key, value, e);
      	//数组内部元素长度+1
        size++;
    }
```

**常见问题**

1. 为什么将数据从旧数组移动到新数组时需要重新计算索引？

   索引 = `HashCode(key) & (length - 1)`

   索引的计算受到数组长度的影响，所以数组长度改变之后，索引也需要作出对应的改变。

   ```java
       static int indexFor(int h, int length) {
           // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
           return h & (length-1);
       }
   ```

   

## 



## 添加元素 put 方法源码分析（重要）

针对主要的添加元素方法 `put(K key, V value)` 进行分析。

```java
public V put(K key, V value) {
  			//1.初始化数组容量
        if (table == EMPTY_TABLE) {
            inflateTable(threshold);
        }
  			//2.允许存为null的key
        if (key == null)
            return putForNullKey(value);
  			//3.对key进行hash算法
        int hash = hash(key);
  			//4.通过hash和数组长度的位运算来计算索引位置
        int i = indexFor(hash, table.length);
  			//5.从index位置开始遍历链表
        for (Entry<K,V> e = table[i]; e != null; e = e.next) {
            Object k;
          	//若hash值一致，key一致的话，则替换元素
            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                V oldValue = e.value;
              	//更新元素value值
                e.value = value;
                e.recordAccess(this);
              	//返回元素对应旧值
                return oldValue;
            }
        }
				//修改次数+1（用于迭代器判断并发修改异常）
        modCount++;
  			//添加元素
        addEntry(hash, key, value, i);
  			//首次新增，返回null
        return null;
    }

		//底层数组扩容，传入指定数组容量值
    private void inflateTable(int toSize) {
        // Find a power of 2 >= toSize
      	//计算离数组容量值最近的2次幂值。比如 10 =》16；16=》16
        int capacity = roundUpToPowerOf2(toSize);
				//确认扩容临界点值
        threshold = (int) Math.min(capacity * loadFactor, MAXIMUM_CAPACITY + 1);
      	//初始化底层数组空间（指定长度）
        table = new Entry[capacity];
        initHashSeedAsNeeded(capacity);
    }

		//计算 Key 对应索引位置。数组默认长度必须是2的非零次幂
    static int indexFor(int h, int length) {
        // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
        return h & (length-1);
    }

		//hash值，key值，value值，插入的索引位置
    void addEntry(int hash, K key, V value, int bucketIndex) {
        if ((size >= threshold) && (null != table[bucketIndex])) {
            resize(2 * table.length);
            hash = (null != key) ? hash(key) : 0;
            bucketIndex = indexFor(hash, table.length);
        }

        createEntry(hash, key, value, bucketIndex);
    }

    void createEntry(int hash, K key, V value, int bucketIndex) {
      	//获取索引位置上原来的Entry
        Entry<K,V> e = table[bucketIndex];
      	//索引执行新建的Entry。（新建的Entry的next执行原来的Entry，实现头插）
        table[bucketIndex] = new Entry<>(hash, key, value, e);
      	//数组内部元素长度+1
        size++;
    }
```

1. 若为第一次添加元素，初始化数组容量。

   在创建 HashMap 的时候，并不会初始化底层数组，而是在第一次调用 `put()` 方法的时候，初始化底层数组。（懒加载，节省内存空间）

   [首次扩容原理](#首次扩容)

2. 判断 Key == null 的情况，特殊处理（添加到底层数组索引为 0 的位置）。

   ```java
       //添加 key == null
   		private V putForNullKey(V value) {
         	//遍历底层数组索引为0的链表
           for (Entry<K,V> e = table[0]; e != null; e = e.next) {
               if (e.key == null) {
                   V oldValue = e.value;
                   e.value = value;
                   e.recordAccess(this);
                 	//找到，返回oldValue
                   return oldValue;
               }
           }
           modCount++;
         	//未找到，在0索引上新增Entry（key为null，value为传入的value，索引位置为0）
           addEntry(0, null, value, 0);
           return null;
       }
   ```

3. 对 Key 进行 Hash 算法。

   ```java
       final int hash(Object k) {
           int h = hashSeed;
           if (0 != h && k instanceof String) {
               return sun.misc.Hashing.stringHash32((String) k);
           }
   
           h ^= k.hashCode();
   
           // This function ensures that hashCodes that differ only by
           // constant multiples at each bit position have a bounded
           // number of collisions (approximately 8 at default load factor).
           h ^= (h >>> 20) ^ (h >>> 12);
           return h ^ (h >>> 7) ^ (h >>> 4);
       }
   ```

4. 计算元素所在索引位置。

   得到 Key 的 Hash 算法值之后，与`数组长度 - 1`的结果进行`与运算`，得到元素对应的索引位置。

   ```java
       static int indexFor(int h, int length) {
           // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
           return h & (length-1);
       }
   ```

   可以看到源码注释中提示了 `length must be a non-zero power of 2`，即长度必须限制为 2 的 非零次幂。

   [数组长度为什么限制为 2 的非零次幂？](数组长度为什么限制为 2 的非零次幂？)

   [数组默认长度是 16 的原因？](数组默认长度是 16 的原因？)

5. 遍历索引位置的链表。

   - 若遍历链表找到 Key 相同的元素，则替换 Value，返回旧的 Value。

   - 若遍历链表未找到 Key 相同的元素，继续往下。

6. 修改次数 +1，避免并发修改异常。

7. 添加元素。

8. 返回 null。



## 查询元素 get 方法源码分析（重要）

以`get(Object key)` 方法来分析。

```java
    public V get(Object key) {
      	//key为null时单独处理
        if (key == null)
            return getForNullKey();
      	//根据key查询Entry
        Entry<K,V> entry = getEntry(key);
				//返回value值
        return null == entry ? null : entry.getValue();
    }

		//查询key为null的Entry对应value值
    private V getForNullKey() {
      	//数据长度为null，返回null
        if (size == 0) {
            return null;
        }
      	//开始遍历底层数组索引0位置的链表
        for (Entry<K,V> e = table[0]; e != null; e = e.next) {
          	//匹配到key值，返回value
            if (e.key == null)
                return e.value;
        }
      	//未找到，返回null
        return null;
    }

		//根据key值找到对应Entry的value值
    final Entry<K,V> getEntry(Object key) {
        if (size == 0) {
            return null;
        }
				//计算key值的hash值
        int hash = (key == null) ? 0 : hash(key);
      	//获取key值对应底层数组的索引，开始遍历该索引位置的链表
        for (Entry<K,V> e = table[indexFor(hash, table.length)];
             e != null;
             e = e.next) {
            Object k;
          	//若hash值一致且key值一致（地址值相等或者内容相等）
          	//hash值相等的时候，代表key的hashcode是相等的。此时使用equals方法，整个链表比较key都是一致的，所以需要重写equals和hashcode方法。
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
              	//返回Entry
                return e;
        }
        return null;
    }

		//根据key的hash值和数组长度计算，Entry对应底层数组的索引位置
    static int indexFor(int h, int length) {
        // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
        return h & (length-1);
    }
```

整个查询分两种情况。

1. 当 key == null 时，从数组索引 0 处开始查询 Entry。

   因为 key == null 属于一种特殊情况，在插入时插入到了底层数组索引 0 的位置。所以查询时直接从 index = 0 位置开始查询。

   - 从头开始遍历查询 index = 0 位置的链表。

   - 若找到 Entry 的 key ==null，返回该 Entry 的 value；

   - 若未找到，则返回 null。

2. 当 key != null 时。

   - 计算 key 的 Hash 值（特定 Hash 算法）。

   - 计算 key 值对应的底层数组索引位置，计算公式为 `index = hash & (length-1)`;

   - 从 index 位置的头节点开始遍历链表。

   - 比较 key 值。

     该链表的所有元素 Hash 值都是一致的（因为计算得到的 index 是一致的）。

     所以在比较 key 值是否一致时，需要重写 equals 和 hashcode 方法。

   - 若找到与传入 key 一致的，则返回 Entry 里的 value 值。

   - 若未找到则返回 null。

## 删除元素 remove 方法源码分析

JDK 1.7 的删除方法较为简单，理解单向链表的删除原理，再结合源码即可。

```java
    public V remove(Object key) {
      	//返回删除的Entry
        Entry<K,V> e = removeEntryForKey(key);
      	//Entry不为空，返回value
        return (e == null ? null : e.value);
    }

		//删除key值的主要方法
    final Entry<K,V> removeEntryForKey(Object key) {
        if (size == 0) {
            return null;
        }
      	//计算key的hash值
        int hash = (key == null) ? 0 : hash(key);
      	//找到key对应的桶
        int i = indexFor(hash, table.length);
      	//获取桶对应Entry
        Entry<K,V> prev = table[i];
        Entry<K,V> e = prev;
				//循环链表
        while (e != null) {
          	//下一节点
            Entry<K,V> next = e.next;
            Object k;
          	//比较hash和key值（需要重写equals和hashcode方法），匹配到一致key
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k)))) {
              	//操作变量加1（防止并发异常）
                modCount++;
              	//数据总量减1
                size--;
              	//a.若匹配节点为头节点
                if (prev == e)
                  	//桶指向下一节点
                    table[i] = next;
                //b.不为头节点。
                else
                  	//前驱的下一节点指向待删除节点的下一节点
                    prev.next = next;
              	//linkedHashMap每次删除都会调用
                e.recordRemoval(this);
                return e;
            }
          	//准备遍历下一节点
          	//前驱指向当前节点
            prev = e;
          	//当前节点指向下一节点
            e = next;
        }
        return e;
    }
```



## 常见问题

### 1. 数组默认长度是 16 的原因？

- 符合 HashMap 数组长度是 2 的非零次幂
- 为了方便计算元素在数组中的索引 index 的 Hash 算法。
- 16 属于一个经验值。结合数组扩容机制，太小了就有可能频繁发生扩容，影响效率。太大了又浪费空间，不划算。

```java
    //h:key的hash值，length：数组长度
    static int indexFor(int h, int length) {
        // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
        return h & (length-1);
    }
```

可以看到计算 index 的公式为 `index = HashCode(key) & (length-1)`，对应 `Key 的 HashCode 值` 和 `数组长度 - 1` 之间的`与运算`。

1. 默认 length = 16。此时 `index = HashCode(key) & 1111`

   假设` HashCode(key)= 3029737`，对应二进制位` HashCode(key)= 101110001110101110 1001`。

   此时与运算结果为 `101110001110101110 1001 & 1111 = 1001` 。

   对应 `index = 9`。

2. 假设 length = 10。此时 `index = HashCode(key) & 1001`

   此时与运算结果为 `101110001110101110 1001 & 1001 = 1001` 。

   对应 `index=9`。

   此时会发现，有些结果永远得不到，比如 `0011 （x & 1001 ! = 0011）`，此时会存在` index = 3` 的结果不会出现，数组索引 3 的位置上不会保存元素，不满足 Hash 算法均匀分布的原则。


综上所述：

通过与运算来确认索引位置的时候，和 Key 的 HashCode 值的最后四位有很大关系。

默认数组长度为 16 时，`length-1` 的值是 `1111` ，所有二进制位都为 1。与运算的结果等同于  `HashCode(key)` 的后 4 位的值，此时只要 `HashCode(key)` 足够均分，那么与运算计算出的 index 的结果也是均分的，能够满足 Hash 算法均匀分布的原则。

### 2. 数组长度为什么限制为 2 的非零次幂？

为了方便计算元素在数组中的索引 index 的 Hash 算法。

计算 index 的公式为 `index = HashCode(key) & (length-1)`，对应 `Key 的 HashCode 值` 和 `数组长度 - 1` 之间的`与运算`。

当数组长度为 2 的非零次幂时，此时对应二进制结果为 首位为 1，后面都是 0。此时的 length - 1 的二进制位上都是 1。此时与运算的结果等同于  `HashCode(key)` 对应后几位的值。只要   `HashCode(key)` 结果足够均分，得到的 index 结果就是均分的，满足 Hash 算法均匀分布的原则。同时不浪费数组空间。

综上所述，原因主要为以下几点：

- 方便计算元素在数组中的索引 index 的 Hash 算法，使其满足 Hash 算法均匀分布的原则。

- 不浪费数组空间。



### 3. 为何负载因子默认为 0.75？（重要）

这个问题需要搭配扩容机制来看，可以理解为为什么要在当前数组长度大于等于底层数组长度的 0.75 倍时发生扩容？

主要目的是**为了减少索引冲突的次数**。

#### 索引冲突的原因？

在计算元素在底层数组位置时，根据 Key 的 Hash 值（特定 Hash 算法），和 长度 - 1的与运算，得到元素在数组中的索引位置，公式为 `index = HashCode(key) & (length-1)`。

此时会存在不同的 Key 值得到的 index 值可能会相同（这也是引入链表的原因）。而 index 相同时就会以头插法的形式追加到链表中，此时若相同 index 元素越多，链表就会越长。

#### 不同值碰撞的机率对比

当 loadFactor = 0.75 时，此时新增元素计算索引时，发生碰撞的最大机率为 0.75。

对比来看，若 loadFactor = 0.95 时，新增元素发生碰撞的最大机率为 0.95。

碰撞几率越高，对应数组扩容的机率就会越低，此时空间利用率高。

[底层扩容原理](#底层扩容原理?)

而碰撞会导致对应的索引位置的链表长度变长，此时若增加元素效率就会变低，即时间效率低。

#### 结论

**所以当负载因子越大时，碰撞几率越大，发生扩容机率越低，链表长度会越长，而此时效率会越来越低，但是空间利用率会高。**

**总结而言，选择负载因为为 0.75 是一种以空间换时间的考虑，牺牲了空间利用率来提高效率。**


### 4. 多线程导致的死循环问题？（重要）

在多个线程操作时，若底层数组执行扩容，就有可能会发生循环链表的情况。

扩容之前若存在链表 A -> B -> C ，若 A、B、C 扩容后对应的 index 一致，则采用头插法后的链表顺序为 C -> B ->A。

这个机制在多线程的环境下，有可能发生死循环的情况，类似 A -> B -> C -> B。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210412160633.png)

**如果扩容前位于同一链表的两个 Entry 在扩容后还是分配到相同的 index 上，就会出现死循环的问题。根本原因还是链表的插入方式采用的是头插法，这样会导致链表顺序反过来。**

### 5. 多线程导致的元素丢失问题？（重要）

- 同时执行 put 操作导致元素丢失

  多个线程在执行 put 操作时，若出现了哈希碰撞，导致两个线程得到的索引位置一致。采取头插法时，若两个线程获取的是同一个头节点，则在 put 操作执行完成后，只有其中一个线程值会插入到头节点，导致其它线程插入的丢失。

  例如：线程A 和 线程B 分别插入元素 1111 和元素 11111，假设对应索引位置都为 1 。采用头插法时获取的链表头节点都为 1 ，则完成插入之后形成的链表如右图所示，此时会造成元素 11111 丢失。

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210412153653.png)

- 多个线程同时执行 get 和 put 操作，导致获取元素为 null

  在 put 操作执行时，若设置到扩容操作，在扩容完成之后旧数组为空。此时若执行 get 操作返回为 null。

  原因就是扩容操作未执行完毕，执行 get 操作时，操作的是旧数组，当旧数组为空时返回都是 null。

[添加元素方法源码分析（重要）](#添加元素方法源码分析（重要）)



## 参考链接

[HashMap和ConcurrentHashMap深入解析源码合集，看完吊打面试官！](https://www.bilibili.com/video/BV1x741117jq)

[掘金-漫画：什么是HashMap？](https://juejin.cn/post/6844903518264885256)

[HashMap面试必问的6个点，你知道几个？](https://juejin.cn/post/6844903921190699022)

[《我们一起进大厂》系列-HashMap](https://juejin.cn/post/6844904017269637128)

[HashMap在多线程下不安全问题(JDK1.7)](https://juejin.cn/post/6844903953532977160#heading-0)