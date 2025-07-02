# RocketMQ基础学习

## 基础架构

![image.png](https://s2.loli.net/2025/06/27/JQ74usXOmze6LI3.png)

## 生产者

RocketMQ提供多种发送方式，**同步发送、异步发送、顺序发送、单向发送**。

同步和异步方式均需要 Broker 返回确认信息，单向发送不需要。

生产者中，会把同一类 Producer 组成一个集合，叫做生产者组。**同一组的 Producer 被认为是发送同一类消息且发送逻辑一致**。

## 消费者

### 消费者组

**消费者组消费同一组数据，消费相同topic，并且消费逻辑一致。消费者组的消费者实例必须订阅完全相同的Topic**。

### 消费模式

RocketMQ 支持两种消息模式：**集群消费（Clustering）和广播消费（Broadcasting）**。

- 集群消费模式下, 相同Consumer Group的每个Consumer**实例平均分摊消息**。
- 广播消费模式下，相同Consumer Group的每个Consumer**实例都接收全量的消息**。

## Topic

Topic只是一个逻辑概念，**并不实际保存消息**。同一个Topic下的消息，会分片保存到不同的Broker上，而每一个分片单位，就叫做**MessageQueue**。

MessageQueue是一个具有**FIFO特性的队列**结构，生产者发送消息与消费者**消费消息的最小单位**。

类似于Kakfa的Partation。

## Broker

Broker Server是 RocketMQ 的核心。

- Remoting Module：整个Broker的实体，负责处理来自clients端的请求。
- Client Manager：负责管理客户端(Producer/Consumer)和维护Consumer的Topic订阅信息。
- Store Service：提供方便简单的API接口处理消息存储到物理硬盘和查询功能。
- HA Service：高可用服务，提供Master Broker 和 Slave Broker之间的数据同步功能。
- Index Service：根据特定的Message key对投递到Broker的消息进行索引服务，以提供消息的快速查询。

### Broker集群

### 普通集群

这种集群模式下会给每个节点分配一个固定的角色。

- master负责响应客户端的请求，并存储消息。
- slave则只负责对master的消息进行同步保存，并响应部分客户端的读请求。消息同步方式分为**同步**同步和**异步**同步。

这种集群模式下各个节点的角色无法进行切换，也就是说，master节点挂了，这一组Broker就不可用了。

**读写分离，master挂了之后这一组Borker就失效了。没有master选举机制**

### Dledger集群

Dledger是 RocketMQ 自4.5版本引入的实现高可用集群的一项技术。

这个模式下的集群会随机选出一个节点作为master，而当master节点挂了后，会从**slave中自动选出一个节点升级成为master**。

Dledger技术做的事情：

1. **从集群中选举出master节点**。
2. **完成master节点往slave节点的消息同步**。

## NameServer

NameServer 就是 **Broker的注册中心**。

BrokerServer 会在启动时向所有的 NameServer 注册自己的服务信息，并且后续通过心跳请求的方式保证这个服务信息的实时性。

生产者或消费者能够通过名字服务查找各主题相应的 Broker IP 列表。多个 Nameserver 实例组成集群，但相互独立，没有信息交换。

## Message

生产和消费数据的最小单位，每条消息**必须属于一个 Topic**。

### MessageID

RocketMQ 中每个消息拥有**唯一的 MessageID**，且可以携带具有业务标识的 Key。系统提供了通过 Message ID 和 Key 查询消息的功能。

### Tag

Message 上有一个为消息设置的标志-**Tag标签**。用于**同一Topic下区分不同类型的消息**。来自同一业务单元的消息，可以根据不同业务目的在同一主题下设置不同标签。标签能够有效地保持代码的清晰度和连贯性，并优化 RocketMQ 提供的查询系统。

**消费者可以设置消费某个Topic的指定Tag数据，用于数据过滤。**

> 消费者可以指定 topic 和 tag。