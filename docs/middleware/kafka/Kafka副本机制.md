# Kafka副本机制

![image.png](https://s2.loli.net/2025/06/26/OULBqCvD7pRfPEk.png)

Kafka 的副本是针对分区来说的，为分区创建副本。

副本的作用就是提供**数据冗余，在 Leader 副本挂掉之后，转换为 Leader 副本继续工作。**

不然当 Leader 副本挂掉之后，该分区就会停止对外提供服务。

> Kafka的副本并不提供读写功能，为了避免数据读写差异导致的数据不一致问题出现。
> 

### 副本同步

![image.png](https://s2.loli.net/2025/06/26/49rwoxeGLvzcubB.png)

生产者只会往分区的 Leader 发消息，而其它 Follower 会从 Leader 拉取数据进行同步。

### Follower追随者副本

Follower 副本是不对外提供服务的，只是定期地异步拉取领导者副本中的数据而已。

## LSR副本集合

LSR集合里面保存的副本都是**与 Leader 副本保持同步的副本**。

> Follower 追随者副本在同步 Leader 副本数据的时候，是异步方式同步的，这样就可能导致同步进度有差异，或者远远落后于 Leader 副本的数据。
> 

LSR集合里面必然会包含 Leader 副本，甚至在极端情况下，没有任何副本与 Leader 副本保持同步，这种情况下 LSR 里面只会有 Leader 副本。

### 进入LSR副本集合的条件

- **replica.lag.time.max.ms**
  
    该参数的含义是 Follower 副本能够落后 Leader 副本的最长时间间隔，默认是 10s。
    

所以只要副本与 Leader 副本的同步时间相差在 10s 以内，都认为该副本是同步的，也就可以进入 LSR副本集合里面。（即使该副本里面的数据要比 Leader 副本数据少很多）

如果 LSR副本集合里面的副本同步速度超过了该间隔，会被从 LSR副本集合里面踢出去。

LSR集合是一个动态的集合，它能够根据**`replica.lag.time.max.ms`**配置的时间间隔，来动态的调整集合里面的副本。超过就删除，未超过就将副本加入到 LSR集合。

- ISR（**InSyncRepli）** : 速率和leader相差低于10秒的follower的集合
- OSR **(OutSyncRepli)** : 速率和leader相差大于10秒的follower
- AR **(AllRepli)**: 全部分区的follower

### 故障转移

当 Leader 副本挂掉之后，或者 Leader 副本所在 Broker 宕机之后。就会触发新的 Leader 的选举。

Kafka 依赖于 zk 的 watch 机制和临时节点功能，能够实时感知到挂掉的 Broker 和 Leader 副本，从而触发副本选举。

### Partition副本选举Leader机制

选举受到`unclean.leader.election.enable`参数的影响。

1. Controller 感知到 Leader 所在副本的 Broker 挂掉。
2. `unclean.leader.election.enable=false`，Controller 从 LSR列表中获取第一个 Broker 作为对应分区的Leader。
    - 当 LSR 集合为空的情况下，选不出来 Leader，就会导致该分区对外停止服务。
    - 能避免数据丢失（HW 高水位保证Consumer 能消费的数据是 LSR
    里面最低的数据水位），维护数据的一致性。但是牺牲了高可用。
3. `unclean.leader.election.enable=true`，Controller 从 LSR列表中获取第一个 Broker 作为对应分区的Leader。如果 LSR集合为空，则允许在其它副本选Leader。
    - 缺点是可能导致数据的丢失。
    - 优点是能保证 Leader 副本一直存在，不至于对外停止服务，提高了高可用性。