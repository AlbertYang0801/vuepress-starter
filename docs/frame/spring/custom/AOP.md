# AOP

## ByteBuddy

AOP即面向切面编程，本质上是一个 Proxy 模式。核心就是拦截核心 Bean 的方法调用。

- JDK动态代理
- CGLIB动态生成字节码代理。

> 如果是接口AOP，则采用JDK动态代理。如果是类AOP，则采用CGLIB。
> 

## AOP实现核心

- 找到符合AOP要求的原始Bean
- 执行指定的拦截器逻辑

### AOP流程

1. 利用 `BeanPostProcessor` 检测每个Bean。
2. 扫描每个 Bean 的 @Around 注解。
3. 执行 InvocationHandler 的代理方法。

### 实现 @Before 和 @After

基于@Around的模板就可以实现。

通过适配器模式，将After逻辑注入到代理类`InvocationHandler`的代理逻辑里面。（@Before同理）

```java
public abstract class AfterInvocationHandlerAdapter implements InvocationHandler {

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object invoke = method.invoke(proxy, args);
        return after(proxy, invoke, method, args);
    }

    public abstract Object after(Object proxy, Object returnValue, Method method, Object[] args) throws Throwable;

}

```





https://gitee.com/zztiyjw/summer-framework/tree/master/summer-aop