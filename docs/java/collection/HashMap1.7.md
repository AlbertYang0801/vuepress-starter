# HashMap - 1.7

## 类简介

HashMap 是一个用来存储 Key - Value 键值对的集合，每一个键值对也叫做 Entry，这些 Entry 保存在底层数组中。

### 1. 底层数组

```java
    static final Entry<?,?>[] EMPTY_TABLE = {};

    /**
     * The table, resized as necessary. Length MUST Always be a power of two.
     */
    transient Entry<K,V>[] table = (Entry<K,V>[]) EMPTY_TABLE;
```

### 2. Entry 类

Entry 类实际上是一个单向的链表结构，它具有 Next 指针，来链接下一个 Entry 实体。

```java
    static class Entry<K,V> implements Map.Entry<K,V> {
            //key值
            final K key;
            //value值
            V value;
            //下一节点
            Entry<K,V> next;
            //当前节点hash值
            int hash;

            /**
             * Creates new entry.
             */
            Entry(int h, K k, V v, Entry<K,V> n) {
                value = v;
                next = n;
                key = k;
                hash = h;
            }

            ......

    }
```

### 3. 负载因子 - loadFactor

负载因子与数组的扩容机制有关，主要用来计算扩容临界值 - threshold。

该值默认为 0.75 ，表示底层数组会在大于等于当前数组长度的 0.75 倍时发生扩容。

[为何负载因子默认为 0.75？（重要）](#3.为何负载因子默认为 0.75？（重要）)

### 4. 扩容临界值 - threshold

threshold 表示的是底层数组发生扩容的临界值，当底层数组大于该值时，会发生扩容。

[底层扩容原理？](#底层扩容原理？)

### 5. 元素长度 - size

size 表示 HashMap 中实际保存元素的个数。

在创建新的 Entry 的时候会执行 `size++`；

```java
    void createEntry(int hash, K key, V value, int bucketIndex) {
      	//获取索引位置上原来的Entry
        Entry<K,V> e = table[bucketIndex];
      	//索引执行新建的Entry。（新建的Entry的next执行原来的Entry，实现头插）
        table[bucketIndex] = new Entry<>(hash, key, value, e);
      	//数组内部元素长度+1
        size++;
    }
```



## 存储元素的原理

采用 `数组 + 链表` 的形式存储。

- 数组是为了确定元素所在索引的位置，数组中每个元素初始值都是 NULL。元素所在索引位置和` Key 值`和`数组长度值`有关。

  对 `Key` 进行 `Hash 算法 `得到的结果值 `Hash(key)`，与`数组长度 - 1` 得到的结果值进行`与运算`，得到元素对应的数组索引位置。

  计算公式为：`index = Hash(key) & (length-1)`

- 链表是为了解决 `索引冲突` 问题，当出现元素计算的`索引 index` 值一样的情况时，就出现了`索引冲突`问题。此时在`索引 index` 上形成一个`链表`来保存元素。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210407172541.png)

1. 通过特定 Hash 算法计算 Key 的 Hash 值。

2. 通过 Key 的 Hash 值和 长度 - 1 的与运算结果，得到底层数组对应索引位置 Index。

3. 若数组对应的 index 位置为 NULL，将 Entry 存放到数组的 index 位置上。

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210407113537.png)

4. 若数组对应的 index 位置不为 NULL，即发生了索引冲突，此时采用链表的方式来保存元素，新增的元素会保存在链表的头部，并存放到数组对应的 index 位置上（头插法）。

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

## 添加元素方法源码分析（重要）

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





## 底层扩容原理？

在向 HashMap 中新增元素的时候，涉及到对底层数组容量扩容的一个机制。

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




### 4. 多线程导致的死循环问题？

在多个线程操作时，若底层数组执行扩容，就有可能会发生循环链表的情况。



参考链接

[HashMap和ConcurrentHashMap深入解析源码合集，看完吊打面试官！](https://www.bilibili.com/video/BV1x741117jq)

[掘金-漫画：什么是HashMap？](https://juejin.cn/post/6844903518264885256)

[HashMap面试必问的6个点，你知道几个？](https://juejin.cn/post/6844903921190699022)

[《我们一起进大厂》系列-HashMap](https://juejin.cn/post/6844904017269637128)