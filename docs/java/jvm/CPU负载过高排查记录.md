# CPU负载过高排查记录

[解决线上微服务容器cpu占用100%问题（java进程占用100%问题）_容器cpu占用高_上树的蜗牛儿的博客-CSDN博客](https://blog.csdn.net/lijie1051/article/details/128464838)

## 平台发现问题

平台发现集群节点 node219 CPU利用率过高。

![image.png](https://s2.loli.net/2025/05/29/Ub4zn7Pw3YM6Evl.png)

通过查看该节点下的 pod 发现，bookdemo 使用 CPU 过高。

![image.png](https://s2.loli.net/2025/05/29/pT5ohk7ftYPECGU.png)

## 主机排查

### top 查看进程情况

使用 top 确认占用cpu过高的进程。

PID=17177 占用 CPU 最高。

![](https://s2.loli.net/2025/05/29/KoI7m1SMUPerxW4.png)

### 查看进程 PID 对应的容器

由于该进程是个POD，需要找到对应容器，进入容器内部排查线程情况。

![](https://s2.loli.net/2025/05/29/KocELWP9Chysi2f.png)

![](https://s2.loli.net/2025/05/29/fWkvhgDpCyUju9w.png)

## 容器内部排查

### top查看进程情况

可以看到 PID=1 进程使用CPU过高。

![](https://s2.loli.net/2025/05/29/TRfVYGOBQAHukyC.png)

### 查看进程的线程资源情况

根据 PID = 1 查看该进程下的线程情况。

```json
top -H -p1
```

![](https://s2.loli.net/2025/05/29/rzfWVbpwZsy1R8g.png)

可以看到有8个线程 CPU 使用率非常高。

### jstack查看进程堆栈信息

```json
jstack 17177
```

输出结果到文件

```json
jstack 17177 > java.log
```

### 查看某个线程堆栈

比如查看线程 PID=1911 的堆栈。

> 堆栈里面的 id 是16进制，需要将拿到的 线程PID转换为16进制。比如 1911的16进制是 777。
> 

[十进制转换 - 在线进制转换器](https://jisuan5.com/decimal/?hex=1911)

可以看到堆栈信息中该线程的标识是 `nid=0x777`，可以根据该标识过滤。

![](https://s2.loli.net/2025/05/29/G65zLyHxJDkUphr.png)

```json
cat java.log | grep 'nid=0x777' -C 10
```

![](https://s2.loli.net/2025/05/29/WzcMReCoy5qpE8j.png)

可以看到代码关键位置，通过排查代码作进一步排查。

### 通过堆栈信息排查死锁

```json
cat java.log |grep 'deadlock' -C 10
```

![](https://s2.loli.net/2025/05/29/AidVDvC42GIkTtQ.png)

可以看到线程1 和 线程2 互相持有对方需要的锁，可以看到对应代码位置。

通过 lockId 可以快速查找该锁被谁持有。