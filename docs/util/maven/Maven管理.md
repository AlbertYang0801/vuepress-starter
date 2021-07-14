

# 操作备忘

## 上传包到私服

### 概述
在公司工作的时候，使用的 Maven 仓库是公司私服。有的时候对接第三方 SDK，需要把第三方的 SDK 手动上传到公司私服，这里记录一下上传步骤。

[https://www.cnblogs.com/htyj/p/8024791.html](https://www.cnblogs.com/htyj/p/8024791.html)

### 准备工作
 1. 查找 Maven 依赖

    ```xml
    <dependency>
    	<gruopId>im.youdu</gruopId>
      <artifactId>ydsdk-java</artifactId>
      <version>1.0.0</version>
    </dependency>
    ```

2. 准备 Jar 包文件

   ```
   ydsdk-java-1.0.0.jar
   ```

3. 仓库地址

   ```
   http://xxx:18081/content/groups/public
   ```

4. 用户名和密码

### 上传步骤

1. 浏览器打开仓库地址。

2. 输入用户名密码。

3. 找到仓库。

4. 剩下的操作步骤如下图。
   
   ![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210226114500.png)

## 安装包到本地仓库
1. 常用命令

   ```shell
   mvn install:install-file -Dfile="${包全路径}" -DgroupId=${groupId} DartifactId=${DartifactId} -Dversion=${version} -Dpackaging=jar
   ```

2. 参考示例

   ```shell
   mvn install:install-file -Dfile="/Users/yangjunwei/Desktop/x-pack-transport-6.8.8.jar" -DgroupId=org.elasticsearch.client -DartifactId=x-pack-transport -Dversion=6.8.8 -Dpackaging=jar
   ```

   

  



