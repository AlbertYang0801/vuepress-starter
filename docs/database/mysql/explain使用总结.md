# explain使用总结

## 参数

| id | Columns | JSON Name | Meaning |
| --- | --- | --- | --- |
| 1 | id | select_id | 每个select子句的标识id |
| 2 | select_type | None | select语句的类型 |
| 3 | table | table_name | 当前表名 |
| 4 | partitions | partitions | 匹配的分区 |
| 5 | type | access_type | 当前表内访问方式 join type |
| 6 | possible_keys | possible_keys | 可能使用到的索引 |
| 7 | key | key | 经过优化器评估最终使用的索引 |
| 8 | key_len | key_length | 使用到的索引长度 |
| 9 | ref | ref | 引用到的上一个表的列 |
| 10 | rows | rows | rows_examined，要得到最终记录索要扫描经过的记录数 |
| 11 | filtered | filtered | 按表条件过滤行的百分比 |
| 12 | Extra | None | 额外的信息说明 |

### select_type

| id | select_type value | JSON name | Meaning |
| --- | --- | --- | --- |
| 1 | SIMPLE | None | 简单的SELECT语句（不包括UNION操作或子查询操作） |
| 2 | PRIMARY | None | PRIMARY：查询中最外层的SELECT（如两表做UNION或者存在子查询的外层的表操作为PRIMARY，内层的操作为UNION） |
| 3 | UNION | None | UNION：UNION操作中，查询中处于内层的SELECT（内层的SELECT语句与外层的SELECT语句没有依赖关系） |
| 4 | DEPENDENT UNION | dependent(true) | DEPENDENT UNION：UNION操作中，查询中处于内层的SELECT（内层的SELECT语句与外层的SELECT语句有依赖关系） |
| 5 | UNIOIN RESULT | union_result | UNION RESULT：UNION操作的结果，id值通常为NULL |
| 6 | SUBQUERY | None | SUBQUERY：子查询中首个SELECT（如果有多个子查询存在） |
| 7 | DEPENDENT SUBQUERY | dependent(true) | DEPENDENT SUBQUERY：子查询中首个SELECT，但依赖于外层的表（如果有多个子查询存在） |
| 8 | DERIVED | None | DERIVED：被驱动的SELECT子查询（子查询位于FROM子句） |
| 9 | MATERIALIZED | materialized_form_subquery | MATERIALIZED：被物化的子查询 |
| 10 | UNCACHEABLE SUBQUERY | cacheable(false) | UNCACHEABLE SUBQUERY：对于外层的主表，子查询不可被物化，每次都需要计算（耗时操作） |
| 11 | UNCACHEABLE UNION | cacheable(false) | UNCACHEABLE UNION：UNION操作中，内层的不可被物化的子查询（类似于UNCACHEABLE SUBQUERY） |

### type

| id | type value | Meaning |
| --- | --- | --- |
| 1 | system | 表中只有一行 |
| 2 | const | 单表中最多有一个匹配行，primary key 或者 unique index的检索 |
| 3 | eq_ref | 多表连接中被驱动表的连接列上有primary key或者unique index的检索 |
| 4 | ref | 与eq_ref类似，但不是使用primary key或者unique index，而是普通索引。也可以是单表上non-unique索引检索 |
| 5 | fulltext | 使用FULLTEXT索引执行连接 |
| 6 | ref_or_null | 与ref类似，区别在于条件中包含对NULL的查询 |
| 7 | index_merge | 索引合并优化，利用一个表里的N个索引查询,key_len表示这些索引键的和最长长度。 |
| 8 | unique_subquery | in的后面是一个查询primary key |
| 9 | index_subquery | in的后面是一个查询普通index字段的子查询 |
| 10 | range | 单表索引中的范围查询,使用索引查询出单个表中的一些行数据。ref列会变为null |
| 11 | index | 等于ALL。它有两种情况：(1)覆盖索引 (2)用索引的顺序做一个全表扫描。 |
| 12 | all | 全表扫描 |

### extra

| id | type value | Meaning |
| --- | --- | --- |
| 1 | const row not found | 所要查询的表为空 |
| 2 | Distinct | mysql正在查询distinct值，因此当它每查到一个distinct值之后就会停止当前组的搜索，去查询下一个值 |
| 3 | Impossible WHERE | where条件总为false，表里没有满足条件的记录 |
| 4 | Impossible WHERE noticed after reading const tables | 在优化器评估了const表之后，发现where条件均不满足 |
| 5 | no matching row in const table | 当前join的表为const表，不能匹配 |
| 6 | Not exists | 优化器发现内表记录不可能满足where条件 |
| 7 | Select tables optimized away | 在没有group by子句时，对于MyISAM的select count(*)操作，或者当对于min(),max()的操作可以利用索引优化，优化器发现只会返回一行。 |
| 8 | Using filesort | 使用filesort来进行order by操作 |
| 9 | Using index | 覆盖索引 |
| 10 | Using index for group-by | 对于group by列或者distinct列，可以利用索引检索出数据，而不需要去表里查数据、分组、排序、去重等等 |
| 11 | Using join buffer | 之前的表连接在nested loop之后放进join buffer，再来和本表进行join。适用于本表的访问type为range，index或all |
| 12 | Using sort_union,using union,using intersect | index_merge的三种情况 |
| 13 | Using temporary | 使用了临时表来存储中间结果集，适用于group by，distinct，或order by列为不同表的列。 |
| 14 | Using where | 在存储引擎层检索出记录后，在server利用where条件进行过滤，并返回给客户端 |

## 案例

### 结合排序选择索引

```sql
select * from t where (a between 1 and 1000)  and (b between 50000 and 100000) order by b limit 1;
```

![](https://s2.loli.net/2025/06/16/ZewYd14QguDjvtx.png)

mysql在选择索引的时候会判断查询代价。

- 扫描行数
- 排序

b（50000）虽然比 a（1000） 扫描范围广，但是排序是按照 b 来排的。选择 b 虽然扫描行数过多，但是不用排序，代价更小。

所以 mysql 选择 b 索引进行查询。从结果看过滤了10w条。

```sql
explain select * from t2 where (a between 1 and 1000)  and (b between 50000 and 100000) order by b,a limit 1;
```

如果排序字段加上 a，mysql 就会选择使用 a 索引。从结果看只过滤了1000条。

![](https://s2.loli.net/2025/06/16/5HMIQwC3BRYiJSD.png)

### in查询走索引

```sql
explain select * from t2 where b in (123122,512312,25125)
```

![](https://s2.loli.net/2025/06/16/yPlsiXN9f6mbnEk.png)

查索引，找到row，然后回表。所以扫描行数为3行。

### like

### 不走索引

```sql
explain select * from t2 where name like '%100'
```

不符合最做匹配原则，不走索引。

![](https://s2.loli.net/2025/06/16/56PTDdoZFXOqY8C.png)

### 走索引

```sql
explain select * from t2 where name like '1001203%'
```

![](https://s2.loli.net/2025/06/16/fILKDYGsEmCyuHw.png)

## 参考链接

[mysql explain 详解](https://weikeqin.com/2020/02/05/mysql-explain/)