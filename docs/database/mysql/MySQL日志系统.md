# MySQL日志系统

## undo.log

**记录被更新前的数据。**

![](https://s2.loli.net/2025/06/13/2qrd8h7f6nCpPUs.png)

InnoDB 支持事务，在事务执行失败回滚时，数据会回到操作前的样子。

`undo.log` 就是为了事务回滚，恢复数据的。

回滚对应的操作如下：

1. insert
   
    插入一条记录时，将这条记录的主键记录下来，回滚时根据主键删除。
    
2. update
   
    更新一条记录时，将更新的列的旧值记录下来，回滚时将这些值更新回去。
    
3. delete
   
    删除一条记录时，将这条记录记录下来，回滚时重新插入到表中。
    

---

在 MySQL 崩溃时，未提交的事务会影响到数据的准确性。此时就需要 `undo.log` 去回滚未提交的事务。

## redo.log

记录被修改后的数据。

当数据从磁盘中获取到，存到 `Buffer Pool` 后，同时将操作前的数据存到 `undo.log` 中。

对数据的操作都是在内存中，若发生了断电宕机，内存中的数据会丢失。

此时就引入了 `redo.log`，来解决**断电宕机**的问题。

`redo.log` 是 InnoDB引擎独有的，是存储引擎级别，不是 MySQL 级别的。

### 作用

![](https://s2.loli.net/2025/06/13/CghsYDIOGZcb5dQ.png)

`redo.log` 记录的是修改后的数据。*记录的是物理层面，“对什么数据，做了什么改动”。*

### 宕机恢复

在 MySQL 重启后，存储引擎会将 `redo.log` 中的数据恢复到 `Buffer Pool` 中。

InnoDB 可以保证即使数据库发生异常重启，之前提交的记录都不会丢失。

### redo log buffer

由于 `redo.log` 也是磁盘上的文件，所以引入了 `redo log buffer` 来减少磁盘 I/O 读写。

---

更新后的记录会先写到 `redo log buffer` 里，再根据刷盘策略刷到 `redo.log` 中。

### 刷盘策略

`redo log buffer` 中的数据写入到 `redo.log`。

日志文件中刷盘策略可以通过 `innodb_flush_log_at_trx_commit` 参数来设置 :

- 0：表示不刷入磁盘
- 1：表示立即刷入磁盘
- 2：表示先刷到 os cache

---

### 极端问题

假如在 `redo log buffer` 中的数据写入 `redo.log` 之前发生宕机情况，内存中的数据是否丢失？

此时内存中的数据会丢失，按照事务未成功处理，会根据 `undo.log` 中的数据回滚到之前的数据。

### 文件限制

InnoDB 的 redo log 是固定大小的，比如可以配置为一组 4 个文件，每个文件的大小是 1GB，总共可以记录 4GB的数据。

从头开始写，写到末尾就又回到开头循环写。

![](https://s2.loli.net/2025/06/13/rWQfm53kHSRBxNG.png)

`write pos` 是当前记录的位置，一边写一边后移，写到第 3 号文件末尾后就回到 0 号文件开头。

`check point` 是当前要擦除的位置，也是往后推移并且循环的，擦除记录前要把记录更新到数据文件。

`write pos` 和 `checkpoint` 之间的是“粉板”上还空着的部分，可以用来记录新的操作。如果 `write pos` 追上 `check point`，表示“粉板”满了，这时候不能再执行新的更新，得停下来先擦掉一些记录，把 `check point` 推进一下。

![](https://s2.loli.net/2025/06/13/I34yqBgObKNcxo2.png)

### 修改文件大小

配置文件中修改`innodb_log_file_size`参数大小来调整 redo log 的日志大小。单个 redo log 日志文件大小为 48MB。

> innodb_log_file_size 参数的默认值为 48MB
> 

```java
mysql> SHOW GLOBAL VARIABLES LIKE 'innodb_log_file_size';+----------------------+----------+| Variable_name        | Value    |+----------------------+----------+| innodb_log_file_size | 50331648 |+----------------------+----------+1 row in set (0.13 sec)
```

在 mysql 配置文件 my.cnf 中新增如下配置：

```java
[mysqld]...innodb_log_file_size=2G
...
```

## bin.log

**记录整个操作记录。**

`redo log`是 InnoDB 存储引擎特有的日志文件，在 InnoDB引擎中操作。而`bin log`属于是 MySQL 级别的日志，在**执行器**中操作。

`redo log`记录的东西是偏向于物理性质的，如：“对什么数据，做了什么修改”。

`bin log`是偏向于逻辑性质的，类似于：“对 students 表中的 id 为 1 的记录做了更新操作”。

---

### 写入文件

在提交事务阶段，执行器会将操作后的数据写入内存，然后刷到磁盘上的 `bin.log` 日志文件中。

### 文件限制

`bin.log` 日志文件是追加使用的，限制日志文件的大小，写满之后会顺序向后写。由 `binlog.index` 管理文件名。

![](https://s2.loli.net/2025/06/13/KWQx7lPEINM28hr.png)

而 `bin.log` 文件的默认过期时间是 30天，在过期之后会将文件删除。

### 刷盘策略

`bin.log` 的刷盘策略可以根据 `sync_bin log` 参数来修改。

- 默认为0，表示先写入 os cache。
  
    也就是说在提交事务的时候，数据不会直接到磁盘中，这样如果宕机`bin log`数据仍然会丢失。
    
- 1：表示**直接将数据写入到磁盘**文件中。

![](https://s2.loli.net/2025/06/13/jsGzBW5hlZyrfPU.png)

### 使用场景

`bin.log` 适用于 **手动数据恢复 和 主从复制**。

## 拓展

### crase-safe

`crase-safe` 能力指的是 MySQL 服务器宕机重启后。保证：

- 所有已经提交的事务的数据不会丢失。
- 所有没有提交的事务的数据自动回滚。

### 日志的两阶段提交

在 MySQL 日志中，`redo.log` 和 `bin.log` 中都记录了更新的数据。

在提交更新 SQL 时，必需要保证两个日志文件的一致性。要么全都失败、要么全都成功。不然会出现数据丢失问题。

![](https://s2.loli.net/2025/06/13/NcRsGW1hFY5oPEv.png)

### 第一阶段 - prepare阶段

在执行器调用引擎接口记录最终 SQL数据时。

引擎会将最终数据以物理逻辑（对什么数据，做了什么改动）形式存到 `redo log b uffer` 中，再根据刷盘策略 `fsync` 到磁盘日志文件 `redo.log` 中。此时将 `redo.log` 状态变为 `prepare` 。

引擎通知执行器可以提交事务。

### 第二阶段 - commit阶段

执行器开始提交事务。

执行器将 SQL语句的逻辑操作（SQL语句）写入到 `binlog cahce`，再根据刷盘策略 `fsync` 到磁盘日志文件 `bin.log`。

执行器再次调用引擎接口，引擎将 `redo.log` 的状态改为 `commit`。

---

### 事务状态

只有两阶段全部提交，才会视为整个事务成功执行。

若事务在写日志时，二阶段将 `redo.log` 改为 `commit` 状态之前发生断电宕机情况，都视为事务提交失败。

在重启恢复时，会按照 `undo.log` 中记录的数据回滚事务。