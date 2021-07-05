# Elasticsearch简介

## Elastic Stack

ELK Stack 是 Elasticsearch、Logstash、Kibana 三大开源框架的合集简称。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210705174726.png)

1. Elasticsearch  是一个基于Lucene、可分布式、近实时的搜索引擎，其通过 Restful 方式进行交互。
2. Logstash 是一个数据引擎，可将不用来源数据对接进 Elasticsearch 或其它目的地中。
3. Kibana 是一个数据可视化平台 。

## Elasticsearch介绍

### 百度百科介绍

> Elasticsearch 是一个分布式、高扩展、高实时的搜索与[数据分析](https://baike.baidu.com/item/数据分析/6577123)引擎。它能很方便的使大量数据具有搜索、分析和探索的能力。充分利用Elasticsearch的水平伸缩性，能使数据在生产环境变得更有价值。Elasticsearch 的实现原理主要分为以下几个步骤，首先用户将数据提交到Elasticsearch 数据库中，再通过分词控制器去将对应的语句分词，将其权重和分词结果一并存入数据，当用户搜索数据时候，再根据权重将结果排名，打分，再将返回结果呈现给用户。
>
> Elasticsearch是与名为Logstash的数据收集和日志解析引擎以及名为Kibana的分析和可视化平台一起开发的。这三个产品被设计成一个集成解决方案，称为“Elastic Stack”（以前称为“ELK stack”）。
>
> Elasticsearch可以用于搜索各种文档。它提供可扩展的搜索，具有接近实时的搜索，并支持多租户。”Elasticsearch是分布式的，这意味着索引可以被分成分片，每个分片可以有0个或多个副本。每个节点托管一个或多个分片，并充当协调器将操作委托给正确的分片。再平衡和路由是自动完成的。“相关数据通常存储在同一个索引中，该索引由一个或多个主分片和零个或多个复制分片组成。一旦创建了索引，就不能更改主分片的数量。
>
> Elasticsearch使用Lucene，并试图通过JSON和Java API提供其所有特性。它支持facetting和percolating，如果新文档与注册查询匹配，这对于通知非常有用。另一个特性称为“网关”，处理索引的长期持久性；例如，在服务器崩溃的情况下，可以从网关恢复索引。Elasticsearch支持实时GET请求，适合作为NoSQL数据存储，但缺少[分布式](https://baike.baidu.com/item/分布式/7316617)事务。 

**总结**

1. Elasticsearch 是一个基于 Lucene 的高扩展性分布式搜索服务器。
2. Elasticsearch 隐藏了 Lucene 的复杂性，对外提供 Restful 接口来操作。

### Elasticsearch通信方式

Elasticsearch 默认提供两种通信方式。

- Java客户端通信 **9300** 端口。
- Restful方式通信，HTTP服务所在的端口，默认为 **9200** 端口。

### Elasticsearch和Solr对比

1. es 基本是开箱即用，非常简单。Solr 安装略微复杂。
2. Solr 利用 Zookeeper 进行分布式管理，而 Elasticsearch 自身带有分布式协调管理功能。
3. Solr 支持更多格式的数据，比如 JSON、XML、CSV，而 Elasticsearch 仅支持 json 文件格式。
4. Solr 官方提供的功能更多，而 Elasticsearch 本身更注重于核心功能，高级功能多有第三方插件提供，例如图形化界面需要kibana友好支撑
5. Solr 查询快，但更新索引时慢（即插入删除慢），用于电商等查询多的应用；
6. ES建立索引快（即查询慢），即实时性查询快，用于 facebook 新浪等搜索。
7. 是传统搜索应用的有力解决方案，但 Elasticsearch 更适用于新兴的实时搜索应用。
8. Solr 比较成熟，有一个更大，更成熟的用户、开发和贡献者社区，而 Elasticsearch 相对开发维护者较少，更新太快，学习使用成本较高。





