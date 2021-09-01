# MySQL异常问题


## 配置类型

### 1. Navicat连接数量过多

#### 异常体现

报错 **Too many connections**

#### 解决办法

- 查看最大连接数

  ```sql
  show variables like '%max_connections%';
  ```

- 全局修改最大连接数

  ```sql
  set global max_connections = 10000;
  ```

- 重启 MySQL

  ```java
  systemctl restart mysqld
  ```

### 2. 导入SQL脚本提示 "sql_mode=only_full_group_by"

#### 异常信息

导入SQL脚本提示 `sql_mode=only_full_group_by`

#### 解决办法

1、查看sql_mode

```sql
SELECT @@sql_mode;
```


查询出来的值为：

```sql
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```

2、去掉 `ONLY_FULL_GROUP_BY`，重新设置值。

```sql
SET @@global.sql_mode ='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
```

3、上面是改变了全局 `sql_mode`，对于新建的数据库有效。对于已存在的数据库，则需要在对应数据库下执行：

```sql
SET sql_mode ='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
```

————————————————
版权声明：本文为CSDN博主「Ch3n」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_43064185/article/details/99646535



