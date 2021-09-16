

# Elasticsearch检索

## 检索方式

Elasticsearch提供两种检索方式。

1. RestAPI 形式通过 URL 参数进行检索。

2. 通过 DSL 语句进行查询，通过传递 JSON 为请求体与 Elasticsearch 进行交互，这种方式更强大简洁。

## URL检索

`GET /{index}/{type}/_search?q=*&sort=age:desc&size=5&from=0&_source=name,age,bir`

> _search：搜索的API
>
> q=* ：匹配所有文档
>
> sort=age：按照指定字段进行排序，默认为升序，:desc 降序排列
>
> size：展示多少条数据
>
> from：展示第几页
>
> _source：只匹配哪些字段





## DSL 查询

### # 测试数据

1. 创建索引

   ```JAVA
   curl --location --request POST 'http://localhost:9200/course_test' \
   --header 'Content-Type: application/json' \
   --data-raw '
   {
     "mappings":{
       "emp":{
         "properties":{
           "name":{
             "type":"text"
           },
           "age":{
             "type":"integer"
           },
           "bir":{
             "type":"date"
           },
           "content":{
             "type":"text"
           },
           "address":{
             "type":"keyword"
           }
         }
       }
     }
   }'
   ```

2. 添加数据

   ```java
   curl --location --request POST 'http://localhost:9200/course_test/emp/' \
   --header 'Content-Type: application/json' \
   --data-raw '{
       "name": "小黑",
       "age": 23,
       "bir": "2012-12-12",
       "content": "为开发团队选择一款优秀的MVC框架是件难事儿，在众多可行的方案中决择需要很高的经验和水平",
       "address": "北京"
   }'
   ```

3. 测试数据

   ```java
   {"name":"小黑","age":23,"bir":"2012-12-12","content":"为开发团队选择一款优秀的MVC框架是件难事儿，在众多可行的方案中决择需要很高的经验和水平","address":"北京"}
   {"name":"王小黑","age":24,"bir":"2012-12-12","content":"Spring 框架是一个分层架构，由 7 个定义良好的模块组成。Spring 模块构建在核心容器之上，核心容器定义了创建、配置和管理 bean 的方式","address":"上海"}
   {"name":"张小五","age":8,"bir":"2012-12-12","content":"Spring Cloud 作为Java 语言的微服务框架，它依赖于Spring Boot，有快速开发、持续交付和容易部署等特点。Spring Cloud 的组件非常多，涉及微服务的方方面面，井在开源社区Spring 和Netflix 、Pivotal 两大公司的推动下越来越完善","address":"无锡"}
   {"name":"win7","age":9,"bir":"2012-12-12","content":"Spring的目标是致力于全方位的简化Java开发。 这势必引出更多的解释， Spring是如何简化Java开发的？","address":"南京"}
   {"name":"梅超风","age":43,"bir":"2012-12-12","content":"Redis是一个开源的使用ANSI C语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value数据库，并提供多种语言的API","address":"杭州"}
   ```

### 1. 查询所有 - match_all

   match_all ：返回索引中所有文档

   ```java
   GET /{index}/{type}/_search
          
   {
     "query": {
       "match_all": {}
     }
   }
   ```

### 2. 查询结果返回指定数量 - size

   size : 指定查询结果条数 。**默认返回10条。**

   ```java
   GET /{index}/{type}/_search
       
   {
     "query": {
       "match_all": {}
     },
     "size": 2
   }
   ```

### 3. 分页查询 - from

   from 和 size 一起可实现分页效果。

   ```java
   GET /{index}/{type}/_search
       
   {
     "query": {
       "match_all": {}
     },
     "size": 2,
     "from": 1
   }
   ```

### 4. 返回指定字段 - _source

   ```java
   GET /{index}/{type}/_search
       
   {
       "query": {
           "match_all": {
               
           }
       },
       "_source": "name"
   }
   
   #返回多个字段
   {
       "query": {
           "match_all": {
               
           }
       },
       "_source": [
           "name",
           "age"
       ]
   }
   ```

### 5. 关键字查询 - term

   Elasticsearch 里 text 类型字段会分词，keyword、date、Integer 等类型不会分词，只会按照整体取匹配。

   ```java
   GET /{index}/{type}/_search
   
   {
       "query": {
           "term": {
               "name": {
                   "value": "黑"
               }
           }
       }
   }
   
   //address是keyword类型，不会进行分词，只会整体匹配。
   {
       "query": {
           "term": {
               "address": {
                   "value": "北京"
               }
           }
       }
   }
   ```

   

### 6. 范围查询 - range

   range关键字：针对一些字段查询指定范围的文档。`gte` 和 `lte` 分别指定范围的左右区间

   ```java
   GET /{index}/{type}/_search
       
   {
       "query": {
           "range": {
               "age": {
                   "gte": 5,
                   "lte": 10
               }
           }
       }
   }
   ```

### 7. 前缀查询  - prefix

   prefix关键字：用来检索含有指定前缀关键字的相关文档。

   指定前缀并不是匹配文档指定字段，匹配的是文档指定字段经过分词后的数据，比如王小黑经过分词后是张、小、黑、小黑，无论匹配到哪个都会指向这个文档。

   ```java
   GET /{index}/{type}/_search
       
   {
       "query": {
           "prefix": {
               "name": {
                   "value": "小"
               }
           }
       }
   }
   ```

### 8. 通配符查询 - wildcard

   wildcard关键字：通配符查询。

   ？用来匹配一个任意字符。* 用来匹配多个字符。

   ```java
   GET /{index}/{type}/_search
       
   {
       "query": {
           "wildcard": {
               "name": {
                   "value": "王*"
               }
           }
       }
   }
   ```

### 9. 多Id查询 - ids

   ```java
   GET /{index}/{type}/_search
   
   {
       "query": {
           "ids": {
               "values": [
                   "PcDve3oBaj-AFoHVBG3J",
                   "P8Dve3oBaj-AFoHVNG1W"
               ]
           }
       }
   }
   ```

### 10. 模糊查询 - fuzzy

fuzzy 关键字：用来模糊查询含有指定关键字的文档。

```java
GET /{index}/{type}/_search
    
{
    "query": {
        "fuzzy": {
            "content": "sprin"
        }
    }
}
```

### 11. 布尔查询 - bool

bool 关键字：用来组合多个条件实现复杂查询。

- must：需要同时成立。相当于 && 。
- should：成立一个就行。相当于||。
- must_not：不能满足任何一个。相当于！。

```java
GET /{index}/{type}/_search
    
{
  "query": {
   "bool":{
       "must":[
           {
               "range":{
                   "age":{
                   "gte":5,
                   "lte":10
               }}
           }
       ],
       "must_not":[{
           "term":{
               "address":{

            "value":"南京"
               }
           }
       }]
   }
  }
}
```

### 12. 高亮查询 - highlight

highlight 关键字：可以让指定关键字高亮。

```java
GET /{index}/{type}/_search
    
{
    "query": {
        "term": {
            "address": {
                "value": "南京"
            }
        }
    },
    "highlight": {
        "fields": {
            "address": {
                
            }
        }
    }
}
```

### 13. 多字段查询 - multi_match

支持多个字段匹配。

```java
{
    "query": {
        "multi_match": {
            "query": "开发",
            "fields": [
                "name",
                "content"
            ]
        }
    }
}
```

### 14. 多字段分词查询 - query_string

该关键词可增加分词器。

```java
{
    "query": {
        "query_string": {
            "query": "小黑",
            "analyzer": "ik_max_word",
            "fields": [
                "name",
                "content"
            ]
        }
    }
}
```

### 15. 排序 - sort

```java
{
    "query": {
        "range": {
            "age": {
                "gte": 5,
                "lte": 10
            }
        }
    },
  	"sort":{
      "age":{
        "order":"desc"
      }
    }
}
```





## 参考链接

[7_ES中高级检索(Query)](https://blog.csdn.net/XJ0927/article/details/111999742)



