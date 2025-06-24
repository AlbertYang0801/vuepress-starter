# redis数据类型

# redis数据类型

[练习代码地址 redis-practice](https://gitee.com/zztiyjw/JavaAdvanced/tree/master/redis-practice#/zztiyjw/JavaAdvanced/blob/master/redis-practice/src/test/java/com/albert/redis/datastructure/DataStructureTest.java)

## 键 - key

在了解数据类型之前，先了解一下 redis 的键。

在 redis 中 命令不区分大小写，但是注意 **redis 中的 key 和 value 是区分大小写的**。

![](https://s2.loli.net/2025/06/18/SkA5V2p3XB4hrti.png)

## 字符串 - string

字符串数据结构是简单的 K-V 模式数据结构。

### 特点

- 单值单 value。
- 二进制安全，可以包含任何数据。
- 一个键对应 value 值最大能存储数据 512 MB。

### 常用命令

![](https://s2.loli.net/2025/06/18/9xe5ETN2RQW8Pby.png)

- 设置字符串 - `set test 100`
- 查询字符串 - `get test`
- 删除字符串 - `del test`
- 追加字符串 - `append test`
- 查询字符串长度 - `strlen test`
- 批量添加 - `mset A 1 B 2`
- 批量获取 - `mget A B`
- 先查询再设置 - `getset hello world`

![](https://s2.loli.net/2025/06/18/ux4My5IHwvRX6W9.png)

---

### 自增自减命令

由于 redis 是基于单线程的，这些增减命令都具有原子性。

注意命令只能操作 value 是数字的 key 值。

- 自增1 - `incr count`
- 自减1 - `decr count`
- 自增指定值 - `incrby count 10`
- 自减指定值 - `decrby count 10`

![](https://s2.loli.net/2025/06/18/bFsMkDjc3BluiUp.png)

> incr 和 decr 命令应用场景很广泛，可用于点赞数量统计等场景。
> 

---

- 查询字符串指定区间 - `getrange key start end`
- 设置字符串指定区间 - `setrange key offset value`
- 设置可过期字符串（秒） - `setex key seconds value`
- 值不存在可设置 - `setnx key value`
- 批量设置值不存在可设置 - `msetnx key value [key value ...]`

![](https://s2.loli.net/2025/06/18/hjDmVpxr7g3X1cs.png)

### 实战总结

1. 点赞数量
    - 新增点赞
      
        `incr read`
        
    - 点赞总数
      
        `get read`
    
2. 文章阅读量

## 列表 - list

list 是类似双端链表或双端队列的数据结构。

### 特点

- 类似双向链表或双端队列，可以在列表左右两边操作数据。
- 单值对应多 value。
- 列表是有序的，按照 value 插入数据对 value 排序。
- 列表存放的 value 可重复。

![](https://s2.loli.net/2025/06/18/rUFBpb98aIgf1oQ.png)

### 常用命令

- 列表左边增加元素 - `lpush key element [element ...]`
- 列表右边增加元素 - `rpush key element [element ...]`
- 列表左边删除元素 - `lpop key`
- 列表右边删除元素 - `rpop key`
- 遍历列表（开始～结束） - `lrange key start stop`
- 获取列表指定位置元素 - `lindex key index`
- 查询列表长度 - `llen key`
- 删除多个相同 value - `lrem key count element`

![](https://s2.loli.net/2025/06/18/ZHUew9dWmpQXJlT.png)

- 截取列表重新赋值 - `ltrim key start stop`
- 从源列表右边提取元素放到目的列表 - `rpoplpush source destination`
- 修改列表指定位置 value - `lset key index element`
- 在列表指定位置前或后添加元素 - `linsert key BEFORE|AFTER pivot element`

![](https://s2.loli.net/2025/06/18/1J2SjfeOAIUuT5l.png)

### 实战总结

1. 公众号文章订阅
    - 新增文章
      
        `lpush code java css`
        
    - 获取推送的最近5篇文章
      
        `lrange code 0 4`
        

## 哈希 - hash

hash 的数据结构也是 K-V 模式，但是 hash 的 V 对应 K-V，也就是 **K-（K-V）**，适合存储对象。比如存储用户信息，K 是用户Id，V 是用户信息。

### 特点

- 数据结构特点是 K -（K-V），K 和 V 都是字符串类型。

![](https://s2.loli.net/2025/06/18/1Puf3gsUZyK2epc.png)

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
- 对哈希表某个 key 赋值（key 值不存在进行赋值，key 值存在此命令无效）- `hsetnx key field value`

![](https://s2.loli.net/2025/06/18/2tBGpKHT6ur4wRJ.png)

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
        

## 无序集合 - set

set 是一种无序集合，存储元素无序并且不可重复。

### 特点

- 单值对应多 value。
- set 集合存放元素是**无序**的。
- set 集合存放的元素是**不可重复的**。

![](https://s2.loli.net/2025/06/18/U3tznkJ2awTQYHh.png)

### 常用命令

- 添加元素 - `sadd key member [member ...]`
- 遍历集合元素 - `smembers key`
- 判断某个元素是否存在集合中 - `sismember key member`
- 获取集合中元素个数 - `scard key`
- 删除集合元素 - `srem key member [member ...]`
- 从集合从随机获取几个数（不删除）- `srandmember key [count]`
- 集合元素随机出栈 - `spop key [count]`
- 将一个集合内的某个值赋给另一个集合 - `smove source destination member`

![](https://s2.loli.net/2025/06/18/Lo7ltM1duYjrHRV.png)

### 数据集合类

- 差集 - `sdiff key [key ...]`
- 交集 - `sinter key [key ...]`
- 并集 - `sunion key [key ...]`

![](https://s2.loli.net/2025/06/18/GfXBEj3OxiUza1h.png)

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
      
        `spop key [count]`
    
3. 微博共同关注的人
    - 对两个用户关注的人取交集
      
        `sinter userA userB`
    
4. QQ - 可能认识的人
    - 对两个用户取差集
      
        `sdiff userA userB`
        

## 有序集合 - zset

zset 是有序版本，是在 set 集合的基础上，增加一个 score 值，来进行排序。

### 特点

- 数据结构是 `k v1 score1 v2 score2`
- zset 集合存放元素是**有序**的。
- zset 集合存放元素也是**不可重复**的。

![](https://s2.loli.net/2025/06/18/JDW2gEONmzTZ3RC.png)

### 常用命令

- 添加元素 - `zadd key [NX|XX] [CH] [INCR] score member [score member ...]`
- 遍历元素（可选是否显示分数） - `zrange key start stop [WITHSCORES]`
- 删除集合中某个元素 - `zrem key member [member ...]`
- 根据分数过滤元素 - `zrangebyscore key min max [WITHSCORES] [LIMIT offset count]`
  
    可以选择展示分数（withscores）和限制元素个数（limit）。
    
- 对集合中某个元素进行增量 - `zincrby key increment member`

![](https://s2.loli.net/2025/06/18/YpBZbOj8ske9wAG.png)

![](https://s2.loli.net/2025/06/18/K47rYIvgd8J61oZ.png)

- 获取集合中元素总个数 - `zcard key`
- **获取集合指定分数区间的元素个数** - `zcount key min max`
- 获取集合中指定元素的下标 - `zrank key member`
- 获取集合中指定元素的分数 - `zscore key member`
- **倒序遍历集合区间** - `zrevrange key start stop [WITHSCORES]`
- 倒序获取集合中某个元素的下标 - `zrevrank key member`
- 按照倒序根据分数过滤元素 - `zrevrangebyscore key max min [WITHSCORES] [LIMIT offset count]`
  
    从最大值到最小值过滤，可以选择展示分数（withscores）和限制元素个数（limit）。
    

![](https://s2.loli.net/2025/06/18/OH98iucjRhLkpwD.png)

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
        

## 位图 - bitmaps

bitmaps 又称位图，本身并不是一种实际的数据结构，而是基于 String 数据类型的按位操作。bitmaps 本质上是数组，数组由多个二进制位组成，每个二进制位只能存储 0 和 1。

### 特点

- **优点**
    1. 位图数据结构操作二进制位，只有 0 和 1 两个值。
       
        > 只支持存储 0 和 1，不支持存储其它数据类型。
        > 
    2. 基于 String 数据类型，bitmaps 最大存储长度为 512 MB。
       
        > 由于 String 数据类型的数据结构为 SDS （简单动态字符串），SDS 最大长度为 512MB，所以 bitmaps 的最大长度是 512MB。
        > 
    3. 由于 Bitmaps 是按位操作，所以存储时可以极大的节省空间。
       
        > 512MB （2^32）内存可以存储将近 42.9 亿的字节信息。
        > 
- **缺点**
    1. 由于 Bitmaps 是按位操作，当二进制位的偏移量很大时，会比较耗时。
    2. Bitmaps 有时可能会浪费空间。
       
        > Bitmaps 底层基于 SDS，底层字符串可以根据输入的位次，进行扩展以保存 value 到指定偏移量，对应的空白位置以 0 填充。
        > 
    3. 若 Bitmaps 操作大的 offset 时，对内存的分配可能阻塞 Redis 服务器。

如果连续输入比较稀疏（输入1，30000等跨度比较大的位次），会浪费大量内存空间。

### 常用命令

- 向指定偏移量 bit 位置设置值 - `setbit key offset value`
  
    > 当 key 不存在时，自动生成一个新的字符串。
    > 
    
    ![](https://s2.loli.net/2025/06/18/GbodVgeyk1SaPLm.png)
    
    ```java
    127.0.0.1:6379> set hello big
    OK
    127.0.0.1:6379> getbit hello 7(integer) 0127.0.0.1:6379> setbit hello 7 1(integer) 0127.0.0.1:6379> get hello
    "cig"127.0.0.1:6379>
    127.0.0.1:6379> setbit world 50 1(integer) 0127.0.0.1:6379> get world
    "\x00\x00\x00\x00\x00\x00 "127.0.0.1:6379> setbit world 50 0(integer) 1127.0.0.1:6379> get world
    "\x00\x00\x00\x00\x00\x00\x00"127.0.0.1:6379>
    ```
    

offset 参数值必须大于等于 0，小于 2^32。

- 获取位图指定 bit 的值 - `getbit key offset`
  
    使用 getbit 命令获取 String 类型指定 bit 的值。
    
    ![](https://s2.loli.net/2025/06/18/BOiIjuldzhSZsrm.jpg)
    
    ```java
    127.0.0.1:6379> set hello big
    OK
    127.0.0.1:6379> getbit hello 2(integer) 1127.0.0.1:6379>
    ```
    
- 统计位图指定区间中 bit 为 1 的总数量 - `bitcount key [start end]`
  
    ```java
    127.0.0.1:6379> setbit hello 10 1(integer) 0127.0.0.1:6379> setbit hello 15 1(integer) 0127.0.0.1:6379> bitcount hello
    (integer) 2127.0.0.1:6379>
    ```
    
- 对一个或多个 key 执行逻辑操作（与、非、或、异或） - `bitop operation destkey key [key ...]`
  
    【BITOP】支持逻辑操作，包含 且 AND、或 OR、异或 XOR、非 NOT；
    
    - 且 AND(&)：同 1 为 1，其余为 0；
    - 或 OR(|)：有 1 为 1，同 0 为 0；
    - 异或 XOR(^)：不同为 1，相同为 0；
    - 非NOT(~)：1 变 0，0 变 1；
    
    ```java
    A 二进制 01000001B 二进制 01000010@ 二进制 01000000127.0.0.1:6379> set a A
    OK
    127.0.0.1:6379> set b B
    OK
    127.0.0.1:6379>
    127.0.0.1:6379>
    127.0.0.1:6379>
    127.0.0.1:6379> bitop and ggg a b
    (integer) 1127.0.0.1:6379> get ggg
    "@"127.0.0.1:6379>
    ```
    
- 查询指定字节区间第一个指定 bit （0 或 1）的位置 - `bitpos key bit [start] [end]`。
  
    ```java
    127.0.0.1:6379> setbit hello 0 1(integer) 0127.0.0.1:6379> setbit hello 1 1(integer) 0127.0.0.1:6379> setbit hello 2 0(integer) 0127.0.0.1:6379> bitpos hello 0(integer) 2127.0.0.1:6379> bitpos hello 1(integer) 0127.0.0.1:6379>
    ```
    

### 实战总结

- 用户每月签到
    - 用户签到
      
        `setbit signIn:YYYYMM:userId day 1`
        
    - 统计当月签到总数
      
        `bitcount signIn:YYYYMM:userId`
        
    
    代码如下：
    
    ```java
    @Service
    public class Bitmaps_SignInService {
    
        @Autowired
        RedisUtil redisUtil;
    
        @Autowired
        RedisTemplate redisTemplate;
    
        private final String SIGNIN = "signIN";
    
        /**
         * 用户签到
         */
        public boolean signIn(String userId) {
            //当月
            String month = LocalDateTimeUtils.formatNow(LocalDateTimeUtils.YEAR_MONTH);
            //本月第几天
            int dayOfMonth = LocalDateTime.now().getDayOfMonth();
            return redisUtil.setBit(getSignInKey(userId, month), dayOfMonth, true);
        }
    
        /**
         * 获取指定用户某月份签到总数
         */
        public int countMonthSignIn(String userId, String month) {
            String signInKey = getSignInKey(userId, month);
            //redisTemplate没有提供bitcount命令，可使用execute调用相关方法
            Long execute = (Long) redisTemplate.execute(
                    (RedisCallback<Long>) con -> con.bitCount(signInKey.getBytes()));
            if (Objects.isNull(execute)) {
                return 0;
            }
            return execute.intValue();
        }
    
        private String getSignInKey(String userId, String month) {
            return SIGNIN + ":" + month + ":" + userId;
        }
    
    }
    ```
    
    测试例子如下：
    
    ```java
        /**
         * bitmaps-用户签到
         */
        @Test
        public void bitmapsTest() {
            String userId = "xiaoming";
            //签到
            boolean signInFlag = bitmapsSignInService.signIn(userId);
            System.out.println(userId + " => 签到状态：" + signInFlag);
            String month = LocalDateTimeUtils.formatNow(LocalDateTimeUtils.YEAR_MONTH);
            int signInCount = bitmapsSignInService.countMonthSignIn(userId, month);
            System.out.println(userId + " => " + month + " => 签到次数为:" + signInCount);
        }
    
        //output
        xiaoming => 签到状态：false
        xiaoming=>2021-08=> 签到次数为:1
    ```
    

### 参考链接

- [Redis学习笔记 - Bitmaps（位图）](https://blog.csdn.net/lm324114/article/details/88959531)
- [https://juejin.cn/post/6844903561839525902](https://juejin.cn/post/6844903561839525902)