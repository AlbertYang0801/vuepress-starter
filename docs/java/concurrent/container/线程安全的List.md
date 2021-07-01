### 线程安全的List

#### 一、Vector

采用`synchronized`在方法级别加锁，效率低。

```java
    public synchronized boolean add(E e) {
        modCount++;
        ensureCapacityHelper(elementCount + 1);
        elementData[elementCount++] = e;
        return true;
    }
```



#### 二、Collections包装List

`Collections`类维护了一个`synchronizedList`类，该类把有关`list`的所有操作都被加上了锁，在执行任何方法之前都要获取锁对象`mutex`，实现了线程安全。

```java
    ArrayList<Object> oldList = Lists.newArrayList();
    //使用Collections对list进行线程同步封装
    List<Object> safeList = Collections.synchronizedList(oldList);
```

虽然这个包装的`list`实现了线程安全，但是在多线程的环境并不算太好。无论是读取还是写入操作，都需要先获取锁对象，这样会导致其它操作进入等待状态，效率较低。若并发量不高，可以使用，在并发量高的时候，性能不太好，`不推荐使用`。

```java

		//------------源码
    public static <T> List<T> synchronizedList(List<T> list) {
      	//判断是否随机访问，区分list的类型
        return (list instanceof RandomAccess ?
                new SynchronizedRandomAccessList<>(list) :
                new SynchronizedList<>(list));
    }

//------------Collects内部的SynchronizedList类
static class SynchronizedList<E>
        extends SynchronizedCollection<E>
        implements List<E> {
        private static final long serialVersionUID = -7754090372962971524L;

        final List<E> list;

        SynchronizedList(List<E> list) {
            super(list);
            this.list = list;
        }
        SynchronizedList(List<E> list, Object mutex) {
            super(list, mutex);
            this.list = list;
        }

        public boolean equals(Object o) {
            if (this == o)
                return true;
            synchronized (mutex) {return list.equals(o);}
        }
        public int hashCode() {
            synchronized (mutex) {return list.hashCode();}
        }
				//执行方法之前都要先获取到锁对象mutex
        public E get(int index) {
            synchronized (mutex) {return list.get(index);}
        }
        public E set(int index, E element) {
            synchronized (mutex) {return list.set(index, element);}
        }
  			
  			......
          
}
```



#### 三、CopyOnWriteArrayList

由于`排它锁`在一定读写分离特别是读操作特别多的情况下影响效率，所以在读操作多的时候不推荐使用`排它锁`。

`CopyOnWriteArrayList`位于`Java.util.concurrent`包内，专门对并发进行了优化，实现了读写分离，而且`写操作`不会阻塞`读操作`，只有在`写-写`操作时才会阻塞。根据名字可以看到，`CopyOnWrite`大概意思就是在写操作的时候会进行自我复制，将原来的数据复制一份当作`副本`，然后将要写入的内容写入`副本`中，最后将副本替换原来的数据，即完成了写操作，同时不会影响读操作。

```java
//线程安全的list
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
CopyOnWriteArrayList<Integer> newList = new CopyOnWriteArrayList<Integer>(oldList);
```

##### 实现原理

1. 创建过程

   - 不传参数。

     初始化一个长度为`0`的空数组，并赋值给内部数组`array`。

   - 传入Collection。

     按照传入集合的元素顺序迭代，复制到新数组中，并把新数组赋值给内部数组`array`。

   ```java
       private transient volatile Object[] array;
   
       final void setArray(Object[] a) {
           array = a;
       }
   
   		/**
        * Creates an empty list.
        */
       public CopyOnWriteArrayList() {
           setArray(new Object[0]);
       }
   
       public CopyOnWriteArrayList(Collection<? extends E> c) {
           Object[] elements;
           if (c.getClass() == CopyOnWriteArrayList.class)
               elements = ((CopyOnWriteArrayList<?>)c).getArray();
           else {
               elements = c.toArray();
               // c.toArray might (incorrectly) not return Object[] (see 6260652)
               if (elements.getClass() != Object[].class)
                   elements = Arrays.copyOf(elements, elements.length, Object[].class);
           }
           setArray(elements);
       }
   ```

   

2. 读方法

   首先`array`是存放原本数据的数组，其由`volatile`关键字修饰，代表若其它线程修改了`array`里的值，会被动态发现。根据源码可以看到在读操作的时候是没有实现线程同步的，也不会被写操作阻塞，原因就是`array`数组具有可见性。

   ```java
        /** The array, accessed only via getArray/setArray. */
       private transient volatile Object[] array;
   
       /**
        * Gets the array.  Non-private so as to also be accessible
        * from CopyOnWriteArraySet class.
        */
       final Object[] getArray() {
           return array;
       }   
   
   		private E get(Object[] a, int index) {
           return (E) a[index];
       }
   
   		public E get(int index) {
           return get(getArray(), index);
       }
   ```

   

3. 写方法

   在进行写操作的时候，首先会加一把重入锁，但是由于这把锁在写操作内部，所以仅限于`写-写`操作时会阻塞。

   根据源码可以看出，在写操作之前，会完成一次原数据的复制，并新建副本，指定长度`+1`，然后将要添加的元素放在副本的最后一个元素，最后将副本赋值给原数据`array`，即完成了写操作。由于`array`本身是由`volatile`修饰的，具有可见性，所以写入数据会立即被其它线程发现，读操作就不会受到影响，也完成了`读-写不互斥`。

   ```java
    /** The array, accessed only via getArray/setArray. */
       private transient volatile Object[] array;
   
       /**
        * Gets the array.  Non-private so as to also be accessible
        * from CopyOnWriteArraySet class.
        */
       final Object[] getArray() {
           return array;
       }   
   
     
   		public boolean add(E e) {
           final ReentrantLock lock = this.lock;
        		//加锁
           lock.lock();
           try {
             	//获取原数据
               Object[] elements = getArray();
            
               int len = elements.length;
               Object[] newElements = Arrays.copyOf(elements, len + 1);
               newElements[len] = e;
               setArray(newElements);
               return true;
           } finally {
             	//释放锁
               lock.unlock();
           }
       }
   ```

   