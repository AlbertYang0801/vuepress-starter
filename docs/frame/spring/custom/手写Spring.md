# 手写Spring

- boot模块：实现一个简化版的 `Spring Boot`，用于打包运行。
- web模块：实现Web MVC和REST API。

## Spring主要模块

- context模块：实现ApplicationContext容器与Bean的管理；
- aop模块：实现AOP功能；
- jdbc模块：实现JdbcTemplate，以及声明式事务管理；

## IOC

[IOC](IOC.md)

## AOP

[AOP](AOP.md)

## JDBC

[JDBC](JDBC.md)

[声明式事务](声明式事务.md)

1. 由`JdbcConfiguration`创建的`DataSource`，实现了连接池；
2. 由`JdbcConfiguration`创建的`JdbcTemplate`，实现基本SQL操作；
3. 由`JdbcConfiguration`创建的`PlatformTransactionManager`，负责拦截`@Transactional`标识的Bean的public方法，自动管理事务；
4. 由`JdbcConfiguration`创建的`TransactionalBeanPostProcessor`，负责给`@Transactional`标识的Bean创建AOP代理，拦截器正是`PlatformTransactionManager`。

## MVC

[MVC](MVC.md)

1. 一个`DispatcherServlet`作为核心处理组件，接收所有URL请求，然后按MVC规则转发；
2. 基于`@Controller`注解的URL控制器，由应用程序提供，Spring负责解析规则；
3. 提供`ViewResolver`，将应用程序的Controller处理后的结果进行渲染，给浏览器返回页面；
4. 基于`@RestController`注解的REST处理机制，由应用程序提供，Spring负责将输入输出变为JSON格式；
5. 多种拦截器和异常处理器等。

## Boot

[Boot](Boot.md)

## 设计模式

- 工厂模式
    
    ApplicationContext
    
- 适配器模式
    
    AfterInvocationHandlerAdapter
    
- 模版模式
    
    JdbcTemplate
    

## 源码

[Albert.Yang/summer-framework](https://gitee.com/zztiyjw/summer-framework)

[简介 - 手写Spring - 廖雪峰的官方网站](https://liaoxuefeng.com/books/summerframework/introduction/index.html)

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373cc%E6%89%8B%E5%86%99Spring23fc0f0a-d000-42b6-9681-5aa128214394image.png)