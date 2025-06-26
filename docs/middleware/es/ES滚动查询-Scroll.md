# ES滚动查询-Scroll

## 原理

Elasticsearch中的滚动查询是基于 **固定的排序规则** 来加载一部分数据。

当用户刷新时，将从上次加载的最后一条数据的位置再加载同样数量的数据。

滚动查询的原理类似于分页查询，但是滚动查询不需要重新执行搜索，只需要继续检索下一批结果。在滚动查询中，每次只加载当前页的数据，而不是一次性加载所有数据。这使得滚动查询比分页查询更高效，因为滚动查询不需要将所有数据都存储在内存中。同时，滚动查询也适用于大量数据的处理，因为它可以分批次地处理数据，而不是一次性处理所有数据。

### 滚动查询的排序规则

**滚动查询的排序规则不一定是时间**。在Elasticsearch中，滚动查询是使用”scroll” API来执行的操作，它的排序规则取决于你在搜索请求中指定的排序方式。

例如，你可以根据文档的特定字段进行排序，如按照日期字段排序，或者按照相关性得分排序。如果你没有指定排序方式，Elasticsearch将按照相关性得分进行排序。

固定排序规则意味着每次滚动查询都按照相同的规则返回数据。如果数据的排序发生改变，那么之前保存的滚动ID将无法使用。

因此，如果你需要根据时间进行滚动查询，你需要确保时间字段在搜索请求中作为排序的一部分，这样滚动查询的结果才能按照时间进行排序。

**通过使用ScrollId机制，用户可以继续从上一次停止的位置开始检索，而不是重新从头开始检索。**

### ScrollId清除

**是的**，scrollId需要手动清除。scrollId是Elasticsearch中用于滚动查询的标识符，它会在每次滚动查询时生成，并返回给客户端。在完成滚动查询后，需要手动清除scrollId，以释放Elasticsearch资源并避免文件描述符被占用。可以通过使用`ClearScrollRequest`来手动清除scrollId。

```java
            List<String> scrollList = Arrays.asList(scrollIds);
            ClearScrollRequest clearScrollRequest = new ClearScrollRequest();
            clearScrollRequest.setScrollIds(scrollList);
            ClearScrollResponse clearScrollResponse = null;
            try {
                clearScrollResponse = ConnectEs.instance().getRestHighLevelClient().clearScroll(clearScrollRequest, RequestOptions.DEFAULT);
            } catch (IOException e) {
                log.warn("clearScroll exp ->", e);
            }
```

## 使用示例

当使用滚动查询时，通常需要将滚动ID传递给滚动API以检索下一批结果。以下是一个示例：

假设我们有一个名为”my_index”的索引，并且我们想要检索其中包含单词”elasticsearch”的所有文档。我们可以通过以下步骤执行滚动查询：

1. 发送初始搜索请求，并指定滚动查询参数：

```

    POST /my_index/_search?scroll=1m

    {

      "query": {

        "match": {

          "content": "elasticsearch"

        }

      }

    }
```

该请求将返回一个滚动ID，我们将需要传递该ID以检索下一批结果。

1. 发送滚动API请求以检索下一批结果：

```

	POST /my_index/_search?scroll=1m  

	{  

	  "query": {  

	    "match": {  

	      "content": "elasticsearch"  

	    }  

	  }  

	}
```

其中，`scroll_id` 是从初始搜索请求中获得的滚动ID。该请求将返回下一批结果。

1. 重复执行步骤2，直到所有结果都被检索到或达到停止条件。
    
    需要注意的是，滚动查询不适合用于实时数据，因为滚动查询会保持搜索上下文，可能会返回旧数据。此外，滚动查询会消耗大量的内存和CPU资源，不建议在生产环境中频繁使用。