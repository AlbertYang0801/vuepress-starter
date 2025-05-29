# JVM内存模型

Java 内存模型在 JDK1.7 主要包含以下区域。

- 程序计数器
- 虚拟机栈
- 本地方法栈
- 方法区
- 堆

而在 JDK1.8中将运行时数据区中的方法区给取消了，换成了本地内存中的元数据区。

- 程序计数器
- 虚拟机栈
- 本地方法栈
- 堆
- 元数据区

## 内存模型图

1. JDK 1.7 内存模型图
   
    ![](https://s2.loli.net/2025/05/29/SYFaLjZb1Ngc6tp.png)
    
2. JDK 1.8 内存模型图
   
    JDK1.8中取消了运行时数据区中的方法区，换成了元数据区放到了本地内存里。
    
    ![](https://s2.loli.net/2025/05/29/eF9AcHLTmiBYqtP.png)
    

## 运行时数据区

### 1、程序计数器

- 作用
  
    程序计数器作用是**保存程序要执行的下一条指令的地址**。
    
- 特点
    - 程序计数器是**线程私有**的，各个线程之间互不影响。
    - 程序计数器是 JVM 中唯一没有规定 `OutOfMemoryError` 情况的区域。
      
        由于程序计数器保存的数据占用空间不会随程序执行而改变，所以程序计数器是内存区域中没有规定 `OutOfMemoryError` 情况的区域。
    
- 注意
    - 如果线程执行的是非 native 方法，则程序计数器保存的是下一条执行的指令地址。
    - 如果线程执行的是 native 方法，则程序计数器中的值是 undefined。

### 2、虚拟机栈

虚拟机栈是常说的栈内存，是 Java 方法执行的区域。

### 栈帧

虚拟机栈存放的是一个个`栈帧`，每个栈帧对应一个调用的方法。**虚拟机栈是线程私有的，每个线程都有自己的虚拟机栈**，保存了线程私有的 Java 方法。

**栈帧** 包含 **局部变量表、操作数栈、指向运行时常量池的引用、方法返回地址、附加信息**。

![](https://s2.loli.net/2025/05/29/w3FA1cTuM6hVGfx.png)

- 局部变量表
  
    > 主要用来保存方法中的局部变量，包含方法中声明的非静态变量和函数形参。
    > 
    - 基本数据类型保存的是**值**。
    - 引用类型保存的是**对象引用地址**。
    
    局部变量表的大小在编译器可以指定其大小，因此在程序执行期间局部变量表的大小是不会改变的。
    
- 操作数栈
  
    > 是方法中进行数据运算的地方。用来计算表达式求值，程序中的计算过程都是借助于操作数栈来完成的。
    > 
- 指向运行时常量池的引用
  
    > 因为在方法执行的过程中可能需要用到类中的变量，所以每个方法也就是栈帧需要保存一个执行运行时常量的引用。
    > 
    
    运行时常量池在方法区中。
    
- 方法返回地址
  
    > 在线程中，每个方法执行完成之后，需要返回到之前调用它的地方。所以在栈帧中需要保存方法的返回地址。由于每个线程执行的方法可能不同，所以每个线程都要有一个自己的虚拟机栈。
    > 

### 执行过程

当线程执行一个方法的时候，对应创建一个栈帧压栈。当方法执行完毕之后，便会将栈帧出栈。**线程当前执行的方法必定位于虚拟机栈的顶部。**

![](https://s2.loli.net/2025/05/29/cf8t4Odv5eNlL7o.png)

在该区域会发生两种异常：

- 如果线程请求的栈大于虚拟机允许的深度，会抛出 `StackOverFlowError` 异常。
- 如果虚拟机栈可以动态扩展，当扩展到无法申请到足够内存时，就会抛出 `OutOfMemoryError` 异常。

### 问题分析

1. 垃圾回收是否涉及栈内存？
   
    不涉及栈内存，垃圾回收只涉及存放对象的堆内存。
    
    栈内存存放的是调用方法信息，不需要垃圾回收。
    
2. 栈内存分配越大越好吗？
   
    栈内存大小在 linux 系统下为 1M。
    
    ![](https://s2.loli.net/2025/05/29/wla9tb4Ye6XB1Ag.png)
    
    由于物理内存是一定的，假设为 500M，而虚拟机方法栈是**每个线程私有**的。在栈内存大小 1M 的情况，可以分配 500个线程。若增大栈内存，则线程数会随之减少。
    
    所以栈内存并不是越大越好，一般使用系统默认的 1m 即可（windows系统除外）。
    
3. 方法内的局部变量是否线程安全？
   
    方法内的局部变量存在于虚拟机方法栈中，是线程私有的，所以是线程安全的。
    
    ```java
    public class LocalVariable implements Runnable{    @Override    public void run() {        int x = 0;        for (int i = 0; i < 5000; i++) {            x++;        }        System.out.println(x);    }    public static void main(String[] args) {        ExecutorService executorService = Executors.newFixedThreadPool(10);        for(int i=0;i<10;i++){            executorService.submit(new LocalVariable());        }        executorService.shutdown();    }}//5000//5000
    ```
    
    注意：**全局静态变量位于方法区，存在线程安全问题。**
    
    ---
    
    - 如果方法内的局部变量没有逃离方法，在方法内使用，那么它就是线程安全的。
    - 如果局部变量**引用**了其它对象，并且逃离了方法的作用范围，需要考虑安全问题。
      
        ```java
            /**     * 线程不安全     */    public static StringBuffer test2() {        StringBuffer stringBuffer = new StringBuffer();        stringBuffer.append("1");        stringBuffer.append("2");        stringBuffer.append("3");        return stringBuffer;    }    //其它方法引用了该方法，需要考虑变量的线程安全问题。    @SneakyThrows    public static void main(String[] args) {        //引用对象        StringBuffer stringBuffer = test2();        for(int i=0;i<2;i++){            new Thread(()->{                stringBuffer.append("o");            }).start();        }        Thread.sleep(1000);        System.out.println(stringBuffer);    }
        ```
        

### 模拟栈溢出

1. **栈帧过多**导致栈内存溢出
   
    两个方法相互调用，导致虚拟机栈不断地压栈，最终抛出 `StackOverFlowError` 异常。
    
    ![](https://s2.loli.net/2025/05/29/SnJtRIy8DcOPFWC.png)
    
2. **栈帧过大**导致栈内存溢出

### 调整栈内存大小

- **Xss256k：调整栈内存大小为 256k。**

![](https://s2.loli.net/2025/05/29/eO3nAWJrMZfqbYH.png)

### 3、本地方法栈

本地方法栈和虚拟机栈的作用很相似，虚拟机栈为虚拟机执行 Java 方法，而本地方法栈则为 Java 方法使用到的本地方法服务（navite 方法）。

**相同的本地方法栈也可能抛出 `StackOverFlowError` 和 `OutOfMemoryError` 异常**。

![](https://s2.loli.net/2025/05/29/gUn2jBLGcxzvhD4.png)

---

Thread 类中就存在很多 native 方法。

![](https://s2.loli.net/2025/05/29/jwRS5gD7rQ1dulN.png)

### 4、堆

堆是 JVM 内存管理最大的一块区域，堆存放的是内存的实例，所有对象实例都要在堆上分配内存。Java 堆可以处于物理上不连续的空间，只要逻辑上是连续的即可。

堆空间是**线程共享**的一个区域，堆中的对象都要**考虑线程安全问题**。

若堆内存不足以创建新对象实例时，将抛出 `OutOfMemoryError` 异常。

### 堆空间划分

堆是**垃圾收集器的主要管理区域**，为了支持垃圾回收，堆被划分为三个区域。

- 年轻代
  
    年轻代被划分为 **Eden区、S1区和 S2区**（空间分配比例是 8:1:1）。
    
- 老年代
- 永久代（JDK 1.8 已经移除永久代）
  
    ![](https://s2.loli.net/2025/05/29/ITJn2vYLzstQaW5.png)
    

### 调整堆内存大小

通过配置 `-Xmx1024m` 参数可以修改并指定堆内存大小。

![](https://s2.loli.net/2025/05/29/Ff3PpLoZqvS24RE.png)

### 模拟堆内存溢出

```java
    @SneakyThrows    public static void main(String[] args) {        int i = 0;        try {            List<String> list = new ArrayList<>();            String a = "hello";            while (true) {                list.add(a);                //字符串翻倍增长，占满堆内存                a = a + a;                i++;                System.out.println(i);            }        } catch (Exception e) {            e.printStackTrace();            System.out.println(i);        }        Thread.sleep(10000);    }
```

![](https://s2.loli.net/2025/05/29/XpP7suYbV6v5nmD.png)

### 堆内存诊断

1. **jmap** 工具
   
    > jmap 只能查看某个时刻的数据。
    > 
    - 使用 jps 查出进程 Id
    - 使用 jmap 分析堆内存
      
        ```java
        Jmap -heap pid
        ```
        
        新建一个 10MB 的数组，对进程分析得出得出的结果如下：
        
        ```
        Heap Configuration:
           MinHeapFreeRatio         = 0
           MaxHeapFreeRatio         = 100
           MaxHeapSize              = 4259315712 (4062.0MB)
           NewSize                  = 88604672 (84.5MB)
           MaxNewSize               = 1419771904 (1354.0MB)
           OldSize                  = 177733632 (169.5MB)
           NewRatio                 = 2
           SurvivorRatio            = 8
           MetaspaceSize            = 21807104 (20.796875MB)
           CompressedClassSpaceSize = 1073741824 (1024.0MB)
           MaxMetaspaceSize         = 17592186044415 MB
           G1HeapRegionSize         = 0 (0.0MB)
        
        Heap Usage:
        PS Young Generation
        Eden Space:     //年轻代：新创建的对象分配到年轻代
           capacity = 66584576 (63.5MB)
           used     = 18496920 (17.640037536621094MB)   //堆内存eden区使用17MB（原使用7MB）
           free     = 48087656 (45.859962463378906MB)
           27.779586671844243% used
        From Space:
           capacity = 11010048 (10.5MB)
           used     = 0 (0.0MB)
           free     = 11010048 (10.5MB)
           0.0% used
        To Space:
           capacity = 11010048 (10.5MB)
           used     = 0 (0.0MB)
           free     = 11010048 (10.5MB)
           0.0% used
        PS Old Generation   //老年代：大对象直接放入老年代；年轻代中多次GC存活下来的对象转移到老年代。
           capacity = 177733632 (169.5MB)
           used     = 0 (0.0MB)
           free     = 177733632 (169.5MB)
           0.0% used
        ```
    
2. 使用 **jconsole** 工具
   
    > 选择指定的类进行分析，jconsole 工具分析的是连续的数据。
    > 
    
    ![](https://s2.loli.net/2025/05/29/NJuTFGCpR2UzwHn.png)
    
    ![](https://s2.loli.net/2025/05/29/4fLngD9vjukXds5.png)
    
3. 使用 **jvisualvm** 来进行分析。
   
    ![](https://s2.loli.net/2025/05/29/3tqxPSQBgm7p4is.png)
    
    - 查找最大的对象
      
        ![](https://s2.loli.net/2025/05/29/147PJkyZd3KOfez.png)
        

### 5、方法区

方法区在 JVM 中也是一个非常重要的区域，**是线程共享的内存区域**。

### 组成

在方法区中，存储了每个类的信息、静态变量、常量以及编译后的代码等。

- 类（包含类名称、方法信息、字段信息）
- **运行时常量池**（静态变量、常量）
- 类的加载（编译后的代码）

![](https://s2.loli.net/2025/05/29/unvj8JHQy1lMGtN.png)

### 方法区的实现

方法区是 JVM 中的一种规范定义。

- 在 JDK 1.7 以及之前版本，**永久代**是方法区的实现，位于堆内存中。为了区分 Java 堆，它还有一个别名叫 Non - Heap （非堆）。
- 在 JDK 1.8 方法区的实现是**元数据区**，位于本地内存中。

![](https://s2.loli.net/2025/05/29/UMeTrl4NbnZmdi2.png)

### 方法区内存溢出

当方法区无法满足内存分配时，将抛出 `OutOfMemoryError` 异常。

- 元空间内存溢出
  
    创建类对象导致元空间内存溢出。
    
    > 修改元空间内存大小：-XX:MaxMetaspaceSize=8m
    > 
    
    ![](https://s2.loli.net/2025/05/29/jS4QtCvN698WlRn.png)
    

### 方法区垃圾回收

![](https://s2.loli.net/2025/05/29/jxJZ874k1D6tYMz.png)

### JDK1.8 为什么将永久代改为元空间？

1. 解决了永久代大小限制的问题。
   
    由于元空间使用本地内存，因此不再受JVM堆大小的限制，从而避免了因类加载过多而导致的 OutOfMemoryError 错误。
    
2. 提高了内存使用效率。
   
    方法区主要存储了类的元数据信息、常量、静态变量以及编译器编译后的代码等内容。这部分数据在运行时是只读的，因此将其放到本地内存中可以减轻堆内存的压力，从而提高Java应用程序的运行效率。
    
3. 更好的性能优化。
   
    将方法区放到本地内存，可以更好地利用操作系统的内存管理机制，从而实现更好的性能优化。
    
    IO 操作上更加高效，本地内存可以直接与操作系统的 IO进行交互。而不需要先将堆里面的数据拷贝到本地内存然后再进行交互。
    

### 6、运行时常量池

运行时常量池是**方法区的一部分**，用于存放编译期生成的常量和对象引用，这部分内容将在被类加载后，进入方法区的运行时常量池中存放。运行时常量池是每个类都有一个，而且具备动态性，运行期间也可以放入新的常量。

[详解JVM常量池、Class常量池、运行时常量池、字符串常量池](https://blog.csdn.net/qq_45737068/article/details/107149922?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_antiscanv2&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_antiscanv2&utm_relevant_index=1)

### 字符串常量池-StringTable

存放的是方法中的字符串常量，作用是**减少字符串的重复创建**，字符串常量池是共享区域。

**StringTable** 数据结构本质上类似 哈希链表（数组+链表），在 1.6 位于永久代中，之后在**堆内存中**。

> 运行时常量池从永久代转移到了元空间。但是字符串常量池，转移到了堆里面。
> 

StringTable实现的前提是 String类型不可变的，若String可变，对于不同的引用，指向StringTable的变量值也会随即改变。

[为什么String类是不可变的？](https://www.cnblogs.com/baizhanshi/p/6970583.html)

> StringTable 在 1.6位于永久代中，而永久代只有在 fullGC的时候才会进行垃圾回收，就是在老年代满的时候进行的垃圾回收。StringTable 数据结构本质上类似 HashMap，数据越多的情况效率越低。所以垃圾回收频率低的话，影响到StringTable 的使用。
> 

![](https://s2.loli.net/2025/05/29/UMeTrl4NbnZmdi2.png)

**懒加载策略**

方法中的字符串，只有用到了该参数，才会放到字符串常量池中，一种懒加载策略。

**OOM异常**

- JDK1.6之前，StringTable位于永久代中。
  
    当不断向 StringTable 写入数据时，可能造成永久代的 OOM。
    
- JDK1.7之后，StringTable位于堆内存中。
  
    同理，StringTable 可能会造成 OOM。
    

**StrintTable垃圾回收**

[StringTable垃圾回收跟踪案例](https://blog.csdn.net/zhuxuemin1991/article/details/103940936?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_paycolumn_v3&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_paycolumn_v3&utm_relevant_index=1)

### intern()方法

`intern()` 方法作用是 *如果常量池中存在当前字符串, 就会直接返回当前字符串. 如果常量池中没有此字符串, 会将此字符串放入常量池中后, 再返回*。

- JDK6
  
    将堆中字符串**复制一份**放入串池，若串池存在该字符串，返回串池的引用。若串池不存在，在串池放入复制的字符串的引用。
    
- JDK7
  
    将堆中字符串对象放入串池，若串池存在该字符串，返回串池的引用。若串池不存在，则在串池放入堆中字符串的引用。
    

---

```java
public static void main(String[] args) {
    // "1" 作为常量放入串池
    // new String("1") 在堆中创建对象
    // s是堆中对象的引用 ，此时 1 的对象。
    String s = new String("1");
    // 将s引用存入串池，但串池已经有了"1"
    s.intern();
    // 从串池中找到 "1"
    String s2 = "1";
    // s为堆中对象的引用，没有改变
    // s2为串池对象的引用
    // false
    System.out.println(s == s2);

    //jdk1.8               
    // "1" 作为常量放入串池
    // new String("1") 在堆中创建两个对象
    // s3 = new StringBuilder().append("1").append("1").toString ==> new String("11")
    // s3是堆中字符串 11 的引用
    String s3 = new String("1") + new String("1");
    // 将s3的引用存入串池，串池之前不存在11。
    s3.intern();
    // 从串池找11，就是s3的引用地址。
    String s4 = "11";
    //jdk1.8 true
    //jdk1.6 false 因为intern()放到串池的是复制的对象，和堆中对象不是一个
    System.out.println(s3 == s4);
}
```

[美团技术团队：深入解析String#intern](https://tech.meituan.com/2014/03/06/in-depth-understanding-string-intern.html)

### StringTable调优

- 调整StringTable大小
  
    类比 HashMap，StringTable 的大小就是桶的个数，桶越多，哈希碰撞几率越低。
    
    ```
    # 最小值为1009
    -XX:StringTable=1009
    ```
    
    > 假设写入 StringTable表数据非常多，当 StringTable表的大小越小时，越容易发生哈希碰撞产生链表。而随着数据变多，链表会越来越长。而在写入 StringTable 时，为了保证数据的唯一性，会查找 StringTable 判断数据唯一性。此时链表越长查找效率越低，进而影响了写入的效率。
    > 
    
    **若写入串池数据量较大，适当调大该参数**，减少哈希碰撞的几率，用内存空间来换效率。
    
- 重复字符串对象放入StringTable
  
    若是重复字符串对象很多，考虑使用 `intern()` 方法放入 StringTable 中。
    

### 7、直接内存

直接内存是 JDK 1.8 之后被利用到的区域，并不是虚拟机运行时数据区的一部分，但是这部分内存由于取代了方法区，会被频繁使用也可能导致 `OutOfMemory` 异常。

- 常用于 NIO 操作时，用作数据缓冲区。
- 分配回收成本较高，但读写性能高。
- 不受 JVM 内存回收管理。

---

**读取文件 -> 系统缓冲区 -> java 缓冲区**

![](https://s2.loli.net/2025/05/29/TPJe2zQCjuhGOlD.png)

**读取文件 -> 直接内存**

> 直接内存是系统内存和 Java 堆内存都可以共享的一个区域，对比之前读取文件时，减少了一次缓冲区的写入和读取，进而提高了效率。
> 

![](https://s2.loli.net/2025/05/29/CQ6X5p32TeonGPf.png)

### 直接内存OOM

不断使用直接内存会使用直接内存 OOM。

```java
public class DirectBufferOOM {

    static int size = 100 * 1024 * 1024;

    public static void main(String[] args) {
        List<ByteBuffer> list = new ArrayList<>();
        int i = 0;
        try {
            while (true) {
                //直接内存使用大小
                ByteBuffer byteBuffer = ByteBuffer.allocateDirect(size);
                list.add(byteBuffer);
                i++;
            }
        } finally {
            System.out.println(i);
        }
    }

}
```

![](https://s2.loli.net/2025/05/29/Ppth7f6AIbGFYvS.png)

### 直接内存释放

![](https://s2.loli.net/2025/05/29/ReJMUmFYDz5463C.png)

## 常见问题

### 1. JDK 1.7 和 JDK 1.8 内存模型发生的变化？

最大的变化就是在 JDK 1.8 中 元数据区取代了永久代。永久代位于JVM，而元数据区位于本地内存中。

### 2. 方法区和永久代的区分？

方法区是 JVM 中的一种规范定义，永久代是其具体的实现，在 JDK 1.8 中 元空间也是方法区的一种实现。

### 3. 为什么取消永久代？

- 根据官方文档的解释，是为了融合 `HotSpot JVM` 和 `JRockit VM` 做出的努力，因为 `JRockit VM` 没有永久代，不需要配置。
- 永久代大小指定比较困难，因为存放类和方法信息大小不易确定，并且永久代使用比较频繁，容易发生内存不够用的情况，即容易内存溢出。
- 永久代容易发生内存泄漏，永久代中的一些类不使用时，也不容易被 GC 回收，容易造成内存泄漏问题。

### 4. 什么是内存溢出和内存泄漏？

- 内存溢出
  
    当创建新对象的时候无法申请到足够的内存时，就会发生内存溢出。
    
- 内存泄露
  
    对象位于内存中不被使用，但是无法被 GC 回收掉，始终堆积在内存中。当堆积到一定程度会发生内存溢出。
    

## 参考链接

[Java内存管理-JVM内存模型以及JDK7和JDK8内存模型对比总结（三）](https://juejin.cn/post/6844903909983535111#heading-8)