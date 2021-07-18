# redis五大数据类型

## 一、键 - key

在了解数据类型之前，先了解一下 redis 的键。

在 redis 中 命令不区分大小写，但是注意 **redis 中的 key 和 value 是区分大小写的**。

![image-20210715161837066](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718224605.png)

## 二、字符串 - string

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

### 实战总结

1. 点赞数量

   - 新增点赞

     `incr read`

   - 点赞总数

     `get read`

2. 文章阅读量



## 三、列表 - list

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

### 实战总结

1. 公众号文章订阅

   - 新增文章

     `lpush code java css`

   - 获取推送的最近5篇文章

     `lrange code 0 4`

## 四、哈希表 - hash

hash 的数据结构也是 K-V 模式，但是 hash 的 V 对应 K-V，也就是 **K-（K-V）**，适合存储对象。比如存储用户信息，K 是用户Id，V 是用户信息。

### 特点

- 数据结构特点是 K -（K-V），K 和 V 都是字符串类型。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718224641.png)

### 常用命令

- 添加元素 - `hset key field value [field value ...]`
- 获取元素- `hget key field`
- 向哈希表批量添加元素 - `hmset key field value [field value ...]`
- 批量获取哈希表元素 - `hmget key field [field ...]`
- 获取哈希表所有元素 - `hgetall key`
- 删除哈希表中的元素 - `hdel key field [field ...]`
- 获取哈希表长度 - `hlen key`
- 判断哈希表中是否存在某个 key - `hexists key field`
- 获取哈希表所有 key - `hkeys key`
- 获取哈希表指定 key 的所有 value - `hvals key`
- 增加哈希表指定 key 的 value（value 必须是数值，增加整数）- `hincrby key field increment`
- 增加哈希表指定 key 的 value （value 必须是数值，支持浮点数）- `hincrbyfloat key field increment`
- 对哈希表某个 key 赋值（key 值不存在进行赋值，key 值存在此命令无效）- 

![image-20210718210828555](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718210828.png)

### 实战总结

1. 购物车

   - 添加商品

     `hset shopcart 10001 1`

   - 增加商品数量

     `hincreby shopcart 10001 1`

   - 统计购物车商品总数

     `hlen shopcar`

   - 删除商品

     `hdel shopcart 10001`

   - 获取购物车列表

     `hgetall shopcart`

## 五、无序集合 - set

set 是一种无序集合，存储元素无序并且不可重复。

### 特点

- 单值对应多 value。
- set 集合存放元素是**无序**的。
- set 集合存放的元素是**不可重复的**。

![image-20210718224733903](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718224733.png)

### 常用命令

- 添加元素 - `sadd key member [member ...]`
- 遍历集合元素 - `smembers key`
- 判断某个元素是否存在集合中 - `sismember key member`
- 获取集合中元素个数 - `scard key`
- 删除集合元素 - `srem key member [member ...]`
- 从集合从随机获取几个数（不删除）- `srandmember key [count]`
- 集合元素随机出栈 - `spop key [count]`
- 将一个集合内的某个值赋给另一个集合 - `smove source destination member`

![image-20210718203023584](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718203023.png)

### 数据集合类

- 差集 - `sdiff key [key ...]`
- 交集 - `sinter key [key ...]`

- 并集 - `sunion key [key ...]`

![image-20210718203236165](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718203236.png)

### 实战总结

1. 景点预约功能

   - 新增预约
   - 取消预约
   - 判断用户是否预约过
   - 统计预约总人数
   - 展示预约用户信息

2. 抽奖功能

   - 参加抽奖

   - 统计参加人数

   - 随机抽两个人（不限次数）

     `srandmember key [count]`

   - 随机抽两人（只能中一次）

     `stop key [count]`

3. 微博共同关注的人

   - 对两个用户关注的人取交集

4. QQ - 可能认识的人

   - 对两个用户取差集

## 六、有序集合 - zset

zset 是有序版本，是在 set 集合的基础上，增加一个 score 值，来进行排序。

### 特点

- 数据结构是  `k v1 score1 v2 score2`
- zset 集合存放元素是**有序**的。
- zset 集合存放元素也是**不可重复**的。

![image-20210718224715172](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718224715.png)

### 常用命令

- 添加元素 - `zadd key [NX|XX] [CH] [INCR] score member [score member ...]`

- 遍历元素（可选是否显示分数） - `zrange key start stop [WITHSCORES]`

- 删除集合中某个元素 - `zrem key member [member ...]`

- 根据分数过滤元素 - `zrangebyscore key min max [WITHSCORES] [LIMIT offset count]`

  可以选择展示分数（withscores）和限制元素个数（limit）。

- 对集合中某个元素进行增量 - `zincrby key increment member`

![image-20210718223443609](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718223443.png)

![image-20210718211946513](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718211946.png)

- 获取集合中元素总个数 - `zcard key`

- **获取集合指定分数区间的元素个数** - `zcount key min max`

- 获取集合中指定元素的下标 - `zrank key member`

- 获取集合中指定元素的分数 - `zscore key member`

- **倒序遍历集合区间** - `zrevrange key start stop [WITHSCORES]`

- 倒序获取集合中某个元素的下标 - `zrevrank key member`

- 按照倒序根据分数过滤元素 - ` zrevrangebyscore key max min [WITHSCORES] [LIMIT offset count]`

  从最大值到最小值过滤，可以选择展示分数（withscores）和限制元素个数（limit）。

![image-20210718214057384](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210718214057.png)

### 实战总结

1. 销售排行榜

   - 增加商品销量

     `zincrby book 1 java`

   - 查询前十条销售量的商品

     `zrevrange book 0 9 WITHSCORES`

2. 微博热搜排行榜

   - 添加新闻初始热度

     `zadd weibo 250000 test`

   - 点击增加热度

     `zincrby weibo 1 test`

   - 查询前十条热度最高的新闻

     `zrevrange weibo 0 9 WITHSCORES`

   

   
