

## Spring 框架概述

### 一、什么是 Spring 框架？

Spring 框架指的是 Spring Framework，是一种轻量级的开发框架，主要核心是控制反转 （IOC）和 面向切面编程（AOP）。

### 二、Spring 的优点

1. 方便解耦，简化开发（高内聚低耦合）

   - Spring 是一个容器框架，将所有对象创建和依赖关系的维护交给 Spring 管理。

   - Spring 工厂用于生成 Bean。

2. AOP编程的支持

   - Spring 提供面向切面编程，可以方便的实现权限拦截、运行监控等功能
   - 日志打印

3. 支持声明式事务

   - 只需要通过配置就可以完成对事务的管理，而无需手动编程

4. 方便程序测试

   - Spring 支持 Junit4等测试框架，可以通过注解进行方便的测试。

5. 方便集成各种框架

   - Spring支持集成各种框架。（如：Mybatis、ActiveMQ等）

6. 内部封装各种API

   - Spring 内部封装了很多方便实用的 API。（如：JDBC、JavaMail等）



### 三、什么是 IOC ？

IOC（控制反转）是一种设计思想，将原本在程序中手动创建对象的控制权，交给 Spring 框架来管理。

IOC 容器是 Spring 用来实现 IOC 的载体。将对象之间的相互依赖关系交给 IOC 容器来管理，并由 IOC容器完成对象的注入。IOC 容器就像是一个工厂一样，当我们需要创建一个对象的时候，只需要配置对应注解即可，完全不用考虑对象是如何创建出来的，同时也保证了对象之间的松耦合。

总结来说 IOC 就是对 Bean 的注册管理，由 IOC 容器帮对象找相应的依赖对象并注入，而不是由对象主动去找。

#### IOC 中的设计模式

- 简单工厂模式

  Spring 中的 BeanFactory 就是简单工厂的体现，根据传入的标识获取 Bean 对象。

  ```java
  public interface BeanFactory {
    
    Object getBean(String name) throws BeansException;
    
  	......
    
  }
  ```

- 工厂模式

  Spring 中的 FactoryBean 就用到了工厂模式，对应的 `getObject()` 方法可以返回一个对应的对象。

  具体可参考： [FactoryBean总结](FactoryBean.md)

- 单例模式

  在Spring中，所有的 Bean 默认都是单例创建的。

- 策略模式

- 装饰器模式

### 四、什么是 AOP？

AOP（面向切面编程）能够将那些与业务无关，却为业务模块所共同调用的逻辑或责任（如事务管理、日志管理、权限控制等）封装起来，便于减少系统的重复代码，降低模块间的耦合度，并有利于未来的可扩展性和可维护性。

#### 动态代理和静态代理

- 动态代理

  以 Spring AOP 为代表。指代理类在JVM运行时动态生成的。效率会低一点，但是大大提高了代码的简洁度和开发工作。

- 静态代理

  以 AspectJ 为代表。指代理类在编译期生成的，与动态代理相比，效率会很高，但是会生成大量代理类。

#### SpringAOP 和 AspectJ 有什么区别？

- SpringAOP 属于`运行时增强`，而 AspectJ 属于`编译期增强`。

- SpringAOP 基于动态代理实现，而 AspectJ 属于静态代理。

- SpringAOP 已经集成了 AspectJ ，AspectJ 相比于 SpringAOP 功能更加强大，但是 SpringAOP 更简单。

#### SpringAOP 动态代理的两种方式？

- JDK 动态代理
- CGlib 动态代理





### 参考链接

[JavaGuide-Spring框架](https://snailclimb.gitee.io/javaguide/#/docs/system-design/framework/spring/Spring%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93?id=_1-%e4%bb%80%e4%b9%88%e6%98%af-spring-%e6%a1%86%e6%9e%b6)

[博客园：Spring 框架概述](https://www.cnblogs.com/wanghuaying/p/9678349.html)

[Spring IOC 容器源码分析](https://javadoop.com/post/spring-ioc)

