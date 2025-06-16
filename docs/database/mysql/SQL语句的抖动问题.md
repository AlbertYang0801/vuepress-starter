# SQL语句的抖动问题

有时候在执行 SQL 的时候，突然会变得很慢。这种慢比较随机，看起来像是抖动一样。

更新数据流程可以简化一下。

1. 内存（buffer pool）中的数据 flush 到磁盘。
2. 数据写入到 redo log 中。

**其中 buffer pool 中的数据页有三种状态**：

1. 数据页无数据。
2. 数据页是干净页。
   
    > 干净页指的是内存中数据和磁盘数据一致。
    > 
3. 数据页是脏页。
   
    > 脏页指的是内存中的数据被更新，但是没有flush到磁盘。出现内存和磁盘数据不一致的情况，此时该数据页称为脏页面。
    > 

### 性能问题

**导致执行变慢的原因可能有以下几种：**

1. redo log 写满了。
   
    > redo log 满了之后，会进行删除操作，删除最旧的数据，check point 向前推。以便 redo log 有足够空间支持写入。
    > 
    
    在redo log 满的时候，删除最旧数据的同时，要进行 flush 操作，将删除这部分数据中的脏页 flush 到磁盘中。
    
    出现 redo log 写满的情况时，整个系统所有的更新都要阻塞，等待 redo log 空出空间。
    
2. buffer pool 满了。
   
    当要读入的数据没有在 buffer pool 中时，要将数据写入到 buffer pool 的数据页上。
    
    此时如果没有空闲的数据页，就要将最旧不使用的页面淘汰掉。淘汰时，**如果该页面是脏页，需要先将数据页 flush 到磁盘**。如果是干净页，直接删除数据页即可。
    
    如果一个SQL涉及到的淘汰脏页个数太多，会导致查询时间明显变长。
    

### InnoDB 刷脏页的控制策略

### 磁盘能力大小 - innodb_io_capacity

> 从内存 flush 到磁盘，受到磁盘 IO 能力的影响。机械硬盘和SSD的IO能力明显不同
> 

通过配置该参数可以设置磁盘能力大小，让 InnoDB 根据配置的大小进行***全力刷磁盘***。

磁盘的 IOPS 可以通过 fio 工具进行测试。

```
 fio -filename=$filename -direct=1 -iodepth 1 -thread -rw=randrw -ioengine=psync -bs=16k -size=500M -numjobs=10 -runtime=10 -group_reporting -name=mytest
```

假如该值配置过小的话，刷脏页速度赶不上生成写入 buffer pool 数据的速度。会造成脏页累计，影响查询和更新的性能。

### 刷脏页连坐机制 - innodb_flush_neighbors

在刷一个脏页的时候，如果紧邻的数据页也是脏页，会一起刷掉。以此类推下去。

出现这种情况时会导致查询速度变慢，因为要等待脏页 flush。

在机械磁盘的情况下，这个连坐机制是很有必要的，因为可以减少随机IO。一次刷脏页的时候，顺便刷掉其余脏页。防止下次查询磁盘。

但是SSD这种访问磁盘快的情况下，就不需要连坐机制。

可以通过`innodb_flush_neighbors` 参数来配置。

- innodb_flush_neighbors = 0；意味着只刷自己，不连坐。
- innodb_flush_neighbors = 1；意味连坐。

在 MySQL 8.0 中，innodb_flush_neighbors 参数的默认值已经是 0 了。

### 刷脏页速度

InnoDB会在后台刷脏页，而刷脏页时主要根据 buffer pool 中的脏页比例和 redo log 写盘速度来控制，刷脏页的速度。

计算出比例后，根据配置的磁盘能力大小，控制实际刷新脏页的速度。这样可以保证减少刷脏页占用 IO 资源影响到查询和更新。

- 脏页比例
  
    默认脏页比例上限是75%，控制不要让比例超过75%。
    
    可以通过计算得来：
    
    ```
    Innodb_buffer_pool_pages_dirty/Innodb_buffer_pool_pages_total
    ```
    
- redo log 写盘速度
  
    (当前日志序号 - checkpoint) N
    

![](https://s2.loli.net/2025/06/13/seS9y7dD3A15FKH.png)