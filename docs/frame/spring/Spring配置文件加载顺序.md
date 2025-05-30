# Spring配置文件加载顺序

## SpringBoot配置文件的加载顺序

SpringBoot项目启动会扫描以下位置的application.properties或者application.yml文件作为SpringBoot的默认配置文件，具体的目录位置见下图。

1. file:./config/ （ 项目根路径下的config文件夹）
2. file:./ （项目根路径）
3. classpath:/config/ （类路径下的config文件夹）
4. classpath:/ （类路径）

![](https://s2.loli.net/2025/05/30/A2aWi6FBwrteTyS.png)

按照配置文件的优先级，8001>8002>8003>8004

> 注意file层是项目的最外层目录，也就是工作目录。
> 

![](https://s2.loli.net/2025/05/30/ajr6N9vbJOhFwpD.png)