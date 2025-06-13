# Nacos

## 地址

### GitHub

[https://github.com/alibaba/nacos](https://github.com/alibaba/nacos)

### 文档

[Nacos 快速开始](https://nacos.io/zh-cn/docs/quick-start.html)

### 启动命令

```sql
sh startup.sh -m standalone
```

### 可视化页面

[http://localhost:8848/nacos](http://localhost:8848/nacos)

## 注册中心原理

### 服务注册

Nocas Client 在启动的时候会通过 Rest 的方式将自己的元数据（Ip、端口）等信息发给 Nocas Server。

Nacos Server 收到 Client 的注册请求后，将元数据信息存到内存 Map 中。

```java
Map<namespace, Map<group::serviceName, Service>>

K:是namespace_id，起到环境隔离的作用
V:又是一个Map<String, Service>，代表分组及组内的服务。一个组内可以有多个服务
  K:代表group分组，不过作为key时格式是group_name:service_name
  V:服务信息
```

![](https://s2.loli.net/2025/06/10/ogPbjMGSs4HUnOL.png)

### 服务发现

- 服务消费者（Nacos Client）在调用服务提供者的服务时，会发送一个REST请求给Nacos Server，获取上面注册的服务清单，并且缓存在Nacos Client本地。
- 同时会在 Nacos Client 本地开启一个定时任务定时拉取服务端最新的注册表信息更新到本地缓存。

### 心跳同步

- 在服务注册后，Nacos Client会维护一个定时心跳来持续通知Nacos Server，说明服务一直处于可用状态，防止被剔除。
  
    **默认5s发送一次心跳。**
    

### 健康检查

- Nacos Server会开启一个定时任务用来检查注册服务实例的健康情况，对于超过15s没有收到客户端心跳的实例会将它的 healthy 属性置为false(客户端服务发现时不会发现)。
- 如果某个实例超过30秒没有收到心跳，直接剔除该实例(被剔除的实例如果恢复发送心跳则会重新注册)

### 自动配置

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE, ElementType.METHOD })
@ConditionalOnProperty(value = "spring.cloud.nacos.discovery.enabled", matchIfMissing = true)
public @interface ConditionalOnNacosDiscoveryEnabled {

}
```

## 配置中心原理

### 架构

![](https://s2.loli.net/2025/06/10/HgW34DyQGZNlds5.png)

Nacos的模式同时支持CP和AP

配置中心要求高：CP （保证数据一致性）

注册中心要求高：AP （保证服务可用性）

### 实现原理

1. **配置信息存储**：Nacos 默认使用内嵌数据库 Derby 来存储配置信息，还可以采用 MySQL 等关系型数据库。
2. **注册配置信息**：服务启动时，Nacos Client 会向 Nacos Server 注册自己的配置信息，这个注册过程就是把配置信息写入存储，并生成版本号。
3. **获取配置信息**：服务运行期间，Nacos Client 通过 API 从 Nacos Server 获取配置信息。Server 根据键查找对应的配置信息，并返回给 Client。
4. **监听配置变化**：**Nacos Client 可以通过注册监听器的方式，实现对配置信息的监听**。当配置信息发生变化时，Nacos Server 会通知已注册的监听器，并触发相应的回调方法。

### Nacos长轮询

一般来说客户端和服务端的交互分为两种：`推（Push）`和`拉（Pull）`，Nacos 在`Pull`的基础上，采用了**长轮询来进行配置的动态刷新**。

![](https://s2.loli.net/2025/06/10/gPq47OAhJsNvBka.png)

在长轮询模式下，客户端定时向服务端发起请求，检查配置信息是否发生变更。如果没有变更，服务端会”hold”住这个请求，即暂时不返回结果，直到配置发生变化或达到一定的超时时间。

通过长轮询的方式，Nacos 客户端能够实时感知配置的变化，并及时获取最新的配置信息。同时，这种方式也降低了服务端的压力，避免了大量的长连接占用内存资源。

## Nacos-Rabbion

Nacos 里面集成了 Rabbion

### 实现原理

![image-20250610183342200](https://s2.loli.net/2025/06/10/a1Mmg3sAnwz9I25.png)

1. Nacos Client 从 Nacos Server 获取服务列表，并且维护到了本地。
2. 远程调用时候，以 serverName 发起调用。
3. `LoadBalancerInterceptor`会对请求进行拦截，替换 serverName 为真实的地址。

### LoadBalancer 配置

![image-20250610183318593](https://s2.loli.net/2025/06/10/cNgJbnjzxBaVws6.png)