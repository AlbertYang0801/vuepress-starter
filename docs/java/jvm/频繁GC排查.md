# 频繁GC排查

```
jstat -gcutil 1000
```

![](https://s2.loli.net/2025/05/29/WnGmx7A6c4EaTOf.png)

```
jmap -dump:format=b,file=dumpfile 1000
```

使用 MAT 工具分析代码

---

组件消费数据的线程池配置有问题。

![](https://s2.loli.net/2025/05/29/FcNWq7lYSuMUjQf.png)