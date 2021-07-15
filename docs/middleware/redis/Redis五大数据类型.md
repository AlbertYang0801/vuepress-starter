

## 键 - key

在了解数据类型之前，先了解一下 redis 的键。

在 redis 中 命令不区分大小写，但是注意 **redis 中的 key 和 value 是区分大小写的**。

![image-20210715161837066](/Users/yangjunwei/Library/Application Support/typora-user-images/image-20210715161837066.png)

## 字符串 - string

### 特点

- 单值单 value。
- 二进制安全，可以包含任何数据。
- 一个键对应 value 值最大能存储数据 512 MB。

### 常用命令

![image-20210715141418272](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715163125.png)

- 设置字符串 `set test 100`
- 查询字符串 `get test`
- 删除字符串 `del test`
- 追加字符串 `append test`
- 查询字符串长度 `strlen test`
- 批量添加 `mset A 1 B 2`
- 批量获取 `mget A B`
- 先查询再设置 `getset hello world`

![image-20210715141320878](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210715141320.png)

---

###  自增自减命令

由于 redis 是基于单线程的，这些增减命令都具有原子性。

注意命令只能操作 value 是数字的 key 值。

- 自增1 `incr count`
- 自减1 `decr count`
- 自增指定值 `incrby count 10`
- 自减指定值 `decrby count 10 `

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

### 特点

- 类似双向链表或双端队列，可以在列表左右两边操作数据。
- 单值对应多 value。
- 列表是有序的，按照 value 插入数据对 value 排序。
- 列表存放的 value 可重复。

### 常用命令

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

## hash



## 

## set

## zset

