

## 集合概述

### 为什么使用集合？

当我们需要保存一组类型相同的数据的时候，我们应该用一个容器来保存，这个容器就是数组。

但是数组的长度是固定的，当添加的元素超过了数组的长度之后，需要对数组重新定义。而且数组存储的数据是`有序的`、`可重复的`，太过于单一，扩展性不够。

于是，引入了集合，Java 内部给我们提供了功能完善的集合框架。能`存储任意对象`，长度可以`动态改变`，提高了数据存储的灵活性。

### 数组和集合的区别

1. 存储类型
   - 数组可以存储`基本数据类型`，又可以存储`引用数据类型`。
   - 集合只能存储`引用数据类型`。（集合中也可以存储基本数据类型，但是在存储的时候会`自动装箱`变成引用类型）
2. 存储长度
   - 数组的长度是`固定`的，不可以改变。
   - 集合的长度可以`动态改变`。

### 数据和集合的使用

- 如果元素个数`固定`推荐使用`数组`。
- 如果元素个数`不固定`推荐使用`集合`。

### 集合架构图

![](https://s2.loli.net/2025/05/28/wt5PE7Qi4yzFUpj.png)


### 参考链接

[LeetBook - 数组简介](https://leetcode-cn.com/leetbook/read/array-and-string/ybfut/)

