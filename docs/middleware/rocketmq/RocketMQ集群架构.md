# RocketMQ集群架构

![image.png](https://s2.loli.net/2025/06/27/6bzUj2mgCl8NJxH.png)

NameServer：提供Broker的路由服务

Broker：负责接收Producer的消息，存储消息，将消息投递给Consumer。

- Broker需要管理数据，频繁处理数据，所以需要G1、ZGC这种更先进的垃圾回收器。
- 而NameServer类似于Broker的注册中心，提供路由功能，只需要简单的垃圾回收算法就可以，比如CMS。

Producer：生产者

Consumer：消费者

## 集群架构说明

整个RocketMQ集群里面主要分为两部分，Broker和NameServer。

整个RocketMQ遵循的是AP架构，追求可用性。

### NameServer

NameServer 作为注册中心，主要提供路有能力。只需要简单的集群架构提高并发能力即可。

NameServer 之间不进行数据同步，允许 NameServer 之间的数据不一致出现，等待 Borker 心跳上报数据，实现最终一致性即可。

### Broker

Broker作为数据存储，具有频繁读写的特性。

按照读写分离架构设计集群，