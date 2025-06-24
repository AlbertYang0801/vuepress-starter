# redis实现分布式锁

## 分布式锁简介

在分布式环境下，多个系统访问共享资源时会发生线程安全问题，分布式锁就是为了解决分布式环境下访问共享资源的线程安全问题，保证共享资源同一时间只能被一个系统的一个线程访问。

### 分布式锁具备的条件

1. 在分布式环境下，共享资源在同一时间只能被一个系统的一个线程访问。
2. 保证设置分布式锁和删除分布式锁操作的原子性。
3. 具备可重入特性。
4. 防止死锁。
5. 具备锁超时失效的机制。
6. 具备非阻塞锁特性，不会阻塞等待获取锁。

### 分布式锁主要实现方式

1. zeekeeper 实现分布式锁
2. redis 实现分布式锁

---

## setnx 命令

使用 redis 的 setnx 命令可以实现分布式锁。`setnx` 命令在设置 key 值时，若 key 已存在，则直接返回，只有 key 不存在时，才会添加成功。

单单使用该命令会遇到各种问题，还需要根据问题进行优化。

### setnx 实现流程

1. 单机环境下上单机锁保证线程安全，分布式下不具备**线程安全**。
2. 使用 redis 的 setnx 命令来设置分布式锁。
3. **保证分布式锁能够删除，将删除锁的代码放到 finally 代码块** 。
4. 系统宕机时，可能导致 **finally 代码块不执行**，从而分布式锁不会被删除，需要为**分布式锁增加过期时间**。（防止死锁）
5. 保证 redis 命令的原子性，使用包含**设置过期时间的 setnx 命令**。（保证设置时的原子性）
6. 保证每个线程删除的是自己的分布式锁，不能删除别人的锁。在删除的时候判断是否是本线程创建的锁。
   
    > 导致这种问题出现的原因可能是在业务未执行完之前锁过期，其他线程进入创建了新的锁，而当业务执行完删除锁时，删除的就是其他线程新建的锁。
    > 
7. 在删除锁之前，需要使用 redis 命令查询分布式锁是否是本线程创建的。需要**保证 redis 的查询操作和删除锁操作具有原子性**。（保证删除时的原子性）
    - 使用 redis 事务保证 查询和删除操作具有原子性。
    - 使用 **lua 脚本**来执行查询和删除，进而保证原子性。
8. 设置了过期时间的分布式锁，有一个问题解决不了，就是当业务未执行完成的时候，锁过期了，这时需要给锁续期。

---

### 代码实现

1. 简单使用 `setnx` 实现分布式锁。
   
    ```java
           /**
         * 3.0 版本
         * 加分布式锁 - 解决超卖问题
         */
        public String oversoldGoodVersionThree() {
            //不断请求锁
            while (true) {
                //加分布式锁 setNx
                Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, UUID.randomUUID().toString());
                if (Objects.isNull(lock)) {
                    continue;
                }
                //获取到锁
                if (lock) {
                    //获取商品数量
                    String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                    int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                    if (goods <= 0) {
                        System.out.println("商品已经卖完了");
                        return "商品已经卖完";
                    }
    
                    //减库存
                    int realGoodCount = goods - 1;
                    stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                    System.out.println("成功买到商品");
                    //解锁
                    stringRedisTemplate.delete(GOOD_LOCK);
                    return "成功买到商品";
                }
            }
        }
    ```
    
    上述代码可能存在解锁不成功的问题，不能保证分布式锁最终顺利解锁。
    
2. 保证分布式锁顺利解锁，增加 finally 代码块。
   
    ```java
        public String oversoldGoodVersionFour() {
            try {
                //不断请求锁
                while (true) {
                    //加分布式锁 setNx
                    Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, UUID.randomUUID().toString());
                    if (Objects.isNull(lock)) {
                        continue;
                    }
                    //获取到锁
                    if (lock) {
                        //获取商品数量
                        String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                        int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                        if (goods <= 0) {
                            System.out.println("商品已经卖完了");
                            return "商品已经卖完";
                        }
                        //减库存
                        int realGoodCount = goods - 1;
                        stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                        System.out.println("成功买到商品");
                        return "成功买到商品";
                    }
                }
            } finally {
                //解锁
                stringRedisTemplate.delete(GOOD_LOCK);
            }
    
        }
    ```
    
    上述代码虽然能保证最终解锁，但是若因为物理原因导致程序重启，最终没有走到 finally 块。但是在 redis 中对应的锁一直都存在，导致后续无法获取锁。
    
3. 对分布式锁增加过期时间，来保证解锁。
   
    注意，要保证设置锁和设置锁过期时间的原子性，使用一个 redis 命令。
    
    ```java
        public String oversoldGoodVersionFive() {
            try {
                //不断请求锁
                while (true) {
                    //加分布式锁 setNx（增加过期时间）
                    Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, UUID.randomUUID().toString(),1000L, TimeUnit.SECONDS);
                    if (Objects.isNull(lock)) {
                        continue;
                    }
                    //获取到锁
                    if (lock) {
                        //获取商品数量
                        String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                        int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                        if (goods <= 0) {
                            System.out.println("商品已经卖完了");
                            return "商品已经卖完";
                        }
                        //减库存
                        int realGoodCount = goods - 1;
                        stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                        System.out.println("成功买到商品");
                        return "成功买到商品";
                    }
                }
            } finally {
                //解锁
                stringRedisTemplate.delete(GOOD_LOCK);
            }
        }
    ```
    
    上述增加了锁过期的机制，是为了解决锁可能无法正常被解决的问题。但是也引来了新的问题。比如业务逻辑未执行完成，锁过期。
    
    锁过期会导致其他线程在自旋的过程可以拿到分布式锁，进行业务处理。最终会导致在线程结束删除锁时，删除的不是自己的锁。
    
    ![](https://s2.loli.net/2025/06/18/Qao12jb5sVpUlcG.png)
    
4. 对分布式锁增加线程标识，保证删除的是自己线程新建的锁。
   
    ```java
    public String oversoldGoodVersionSix() {
      	//当前线程作为
        String value = UUID.randomUUID().toString() + Thread.currentThread().toString();
        try {
            //不断请求锁
            while (true) {
                //加分布式锁 setNx（增加过期时间）
                Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, value,
                        1000L, TimeUnit.SECONDS);
                if (Objects.isNull(lock)) {
                    continue;
                }
                //获取到锁
                if (lock) {
                    //获取商品数量
                    String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                    int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                    if (goods <= 0) {
                        System.out.println("商品已经卖完了");
                        return "商品已经卖完";
                    }
                    //减库存
                    int realGoodCount = goods - 1;
                    stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                    System.out.println("成功买到商品");
                    return "成功买到商品";
                }
            }
        } finally {
            //删除自己的锁
            if(Objects.requireNonNull(stringRedisTemplate.opsForValue().get(GOOD_KEY)).equalsIgnoreCase(value)){
                //解锁
                stringRedisTemplate.delete(GOOD_LOCK);
            }
        }
    }
    ```
    
    在 finally 代码块中，先从 redis 查询 key 值，再删除 key。这两部操作不具备原子性，容易发生线程安全问题。
    
5. 保证 redis 多个操作的原子性，使用 redis 自身的事务来完成，同时使用乐观锁。
   
    ```java
        public String oversoldGoodVersionSeven() {
            String value = UUID.randomUUID().toString() + Thread.currentThread().toString();
            try {
                //不断请求锁
                while (true) {
                    //加分布式锁 setNx（增加过期时间）
                    Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, value,1000L, TimeUnit.SECONDS);
                    if (Objects.isNull(lock)) {
                        continue;
                    }
                    //获取到锁
                    if (lock) {
                        //获取商品数量
                        String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                        int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                        if (goods <= 0) {
                            System.out.println("商品已经卖完了");
                            return "商品已经卖完";
                        }
                        //减库存
                        int realGoodCount = goods - 1;
                        stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                        System.out.println("成功买到商品");
                        return "成功买到商品";
                    }
                }
            } finally {
                //增加事务
                while (true) {
                    //开启乐观锁监听
                    stringRedisTemplate.watch(GOOD_LOCK);
                    if (Objects.requireNonNull(stringRedisTemplate.opsForValue().get(GOOD_LOCK)).equalsIgnoreCase(value)) {
                        //开启事务
                        stringRedisTemplate.multi();
                        stringRedisTemplate.delete(GOOD_LOCK);
                        //提交事务
                        List<Object> execList = stringRedisTemplate.exec();
                        if (execList.size() > 0) {
                            continue;
                        }
                    }
                    //取消监听
                    stringRedisTemplate.unwatch();
                    break;
                }
            }
        
    ```
    
6. 保证 redis 多个操作的原子性，更常用的是使用 lua 脚本。
   
    > Lua 脚本在 Redis 中执行时具有原子性，即 Redis 保证在执行 Lua 脚本期间，不会有其他命令插入执行。这使得 Lua 脚本成为在 Redis 中实现复杂逻辑并保证原子性的理想工具。
    > 
    
    ```java
     public String oversoldGoodVersionEight() {
            String value = UUID.randomUUID().toString() + Thread.currentThread().toString();
            try {
                //不断请求锁
                while (true) {
                    //加分布式锁 setNx（增加过期时间）
                    Boolean lock = stringRedisTemplate.opsForValue().setIfAbsent(GOOD_LOCK, value,
                            1000L, TimeUnit.SECONDS);
                    if (Objects.isNull(lock)) {
                        continue;
                    }
                    //获取到锁
                    if (lock) {
                        //获取商品数量
                        String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                        int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
    
                        if (goods <= 0) {
                            System.out.println("商品已经卖完了");
                            return "商品已经卖完";
                        }
                        //减库存
                        int realGoodCount = goods - 1;
                        stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                        System.out.println("成功买到商品");
                        return "成功买到商品";
                    }
                }
            } finally {
                Jedis jedis = JedisUtils.getJedis();
                try {
                    //lua脚本
                    String script = "if redis.call('get',KEYS[1] == ARGV[1]) " +
                            "then " +
                            "return redis.call('del',KEYS[1] " +
                            "else " +
                            " return 0 " +
                            "end";
    								//jedis执行脚本
                    Object eval = jedis.eval(script, Collections.singletonList(GOOD_LOCK), Collections.singletonList(value));
                    if (Objects.equals("1", eval.toString())) {
                        System.out.println("使用 lua 脚本删除分布式锁成功！");
                    } else {
                        System.out.println("使用 lua 脚本删除分布式锁失败！");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    if (Objects.nonNull(jedis)) {
                        jedis.close();
                    }
                }
            }
        }
    ```
    
7. 在上述优化完之后，实现的分布式锁还存着问题。比如在业务执行完成之前，分布式锁的过期，导致其他线程进入，所以还需要对锁进行续期。

### 总结

可以发现通过 setnx 实现的分布式锁，主要解决了：

1. **加锁设置和删除锁操作时的原子性**。
2. **防止死锁的发生**。

但是没有解决**锁提前过期时的续期问题**。解决锁续期问题可以采用 Redisson 来实现。

---

## Redisson

Redisson 是**官方推荐的分布式锁实现方案**，Redisson 内部的 **WatchDog** 机制解决了锁续期的问题。

### 使用Redisson解决超卖

1. 配置 redisson。
   
    ```java
      @Configuration
      public class RedissonConfig {
      
          @Bean
          public RedissonClient redissonConfig() {
              Config config = new Config();
              config.useSingleServer().setAddress("redis://localhost:6379");
              return Redisson.create(config);
          }
      
      
      }
    ```
    
2. 解决超卖问题。
   
    ```java
    public String testRedisson() {
            //获取分布式锁
            RLock rLock = redissonClient.getLock(GOOD_LOCK);
            //加锁
            rLock.lock(1000L, TimeUnit.SECONDS);
            try {
                //获取商品数量
                String stock = stringRedisTemplate.opsForValue().get(GOOD_KEY);
                int goods = StringUtils.isEmpty(stock) ? 0 : Integer.parseInt(stock);
                if (goods <= 0) {
                    System.out.println("商品已经卖完了");
                    return "商品已经卖完";
                }
                //减库存
                int realGoodCount = goods - 1;
                stringRedisTemplate.opsForValue().set(GOOD_KEY, String.valueOf(realGoodCount));
                System.out.println("成功买到商品");
                return "成功买到商品";
            } finally {
                //加锁状态 当前线程
                if (rLock.isLocked() && rLock.isHeldByCurrentThread()) {
                    //解锁
                    rLock.unlock();
                }
            }
        }
    ```
    
    使用 redisson 可以发现，redisson 应该能够解决锁续期问题、锁操作的原子性问题、锁是否为当前线程创建等问题。
    
    > Redisson 在分布式场景下存在问题，假如持有锁的节点挂掉之后，锁未同步给其它节点就会存在锁丢失问题。
    > 
    
    引入红锁来解决分布式问题，核心就是给 Redis 集群每个节点加锁，超过一半加锁成功即认为加锁成功。
    
    [Redisson](https://flowus.cn/26b50e8d-5677-45f2-af40-75530697304c)
    

## 参考链接

[阳哥大厂面试题第三季-第 5 章 Redis](https://blog.csdn.net/oneby1314/category_10692968.html)