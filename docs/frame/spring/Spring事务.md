

## Spring事务总结


### 编程式事务

在代码中硬编码，不推荐使用。

### 声明式事务

- 基于注解的声明式事务
- 基于 XML 的声明式事务


### @Transactional 注解

Exception 分为运行时异常 RuntimeException 和非运行时异常。事务管理能保证出现异常情况的时候保证数据的一致性。

默认 `@Transactional` 注解只会在遇到 RuntimeException 类型异常或者 Error时，才会回滚事务。遇到其它异常，Spring 不会回滚事务。

#### 作用范围

- 当 `@Transactional`注解作用于类上的时，该类的所有方法都将具有该类型的事务属性，同样的我们也可以在方法级别上使用该注解来覆盖类级别的定义。

#### @Ttransactional(rollbackFor=Exception.class)

在注解上配置 `rollbackFor` 属性并指定异常类，则在目标方法中抛出的异常类及其子类时，事务同样会回滚。

比如配置 `rollbackFor=Exception.class` 时，若在目标方法出现 Exception 类及其子类异常时便会回滚。

#### @Ttransactional 只有应用到 public 方法才会生效

只有 `@Ttransactional ` 注解应用到 public 方法上时，才能进行事务管理。



### 参考链接

[透彻的掌握 Spring 中 @transactional 的使用](https://developer.ibm.com/zh/articles/j-master-spring-transactional-use/)



