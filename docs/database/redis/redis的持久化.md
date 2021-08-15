# redis的持久化
redis 有 **RDB** 和 **AOF** 两种持久化方式。
## RDB

RDB 是 *Redis DataBase* 的简称，指的是在指定时间间隔内将内存中的数据集快照写入磁盘文件，也就是 Snapshot 快照，RDB 是**默认开启**的。

### RDB的原理

Redis 会单独创建 （fork）一个子进程来进行持久化操作，将内存中某一时刻的数据持久化到磁盘文件。这个子进程会先将数据写入到一个临时文件中，等待持久化进程结束后，再用这个临时文件替换掉磁盘文件。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815192619.png)

在整个过程中，**主进程是不进行任何 IO 操作的**，这样保证了主进程存取的高性能。

RDB 的持久化过程每次都是**全量存储**，但是 RDB 可能由于系统宕机等问题导致**最后一次持久化的数据丢失**。

### RDB的同步策略

RDB 的配置文件存在 redis.conf 中。

```java
#900秒（15分钟）后，如果至少有一个key更新
save 900 1
#300秒（5分钟）后，如果至少更改了10个key 
save 300 10
#60秒后，如果至少10000个key发生更改
save 60 10000
```

redis.conf 中配置内容如下：

![image-20210815192040662](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815192040.png)

### RDB如何恢复数据

RDB持久化的磁盘文件为 **dump.rdb**，redis 在启动的时候会加载该文件中的数据到内存中。

![image-20210815191238865](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815194512.png)

### RDB的优缺点

**RDB的优点**

1. 适合大规模的数据恢复。
2. 对数据完整性和一致性要求不高。

**RDB的缺点**

1. 存在**丢失最后一次数据的风险**。

   *若在最后一次数据持久化之前发生宕机清空，就会导致最后一次数据丢失。*

2. 在持久化过程中，fork 子进程**全量存储**内存中的数据，导致内存中的数据被全量复制了一份，占用内存空间。

## AOF

AOF 是 *Append Only File* 的简称，指的是**以日志的形式来记录每个写操作，将 Redis 执行过的所有写指令记录下来，读操作不记录**。

### AOF的原理

AOF 的机制只允许**追加文件**但不可以改写文件，

redis 启动的时候会加载该日志文件，根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复。

![img](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815195213.png)

### AOF的开启

AOF 保存的日志文件是 **appendonly.aof** 文件。

在 redis 中默认是不开启 AOF 的，可以在 **redis.conf** 修改配置 `appendpnly no` 为 `appendonly yes` 即可开启 AOF。

![image-20210815195638859](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815195638.png)

### AOF的同步策略

AOF包含三种同步策略。

1. 每次修改同步-`appendfsync always`

   每次发生数据变更便记录到磁盘中，由于持久化频率高，所以性能较差。但是数据完整性比较好。

2. 每秒同步-`appendfsync everysec`

   异步每秒记录数据，若发生宕机。可能丢失一秒内的数据。

3. 不同步-`appendfsync no`

   从不同步。

![image-20210815200049012](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815200049.png)

### AOF如何恢复数据

AOF 的日志文件 **appendonly.aof** 默认存在 redis 的根目录下，也可以使用 `config get dir` 命令查看目录。

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815200830.png" alt="image-20210815200830024" style="zoom:50%;" />

正常情况开启了 AOF 之后，redis 会加载日志文件，并从前向后执行日志文件中的写指令来恢复数据。

当异常情况 AOF 文件被写坏时，可以使用 `redis-check-aof --fix` 命令进行修复，然后重启就可以重新加载数据。

### AOF的重写原理

#### 为什么需要重写？

由于AOF采用的是日志追加方式，文件会越来越大，为避免文件过大，新增了重写机制。当 AOF 文件超过指定阀值的时候，AOF 就会启动内容压缩，只保留可以恢复数据的最小指令集。

*由于 AOF 每个写指令都追加到日志文件中，可能出现 AOF 文件出现多个相同 key 的写指令（内存中保存的是最后一个写指令的值），所以可以根据内存中的数据对 AOF 日志文件进行压缩。*

#### 重写原理

当 AOF 文件超过指定阀值的时候，会 fork 出新进程来重写日志文件（重写过程类似 RDB，先写临时文件再替换）。遍历内存中的所有数据，针对每个数据生成写指令，存入 AOF 文件中。重写的过程读取的是内存中的数据，而不是旧的 AOF 文件，类似于 RDB 的存储方式。

#### 触发机制

redis 会记录上次重写时的 AOF 日志文件大小，默认配置是**当 AOF 日志文件大小是上次重写后大小的一倍并且文件大小大于 64 MB 时触发**。

```java
#重写时候的百分比，默认是100%
auto-aof-rewrite-percentage 100
#日志文件最小大小
auto-aof-rewrite-min-size 64mb
```

该配置在 redis.conf 中如下所示：

![image-20210815202530766](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210815202530.png)

### AOF的优缺点

**AOF的优点**

1. AOF 的数据完整性和实时性比较好。
2. AOF 存在重写压缩机制，保证日志文件不至于过大。

**AOF的缺点**

1. 根据 AOF 的同步策略，**可能会丢失最后一条数据或最后一秒的数据**。
2. 相同大小的数据，AOF 文件要远大于 RDB 文件，恢复速度也小于 RDB 文件。
3. AOF 运行效率低于 AOF，每秒同步一次效率较好。

## RDB和AOF的对比

RDB 持久化方式能够在**指定时间间隔内对数据进行快照存储**。

AOF 持久化方式**记录每次写指令**，当服务器重启时按照顺序执行这些写指令来恢复数据。其中 AOF 还存在**重写压缩**机制，保证 AOF 文件不至于过大。

### 同时开启时的生效规则

当同时开启 RDB（默认开启） 和 AOF（手动开启） 时，redis 会**优先载入 AOF 文件来恢复数据**，也就是以 AOF 文件数据为准。

因为 AOF 的日志文件数据保存比较完整，而 RDB 的数据并不实时，所以同时开启时会以 AOF 文件为准。

### 如何选择持久化方式

>因为RDB文件只用作后备用途，建议只在Slave上持久化RDB文件，而且只要15分钟备份一次就够了，只保留save 900 1这条规则。
>
>如果Enalbe AOF，好处是在最恶劣情况下也只会丢失不超过两秒数据，启动脚本较简单只load自己的AOF文件就可以了。代价一是带来了持续的IO，二是AOF rewrite的最后将rewrite过程中产生的新数据写到新文件造成的阻塞几乎是不可避免的。只要硬盘许可，应该尽量减少AOF rewrite的频率，AOF重写的基础大小默认值64M太小了，可以设到5G以上。默认超过原大小100%大小时重写可以改到适当的数值。
>
>如果不Enable AOF ，仅靠Master-Slave Replication 实现高可用性也可以。能省掉一大笔IO也减少了rewrite时带来的系统波动。代价是如果Master/Slave同时倒掉，会丢失十几分钟的数据，启动脚本也要比较两个Master/Slave中的RDB文件，载入较新的那个。新浪微博就选用了这种架构

- 如果 redis 只做缓存，则可以不用任何持久化方式。
- 若作为后备数据库使用，最好使用 RDB，因为 AOF 不断变化不容易备份。
- 最好同时开启 AOF 和 RDB，其中 AOF 保证数据完整，RDB 作为后备使用。