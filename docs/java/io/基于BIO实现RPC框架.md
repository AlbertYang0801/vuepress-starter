# 基于BIO实现RPC框架

[基于bio手写实现简单的rpc_java 手写一个bio-CSDN博客](https://blog.csdn.net/weixin_42161936/article/details/119919878)

## RPC

![](https://s2.loli.net/2025/05/29/VBKQe5x3CLivlSc.png)

### RPC设计

![](https://s2.loli.net/2025/05/29/4aowYkprR6FG2Ai.png)

RPC 的核心就是让客户端调用远程服务方法，就像调用本地方法一样。

- 服务端将自己的类注册到远程服务。
- 客户端通过注册中心获取到服务端地址。
    - 客户端调用服务端地址，传入类名，调用方法、入参
    - 服务端收到方法信息后，本地通过**反射**执行方法，获取结果返回给客户端。
- 客户端需要写一个需要调用的类，和服务端的类保持一致（方法名、入参类型、入参）。
    - 客户端需要对这个类进行动态代理，实际访问的是该类的代理对象。
        - 代理逻辑包括对获取方法信息（方法名、入参），然后调用远程服务，将远程服务返回结果返回。

### 代理问题

RPC 的本质是让调用远程服务像调用本地方法一样简单。

调用者不关心内部实现，具体的远程调用由代理对象负责，这里就用到了代理模式。

### 序列化问题

在网络传输过程中，将对象变为二进制串传输。通过对象的序列化和反序列化实现。

### 通信问题

可以通过 BIO 进行网络传输。

## 注册中心

注册中心只有两种请求

- 服务注册
- 服务发现

将服务注册到注册中心，注册中心其实通过一个 Map 保存实例信息，维护 serviceName 和 serviceAddress 的关系。

```java
    //注册服务名,支持多实例
    //注册加锁，查询不加
    private static final Map<String, Set<RegisterServiceVo>> SERVICE_HOLDER = new HashMap<>();
```

## 服务端

- 启动时需要将自己注册到注册中心
- 提供基于反射调用自己方法的能力

## 客户端

- 从注册中心获取服务列表，获取服务真实地址。
- 添加远程服务接口。
  
    ```java
    public interface IStockService {
    
        /**
         * 获取商品的库存
         * @param skuId
         * @return
         */
        long getStock(Integer skuId);
    
    }
    ```
    
- 基于远程服务接口进行 JDK 动态代理。
  
    基于远程服务接口类，创建一个动态代理类并且放到 Spring 中。在使用的时候从 Spring 容器中获取该 Service，即可调用动态代理类的逻辑。
    
    ```java
    @Configuration
    public class BeanConfig {
    
        @Autowired
        RpcClientFrame rpcClientFrame;
    
        /**
         * 注册远程服务接口
         * 创建远程服务接口的代理对象，实现调用远程服务的逻辑
         * @return
         */
        @Bean
        public IStockService iStockService(){
            return rpcClientFrame.getRemoteProxyObject(IStockService.class);
        }
    
    }
    ```
    
    动态代理类的逻辑
    
    - 获取远程服务真实地址。
    - 使用反射获取远程服务类、方法、入参等信息。
    - 调用远程服务。
    
    ```java
        /**
         * 远程服务的代理对象，参数是客户端要调用的服务
         */
        public <T> T getRemoteProxyObject(final Class<?> serviceInterface) {
            //从注册中心获取服务真实地址
            InetSocketAddress serviceRealAddress = serviceDiscoveryHandler.getServiceRealAddress(serviceInterface.getName());
            //获取服务代理对象，由代理对象进行实际的网络调用
            //对Class执行InvocationHandler的Invoke方法，即JDK动态代理
            return (T) Proxy.newProxyInstance(serviceInterface.getClassLoader(),
                    new Class<?>[]{serviceInterface},
                    new DynProxy(serviceInterface,
                            serviceRealAddress));
        }
    ```
    

## 源码地址

[moudle-netty/rpc-client/src/main/java/com/albert/rpc/bio/client/RpcClientFrame.java · Albert.Yang/JavaAdvance - Gitee](https://gitee.com/zztiyjw/JavaAdvance/blob/master/moudle-netty/rpc-client/src/main/java/com/albert/rpc/bio/client/RpcClientFrame.java)