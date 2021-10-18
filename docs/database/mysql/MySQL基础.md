

## 查询总结

### 比较运算

| 操作符                    | 含义               | 备注        |
| ------------------------- | ------------------ | ----------- |
| =                         | 等于               | 不是 ==     |
| >                         | 大于               |             |
| >=                        | 大于等于           |             |
| <                         | 小于               |             |
| <=                        | 小于等于           |             |
| <>                        | 不等于             | 也可以是 != |
| BETWEEN [START] AND [END] | 在两个值之间       | 包含边界    |
| IN (V1,V2,V3)             | 是否存在于值列表中 |             |
| LIKE                      | 模糊查询           |             |
| IS (NOT) NULL             | 判断空值           |             |



- BETWEEN-AND

  `BETWEEN [START] AND [END]` 范围查询，包含条件的边界值，类似于 `END <= value <=START `。

  ```sql
  select * from order_info
  where amount_money BETWEEN 23.60 and 100
  
  24	《繁华2》	23.60	4	爱读书的人	2021-07-03 16:29:00	2
  25	《繁华2》	23.60	1	爱读书的人	2021-10-14 19:46:26	2
  28	限时发送的订单	100.00	4	yjw	2021-07-14 16:20:01	1
  ```

  



### 模糊查询

使用 LIKE 关键字进行模糊查询。

- `%` 代表任意个字符。
- `_` 代表一个字符。

*`%` 和 `_` 可以同时使用。*

```sql
select order_name from order_info
where order_name like '%2'
//NULL

select order_name from order_info
where order_name like '%2%'
//《繁华2》

select order_name from order_info
where order_name like '%2_'

//《繁华2》
```







### 去重查询

**在查询列前添加关键字 `DISTINCT`,可实现对查询结果的去重复。**

测试表内容如下：

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014192757.png" alt="image-20211014192757892" style="zoom:50%;" />

- 单列去重

  ```sql
select DISTINCT order_name from order_info
  ```
  
  

  <img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014192844.png" alt="image-20211014192844791" style="zoom:50%;" />

  

- 多列去重

  对多列也可以实现去重。

  ```sql
  select DISTINCT order_name,order_status from order_info
  ```

  

  <img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014192908.png" alt="image-20211014192908539" style="zoom:50%;" />

---

### 聚合查询

MySQL 中有聚合函数，用来对**某一列**进行计算，常用函数列表如下。

*聚合函数默认情况下会忽略值为 null 的行，不参与计算。*

| 函数                                                         | 作用         | 备注                                                     |
| ------------------------------------------------------------ | ------------ | -------------------------------------------------------- |
| [AVG([distinct\] expr)](https://www.cnblogs.com/geaozhang/p/6745147.html#sum-avg) | 求平均值     | 适用于数值型字段                                         |
| [COUNT({*\|[distinct\] } expr)](https://www.cnblogs.com/geaozhang/p/6745147.html#count) | 统计行的数量 | `count(*)`统计数据行数；`count(列名)`统计列值非空的数量; |
| [MAX([distinct\] expr)](https://www.cnblogs.com/geaozhang/p/6745147.html#max-min) | 求最大值     | 适用于任意数据类型字段                                   |
| [MIN([distinct\] expr)](https://www.cnblogs.com/geaozhang/p/6745147.html#max-min) | 求最小值     | 适用于任意数据类型字段                                   |
| [SUM([distinct\] expr)](https://www.cnblogs.com/geaozhang/p/6745147.html#sum-avg) | 求累加和     | 适用于数值型字段                                         |

**注意**

1. 聚合函数不允许嵌套。
2. 聚合函数的参数可以是**某一列**或者**函数表达式**。
3. 一个 SELECT 子句可以有多个聚合函数。
4. WHERE 子句不能使用组函数，而 Having 可以使用组函数。

**SQL练习**

测试表内容如下：

![image-20211014193715527](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014193715.png)

```java
select count(amount_money) from order_infowhere amount_money<100
//3
select max(amount_money) from order_info
//100
select count(DISTINCT amount_money) from order_info
//2
select avg(DISTINCT amount_money) from order_info
//61.800000
------
//函数表达式
select avg(TO_DAYS(create_time)) from order_info
//738355.8333
```

---

### 分组查询

**分组查询格式**

```sql
select [聚合函数] 字段名 from 表名 [where 查询条件] [group by 字段名] [having 过滤条件]
```

GROUP BY 语句根据一个或多个列对结果集进行分组，在分组的列上我们可以使用 COUNT, SUM, AVG 等聚合函数。

Having 是用来对**查询结果过滤**的，使用的**过滤条件须为查询结果包含的字段**，在Having 中可以使用聚合函数。

*包含 GROUP BY 的查询语句，SELECT 后的字段若未包含在 GROUP BY 后作为分组的条件，就要使用聚合函数进行聚合，否则会报错。（若某个字段没有作为分组条件，有可能会产生多条记录，若再不使用聚合函数将多条记录聚合为一条记录，则与分组会发生冲突）*

**SQL练习**

测试表内容如下：

![image-20211014193715527](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014200314.png)

- 分组查询

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  //《繁华2》	2
  //限时发送的订单	8
  ```

- 分组查询 - 带 having

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  HAVING count > 2
  //限时发送的订单	8
  ```

- 分组查询 - having 使用聚合函数

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  HAVING count(order_name)>6
  //限时发送的订单	8

---

### 排序查询

ORDER BY 可以对查询结果排序，位于 SELECT 查询语句的结尾。

其中 **DESC 是倒序排列**，**ASC 是正序排列**。

- 正序排列 - asc

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  order by count asc
  //《繁华2》	2
  //限时发送的订单	8
  ```

- 倒序排列 - desc

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  order by order_name desc
  //限时发送的订单	8
  //《繁华2》	2
  ```

- 分组合并排列

  ```sql
  select order_name,count(amount_money) as count from order_info group by order_name
  desc
  //限时发送的订单	8
  //《繁华2》	2
  ```

### 合并查询

MySQL 中合并查询有 UNION 和 UNION ALL 两种。

1. UNION 用于把多个 SELECT 的查询结果集合并成一个。

   - 进行合并的 SELECT 列表必须在**字段数量和数据结构上保持一致**。

   - **最终结果集的列名来自第一个 SELECT 语句**。

   - **默认会去对结果行去重复**。

   ---

   ```sql
   select order_name as name,amount_money from order_info where amount_money>50 
   UNION
   select order_name,amount_money as money from order_info where amount_money<50 
   
   限时发送的订单	100.00
   《繁华2》	23.60
   ```

2. **UNION ALL 不会去重复。**

   相同的SQL，使用 UNION ALL 之后，查询结果不会去重。

   ```sql
   select order_name as name,amount_money from order_info where amount_money>50 
   UNION ALL
   select order_name,amount_money as money from order_info where amount_money<50 
   
   限时发送的订单	100.00
   限时发送的订单	100.00
   限时发送的订单	100.00
   《繁华2》	23.60
   《繁华2》	23.60
   ```


---

### 子查询

#### where 型子查询

把内层的查询结果当作外部查询的比较条件。

1. 使用倒序加分页实现只查询 Id 最大的一条记录。

   ```sql
   select * from order_info ORDER BY id limit 1;
   ```

2. 使用 where 子查询查询 id 最大的一条记录。

   ```sql
   select * from order_info 
   where id = (select max(id) from order_info) ;
   ```

3. 使用 where 子查询查询每个种类下 Id 最大的一条记录。

   ```sql
   select * from order_info 
   where id in (select MAX(id)  from order_info group by id   )
   ```

   例子练习：

   **先查出表里的最大时间，再根据最大时间查询数据。需要将最大时间作为一个条件。**

   ```sql
   select monitor_id as monitorId,monitor_name as monitorName,host,loss,avg,mtr_time,status
   from web_jkb_mtr_detail
   where mtr_time in (
   	select maxtime from ( select Max(mtr_time) as maxtime from web_jkb_mtr_detail where monitor_id = 11 ) one
   )  and monitor_id = 11 and status = 1
   ORDER BY avg DESC
   ```


#### from 型子查询

from 型子查询把内层的查询结果作为一个临时表，供外层的 SQL 查询，临时表要起一个别名。

1. 查询 id 最大的记录。

   ```sql
   select id,order_name from 
   (select max(id) as id,order_name from order_info group by id)  as tmp
   ```



### 多表查询

#### 笛卡尔集

在多表查询的情况下，出现下列情况时，就有可能会产生笛卡尔集。

- 省略连接条件
- 连接条件无效
- 所有表中的所有行互相连接

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018121316.png" alt="image-20211018121316852" style="zoom:33%;" />

在 SQL 中的体现如下图：

![bubuko.com,布布扣](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018121506.jpg)

---

#### 等值连接

查询多表时，可以在 WHERE 子句中添加连接条件（注意区分多表中的相同列）。

```sql
select order_info.id,order_info.amount_money,order_info.order_name,tenant_info.id,tenant_info.tenant_name
from order_info,tenant_info
where order_info.id = tenant_info.id
//24	23.60	《繁华2》	24	test
```



#### 内连接

内连接查询结果返回的是两个表中都满足链接条件的记录。

```sql
select order_info.id,order_info.amount_money,order_info.order_name,tenant_info.id,tenant_info.tenant_name
from order_info
inner join tenant_info
on order_info.id = tenant_info.id

24	23.60	《繁华2》	24	test
```



#### 左连接

左连接会将链接的左边数据全部返回，而右表只返回满足链接的有效数据，其余返回 NULL。

```sql
select order_info.id,order_info.amount_money,order_info.order_name,tenant_info.id,tenant_info.tenant_name
from order_info
left join tenant_info
on order_info.id = tenant_info.id


24	23.60	《繁华2》	24	 test
25	23.60	《繁华2》	NULL NULL
26		《繁华2》		
27		限时发送的订单		
28	100.00	限时发送的订单		
```



#### 右连接

右连接会将链接的右表数据全部返回，而左表只返回满足链接的有效数据，其余返回 NULL。

```sql
select order_info.id,order_info.amount_money,order_info.order_name,tenant_info.id,tenant_info.tenant_name
from order_info
right join tenant_info
on order_info.id = tenant_info.id

NULL	2			NULL	NULL	NULL
NULL	3			NULL	NULL	NULL
24	23.60	《繁华2》	24		test
```





---

## 常用函数

### 连接函数- concat

- `concat(str1,str2,...)` 函数可以将多列连接在一起，生成新的字符串。

  ```sql
  select concat(order_name,'-',amount_money) as name from order_info
  //《繁华2》-23.60
  //《繁华2》-23.60
  // NULL
  // NULL
  // 限时发送的订单-100.00
  // 限时发送的订单-100.00
  ```

  *注意 concat 函数在连接字符的时候，只要其中有某一个字段为 NULL，那么则整个返回 NULL。*

- `concat_ws(separator, str1, str2, ...) ` 函数也可以将多列连接在一起，第一个参数 separator 是**其它参数之间的分隔符**。

  ```sql
  select concat_ws('-',order_name,amount_money,order_name) from order_info
  //《繁华2》-23.60-《繁华2》
  //《繁华2》-23.60-《繁华2》
  //《繁华2》-《繁华2》
  // 限时发送的订单-限时发送的订单
  // 限时发送的订单-100.00-限时发送的订单
  ```

  *即使某一个字段为 NULL，该函数会继续拼接。*

---

### 分组聚合函数 - group_concat

`group_concat(expr)` 该函数主要是与 GROUP BY 搭配使用，对分组后每一组内的某个字段以逗号进行拼接。

```sql
select GROUP_CONCAT(amount_money) from order_info GROUP BY order_name
//23.60,23.60
//100.00,100.00,100.00,100.00,100.00,100.00,100.00,100.00
```

也可以不使用 GROUP BY ，对某一列符合条件的进行拼接。

```sql
select GROUP_CONCAT(amount_money) from order_info 
//23.60,23.60,100.00,100.00,100.00,100.00,100.00,100.00,100.00,100.00
```

---

### 时间戳格式化函数 - date-format              

**mysql数据库存放的是时间戳，取出的时候希望将时间戳转换为指定格式的时间字符串；**

```sql
//时间戳单位为s
select 
DATE_FORMAT(FROM_UNIXTIME(`timestamp`),'%Y-%m-%d %H:%i:%s') as hour
from monitor_jky_bandwidth 

//时间戳单位为ms
select DATE_FORMAT(FROM_UNIXTIME(1598341522000 div 1000),'%H')
//结果：15


注意：
div为整除，只会取商的整数部分，不会四舍五入。
```



- 数据库存放的数据格式 （时间戳格式）

​    ![image](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018101918.png)

- 转换的时间格式

![image](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018101923.png)

## 基础运算总结

### 除法 div 和 / 的区别

- div 为整除，该运算符只取商的整数部分，而不会四舍五入。
- / 运算符为实数除，运算结果为浮点型。

```sql
select 19820523 / 1000
//19820.5230

select 19820523 div 1000
//19820
```



## 常见问题

### having 和 where 的区别？

having 和 where 都是用来过滤筛选数据的。

1. where 是在查询结果返回之前，对结果进行筛选，**发生在分组 group by 之前**。

   having 是在查询结果出来之后，对结果进行过滤，**发生在 group by 之后**。

2. where 子句不能使用组函数，而 having 子句可以使用组函数。



### SELECT 语句执行顺序

![临时文件 (19)](/Users/yangjunwei/Downloads/临时文件 (19).png)



