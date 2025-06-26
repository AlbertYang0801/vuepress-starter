# ES参数调优

### 预防脑裂

![](https://s2.loli.net/2025/06/26/nxMuRZEr1f7WCU8.png)

[重要配置的修改 | Elasticsearch: 权威指南 | Elastic](https://www.elastic.co/guide/cn/elasticsearch/guide/current/important-configuration-changes.html)

### 堆内存设置

```
 -Xms2730m -Xmx2730m -Duser.timezone=Asia/Shanghai
```

xms和xmx设置一样大小，并设置为略小于pod分配内存的一半。

### 分片设置

分片过小或过多都会影响es的查询速率。

一经设置无法修改。

目前是10个分片，数据量不大的情况下，**设置为5个分片进行测试一下。**1个、和node数量一致分片测试。

1GB 20个分片

1个 20G～40GB

### 副本数量

目前是1个

### 索引缓冲区大小

![](https://s2.loli.net/2025/06/26/GKRof1IHBFebmY6.png)

![](https://s2.loli.net/2025/06/26/sLCkAeYGiXyg41E.png)

Refresh刷新间隔可以调整10s。同时缓冲区可以调大一点。

---

![](https://s2.loli.net/2025/06/26/eSVJcQIzh6RjTNq.png)