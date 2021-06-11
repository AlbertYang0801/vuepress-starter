# List集合体系


## ArrayList

### 特点

- 底层基于**数组**实现。
- 有索引，支持快速访问。
- **查询修改快，增删慢**。
- **线程不安全**。

### 构造方法

1. 无参构造

   - JDK 1.6 之前，以初始容量 10 创建一个长度为10的数组。
   - JDK 1.6 之后，创建一个空数组。

   ```java
       public ArrayList() {
           this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
       }
   ```

2. 有参构造 - 数组长度

   根据传入的数组长度初始化底层数组。

   ```java
       public ArrayList(int initialCapacity) {
           if (initialCapacity > 0) {
               this.elementData = new Object[initialCapacity];
           } else if (initialCapacity == 0) {
               this.elementData = EMPTY_ELEMENTDATA;
           } else {
               throw new IllegalArgumentException("Illegal Capacity: "+
                                                  initialCapacity);
           }
       }
   ```

3. 有参构造 - Collection 集合

   根据传入的 Collection 集合 初始化底层数组。

   ```java
       public ArrayList(Collection<? extends E> c) {
           elementData = c.toArray();
           if ((size = elementData.length) != 0) {
               // c.toArray might (incorrectly) not return Object[] (see 6260652)
               if (elementData.getClass() != Object[].class)
                   elementData = Arrays.copyOf(elementData, size, Object[].class);
           } else {
               // replace with empty array.
               this.elementData = EMPTY_ELEMENTDATA;
           }
       }
   ```

   

### 常用方法

- `add(E e)`

  执行该方法时，ArrayList 会默认将指定的元素追加到列表的末尾。此时时间复杂度为 `O(1)`。

- `add(int index,E element)`

  执行该方法时，ArrayList 会将要插入的位置 i 和其之后的元素（n-i）都后移一位，然后将新元素放到插入位置。此时时间复杂度为`O(n-i)`。

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210329002708.gif)

  该方法会检查索引是否越界。

  ArrayList 的` size` 相当于集合内部数据长度，指向的是下一个元素存放的位置。若 `index` > `size` , 则会跳过索引指向的位置，导致内部数组存放不连续，会报异常 `IndexOutOfBoundsException`。

  ```java
      public void add(int index, E element) {
          rangeCheckForAdd(index);
  
          ensureCapacityInternal(size + 1);  // Increments modCount!!
          //源数组，源数组中开始拷贝的索引位置，目标数组，目标数组中开始复制的索引位置，执行需要复制的数据长度
          System.arraycopy(elementData, index, elementData, index + 1,
                           size - index);
          elementData[index] = element;
          size++;
      }
  
  		private void rangeCheckForAdd(int index) {
          if (index > size || index < 0)
              throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
      }
  ```

  

- `remove(int index)`

  执行该方法时，删除该列表中指定位置的元素，并将该位置后所有元素统一前移一位。

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210329002809.gif)
  
  

### ArrayList 的扩容机制？

以 JDK1.8为例。

1. 调用无参构造创建集合时，创建一个空数组。此时数组长度为0。

2. 第一次调用 `add(E e)`方法添加元素时候，会初始化一个为默认长度 10 的数组。

   ```java
     //得到最小扩容量
     private void ensureCapacityInternal(int minCapacity) {
       if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
          // 获取默认的容量和传入参数的较大值
         minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
       }
       ensureExplicitCapacity(minCapacity);
     }
   ```

3. 当继续调用 `add(E e)` 方法添加元素时，若底层数组长度`已满`，此时会执行`扩容策略`。

4. 在原数组的基础上，创建一个长度为原数组 `1.5` 倍的新数组，先通过位运算确认增加后的数组长度。

   将长度值向右位移一位，得到原数组容量的二分之一左右。（位运算的好处：效率高、节省计算资源）

   ```java
   //计算新数组容量
   int newCapacity = oldCapacity + (oldCapacity >> 1);
   ```

   比如：`7 >> 1 = 3`，并不是刚好二分之一。

   ```java
   7 >> 1 = 3
   221 >> 1 = 21
   ```

5. 确认扩容后数组长度之后，调用 `Arrays.copyOf(elementData,newCapacity)`方法进行数组扩容。

6. 将新增元素放到新数组的 `size + 1 `位置。

### ArrayList 无参构造变化的优点？

- 变化过程

  - JDK 1.6 之前，以初始容量 10 创建一个长度为10的数组。
  - JDK 1.6 之后，创建一个空数组。
  
- 优点

  初始化集合时，使用懒加载，来减少内存空间的浪费。

### ArrayList 数组默认初始长度为10的原因？

选择 10 是因为不大不小，比较合适的一个长度。

- 若默认初始长度过小，扩容时会比较频繁。
- 若默认初始长度过大，则会太过于浪费内存空间。

### ArrayList 扩容因子为 1.5 倍的原因？

ArrayList 底层数组在每次扩容时，都会在原数组的基础上，新建一个长度为原数组 1.5 倍左右的新数组。

Vector 的扩容因子是 2。

从空间上和时间上对比分析来看。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210408110935.png)

**空间**

1. k = 1.5

   - 当 k = 1.5 时，空闲空间为原数组的 0.5 倍左右，减少了空闲空间的浪费。

   - 当 k = 1.5 时，在扩容几次过后，新建的数组可以利用之前已申请的内存空间。（比如 c = 4 时，新数组就利用了之前已申请的内存空间）

2. k = 2

   - 当 k = 2 时，空闲空间为原数组的 1 倍，相对于 k = 1.5 来说，空闲空间较多。

   - 当 k = 2 时，新建的数组永远是上一次数组的 2 倍，这就导致新建数组永远无法重用之前内存空间。

**时间**

- 当 k = 1.5 时，扩容次数较多。
- 当 k = 2 时，扩容次数相对较少。

**所以 ArrayList 和 Vector 扩容因子的选择，都是基于空间和时间之间的权衡。**

[参考：https://www.cnblogs.com/fortunely/p/14279231.html](https://www.cnblogs.com/fortunely/p/14279231.html)

---

### 扩展问题

#### 数组操作的原理

  [LeetBook -数组操作](https://leetcode-cn.com/leetbook/read/array-and-string/yjcir/)

#### `System.arraycopy() ` 和 `Arrays.copyOf()` 方法

在 ArrayList 内部方法里面存在着有关数组复制的两个方法。

- `System.arraycopy()`

  数组拷贝，可以将原数组内容拷贝到自定义数组里。

  ```java
  		//源数组，源数组中开始拷贝的索引位置，目标数组，目标数组中开始复制的索引位置，执行需要复制的数据长度
  		public static native void arraycopy(Object src,  int  srcPos,
                                          Object dest, int destPos,
                                          int length);
  ```
  
  测试例子
  
  ```java
      public static void main(String[] args) {
          int[] arr = new int[10];
          arr[0] = 0;
          arr[1] = 1;
          arr[2] = 2;
          arr[3] = 3;
          arr[4] = 4;
          int[] newArr = new int[10];
  
          //源数组，源数组中开始拷贝的索引位置，目标数组，目标数组中开始复制的索引位置，执行需要复制的数据长度
          System.arraycopy(arr,2,newArr,3,3);
          newArr[2] = 90;
          System.out.println(JsonUtil.toString(newArr));
      }
  
  		//output
  		//[0,0,90,2,3,4,0,0,0,0]
  ```

- `Arrays.copyOf()`

  对数组进行内部扩容，底层实际调用了` System.arraycopy()`方法。

  ```java
      public static int[] copyOf(int[] original, int newLength) {
        	//根据新长度初始化数组
          int[] copy = new int[newLength];
        	//数组拷贝（从0开始拷贝到新长度）
          System.arraycopy(original, 0, copy, 0,
                           Math.min(original.length, newLength));
          return copy;
      }
  ```

  测试例子

  ```java
      public static void main(String[] args) {
          int[] arr= new int[5];
          arr[0] = 0;
          arr[1] = 1;
          arr[2] = 2;
          arr[3] = 3;
          arr[4] = 4;
          //对数组进行内部扩容（实际调用了System.arraycopy方法）
          int[] newArr = Arrays.copyOf(arr, 3);
          System.out.println(JsonUtil.toString(newArr));
      }
      
      //output
      //[0,1,2]
  ```

  



---


## LinkedList

### 特点

- 底层基于双向链表（JDK1.6之前为`双向循环链表`，JDK1.7以及以后为`普通双向链表`）实现。
- 不能快速访问，`只能顺序访问`。
- `查询修改慢，增删快`。可以快速的在链表中间增加和删除元素。
- 线程不安全。

```java
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
```

### 构造方法

1. 无参构造

   ```java
       public LinkedList() {
       }
   ```

2. 有参构造 - Collection 集合

   ```java
       public LinkedList(Collection<? extends E> c) {
           this();
           addAll(c);
       }
   ```

### 常用方法

- `add(E e)`

  默认在双向链表的`末尾`增加元素，时间复杂度`O(1)`。

  ```java
      public boolean add(E e) {
          linkLast(e);
          return true;
      }
  
      void linkLast(E e) {
          final Node<E> l = last;
          final Node<E> newNode = new Node<>(l, e, null);
          last = newNode;
          if (l == null)
              first = newNode;
          else
              l.next = newNode;
          size++;
          modCount++;
      }
  ```

- `add(int index,E element)`

  在指定位置添加元素，时间复杂度`O(n)`。

  1. 判断是否越界。

  2. 根据二分法，判断是从头节点还是尾节点开始遍历。

     - 若 `index < (size >>1) ` ，则从头节点遍历找到插入位置的后继节点。
     - 若 `index >= (size >> 1) `，则从尾节点向前遍历找到插入位置的后继节点。

  3. 按照双向链表在中间插入元素方式进行插入。

     - 初始化节点，后继为插入位置的后继节点，前驱为后继节点的前驱节点。
     - 先将后继节点的前驱指向新建节点（先链接新建节点的后继）。
     - 再将前驱节点的后继指向新建节点（再链接新建节点的前驱）。

     ```java
       //待插入的数据，插入位置的后继节点
     	void linkBefore(E e, Node<E> succ) {
             // assert succ != null;
             //插入位置的后继节点的前驱（插入位置节点）
             final Node<E> pred = succ.prev;
         		//根据待插入数据新建节点（指定新建节点的前驱和后继）。
             final Node<E> newNode = new Node<>(pred, e, succ);
         		//后继节点前驱指向新建节点
             succ.prev = newNode;
             if (pred == null)
                 first = newNode;
             else
               	//插入位置节点后继指向新建节点
                 pred.next = newNode;
             size++;
             modCount++;
         }
     ```

     ![双向链表的插入](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324185341.png)

- `remove()`

  默认删除 `链表的第一个元素`
  
  ```java
      public E remove() {
          //删除首位元素
          return removeFirst();
      }
  
      public E removeFirst() {
        	//获取头节点
          final Node<E> f = first;
          if (f == null)
              throw new NoSuchElementException();
        	//传入头节点
          return unlinkFirst(f);
      }
  
      private E unlinkFirst(Node<E> f) {
          // assert f == first && f != null;
        	//获取节点数据
          final E element = f.item;
        	//获取节点的后继
          final Node<E> next = f.next;
        	//数据域置空，方便垃圾回收
          f.item = null;
        	//后继设置为空
          f.next = null; // help GC
        	//将节点的后继设置为新的头节点
          first = next;
          if (next == null)
              //删除后集合为空，尾节点设为null
              last = null;
          else
            	//设置新的头节点前驱为null
              next.prev = null;
          //长度减1
          size--;
          modCount++;
        	//返回被删除的数据域
          return element;
      }
  ```
  
  
  
- `remove(Object o)`

  默认从链表`头部`开始遍历，删除第一个匹配到的元素。
  
  1. 删除前驱。
  2. 删除后继。
  3. 删除数据域。
  
  ```java
      public boolean remove(Object o) {
        	//对象为空
          if (o == null) {
            	//从头部节点开始遍历，不符合条件，获取节点后继，直到后继节点为空
              for (Node<E> x = first; x != null; x = x.next) {
                	//匹配到第一个数据为空的节点
                  if (x.item == null) {
                    	//删除节点
                      unlink(x);
                      return true;
                  }
              }
          } else {
            	//从头部节点开始遍历，不符合条件，获取节点后继，直到后继节点为空
              for (Node<E> x = first; x != null; x = x.next) {
                	//匹配到第一个数据和传入参数一致的节点
                  if (o.equals(x.item)) {
                    	//删除节点
                      unlink(x);
                      return true;
                  }
              }
          }
          return false;
      }
  		
  		//x节点，待删除数据
      E unlink(Node<E> x) {
          // assert x != null;
        	//获取x节点的数据
          final E element = x.item;
        	//获取x节点的后继
          final Node<E> next = x.next;
        	//获取x节点的前驱
          final Node<E> prev = x.prev;
  				
        	//删除前驱
       		//若前驱为空，代表该节点为头部节点
          if (prev == null) {
          	//将新头部节点设置为x节点的后继
              first = next;
          } else {
            	//将x节点的前驱节点的后继设置为x的后继节点。
              prev.next = next;
            	//将x节点前驱设置为null
              x.prev = null;
          }
  	
        	//删除后继
        	//若后继为空，代表该节点为尾节点
          if (next == null) {
            	//将尾部节点设置为x的前驱
              last = prev;
          } else {
            	//将x节点后继的前驱设置为x的前驱
              next.prev = prev;
            	//将x节点的后继设置为null
              x.next = null;
          }
  				//将x节点的数据设置为null
          x.item = null;
          size--;
        	//记录操作值
          modCount++;
          return element;
      }
  ```
  
  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324221753.png)

- `get(int index)`

  1. 判断是否越界

  2. 根据二分法，判断是从头节点还是尾节点开始遍历。

     - 若 `index < (size >>1) ` ，则从头节点向后遍历找到指定位置节点。
     - 若 `index >= (size >> 1) `，则从尾节点向前遍历找到指定位置节点。

  ```java
      public E get(int index) {
        	//检查是否越界
          checkElementIndex(index);
          return node(index).item;
      }
  
      Node<E> node(int index) {
          // assert isElementIndex(index);
  
          if (index < (size >> 1)) {
              Node<E> x = first;
            	//从头部节点开始遍历
              for (int i = 0; i < index; i++)
                  x = x.next;
              return x;
          } else {
              Node<E> x = last;
            	//从尾部节点开始遍历
              for (int i = size - 1; i > index; i--)
                  x = x.prev;
              return x;
          }
      }
  ```

  

### LinkedList 的底层为什么不用单链表？

#### 数据结构

- 单链表由`数据`和`后继节点 next`组成。

![单链表](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324225608.png)

- 双向链表的节点对象由`数据`、`前驱节点`和`后继节点`组成。

![双向链表](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324230307.png)

#### 效率对比

1. 查找/修改

   查找和修改操作思路基本一致，以查找操作为例。

   **单链表查找**

   - 单链表查找时只能从头节点开始往后查找，查找某元素时间复杂度为`O(n)`。
   - 查找某已知元素前驱时间复杂度为 `O(n)`，查找某已知元素后继时间复杂度为`O(1)`。

   **双向链表查找**

   - 双向链表查找时，查找某元素的时候还可以使用二分法的思想，从头部节点或者尾部节点开始查找，这样查找和修改的效率可以提高一倍。
   - 查找某已知节点前驱和后继的时间复杂度都为`O(1)`。

2. 增加/删除

   增加和删除操作思路基本一致，以删除操作为例。

   **单链表删除**。

   - 需要获取待删除节点 x 的前驱节点 m，将 m 节点的后继设置为 x 的后继节点 n。然后将 x 节点的后继设置为 null，再将 x 节点的数据设置为 null。

     **关键在于，想要删除节点，需要得到待删除节点的前驱节点。而由于单链表的特殊性，想要得到前驱节点，可采取从头节点遍历。指针的移动操作次数大概在` 2*i` 次。**

   **双链表删除**。

   - 双链表每个节点包含了前驱和后继节点，操作时不需要定位前驱节点，指针的操作次数大概在 `i` 次。

#### 总结

1. 使用单链表每次查询都要从头开始，使用双向链表可以采用 `二分法`，效率至少提高一倍。
2. 使用单链表进行增删操作时，需要获取前驱节点信息，需要查找大概`2*i` 次。而双向链表节点保存了前驱节点信息，只需要查找大概 `i `次，效率也至少提高一倍。

### LinkedList 底层是双向循环链表吗？

#### 双向循环链表和普通双向链表的区别

双向普通链表包含头指针和尾指针，分别指向第一个节点和最后一个节点。

![双向链表](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324230307.png)

双向循环链表的尾节点的 next 指向头节点，而头节点的 prev 指向尾节点，构成一个环。

![双向链表](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210324234152.png)

**JDK1.6 之前为双向循环链表，JDK1.7 以及以后为普通双向链表**

双向循环链表需要维护一个头指针，头指针指向节点的前驱就是尾节点。

普通双向链表维护了头指针和尾指针。



**采用普通双向链表的优点**（有误，先保留待验证）

1.查找快。

- 双向循环链表查找元素要从头节点开始向后查找，查找的时间复杂度为 `O(n)`

- 普通双向链表头尾都可以快速遍历。可以快速找到最后一个节点，也可以从后向前遍历链表。查找时可采用 `二分法` 查找，效率可提高一倍左右。

2.增加删除

比如增加元素，默认在链表末尾增加节点。

- 双向循环链表在末尾增加节点时，先找到尾节点，再设置前驱和后继。
- 普通双向链表在末尾增加节点时，可通过尾指针直接找到尾节点。设置新增节点后继为 `null` ，前驱为原来的尾节点，再设置原来尾节点后继为新增节点，即可在末尾成功增加节点。



### LinkedList 删除元素，默认从首位还是末位？

默认删除链表的第一个元素

```java
    public E remove() {
        //删除首位元素
        return removeFirst();
    }

    public E removeFirst() {
      	//获取头节点
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return unlinkFirst(f);
    }

    private E unlinkFirst(Node<E> f) {
        // assert f == first && f != null;
      	//获取头节点数据
        final E element = f.item;
      	//获取头节点的后继
        final Node<E> next = f.next;
      	//置空，方便垃圾回收
        f.item = null;
      	//后继设置为空
        f.next = null; // help GC
      	//将头节点的后继设置为新的头节点
        first = next;
        if (next == null)
            //删除后集合为空，尾节点设为null
            last = null;
        else
          	//设置新的头节点前驱为null
            next.prev = null;
        size--;
        modCount++;
        return element;
    }
```



## Vector

和 ArrayList 类似，不过 Vector 是线程安全的。

### 构造方法

1. 无参构造

   ```java
     public Vector() {
           this(10);
       }
   ```

2. 有参构造 - 数组长度

   ```java
     public Vector(int initialCapacity) {
           this(initialCapacity, 0);
       }
   ```

3. 有参构造 - 数组长度和扩容因子

   最主要的构造方法，传入数组长度和扩容因子。

   ```java
     public Vector(int initialCapacity, int capacityIncrement) {
             super();
             if (initialCapacity < 0)
                 throw new IllegalArgumentException("Illegal Capacity: "+
                                                    initialCapacity);
             this.elementData = new Object[initialCapacity];
             this.capacityIncrement = capacityIncrement;
         }
   ```

4. 有参构造 - Collection 集合

   根据传入的 Collection 集合 初始化底层数组。

   ```java
       public Vector(Collection<? extends E> c) {
           elementData = c.toArray();
           elementCount = elementData.length;
           // c.toArray might (incorrectly) not return Object[] (see 6260652)
           if (elementData.getClass() != Object[].class)
               elementData = Arrays.copyOf(elementData, elementCount, Object[].class);
       }
   ```

### Vector 的扩容机制？

Vector 的扩容机制和 ArrayList 有所不同。

ArrayList 扩容因子是 `1.5` 左右，而 Vector 可以在创建时指定扩容因子。若 Vector 不指定扩容因子，则默认是` 2` 。

其它机制和 ArrayList 一致。

### Vector 的扩容因子为什么默认是 2？

参考上方 ArrayList 章节 `ArrayList 扩容因子为 1.5 倍的原因`

### Vector 线程安全机制？

Vector 在内部方法上加 `synchronized` 关键字来保证线程安全，比如 `add(E e)` 方法。

```java
    public synchronized boolean add(E e) {
        modCount++;
        ensureCapacityHelper(elementCount + 1);
        elementData[elementCount++] = e;
        return true;
    }
```



## 常见问题

### ArrayList 和 LinkedList 的区别？

1. 是否线程安全？

   ArrayList 和 LinkedList 都是`线程不安全`的。

2. 底层数据结构？

   ArrayList 底层使用的是`数组`。

   LinkedList 底层使用的是`双向链表`（JDK1.6之前位双向循环链表，JDK1.7为普通双向链表）。

3. 插入和删除是否受元素位置的影响？

   - ArrayList 底层采用数组存储，插入和删除元素的时间复杂度受元素位置的影响。

     - `add(E e)`

       执行该方法时，ArrayList 会默认将指定的元素追加到列表的末尾。此时时间复杂度为 `O(1)`。

     - `add(int index,E element)`

       执行该方法时，ArrayList 会将要插入的位置 i 和其之后的元素（n-i）都后移一位，然后将新元素放到插入位置。此时时间复杂度为`O(n-i)`。

   - LinkedList 底层采用`双向链表存储`。

     基于链表的特性，在增加和删除元素的时候不受元素位置的影响，只需要关注插入位置元素前驱和后继即可。

4. 是否支持快速访问？

   - ArrayList 支持高效的随机元素访问。基于底层`数组`的`索引`查找，可通过`元素位置`快速获取元素对象。
   - LinkedList 不支持高效的随机元素访问。因为底层是链表，只能从头节点或尾节点开始访问。

5. 内存空间占用？

   - ArrayList 的空间浪费主要体现在`底层数组扩容`时会预留一定的空间，对应的是底层数组的冗余空间。
   - LinkedList 的空间花费体现在底层数据结构为`双向链表`上，每个元素都需要保存其`直接前驱`、`直接后继`和`数据域`。

### ArrayList 和 Vector 的区别？

1. 是否线程安全？
   - ArrayList 是线程不安全的。
   - Vector 是线程安全的，Vector 可以看作 ArrayList 的线程安全版本。
2. 系统开销？
   - Vector 内部在方法上使用了 `synchronized` 关键字保证线程安全，系统开销比较大。
   - ArrayList 相对于来说系统开销较小，推荐使用。
3. 扩容因子？
   - ArrayList 的扩容因子是 `1.5` 倍左右。
   - 而 Vector 默认扩容因子是 `2` 倍，也可以通过构造方法自定义扩容因子。

### 迭代器修改数据的问题？

在迭代器内部直接删除数据会报并发异常 `java.util.ConcurrentModificationException`。

在 `AbstractList` 类维护了一个 `modCount` 变量，可以将`modCount`看作版本号机制。

```java
protected transient int modCount = 0;
```

集合内部涉及增加删除等操作的时候，都会修改 `modCount` 变量的值。在迭代器中修改数据时，若识别到`modCount` 变量发生变化就会抛出并发异常。



## 参考链接

[看图轻松理解数据结构与算法系列(双向链表)](https://juejin.cn/post/6844903648154271757)

[LeetBook - 数组与字符串](https://leetcode-cn.com/leetbook/read/array-and-string/ybfut/)

[C++ STL 中 vector 内存用尽后, 为什么每次是 2 倍的增长, 而不是 3 倍或其他值?](https://www.zhihu.com/question/36538542)