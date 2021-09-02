

# redis安装

## Linux

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

## 虚拟机

1. 复制安装包到 `/usr/local`

2. 解压安装包

   ```java
   tar -zxvf redis-3.0.4.tar.gz      
   ```

3. 执行make

   ![clipboard](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205240.png)

   ![clipboard](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205308.png)

4. 执行make install

   ![clipboard](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205347.png)

5. 修改配置文件 `redis.conf`，将 `daemonize no` 改为 `yes` ，让 redis 服务在后台启动。

   ![1](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205417.png)

6. 将 `redis.conf` 复制到 `/usr/local/bin`

   ![22](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205441.png)

7. 启动 redis

   ```java
   redis-server redis.conf
   ```

8. 测试连接

   ```java
   redis-cli -h 192.168.126.110 -p 6379
   ```

   ![2323](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205526.png)

   ![555](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205553.png)

9. 防火墙开放**6379**端口

   ```java
   firewall-cmd --zone=public --add-port=6379/tcp --permanent
   firewall-cmd --reload
   ```

10. 使用 RedisDesktopManager 进行外网连接测试

    ![clipboard](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210902205633.png)

    ​        

## 





