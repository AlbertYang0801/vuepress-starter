# Set集合体系


## HashSet

### 特点

- 底层基于**哈希算法**实现，使用 `HashMap` 保存数据。
- **无序**（存取顺序不一致）。
- **不可以存储重复元素**。
- **线程不安全**。

### 构造方法

1. 无参构造

   底层使用 `HashMap` 保存数据。
   
```java
       public HashSet() {
           map = new HashMap<>();
       }
   ```
   
3. 有参构造 - Collection 集合

   根据传入的 Collection 集合 初始化底层 `HashMap`。

   ```java
    		private transient HashMap<E,Object> map;
   
   		public HashSet(Collection<? extends E> c) {
         	//根据集合长度判断 HashMap初始容量长度
           map = new HashMap<>(Math.max((int) (c.size()/.75f) + 1, 16));
         	//添加集合内容到 HashMap
           addAll(c);
       }
   
       public boolean addAll(Collection<? extends E> c) {
           boolean modified = false;
           for (E e : c)
            if (add(e))
                   modified = true;
           return modified;
       }
   
       public boolean add(E e) {
           return map.put(e, PRESENT)==null;
       }
   ```
   
3. 有参构造 - 初始容量和负载因子

   传入底层 `HashMap` 初始容量和负载因子，来初始化底层 `HashMap`。

   ```java
       public HashSet(int initialCapacity, float loadFactor) {
           map = new HashMap<>(initialCapacity, loadFactor);
       }
   
   ```

   

4. 

### 常用方法

- `add(E e)`

  向底层`HashMap`中添加元素。

  ```java
      public boolean add(E e) {
          return map.put(e, PRESENT)==null;
      }
  ```

  向`HashMap`中添加元素时，对于相同的`key`，第一次添加时返回`null`，第二次返回`key`值。

  ```java
      @Test
      public void hashMapDeom(){
          HashMap<Integer,Integer> hashMap  = Maps.newHashMap();
          Integer one = hashMap.put(1, 1);
          System.out.println(one);
          Integer two = hashMap.put(1, 2);
          System.out.println(two);
      }
      
      //output
      //null
  		//1
  ```

  

  

---


## LinkedHashSet

### 特点

- 底层基于链表实现，底层使用`LinkedHashMap`保存元素。
- 继承于`HashSet`。
- 不可以存储重复元素。
- 有序，保证元素存取顺序，是 Set 集合体系中唯一保证存取顺序的集合。
- 线程不安全。

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

  


## TreeSet

### 特点

- 底层数据结构是二叉树。

### 构造方法

1. 无参构造

   ```java
     public Vector() {
           this(10);
       }
   ```

   


## 参考链接

