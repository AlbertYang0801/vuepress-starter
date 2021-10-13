# Elasticsearch聚合查询总结


## 1.求和、最大值、最小值、平均值

- 求和 - sum
- 最大值 - max
- 最小值 - min
- 平均值 - avg

---

### DSL查询语句

```java
{
    "size": 0,
    "query": {
        "bool": {
            "filter": [
                {
                    "range": {
                        "indexTime": {
                            "from": "2021-07-09 00:00:00",
                            "to": "2021-07-10 00:00:00",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        }
                    }
                }
            ]
        }
    },
    "aggs": {//聚合字段
        "sum_user": {//自定义字段
            "sum": {//指定字段求和
                "field": "userTotal"
            }
        },
        "max_user": {
            "max": {//指定字段取最大值
                "field": "userTotal"
            }
        },
        "min_user": {
            "min": {//指定字段取最小值
                "field": "userTotal"
            }
        },
        "avg_user": {
            "avg": {//指定字段取平均值
                "field": "userTotal" 
            }
        }
    }
}
```

查询语句返回结果。

```java
{
    "took": 31,
    "timed_out": false,
    "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": 290834,
        "max_score": 0.0,
        "hits": []
    },
    "aggregations": {
        "max_user": {
            "value": 8.0
        },
        "min_user": {
            "value": 8.0
        },
        "sum_user": {
            "value": 69128.0
        },
        "avg_user": {
            "value": 8.0
        }
    }
}
```



### Java API

```java
        //求和、最大值、最小值、平均值
        SumAggregationBuilder sumAggregationBuilder = AggregationBuilders.sum("sum_user").field("userTotal");
        MaxAggregationBuilder maxAggregationBuilder = AggregationBuilders.max("max_user").field("userTotal");
        MinAggregationBuilder minAggregationBuilder = AggregationBuilders.min("min_user").field("userTotal");
        AvgAggregationBuilder avgAggregationBuilder = AggregationBuilders.avg("avg_user").field("userTotal");
        //按顺序
     sumAggregationBuilder.subAggregation(maxAggregationBuilder).subAggregation(minAggregationBuilder).subAggregation(avgAggregationBuilder);
        //执行查询
        SearchRequestBuilder searchRequestBuilder = esSearch.getSearchRequestBuilder();
        searchRequestBuilder.addAggregation(sumAggregationBuilder);
```

## 2. 当天每隔2小时的数据总量

比如查询昨天每两小时的数据总量。

### DSL查询语句

```java
{
    "size": "0",
    "query": {
        "bool": {
            "filter": [
                {
                    "range": {
                        "indexTime": {
                            "from": "2021-07-09 00:00:00",
                            "to": "2021-07-10 00:00:00",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "countData": {//自定义字段
            "date_histogram": {
                "field": "indexTime",
                "interval": "120m"	//时间间隔，每120分钟一条数据
            }
        }
    }
}
```

查询语句返回结果，可以看到 `doc_count` 即为数据总量。

```java
{
    "took": 21,
    "timed_out": false,
    "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": 290834,
        "max_score": 0.0,
        "hits": []
    },
    "aggregations": {
        "groupBy": {
            "buckets": [
                {
                    "key_as_string": "2021-07-09T00:00:00.000Z",
                    "key": 1625788800000,
                    "doc_count": 23977
                },
                {
                    "key_as_string": "2021-07-09T02:00:00.000Z",
                    "key": 1625796000000,
                    "doc_count": 23948
                },
                {
                    "key_as_string": "2021-07-09T04:00:00.000Z",
                    "key": 1625803200000,
                    "doc_count": 23895
                },
                {
                    "key_as_string": "2021-07-09T06:00:00.000Z",
                    "key": 1625810400000,
                    "doc_count": 23900
                },
                {
                    "key_as_string": "2021-07-09T08:00:00.000Z",
                    "key": 1625817600000,
                    "doc_count": 24238
                },
                {
                    "key_as_string": "2021-07-09T10:00:00.000Z",
                    "key": 1625824800000,
                    "doc_count": 24701
                },
                {
                    "key_as_string": "2021-07-09T12:00:00.000Z",
                    "key": 1625832000000,
                    "doc_count": 24207
                },
                {
                    "key_as_string": "2021-07-09T14:00:00.000Z",
                    "key": 1625839200000,
                    "doc_count": 24442
                },
                {
                    "key_as_string": "2021-07-09T16:00:00.000Z",
                    "key": 1625846400000,
                    "doc_count": 24713
                },
                {
                    "key_as_string": "2021-07-09T18:00:00.000Z",
                    "key": 1625853600000,
                    "doc_count": 24679
                },
                {
                    "key_as_string": "2021-07-09T20:00:00.000Z",
                    "key": 1625860800000,
                    "doc_count": 24108
                },
                {
                    "key_as_string": "2021-07-09T22:00:00.000Z",
                    "key": 1625868000000,
                    "doc_count": 23995
                },
                {
                    "key_as_string": "2021-07-10T00:00:00.000Z",
                    "key": 1625875200000,
                    "doc_count": 31
                }
            ]
        }
    }
}
```

### Java API

- dateHistogram - 指定聚合字段别名；
- dateHistogramInterval - 指定时间间隔；
  - 两小时 - `DateHistogramInterval.hours(2)`
  - 一天 - `DateHistogramInterval.days(1)`

```java
        AggregationBuilders.dateHistogram("countData").field("indexTime")
                .dateHistogramInterval(DateHistogramInterval.minutes(120));
        SearchRequestBuilder searchRequestBuilder = esSearch.getSearchRequestBuilder();
        searchRequestBuilder.addAggregation(dateHistogramAggregationBuilder);
```



## 3. 指定间隔时间的操作

比如查询昨天每两小时的用户总量求和结果。

### DSL查询语句

```java
{
    "size": "0",
    "query": {
        "bool": {
            "filter": [
                {
                    "range": {
                        "indexTime": {
                            "from": "2021-07-09 00:00:00",
                            "to": "2021-07-10 00:00:00",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "countUserTotal": {//自定义字段
            "date_histogram": {
                "field": "indexTime",//指定日期字段
                "interval": "120m"	//指定时间间隔2小时
            },
            "aggs": {
                "max_user": {//自定义字段
                    "sum": {//求和
                        "field": "userTotal"	//用户总量字段
                    }
                }
            }
        }
    }
}
```

查询语句的查询结果。

```java
{
    "took": 20,
    "timed_out": false,
    "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": 290834,
        "max_score": 0.0,
        "hits": []
    },
    "aggregations": {
        "countUserTotal": {
            "buckets": [
                {
                    "key_as_string": "2021-07-09T00:00:00.000Z",
                    "key": 1625788800000,
                    "doc_count": 23977,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T02:00:00.000Z",
                    "key": 1625796000000,
                    "doc_count": 23948,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T04:00:00.000Z",
                    "key": 1625803200000,
                    "doc_count": 23895,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T06:00:00.000Z",
                    "key": 1625810400000,
                    "doc_count": 23900,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T08:00:00.000Z",
                    "key": 1625817600000,
                    "doc_count": 24238,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T10:00:00.000Z",
                    "key": 1625824800000,
                    "doc_count": 24701,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T12:00:00.000Z",
                    "key": 1625832000000,
                    "doc_count": 24207,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T14:00:00.000Z",
                    "key": 1625839200000,
                    "doc_count": 24442,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T16:00:00.000Z",
                    "key": 1625846400000,
                    "doc_count": 24713,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T18:00:00.000Z",
                    "key": 1625853600000,
                    "doc_count": 24679,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T20:00:00.000Z",
                    "key": 1625860800000,
                    "doc_count": 24108,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-09T22:00:00.000Z",
                    "key": 1625868000000,
                    "doc_count": 23995,
                    "max_user": {
                        "value": 5760.0
                    }
                },
                {
                    "key_as_string": "2021-07-10T00:00:00.000Z",
                    "key": 1625875200000,
                    "doc_count": 31,
                    "max_user": {
                        "value": 8.0
                    }
                }
            ]
        }
    }
}
```

### Java API

```java
 				//聚合（区分时间间隔，比如每两个小时一条记录）
        DateHistogramAggregationBuilder dateHistogramAggregationBuilder = AggregationBuilders
                .dateHistogram("max_user").field("userTotal")
                .dateHistogramInterval(DateHistogramInterval.hours(2));
     
        //聚合，对应字段取平均值
        AggregationBuilder avgBuilder = AggregationBuilders.sum(avgKey).field("userTotal");
				//连接聚合条件
        dateHistogramAggregationBuilder.subAggregation(avgBuilder);

        //执行查询
        SearchRequestBuilder searchRequestBuilder = esSearch.getSearchRequestBuilder();
        searchRequestBuilder.addAggregation(dateHistogramAggregationBuilder);

```



## 4. 分组-聚合

根据某个字段分组，然后再进行聚合操作。

### DSL查询语句

```java
{
    "size": 10,
    "query": {
        "bool": {
            "must": {
                "terms": {
                    "contentKey": [
                        "/baidu/request",
                        "/metrics"
                    ]
                }
            }
        }
    },
    "aggs": {
        "url_count": {
            "terms": {
                "field": "contentKey"
            },
            "aggs": {
                "5xxCount": {
                    "sum": {
                        "field": "code4xx"
                    }
                },
                "4xxCount": {
                    "sum": {
                        "field": "code5xx"
                    }
                }
            }
        }
    }
}
```

查询结果

![image-20211013171516395](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211013171622.png)

### Java API

查询条件代码如下：

```java
  /**
  * 封装查询条件
  */
	private SearchSourceBuilder fillSourceBuilder(String masterIp, String namespace, String from, String to, List<String> urlList) {
        // 过滤
        BoolQueryBuilder query = QueryBuilders.boolQuery();
        // 过滤指标
//        query.filter(QueryBuilders.termQuery("name", Constant.METRIC_PREFIX_NPM_AGG_ENTITY_REQUEST));
        query.filter(QueryBuilders.rangeQuery(TIMESTAMP).from(from).lt(to));
        query.filter(QueryBuilders.termQuery("labels.masterip", masterIp));
        query.filter(QueryBuilders.termQuery("labels.namespace", namespace));
        //url过滤
        query.filter(QueryBuilders.termsQuery(CONTENT_KEY, urlList));

        //指定字段聚合
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder().query(query).size(0);
        TermsAggregationBuilder termsAggregationBuilder = AggregationBuilders.terms(URL_COUNT).field("content_key");
        termsAggregationBuilder.subAggregation(AggregationBuilders.sum(AGG_4XX).field("values.statuscode_4xx_total"))
                .subAggregation(AggregationBuilders.sum(AGG_5XX).field("values.statuscode_5xx_total"));
        sourceBuilder.aggregation(termsAggregationBuilder);
        logger.debug("getNodeHealthCheckUrlListsourceBuilder:{}",sourceBuilder.toString());
        return sourceBuilder;
    }
```

处理返回结果代码如下：

```java

		try {
            SearchResponse response = ConnectEs.instance().doSearchAction(request);
            if (response != null) {
                Aggregations aggregations = response.getAggregations();
                Terms terms = aggregations.get(URL_COUNT);
                for (Terms.Bucket bucket : terms.getBuckets()) {
                    //4.封装es返回值
                    healthCheckUrlListBeanList.add(fillHealthCheckUrlListBean(bucket));
                }
            }
        } catch (Exception ex) {
            logger.warn("[getNodeHealthCheckUrlList] Occurred exp, msg:{}", ex.getMessage());
            ex.printStackTrace();
        }

		/**
		* 封装es返回值
		*/
    private HealthCheckUrlListBean fillHealthCheckUrlListBean(Terms.Bucket bucket) {
        Aggregations singleAggregations = bucket.getAggregations();
        Long code4xxCount = Convert.toLong(MathUtil.decimal(((Sum) singleAggregations.get(AGG_4XX)).getValue()), 0L);
        Long code5xxCount = Convert.toLong(MathUtil.decimal(((Sum) singleAggregations.get(AGG_5XX)).getValue()), 0L);
        HealthCheckUrlListBean healthCheckUrlListBean = new HealthCheckUrlListBean();
        healthCheckUrlListBean.setUrl(bucket.getKeyAsString());
        healthCheckUrlListBean.setCode4xxCount(code4xxCount);
        healthCheckUrlListBean.setCode5xxCount(code5xxCount);
        healthCheckUrlListBean.setTotalCount(NumberUtil.add(code4xxCount, code5xxCount).longValue());
        return healthCheckUrlListBean;
    }
```







## 参考链接

- [elastic按小时统计当天数据](https://blog.csdn.net/wsdtq123/article/details/78263207)
- [ES聚合&去重查询](https://www.jianshu.com/p/eb1e98693810)
- [ES基本的聚合查询](https://www.baidu.com/s?ie=UTF-8&wd=es%E7%9A%84%E8%81%9A%E5%90%88%E6%9F%A5%E8%AF%A2)
