## Maven上传Jar包到私服

#### 概述

在公司工作的时候，使用的Maven仓库是公司私服。有的时候对接第三方SDK，需要把第三方的SDK手动上传到公司私服，这里记录一下上传步骤。



#### 准备

1. Maven依赖属性

   <img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210227202748.png" style="zoom:67%;" />



2.jar包文件

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210227203133.png" style="zoom: 33%;" />

3.仓库地址

比如`http://xxx:18081/content/groups/public`。

4. 用户名和密码

#### 上传步骤

1. 浏览器打开仓库地址。
2. 输入用户名密码。
3. 找到仓库。
4. 剩下的操作步骤如下图。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210226114500.png)



参考博客：https://www.cnblogs.com/htyj/p/8024791.html