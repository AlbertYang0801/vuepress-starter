# MySQL的binlog日志过期删除

### 问题

mysql的binlog日志过多导致磁盘告警。

部署脚本中没有配置 `binlog` 的失效时间，默认是30天。

## 手动清理

1. 查看正在使用的binlog
    
    ```sql
    show master status
    ```
    
2. 删除指定binlog之前的所有binlog
    
    ```sql
    purge binary logs to 'bin.000055'
    ```
    

## 配置自动清理

### 查看日志过期时间

```sql
show variables like '%expire_logs%'
```

| Variable | Value |
| --- | --- |
| binlog_expire_logs_seconds | 2592000 |
| expire_logs_days | 0 |
- `binlog_expire_logs_seconds`
    
    8.x 版本之后支持该参数，单位秒。
    
- `expire_logs_days`
    
    单位天。
    

### 修改my.cnf 配置文件

- 8.x版本
    
    `Plain Text   binlog_expire_logs_seconds=172800`
    
    ![](MySQL196bbc88-98a3-499e-92b0-6d46f8281658MySQL%E7%9A%84binlog%E6%97%A5%E5%BF%97%E8%BF%87%E6%9C%9F%E5%88%A0%E9%99%A445d93d08-f357-4190-a1b3-946833785c69image_kc5D4GQ789..png)
    

### 重启MySQL服务

```
systemctl restart mysqld
```

## 参考链接

[Mysql设置binlog过期时间并自动删除 - 走看看](http://t.zoukankan.com/jimoliunian-p-13896409.html)