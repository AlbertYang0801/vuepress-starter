# Docker学习总结

## 基本知识

### 1. Docker 是什么？

docker 是一种容器化虚拟技术，解决了运行环境和配置问题，方便持续集成并有助于项目整体发布。

### 2. Docker 能干嘛？

*一次构建、随处运行。*

- 更快速的应用交付和部署。
- 更便捷的升级和扩缩容。
- 更简单的系统运维。
- 更高效的计算源利用。

## 基本组成



### 1. 镜像

   > Docker 镜像（image）就是一个只读的模版，一个镜像可以创建很多容器。

### 2. 容器

   > Docker 利用容器（Container）独立运行一个或一组应，容器是用镜像创建的运行实例。
   >
   > 它可以被启动、开始、停止、删除。每个容器都是相互隔离的、保证安全的平台。
   >
   > *可以把容器看做是一个简易版的 Linux 环境*（包括root用户权限、进程空间、用户空间和网络空间等）和运行在其中的应用程序。
   >
   > 容器的定义和镜像几乎一模一样，也是一堆层的统一视角，唯一区别在于容器的最上面那一层是可读可写的。

### 3. 仓库

   > 仓库（Repository）是集中存放镜像文件的场所。
   >
   > 仓库(Repository)和仓库注册服务器（Registry）是有区别的。仓库注册服务器上往往存放着多个仓库，每个仓库中又包含了多个镜像，每个镜像有不同的标签（tag）。
   >
   > 仓库分为公开仓库（Public）和私有仓库（Private）两种形式。
   >
   > 最大的公开仓库是 Docker Hub(https://hub.docker.com/)，
   >
   > 存放了数量庞大的镜像供用户下载。国内的公开仓库包括阿里云 、网易云 等

### 4. 基本组成总结

   > 需要正确的理解仓储/镜像/容器这几个概念:
   >
   >  Docker 本身是一个容器运行载体或称之为管理引擎。我们把应用程序和配置依赖打包好形成一个可交付的运行环境，这个打包好的运行环境就似乎 image镜像文件。只有通过这个镜像文件才能生成 Docker 容器。image 文件可以看作是容器的模板。Docker 根据 image 文件生成容器的实例。同一个 image 文件，可以生成多个同时运行的容器实例。
   >
   > \*  image 文件生成的容器实例，本身也是一个文件，称为镜像文件。
   >
   > \*  一个容器运行一种服务，当我们需要的时候，就可以通过docker客户端创建一个对应的运行实例，也就是我们的容器
   >
   > \* 至于仓储，就是放了一堆镜像的地方，我们可以把镜像发布到仓储中，需要的时候从仓储中拉下来就可以了。



## 常见问题

### 1. Docker 的工作原理

Docker是一个 Client-Server 结构的系统，Docker 的守护进程运行在主机上， 然后通过 Socket 连接从客户端访问，守护进程从客户端接受**命令**并管理运行在主机上的容器。

![img](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210831195531.png)

1. 在客户端发起的命令都是访问 Docker_Host 的守护线程 Docker daemon；
2. Repository 是镜像仓库，可以拉取镜像到本地。
3. 从镜像创建的运行实例就是容器，来运行应用。

## 常用命令

### Docker启动相关

| 功能               | 相关命令                |      |
| ------------------ | ----------------------- | ---- |
| 启动docker         | systemctl start docker  |      |
| 查看docker版本     | docker -v               |      |
| 设置开机启动docker | systemctl enable docker |      |
| 停止docker         | systemctl stop docker   |      |

### Docker镜像操作

| 功能                            | 相关命令                                    |      |
| ------------------------------- | ------------------------------------------- | ---- |
| Docker命令文档                  | docker --help                               |      |
| 查看本地镜像列表                | docker images                               |      |
| 列出本地所有镜像                | docker images -a                            |      |
| 查看本地镜像列表 - 只显示镜像ID | docker images -q                            |      |
| 列出本地所有镜像的ID            | docker images -qa                           |      |
| 显示镜像的摘要信息              | docker images -digests                      |      |
| 显示完整的镜像信息(完整镜像ID)  | docker images -no-trunc                     |      |
| 检索镜像(从 Docker-Hub 检索)    | docker search                               |      |
| 拉取镜像(从配置的阿里云拉取)    | docker pull 镜像名:tag(版本号.默认为latest) |      |
| 删除本地指定镜像                | docker rmi image-id                         |      |
| 强制删除单个镜像                | docker rmi -f image-id                      |      |
| 删除多个镜像                    | docker rmi -f image:TAG image:TAG           |      |
| 删除全部镜像                    | docker rmi -f $(docker images -qa)          |      |

### Docker容器操作

| 功能                                       | 相关命令                                                     |                                       |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------- |
| 根据镜像名在后台启动容器                   | docker run --name mytomcat -d tomcat:latest                  | --name:给容器命名 -d 在后台启动       |
| 根据镜像id启动容器，并进入容器开启伪终端   | docker run -it image-id                                      | --i:以交互模式启动容器，-t:创建伪终端 |
| 启动端口映射的mysql镜像(指定密码)          | docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6 |                                       |
| 列出docker正在运行的容器                   | docker ps                                                    |                                       |
| 上一个运行的容器                           | docker ps -l                                                 |                                       |
| 列出所有容器(包含运行过的)                 | docker ps -a                                                 |                                       |
| 显示最近n(3)个创建的容器                   | docker ps -n 3                                               |                                       |
| 只显示容器编号(静默模式)                   | docker ps -q                                                 |                                       |
| 不截断输出(完整容器ID，默认的输出12位左右) | docker ps --no-trunc                                         |                                       |
| 容器停止退出                               | exit                                                         |                                       |
| 容器不停止退出                             | ctrl+P+Q                                                     |                                       |
| 启动容器                                   | docker start 容器ID或容器名                                  |                                       |
| 重启容器                                   | docker restart 容器ID或容器名                                |                                       |
| 停止容器                                   | docker stop 容器ID或容器名                                   |                                       |
| 强制停止容器                             | docker kill 容器ID或容器名               |                                       |
| 删除已停止的容器                           | docker rm 容器ID                    |                                       |
| 删除全部容器                             | docker rm -f $(docker ps - a -q)   |                                       |
| 停止容器                                   | docker stop 容器ID或容器名                                   |                                       |
| 停止容器                                   | docker stop 容器ID或容器名                                   |                                       |
| 停止容器                                   | docker stop 容器ID或容器名                                   |                                       |
| 停止容器                                   | docker stop 容器ID或容器名                                   |                                       |
|---------------------------------------------|----------------------------------------------------||
|启动守护式容器(后台运行，必须有一个前台进程，否则自动退出)|docker run -d 容器名||
|查看容器日志|docker logs 容器ID||
|加入时间戳|				docker logs -t ||
|打印最新的日志|				docker logs -f ||
|显示最后多少条|					docker logs --tail||
|查看容器内运行的进程|				docker top 容器ID||
|查看容器内部细节|					docker inspect 容器ID||
|进入正在运行的终端(直接进入容器的伪终端，不会启动新的进程)|			docker attach 容器ID||
|进入正在运行的终端(在容器中打开新的终端，并且可以启动新的线程)|docker exec -it 容器I|例如:mysql docker exec -it 容器ID /bin/bash|
|从容器内拷贝文件到主机上|docker cp 容器ID:容器内路径 目的主机路径||

### 其它命令总结	

| 功能                                              | 相关命令                                                     |                                                              |
| ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 启动zookeeper命令(默认端口为2181,2888,3888,8080): | docker run --name some-zookeeper --restart always -d zookeeper | docker run --name zk01 -p 2181:2181 --restart always -d 镜像ID |
| Docker中的MySQL容器数据持久化命令                 | docker run -p 3306:3306 --name mysql -v /usr/local/mysql/conf:/etc/mysql/conf.d -v /usr/local/mysql/logs:/logs -v /usr/local/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql |                                                              |
| 进入tomcat容器内部                                | docker exec -it 容器ID /bin/bash                             |                                                              |
| Docker中的Tomcat容器实现挂载本地目录              | docker run -d -p 8080:8080 --name tomcat -v /usr/local/docker/docker-tomcat/tomcat-war:/usr/local/tomcat/webapps -v /usr/local/docker/docker-tomcat/tomcat-conf:/usr/local/tomcat/conf tomcat:8.5 |                                                              |
| Docker中的Tomcat容器启动只挂载本地war包目录       | docker run -d -p 8080:8080 --name tomcat -v /usr/local/docker/docker-tomcat/tomcat-war:/usr/local/tomcat/webapps tomcat:8.5 |                               



