# 手写MyBatis

## 整体流程

![](https://s2.loli.net/2025/06/10/p1QqFsxGzYOVlva.png)

整个mybatis的功能，就是代理 mapper 然后执行SQL，返回执行结果。

![](https://s2.loli.net/2025/06/10/SNbO8FgtQDmRxun.png)

1. 解析mybatis配置
    - 解析数据源 （Configuration 的 environment）
    - 解析mapper文件配置 （路径扫描）
2. 解析mapper文件
    - 注册mapper到mapperRegistry。（包含mapper的代理类工厂，可以获取代理过的mapper）
    - 生成mapper方法对应的mapperStatement。（Configuration 的 mappedStatements）
    - 解析mapper方法的标签和SQL，生成BoundSql。
3. SQL执行器
    - 预编译SQL
    - SQL参数化
    - 执行SQL
    - 处理结果集
4. 数据源
    - 支持多种数据源
    - 数据源池化

## 模块

[映射器-mapper](./映射器-mapper)

[数据源](./数据源)

[SQL执行器](./SQL执行器)

[xml解析](./xml解析)

## 参考链接

[第1章：开篇介绍，我要带你撸 Mybatis 啦！](https://bugstack.cn/md/spring/develop-mybatis/2022-03-20-%E7%AC%AC1%E7%AB%A0%EF%BC%9A%E5%BC%80%E7%AF%87%E4%BB%8B%E7%BB%8D%EF%BC%8C%E6%89%8B%E5%86%99Mybatis%E8%83%BD%E7%BB%99%E4%BD%A0%E5%B8%A6%E6%9D%A5%E4%BB%80%E4%B9%88%EF%BC%9F.html)