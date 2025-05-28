# ConcurrentHashMap -1.8

[ConcurrentHashMap 源码分析](https://javaguide.cn/java/collection/concurrent-hash-map-source-code.html#_4-get)

![image-20250528160131844]()

1.8的ConcurrentHashMap，采用对Node加锁机制。

### 加锁原理

采用CAS+Synchronized组合锁的方法。

- CAS

  操作Node数组的时候以CAS方式操作。

- Synchronized

  操作Node对应的数据结构，链表或红黑树的时候加Synchronized。保证操作数据的原子性。