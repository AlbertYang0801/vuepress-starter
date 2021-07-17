

## 键 - key

在了解数据类型之前，先了解一下 redis 的键。

在 redis 中 命令不区分大小写，但是注意 **redis 中的 key 和 value 是区分大小写的**。

![image-20210715161837066](/Users/yangjunwei/Library/Application Support/typora-user-images/image-20210715161837066.png)

## 字符串 - string

字符串数据结构是简单的 K-V 模式数据结构。

### 特点

- 单值单 value。
- 二进制安全，可以包含任何数据。
- 一个键对应 value 值最大能存储数据 512 MB。

### 常用命令

![image-20210715141418272](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715163125.png)

- 设置字符串 -  `set test 100`
- 查询字符串  - `get test`
- 删除字符串 - `del test`
- 追加字符串 - `append test`
- 查询字符串长度 -  `strlen test`
- 批量添加 - `mset A 1 B 2`
- 批量获取 - `mget A B`
- 先查询再设置 - `getset hello world`

![image-20210715141320878](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715141320.png)

---

###  自增自减命令

由于 redis 是基于单线程的，这些增减命令都具有原子性。

注意命令只能操作 value 是数字的 key 值。

- 自增1 -  `incr count`
- 自减1 - `decr count`
- 自增指定值 - `incrby count 10`
- 自减指定值 - `decrby count 10 `

![image-20210715141702887](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715141702.png)

> incr 和 decr 命令应用场景很广泛，可用于点赞数量统计等场景。

---

- 查询字符串指定区间 - `getrange key start end`
- 设置字符串指定区间 - `setrange key offset value`
- 设置可过期字符串（秒） - `setex key seconds value`
- 值不存在可设置 - `setnx key value`
- 批量设置值不存在可设置 - `msetnx key value [key value ...]`

![image-20210715144700772](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715144700.png)

## 列表 - list

list 是类似双端链表或双端队列的数据结构。

### 特点

- 类似双向链表或双端队列，可以在列表左右两边操作数据。
- 单值对应多 value。
- 列表是有序的，按照 value 插入数据对 value 排序。
- 列表存放的 value 可重复。

​		![image-20210715163205871](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715163205.png)	

### 常用命令

- 列表左边增加元素 - `lpush key element [element ...]`
- 列表右边增加元素 - `rpush key element [element ...]`
- 列表左边删除元素 - `lpop key`
- 列表右边删除元素 - `rpop key`
- 遍历列表（开始～结束） - `lrange key start stop`
- 获取列表指定位置元素 - `lindex key index`
- 查询列表长度 - `llen key`
- 删除多个相同 value - `lrem key count element` 

![image-20210715172121562](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715172144.png)

- 截取列表重新赋值 - `ltrim key start stop`
- 从源列表右边提取元素放到目的列表 - `rpoplpush source destination`
- 修改列表指定位置 value - `lset key index element`
- 在列表指定位置前或后添加元素 - `linsert key BEFORE|AFTER pivot element`

![image-20210715172911836](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715172911.png)



## 无序集合 - set

set 是一种无序集合，存储元素无序并且不可重复。

### 特点

- 单值对应多 value。
- set 集合存放元素是**无序**的。
- set 集合存放的元素是**不可重复的**。

### 常用命令

- 添加元素 - 
- 删除集合元素 - 
- 遍历集合元素 - 
- 获取集合中元素个数 - 
- 从集合从随机获取几个数（不删除）- 
- 集合元素随机出栈 - 
- 将一个集合内的某个值赋给另一个集合 - 

### 数据集合类

- 差集

  

- 交集

  

- 并集







## hash

hash 的数据结构也是 K-V 模式，但是 hash 的 V 对应 K-V，也就是 **K-（K-V）**，适合存储对象。比如存储用户信息，K 是用户Id，V 是用户信息。

### 特点

- 数据结构特点是 K -（K-V），K 和 V 都是字符串类型。

### 常用命令

- 添加元素 - 
- 获取元素- 
- 向哈希表批量添加元素 - 
- 批量获取哈希表元素 - 
- 获取哈希表所有元素 - 
- 删除哈希表中的元素 - 
- 获取哈希表长度 - 
- 获取哈希表所有 key - 
- 获取哈希表指定 key 的所有 value - 
- 增加哈希表指定 key 的 value（value 必须是数值，增加整数）- 
- 增加哈希表指定 key 的 value （value 必须是数值，支持浮点数）- 
- 对哈希表某个 key 赋值（key 值不存在进行赋值，key 值存在此命令无效）- 



## 

## zset

