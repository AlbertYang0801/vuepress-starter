# ClickHouse基础

## 列式存储

clickhouse 是 *列式存储* 数据库

在磁盘上按列存储，即按某个字段进行存储。

![Untitled.png](https://s2.loli.net/2025/06/24/vyUe6nuWbLgqfQc.png)

所以列式存储更适合进行查询，比如某一行的聚合、计算、求和等。

### 列式存储的好处

1. 对于某列的聚合、计数、求和等操作要比行式存储更快。
   
    **查询更快**。
    
    - 行式存储，增改删更加方便，因为只需要找到对应的行记录，直接删除即可。但是列式存储对比起来，增改删要更繁琐一点。
2. 每一列的数据类型是一样的，这样能更好的进行数据压缩。
   
    **方便数据压缩，节省磁盘**
    
    - 与 es 相比，作为常见的大数据存储数据库。es 的数据压缩性能不强，通常需要占据很大的磁盘空间。而 ck 的压缩性能要好，比 es 占磁盘要小很多。

## OLAP 和 OLTP的区别

### OLAP

- OLAP 是 `On-Line Analytical Processing` 联机分析处理，Clickhouse就是典型的 OLAP 联机分析型数据库管理系统(DBMS)。
- OLAP主要针对数据进行复杂分析汇总操作，比如云监控平台需要将采集到的流量数据存入到数据库中，极少对数据进行增删改操作，这就是一个典型的 OLAP 场景。

### OLTP

- OLTP 是 `On-Line Transaction Processing` 联机事务处理。
- 在 OLTP 场景中用户并发操作量会很大，要求系统实时进行数据操作的响应，需要支持事务，Mysql、Oracle、SQLServer 等都是 OLTP 型数据库。

### 数据分区和线程级并行

ClickHouse 将数据划分为多个 partition，每个 partition 再进一步划分为多个 index
granularity(索引粒度)，然后通过多个 CPU核心分别处理其中的一部分来实现并行数据处理。

单条查询场景下：

`单条 Query 就能利用整机的 CPU 来进行查询`

查询大数据场景下能够高效并行处理。

但是在高并发情况下，这种优势就不明显了。所以在高 QPS的情况下，CK 的效率反而不如 ES。

- ClickHouse 的缺陷就在高 QPS情况下不支持，而且查询会很吃 CPU，CPU 是 CK 的一个瓶颈。

## 数据类型

[Map(key, value) | ClickHouse Docs](https://clickhouse.com/docs/zh/sql-reference/data-types/map)

### 时间类型

目前 ClickHouse 有三种时间类型：

- Date
  
    接受年-月-日的字符串比如 ‘2019-12-16’
    
- DateTime
  
    接受年-月-日 时:分:秒的字符串比如 ‘2019-12-16 20:50:10’
    
- DateTime64
  
    接受年-月-日 时:分:秒.亚秒的字符串比如 ‘2019-12-16 20:50:10.66’
    

### map类型

- 建表语句
  
    ```sql
    CREATE TABLE table_map (a Map(String, UInt64)) ENGINE=Memory;
    INSERT INTO table_map VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
    ```
    
- 查询语句
  
    ```sql
      select sum(duration_ns_count) as requestCount,
            max(ts) as maxTimestamp,
            sum(duration_ns_buckets[3000000000]) as bucket3s,
            sum(duration_ns_buckets[5000000000]) as bucket5s,
            sum(duration_ns_buckets[10000000000]) as bucket10s,
            sum(duration_ns_buckets[20000000000]) as bucket20s,
            wkd_key,protocol,content_key
            FROM entity_detail WHERE ts BETWEEN #{from} AND #{to}
            AND wkd_key IN
            <foreach collection="workloadKeys" item="workloadKey" open="(" separator="," close=")">
                #{workloadKey}
            </foreach>
            group by wkd_key,protocol,content_key
    ```
    
- 映射字段
  
    ```java
        @TableField(value = "sumMap(duration_ns_buckets)", typeHandler = FastjsonTypeHandler.class, insertStrategy = FieldStrategy.NEVER, updateStrategy = FieldStrategy.NEVER)
        private Map<BigInteger,BigInteger> bucketSum;
    ```