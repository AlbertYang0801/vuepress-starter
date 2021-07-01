# 环境安装

## 一、Elasticsearch 本地安装

 [Elasticsearch 7.10.2下载地址](https://www.elastic.co/cn/downloads/past-releases/elasticsearch-7-10-2) 本地安装 7.10.2 版本，解压即可。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110258.png)

- 启动命令

  `./bin/elasticsearch`

- 校验安装是否成功

  直接在浏览器输入：[http://localhost:9200](http://localhost:9200)，出现如下结果表示安装成功。

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110332.png)

  > You Know, for Search 

## 二、Elasticsearch-head 插件

谷歌浏览器可以配置 es-head 插件，配置成功之后可直接连接 Es。（连接采用 Restful 方式通信，使用的是 9200 端口）

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110429.png)

1. 复合查询

   可以调用 Restful 接口，执行各种操作。

   例如：向指定索引新增文档。

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110503.png)

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110515.png)

2. 基本查询

   基本查询可以按照插件提供的搜索条件进行查询。

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110526.png)

   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110536.png)

## 三、Kibana 

使用 brew 安装。（注意：kibana 版本需和 ES 保持一致）

- 搜索可用版本

   `brew search kibana`

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110808.png)

- 安装默认版本

   `brew install kibana`

  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110819.png)

- kibana存放目录

  `/usr/local/Cellar/kibana/7.10.2`
  
  ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628110846.png)

## 四、IK 分词器

Elasticsearch 默认对中文不分词，所以需要安装 IK 分词器插件。

**1. 分词器安装**

- 安装包下载

[下载地址](https://github.com/medcl/elasticsearch-analysis-ik/releases)（注意：分词器版本和 ES 版本保持一致。）

- 在 ES 根目录下的 `plugins` 文件夹创建 `analysis-ik` 目录，并将下载的安装包 `elasticsearch-analysis-ik-7.10.2.zip` 解压到该目录并删除压缩包。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628111108.png)

**2. 分词测试**

- 接口测试

  ```java
  curl --location --request POST 'http://localhost:9200/course/_analyze' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "text": "测试分词器，中文默认单词分开输出",
    "analyzer": "ik_max_word"
  }'
  ```

- 未分词之前

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628111135.png)

- 分词之后

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210628111144.png)

## 参考链接

- [[Elasticsearch: 权威指南](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html)](https://www.elastic.co/guide/cn/elasticsearch/guide/current/mapping-intro.html)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/index.html)

  
