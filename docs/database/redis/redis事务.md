# redis的事务

redis 的事务，**可以一次执行多个命令，本质上是一组命令的集合，按照顺序串行化执行而不会被其它命令插入**。

## 常用命令

- 开启事务 -`multi`
- 执行所有事务 - `exec`
- 取消所有事务 - `discard`
- 监控一个或多个 key - `watch`
- 取消 watch 命令对所有 key 的监控 - `unwatch`
  
    ![](https://s2.loli.net/2025/06/18/3SDeoKAsTOPNRBX.png)
    

### watch监控

**watch** 指令，类似乐观锁，在创建事务之前，使用 watch 指令监控某个值。在事务提交时，如果 key 的值已经被别的客户端改变，那么整个事务队列都不会执行。

> 通过WATCH命令在事务执行之前监控了多个Keys，倘若在WATCH之后有任何Key的值发生了变化，EXEC命令执行的事务都将被放弃，同时返回 Nullmulti-bulk 应答以通知调用者事务执行失败
> 

![](https://s2.loli.net/2025/06/18/3SDeoKAsTOPNRBX.png)

**unwatch** 指令会取消所有 watch 指令的监控。

![](https://s2.loli.net/2025/06/18/bzRrscBqojapFHn.png)

## 三个特性

![](https://s2.loli.net/2025/06/18/9ZUA8JRvOhcrwN3.png)

### 为什么redis不支持回滚？

![](https://s2.loli.net/2025/06/18/6c3ElxpyKVzgYSH.png)

## 参考链接

[知乎-你应该知道的Redis事务](https://zhuanlan.zhihu.com/p/56017158)