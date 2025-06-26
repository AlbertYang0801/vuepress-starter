# ES的log4j2日志自动清理配置

## 配置

```xml
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.fileIndex = nomax
appender.rolling.strategy.action.type = Delete
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}
appender.rolling.strategy.action.condition.type = IfFileName
appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-*
#时间策略
appender.rolling.strategy.action.condition.nested_condition.type = IfLastModified
appender.rolling.strategy.action.condition.nested_condition.age = 1D
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.action.type = Delete
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}
appender.rolling.strategy.action.condition.type = IfFileName
appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-*
#文件大小
appender.rolling.strategy.action.condition.nested_condition.type = IfAccumulatedFileSize
appender.rolling.strategy.action.condition.nested_condition.exceeds = 2GB
```

## 根据时间划分日志

![未命名文件.png](https://s2.loli.net/2025/06/26/c3l4KvX9NkSqiFt.png)

[log4j：log4j2配置文件解析_夜雨落花的博客-CSDN博客](https://blog.csdn.net/weixin_38569499/article/details/83027748)

## 模拟日志删除

日志删除机制是在创建日志的时候触发。

1. 查看日志时间
   
    ```
    stat elasticsearch_runlog-2022-06-20-16-04-59.log
    ```
    
    ![未命名文件.png](https://s2.loli.net/2025/06/26/t3uJLoPGq5OE4az.png)
    
2. 更改日志时间
   
    ```
    touch -d '2022-06-10 16:03:05.749824135 +0800' elasticsearch_runlog-2021-06-20-16-02-59.log
    ```
    
    ![未命名文件.png](https://s2.loli.net/2025/06/26/7xUzqpYsPa9hdWg.png)