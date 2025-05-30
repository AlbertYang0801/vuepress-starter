# SpringBoot能同时处理多少请求

SpringBoot内置了Tomcat，处理请求是 Web 容器处理的。

1. 线程池线程数限制
   
    而 Tomcat 的线程池默认最大线程池是 200，所以默认同时**最多能处理 200 个请求**。
    
    > 由于 Tomcat 线程池运行机制，核心线程用完之后，还是继续创建线程，直到最大线程数。
    > 
2. 连接数限制
   
    达到连接池数时，会限制请求数。此时因连接数限制为准，而不是最大线程数。
    
    ```
    #tomcat最大连接数限制
    server.tomcat.max-connections=12
    ```
    

---

## 限制配置

```
#tomcat最大连接数限制
server.tomcat.max-connections=12

#线程池队列长度
server.tomcat.accept-count=100
```

## Tomcat的线程池运行机制

当请求进入到 tomcat 容器时，会将请求提交到 tomcat的线程池。

### Tomcat 的默认线程池参数

- 核心线程数 - 25
- 最大线程数 - 200
- 队列长度 - Integer.MAX_VALUE

![](https://s2.loli.net/2025/05/30/EcT4hm5ikZnJdSF.png)

image.png

![](https://s2.loli.net/2025/05/30/o9s7ZvV23kX8IJz.png)

![](https://s2.loli.net/2025/05/30/b2KLyiusAwB1mqZ.png)

> tomcat 的线程池和 Jdk的线程池运行机制有差异。
> 

### 线程池差异点

当线程池中核心线程池用完之后，如何处理新来的任务。

1. JDK
   
    将任务放到队列中。
    
2. Tomcat
   
    **核心线程数用完后，创建新线程，直到达到最大线程数，再将任务放到队列中**。
    
    - 线程数 < 最大线程数 ，返回false
      
        ![](https://s2.loli.net/2025/05/30/y8Twt3zRNPkrAVE.png)
        
    - false 之后，到最后判断进入 `addWorker(command, false )` ，新增非核心线程。
      
        ![](https://s2.loli.net/2025/05/30/3HcQ6s2SxXPNVOZ.png)
        

### 为什么tomcat要改线程运行机制

Tomcat在核心线程数满了之后启用最大线程数的原因是**为了应对高并发请求的情况**。

当核心线程数无法满足请求的处理需求时，通过创建更多的线程来处理请求可以提高系统的并发处理能力。

但是需要注意的是，过多的线程创建可能会导致系统资源的消耗增加，因此在配置最大线程数时需要根据实际情况和系统资源来进行调整，以避免线程过多导致系统性能下降。