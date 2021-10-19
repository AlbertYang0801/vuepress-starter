# MySQL基础

## 一、查询总结

**测试数据**

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211014192757.png" alt="image-20211014192757892" style="zoom:50%;" />

### 基础运算总结

#### 除法 div 和 / 的区别

- div 为整除，该运算符只取商的整数部分，而不会四舍五入。
- / 运算符为实数除，运算结果为浮点型。

```sql
select 19820523 / 1000
//19820.5230

select 19820523 div 1000
//19820
```



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
| AVG([distinct\] expr) | 求平均值     | 适用于数值型字段                                         |
| COUNT({*\|[distinct\] } expr) | 统计行的数量 | `count(*)`统计数据行数；`count(列名)`统计列值非空的数量; |
| MAX([distinct\] expr) | 求最大值     | 适用于任意数据类型字段                                   |
| MIN([distinct\] expr) | 求最小值     | 适用于任意数据类型字段                                   |
| SUM([distinct\] expr) | 求累加和     | 适用于数值型字段                                         |

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
select [聚合函数](字段名),字段名 from 表名 [where 查询条件] [group by 字段名] [having 过滤条件]
```

GROUP BY 语句根据一个或多个列对结果集进行分组，在分组的列上我们可以使用 COUNT, SUM, AVG 等聚合函数。

Having 是用来对**查询结果过滤**的，使用的**过滤条件须为查询结果包含的字段**，在Having 中可以使用聚合函数。

包含 GROUP BY 的分组查询语句，SELECT 后查询出来的字段，要么包含在聚合函数里，要么作为分组的依据包含在 GROUP BY 后面。（若某个字段没有作为分组条件，有可能会产生多条记录，若再不使用聚合函数将多条记录聚合为一条记录，则与分组会发生冲突）

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

ORDER BY 可以对查询结果排序，位于 SELECT 查询语句的结尾（若有 limit 语句，则limit 语句在最终结尾处）。

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



### 分页查询

通过 LIMIT 关键字可以对查询结果进行分页，返回分页后的数据。

> 分页查询公式：LIMIT （当前页数-1）* 每页条数，每页条数

```sql
SELECT * FROM TABLE LIMIT (PageNo - 1)*PageSize,PageSize ；
```

*注意：LIMIT 语句必须在 SELECT 语句的结尾。*


---

- 前 10 条记录

  ```sql
  select * from table limit 0,10
  ```

- 第 11 至 20 条记录

  ```sql
  select * from table limit 10,10
  ```

- 第 20 至 30 条记录

  ```sql
  select * from table limit 20,10
  ```

**LIMIT n, m 的效率是十分低的，一般可以通过在 WHERE 条件中指定范围来优化。 WHERE id > ? limit 10；**

---

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

## 二、常用函数

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

---

## 三、约束

### 什么是约束？

- 为了保证数据一致性和完整性，通过约束的方式来限制数据表。
- 约束是对数据表的强制规定。
- 可以在创建数据表时添加约束，也可以在数据表创建之后添加约束（通过 ALTER TABLE 语句）。

### 约束的种类

- 唯一约束 - UNIQUE
- 主键约束 - PRIMARY KEY
- 外键约束 - FOREIGN KEY
- 非空约束 - NOT NULL

**约束的范围**

1. 根据约束数据列的限制，可以分为单列约束和多列约束。

   - 单列约束

     每个约束只约束一列，例如指定单列的唯一约束。

   - 多列约束

     每个约束可约束多列数据。

2. 根据约束的作用范围，可以分为列级约束和表级约束。

   - 列级约束

     只能作用在一个列上，跟在某列定义的后面。

   - 表级约束

     可以作用在多个列上，不与列一起定义，而是单独定义。

---

### 唯一约束 - UNIQUE

唯一约束用来限制数据表的某些字段值不能重复，创建唯一约束时可以指定单列，也可以指定多列。同一个表也可以设置多个唯一约束。

*创建唯一性约束，会自动创建一个同名的唯一索引，这个索引不能够单独删除，删除唯一约束会自动删除该索引*。**唯一约束是通过唯一索引来实现数据的唯一**。

*唯一约束不允许出现相同的值，但是允许出现多个 NULL 值。*

#### 新增和取消唯一约束

1. 新增唯一约束

   - 建表时设置

     建表语句某字段添加 UNIQUE 标识。

     ```sql
     CREATE TABLE `student` (
       `id` int(11) NOT NULL,
       `username` varchar(255) DEFAULT NULL,
       `stu_num` varchar(255) DEFAULT NULL UNIQUE,
       `classroom` int(11) DEFAULT NULL,
       PRIMARY KEY (`id`),
       KEY `student-class` (`classroom`),
       CONSTRAINT `student-class` FOREIGN KEY (`classroom`) REFERENCES `class` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
     ```

   - 为某列单独设置

     ```sql
     ALTER TABLE student add unique(stu_num,classroom)
     ```

2. 取消唯一约束

   ```sql
   ALTER TABLE student drop index stu_num
   ```

---

![image-20211019145016090](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213555.png)

*为数据表添加了唯一约束之后，新增内容重复则会提示异常。*

![image-20211019144159146](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213548.png)

---

### 主键约束 - PRIMARY

主键约束相当于**唯一约束+非空约束**的组合，主键约束列**不允许重复，也不允许出现空值**。同样主键约束允许设置多列，这些列都不允许为空值，并且组合的值不允许重复。

**每个表最多只允许设置一个主键。**

MySQL 主键名总是 PRIMARY，当创建主键约束时系统默认会在 **所在列或列组合上建立对应的唯一索引**。

![image-20211019152710954](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213541.png)

---

### 外键约束

外键约束用来保证表之间的参照完整性，主要存在于主表和从表之间，同一个表可以有多个外键约束。

**外键约束的作用**

1. 从表的外键值必须在**主表中能找到或者为空**。
2. 当主表数据被从表参照时，主表数据不允许被删除。需要先删除从表关联的数据，然后才可以删除主表数据。
3. 从表参考主表的字段，在主表中要具有唯一性（主键或者唯一约束键盘的列）。
4. 如果表的一个字段，要作为另一个表的外键，这个字段必须有唯一约束（或是这个字段干脆就是主键），如果只是有唯一索引，就会报错。

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018172218.png" alt="image-20211018172218915" style="zoom:50%;" />

#### 如何添加外键

依次打开 Navicat - 设计表 - 外键。设置从表字段和父表字段，还要设置删除时和更新时的处理策略。

![image-20211018173948241](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018173948.png)

#### 删除和更新的处理策略

1. CASCADE：级联，当父表更新、删除，子表会同步更新和删除。
2. NO ACTION：没有行动。
3. RESTRICT：父表在删除和更新记录的时候，要在子表中检查是否有有关该父表要更新和删除的记录，如果有，则不允许删除和更改。
4. SET NULL：置空，当父表更新、删除的时候，字表会把外键字段变为 NULL ，所以这个时候设计表的时候该字段要允许为 NULL，否则会出错。

---

**测试外键约束不同的设置方式**

准备测试数据。

- 主表

  ```sql
  CREATE TABLE `class` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `classname` varchar(255) DEFAULT NULL,
    `classnum` int(4) DEFAULT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
  
  -- ----------------------------
  -- Records of class
  -- ----------------------------
  BEGIN;
  INSERT INTO `class` VALUES (1, '一年级', 3);
  INSERT INTO `class` VALUES (2, '一年级', 2);
  INSERT INTO `class` VALUES (3, '二年级', 1);
  COMMIT;
  
  SET FOREIGN_KEY_CHECKS = 1;
  ```

  <img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018174457.png" alt="image-20211018174457850" style="zoom: 50%;" />

- 从表

  ```sql
  CREATE TABLE `student` (
    `id` int(11) NOT NULL,
    `username` varchar(255) DEFAULT NULL,
    `age` varchar(255) DEFAULT NULL,
    `classroom` int(11) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `student-class` (`classroom`),
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  
  -- ----------------------------
  -- Records of student
  -- ----------------------------
  BEGIN;
  INSERT INTO `student` VALUES (1, '小明', '11', 3);
  ```

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018174435.png" alt="image-20211018174435218" style="zoom:50%;" />

---
1. CASCADE 测试

   - 设置外键，将删除时和更新时的处理方式都设置为 CASCADE。

     ```sql
       CONSTRAINT `student-class` FOREIGN KEY (`classroom`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
     ```

     ![image-20211019093858371](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213526.png)

   - 更新数据

     ![image-20211019094138544](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213503.png)

   - 结论。

     设置为 CASCADE 时，**当父表更新、删除，子表会同步更新和删除**。
---
2. NO ACTION 测试

   - 设置外键，将删除时和更新时的处理方式都设置为 NO ACTION。

     ```sql
       CONSTRAINT `student-class` FOREIGN KEY (`classroom`) REFERENCES `class` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
     ```

     ![image-20211018174313240](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018174313.png)

   - 删除数据![image-20211018174258331](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211018174258.png)

   - 结论

     设置为 NO ACTION 时，**删除和更新主表数据时会抛出异常**。
     

---
3. RESTRICT 测试

   - 设置外键，将删除时和更新时的处理方式都设置为 RESTRICT。

     ![image-20211018173853091](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213418.png)

   - 删除数据

     ![image-20211019093358107](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213415.png)

   - 结论

     设置为 RESTRICT 时，**删除和更新主表数据时会抛出异常**。

---
4. SET NULL 测试

   - 设置外键，将删除时和更新时的处理方式都设置为 SET NULL。

     ```sql
       CONSTRAINT `student-class` FOREIGN KEY (`classroom`) REFERENCES `class` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
     ```

     ![image-20211019094629416](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213433.png)

   - 删除数据

     ![image-20211019094602089](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213428.png)

   - 结论

     设置为 SET NULL 时，**删除和更新主表数据时会将从表的外键字段设置为 NULL**。

---

### 非空约束

非空约束用来确保当前列的值不能为空值，只出现在对数据表的列上。

- 所有的类型都可以是 NULL，包括 int 、float 等数据类型。
- 空字符串 "" 不等于 NULL，0 也不等于 NULL。

#### 新增和取消非空约束

1. 新增非空约束

   - 创建表时

     ```sql
     CREATE TABLE `class` (
       `id` int(11) NOT NULL AUTO_INCREMENT,
       `classname` varchar(255) DEFAULT NULL,
       `classnum` int(4) unsigned DEFAULT '0',
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
     ```

   - 单独设定某列

     ```sql
     ALTER TABLE class MODIFY classnum int(4) NOT NULL;
     ```

2. 取消非空约束

   - 单独取消

     ```sql
     ALTER TABLE class MODIFY classnum int(4) NULL;

   - 取消并设定默认值

     ```sql
     ALTER TABLE class MODIFY classnum int(4) NULL DEFAULT '1';
     ```

---

*数据表的字段默认为 NULL，为字段添加了非空约束之后，若添加空值会报出异常。*

![image-20211019143321668](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211019213350.png)







## 四、常见问题

### having 和 where 的区别？

having 和 where 都是用来过滤筛选数据的。

1. where 是在查询结果返回之前，对结果进行筛选，**发生在分组 group by 之前**。

   having 是在查询结果出来之后，对结果进行过滤，**发生在 group by 之后**。

2. where 子句不能使用组函数，而 having 子句可以使用组函数。



### SELECT 语句执行顺序

查询处理的顺序如下:

1. FROM
2. ON 
3. JOIN 
4. WHERE 
5. GROUP BY 
6. HAVING 
7. SELECT
8. DISTINCT 
9. ORDER BY 
10. LIMIT

```sql
(5)SELECT DISTINCT <select_list>                     

(1)FROM <left_table> <join_type> JOIN <right_table> ON <on_predicate>

(2)WHERE <where_predicate>

(3)GROUP BY <group_by_specification>

(4)HAVING <having_predicate>

(6)ORDER BY <order_by_list>

(7)LIMIT n, m
```



[[MySQL（五）SELECT语句执行顺序](https://www.cnblogs.com/warehouse/p/9410599.html)](https://www.cnblogs.com/warehouse/p/9410599.html)







## 参考链接

[尚硅谷-MySQL基础教程丨mysql数据库实战（sql数据库优化）](https://www.bilibili.com/video/BV1xW411u7ax?spm_id_from=333.788.b_636f6d6d656e74.10)
