# redis简介

## 环境安装

1. 安装包地址

   [官网下载地址](https://download.redis.io/releases/?_ga=2.74174546.195969673.1626310217-1876671789.1626310217)

2. 解压缩

   ```shell
   tar -zxvf redis-6.0.8.tar 
   ```

3. 编译测试

   ```java
   sudo make test
   ```

4. 安装

   ```java
   sudo make install
   ```

5. 设置后台启动

   编辑 `redis.conf `，修改如下内容。

   ```java
   #配置后台运行
   daemonize yes
   ```

6. 启动 

   ```java
   sudo redis-server redis.conf
   ```

7. 进入交互命令行

   ```
   reids-cli
   ```

## Redis 简介

### 单线程

首先，Redis 是完全基于内存的，基于内存操作非常快速。其次采用了单线程来避免不必要的上下文切换和竞争。

### 端口号

redis 默认端口号是 **6379**

### 数据库

redis 默认拥有 16 个数据库，排列顺序类似数组下标，从 0 开始排序，默认使用的是 0 号库。

redis 数据库统一密码管理的，16 个库都是同样密码，默认不设置密码。

- 切换数据库

  ```java
  #切换到 1 号数据库
  select 1
  ```

- 查看当前数据库 key 的数量

  ```java
  dbsize
  ```

- 清空当前库

  ```java
  flushdb
  ```

- 清空所有库

  ```java
  flushall
  ```

### 

