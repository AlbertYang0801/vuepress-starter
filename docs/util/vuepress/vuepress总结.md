# vuepress总结

## 一、环境安装

### 1.使用brew安装node环境

- 安装 brew

  ```java
  /bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)
  ```

- 安装 node

  ```java
	brew install node
  ```

- 查看版本号

  ```java
  node -v
  ```

### 2. vuepress

前提：安装node环境

- npm 安装国内镜像

  ```
  npm config set registry=http://registry.npm.taobao.org -g
  ```

- 使用 npm 安装

  ```
  npm install -g vuepress
  ```

- 查看版本号

  ```
  vuepress -version
  ```





## 二、项目地址

1. 源文件仓库 **vuepress-starter**

   | 别名        | 仓库地址                                                     |
   | ----------- | ------------------------------------------------------------ |
   | github      | [https://github.com/AlbertYang0801/vuepress-starter.git](https://github.com/AlbertYang0801/vuepress-starter.git) |
   | origin      | [https://gitee.com/zztiyjw/vuepress-starter.git](https://gitee.com/zztiyjw/vuepress-starter.git) |
   | Mac本地仓库 | [/Users/yangjunwei/vuepress-starter/](/Users/yangjunwei/vuepress-starter/) |

2. 主页文件仓库 **blog**

   | 别名        | 仓库地址                                                     |
   | ----------- | ------------------------------------------------------------ |
   | origin      | [https://github.com/AlbertYang0801/blog.git](https://github.com/AlbertYang0801/blog.git) |
   | Mac本地仓库 | [/Users/yangjunwei/IdeaProjects/blog](/Users/yangjunwei/IdeaProjects/blog) |

## 三、常用命令

- `vuepress dev .`
- `vuepress build .`

## 四、参考链接

- [VuePress搭建个人技术文档网站教程](https://segmentfault.com/a/1190000017055963)

