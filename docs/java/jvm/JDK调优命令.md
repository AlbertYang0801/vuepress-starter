# JDK调优命令

## jstack

### 死锁检测

1. 使用 jps 命令查看运行中的 java 进程 Id。
   
    ![](https://s2.loli.net/2025/05/29/z4P19GBtHLKaeOE.png)
    
2. 使用 jstack 分析线程状态。
   
    ```
    jstack 进程Id
    ```
    
    - 线程状态
      
        通过分析进程可以得到，`DeadLockTest` 进程的两个线程分别为 `pool-1-thread-2` （简称2）和 `pool-1-thread-1`（简称1）。
        
        通过打印的线程信息可以发现，线程 2 和 1 的线程状态都是 WAITING，其中线程 2 在等待锁 `<0x000000076b4b2640>` , 线程 1 在等待锁 `<0x000000076b4b2670>`。而线程 1 和线程 2 本质上等待的都是对方已经持有的锁，进而引发了死锁问题。
        
        ![](https://s2.loli.net/2025/05/29/6LRiZIJ1yBogm8a.png)
        
    - 死锁现象
      
        同时 jstack 命令分析出了进程中存在的死锁问题，并分析出了死锁的原因。
        
        ![](https://s2.loli.net/2025/05/29/Q8vLGhso7Sg4OTI.png)
        

### cpu 占用过多

1. top 命令分析某个进程的 cpu 占用情况
2. ps 命令分析该进程占用 cpu 多的线程。
   
    ```
    ps H -eo pid,tid,%cpu |grep 32655
    ```
    
    ![](https://s2.loli.net/2025/05/29/E8Vw6Xbh9uCdtcp.png)
    
3. 使用 jstack 分析 cpu 使用量高的线程，pid = 32665。
   
    jstack 命令产生的日志里 pid 是 16进制，所以需要转换 pid 为 16 进制 7F99 。
    
    [十六进制转十进制| 16进制转10进制 | 在线进制转换工具](https://www.sojson.com/hexconvert/16to10.html)
    
    ```
    jstack 2141|grep -A 10 8dc
    ```
    
    可以看到定位到了线程，并且定位到了线程的代码位置。
    
    ![](https://s2.loli.net/2025/05/29/QMz2ukrxLThgfSD.png)
    

## jmap

### 查看对象情况

```
jmap -histo 2141 > log.txt
```

```
num     #instances         #bytes  class name
----------------------------------------------
   1:       5288313      299220792  [C
   2:       1800612      144048960  com.alibaba.csp.sentinel.node.metric.MetricNode
   3:       5043215      121037160  java.lang.String
   4:        162505       59247688  [B
   5:        342026       43742656  [Ljava.lang.Object;
   6:        282618       42957936  org.vlis.cloudmonitor.server.entity.K8sPodDo
   7:       1140776       27378624  java.lang.Double
   8:         99237       22744408  [I
   9:        876365       21032760  java.util.Date
  10:        139821       12304248  java.lang.reflect.Method
  11:        153523        7369104  java.util.HashMap
  12:        154362        6174480  java.util.LinkedHashMap$Entry
```

- num：序号
- instances：实例数量
- bytes：占用空间大小
- class name：类名称，`[C is a char[]，[S is a short[]，[I is a int[]，[B is a byte[]，[[I is a int[][]`

### 查看堆内存情况

```
jmap -heap 1260
```

```
Heap Usage:
PS Young Generation
Eden Space:
   capacity = 382730240 (365.0MB)
   used     = 87365400 (83.3181381225586MB)
   free     = 295364840 (281.6818618774414MB)
   22.826887156865368% used
From Space:
   capacity = 1048576 (1.0MB)
   used     = 655584 (0.625213623046875MB)
   free     = 392992 (0.374786376953125MB)
   62.5213623046875% used
To Space:
   capacity = 111673344 (106.5MB)
   used     = 0 (0.0MB)
   free     = 111673344 (106.5MB)
   0.0% used
PS Old Generation
   capacity = 1086324736 (1036.0MB)
   used     = 839186288 (800.3104095458984MB)
   free     = 247138448 (235.68959045410156MB)
   77.25003953145738% used
```

### 堆内存dump

```
1 jmap ‐dump:format=b,file=eureka.hprof 14660
```

可以配置自动 dump 文件，在内存溢出的时候会自动 dump 文件。

```
-XX:+HeapDumpOnOutOfMemoryError
```

比如应用的启动脚本，开启自动 dump 文件。

```
exec java -classpath $CLASSPATH -Xms1024m -Xmx2048m
-XX:+HeapDumpOnOutOfMemoryError
-Dquery.type=es
-Dfile.encoding=UTF-8 org.vlis.cloudmonitor.server.ApiServerApplication $*
```

## jinfo

### 查看应用扩展参数

```
jinfo -flags 2141
```

```
JVM version is 25.181-b13
Non-default VM flags: -XX:CICompilerCount=3 -XX:+HeapDumpOnOutOfMemoryError -XX:InitialHeapSize=1073741824 -XX:MaxHeapSize=2147483648 -XX:MaxNewSize=715653120 -XX:MinHeapDeltaBytes=524288 -XX:NewSize=357564416 -XX:OldSize=716177408 -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseFastUnorderedTimeStamps -XX:+UseParallelGC
Command line:  -Xms1024m -Xmx2048m -XX:+HeapDumpOnOutOfMemoryError -Dquery.type=es -Dfile.encoding=UTF-8
```

### 查看应用系统参数

```
```Shell
jinfo -sysprops 2141
```

```Shell
JVM version is 25.181-b13
java.runtime.name = Java(TM) SE Runtime Environment
java.vm.version = 25.181-b13
sun.boot.library.path = /home/jdk/jre/lib/amd64
java.vendor.url = http://java.oracle.com/
java.vm.vendor = Oracle Corporation
path.separator = :
file.encoding.pkg = sun.io
java.vm.name = Java HotSpot(TM) 64-Bit Server VM
sun.os.patch.level = unknown
sun.java.launcher = SUN_STANDARD
user.country = US
user.dir = /home/api-server/bin
java.vm.specification.name = Java Virtual Machine Specification
PID = 2141
```
```

## jstat

### 查看堆内存

jstat命令可以查看堆内存各部分的使用量，以及加载类的数量。命令的格式如下：

```
jstat -gc 2141
```

```
[root@localhost ~]# jstat -gc 2141
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT     GCT
102912.0 114688.0 816.3   0.0   364544.0 88977.5   996864.0   104569.5  133696.0 122682.9 15232.0 13281.3  10130  179.985  57     18.496  198.481

S0C：第一个幸存区的大小，单位KB
S1C：第二个幸存区的大小
S0U：第一个幸存区的使用大小
S1U：第二个幸存区的使用大小
EC：伊甸园区的大小
EU：伊甸园区的使用大小
OC：老年代大小
OU：老年代使用大小
MC：方法区大小(元空间)
MU：方法区使用大小
CCSC:压缩类空间大小
CCSU:压缩类空间使用大小
YGC：年轻代垃圾回收次数
YGCT：年轻代垃圾回收消耗时间，单位s
FGC：老年代垃圾回收次数
FGCT：老年代垃圾回收消耗时间，单位s
GCT：垃圾回收消耗总时间，单位s
```

### 查看老年代

```
jstat -gcold 2141
```

```
  MC       MU      CCSC     CCSU       OC          OU       YGC    FGC    FGCT     GCT
133696.0 122682.9  15232.0  13281.3    996864.0    104569.5  10130    57   18.496  198.481
```

option 操作类型

```
[root@localhost ~]# jstat -options
-class
-compiler
-gc
-gccapacity
-gccause
-gcmetacapacity
-gcnew
-gcnewcapacity
-gcold
-gcoldcapacity
-gcutil
-printcompilation
```