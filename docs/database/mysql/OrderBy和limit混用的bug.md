# OrderBy和limit混用的bug

[](https://blog.csdn.net/2401_84049200/article/details/138003184)

## 案例

```java
select * from table order by month desc limit 0,10
```

month 重复度高的情况下，limt查询会出bug。导致部分数据丢失。可以增加区分度高的字段一起排序，比如id。

```java
select * from table order by month desc,id desc limit 0,10
```