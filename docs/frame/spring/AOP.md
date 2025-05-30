# AOP

## 面向切面编程

面向切面编程，指的是在运行期间生成代理对象来对类进行增强处理，比如方法执行前和方法执行后进行代码增强。

### 什么是切面

- 切：
  
    指的是横切逻辑，原有方法代码不动。只能操作横切逻辑代码进行增强。
    
- 面：
  
    横切逻辑往往影响很多个方法，每个方法是一个切点，便形成了面。
    

常用的功能有：

- 方法审计日志
- 校验权限是否足够

![](https://s2.loli.net/2025/05/30/la4PV7O3gbZrJhx.png)

## AOP体系

![image-20250530170340088](https://s2.loli.net/2025/05/30/CH4akEnjiuOhzUq.png)



)连接点 - JoinPoint

类里面**哪些方法可以被增强**，这些方法称为连接点。

- 切面

    切点+通知。

    使用@`Aspect`注解的类就是切面。

    指定切入到哪些方法、那些类的代码片段叫做切面，包含了增强的逻辑。

- 切点-PointCut

    知道对哪个类里面的哪个方法进行增强**。**

    ```java
    execution(* com.guahao.wcp.gops.home.controller.*.*(..))
    ```

- 通知（增强）- Advice

    实际增强的逻辑部分称为通知（增强）。真正实现方法增强代码的地方。

    - 前置通知 - Before
    - 后置通知 - After

### 切点

通过语法结构匹配类或者匹配注解，判断对哪个类的哪个方法进行增强。

1. 匹配注解
   
    ```java
    @annotation(com.albert.spring.aop.AuditLogAspect)
    ```
    
2. 匹配类里面的所有方法
   
    ```java
    execution(* com.guahao.wcp.gops.home.controller.*.*(..))
    ```
    
3. 匹配单个方法
   
    ```java
       @After(value = "execution(* com.albert.spring.aop.service.SystemService.addSystem(..))")
        public void after(){
            System.out.println("after addSystem........");
        }
    ```
    

```java
@Aspect
@Slf4j
@Component
public class LogAspectj {

    /**
     * Controller层切点 注解拦截
     */
    @Pointcut("@annotation(com.albert.spring.aop.AuditLogAspect)")
    public void logAspectPointcut() {
    }

    /**
     * Service层切点 注解拦截
     */
    @Pointcut("execution(* com.albert.spring.aop.service.*.*(..))")
    public void servicePointcut() {
    }

    /**
     * 单个方法拦截
     */
    @After(value = "execution(* com.albert.spring.aop.service.SystemService.addSystem(..))")
    public void after(){
        System.out.println("after addSystem........");
    }

    /**
     * 通知
     * @param joinPoint
     */
    @Before("logAspectPointcut()")
    public void controllerBefore(JoinPoint joinPoint){
        System.out.println("controller before");
    }
  
      /**
     * 环绕通知-指定切点
     * 解析注解
     * @param auditLogAspect
     */
    @Around(value = "logAspectPointcut() && @annotation(auditLogAspect)")
    public void controllerAround(AuditLogAspect auditLogAspect){
        //日志持久化
        log.info("执行了 {} 方法",auditLogAspect.methodName());
        log.info("执行了 {} 操作",auditLogAspect.oper());
    }

    @After("logAspectPointcut()")
    public void controllerAfter(JoinPoint joinPoint){
        System.out.println("controller after");
    }

    @Before("servicePointcut()")
    public void svcBefore(JoinPoint joinPoint){
        System.out.println("svc before");
    }

    @After("servicePointcut()")
    public void svcAfter(JoinPoint joinPoint){
        System.out.println("svc after");
    }

    @After("servicePointcut()")
    public void svcAfter2(JoinPoint joinPoint){
        System.out.println("svc after 2 ");
    }

}
```

## AOP流程

AOP就是进行动态代理，在创建一个Bean的过程中，Spring在最后一步会去判断当前正在创建的这个Bean是不是需要进行AOP，如果需要则会进行动态代理。

在创建 Bean得最后一步，会判断对象是否需要进行AOP，如果需要则进行AOP。不需要则创建Bean完成。

### 如何判断对象是否需要AOP

1. 找出所有的切面 Bean（加了@Aspect注解的类）
2. 遍历切面中的每一个增强方法，判断是否写了 @Before、@After方法
3. 如果写了，判断对应的 Pointcut 是否和当前 Bean对象对应的类匹配。
   
    如果匹配，则表示当前Bean对象有匹配的 Pointcut，表示需要进行 AOP。
    

### Cglib动态代理代理流程

1. 生成代理类 UserServiceProxy，代理类继承 UserService。
2. 代理类中重写了父类的方法，比如 UserService中的 `test()`方法。
3. 代理类中还会有一个target属性，该属性的值为被代理对象。
4. 代理类中的`test()`方法被执行的逻辑如下：
    - 先执行切面逻辑，进行方法增强
    - 调用 `target.test()`，执行被代理对象的方法

UserService代理对象.test()—> **执行切面逻辑** —>target.test()，注意target对象不是代理对象，而是被代理对象。

## AOP实现

![](https://s2.loli.net/2025/05/30/RANqGDlKd7TJnit.png)

### 静态AOP

在编码阶段指定代理关系，在编译器就生成了代理类。

### 动态AOP

### JDK动态代理

主要使用到 `InvocationHandler` 接口和 `Proxy.newProxyInstance()` 方法。

> 其方法是将被代理对象注入到一个中间对象，而中间对象实现 InvocationHandler接口，在实现该接口时，可以在 被代理对象调用它的方法时，在调用的前后插入一些代码。而 Proxy.newProxyInstance() 能够利用中间对象来生产代理对象。插入的代码就是切面代码。所以使用JDK动态代理可以实现AOP。
> 

JDK动态代理：**必须是面向接口的，只有实现了具体接口的类才能生成代理对象**。

- 需要实现 JDK 中的 `InvocationHandler` 接口，实现其中的 `invoke` 方法，在此方法中通过反射的方式调用被代理类的方法。
- 通过 `Proxy` 类的 `newProxyInstance` 方法，生成代理类的实例 iud。

```java
public class UserServcieProxy implements InvocationHandler {

    private UserService userService;

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //代理
        System.out.println("start proxy");
        //这里是运用了反射机制的invoke方法，执行了userService这个目标对象中的方法
        method.invoke(userService,args);
        System.out.println("end proxy");
        return proxy;
    }

    public UserService createProxy(UserService userService){
        this.userService=userService;
        //获取类加载器
        ClassLoader classLoader = UserServcieProxy.class.getClassLoader();
        //被代理对象(也就是要增强处理的类)实现所有的接口
        Class<?>[] interfaces = userService.getClass().getInterfaces();
        //jdk动态代理增强了，返回的是代理后的对象。
         return (UserService) Proxy.newProxyInstance(classLoader,interfaces,this);
    }

    public static void main(String[] args) {
        UserService userService = new UserServiceImpl();
        UserServcieProxy userServcieProxy = new UserServcieProxy();
        UserService proxy = userServcieProxy.createProxy(userService);
        proxy.createUser();
    }

}

```

**为什么JDK动态代理需要实现接口才能代理？**

是由于JDK动态代理机制决定的。

JDK动态代理通过创建了一个实现和被代理类相同接口，然后将方法调用委托给了`InvocationHandler`。

1. **JDK动态代理生成的代理类，已经继承了 Proxy 类**。由于Java是单继承，所以JDK动态代理无法同时继承被代理类，只能通过实现接口。
   
    ![](https://s2.loli.net/2025/05/30/SDk928r3twLg17C.png)
    
    image.png
    
2. JDK动态代理是基于接口实现的，当使用 Proxy类创建代理对象时，接口代表了代理对象应该实现的接口方法，也就是代理对象的类型。

***必须实现接口才能使用JDK动态代理。如果被代理对象没有实现接口，就可以使用Cglib进行代理。***

### Cglib动态代理

**Cglib类是生成被代理对象的子类，对子类进行增强**。

> CGLIB动态代理是利用asm开源包，对代理对象类的class文件加载进来，通过修改其字节码生成子类来处理。
> 
- 代理类增强必须实现 `MethodInterceptor`

```java
public class Cglibproxy implements MethodInterceptor {

    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("start proxy");
        methodProxy.invokeSuper(o, objects);
        System.out.println("end proxy");
        return o;
    }

    public Object createProxy(Object o) {
        Enhancer enhancer = new Enhancer();
        //确定要增强的类
        enhancer.setSuperclass(o.getClass());
        //指定代理类
        enhancer.setCallback(new Cglibproxy());
        return enhancer.create();
    }

    public static void main(String[] args) {
        //代理增强
        Cglibproxy cglibproxy =new Cglibproxy();
        //被代理对象
        UserService userService = new UserService();
        //代理类（被增强的类）
        UserService userServiceProxy = (UserService)cglibproxy.createProxy(userService);
        userServiceProxy.addSystem();
    }

}
```

### Cglib 和 jdk 动态代理的区别

- Jdk动态代理
  
    利用拦截器（必须实现 InvocationHandler ）加上**反射机制**生成一个代理接口的匿名类，在调用具体方法前调用 InvokeHandler 来处理。
    
- Cglib动态代理
  
    利用 ASM 框架，对代理对象类生成的 class 文件加载进来，通**过修改其字节码生成子类**来处理。
    

### **什么时候用 Cglib 什么时候用 JDK 动态代理？**

1. 目标对象实现**了接口**，默认用 **JDK 动态代理。**
2. 如果目标对象**使用了接口**，可以**强制**使用 cglib。
3. 如果目标**对象没有实现接口**，必须**采用 cglib 库。**
   
    > Spring 会自动在 JDK 动态代理和 cglib 之间转换
    > 

## Spring事务和AOP的关系

Spring事务是通过AOP实现的，对代理对象的每个方法进行拦截。

在方法开始前开始事务，在方法执行结束后根据是否有异常进行提交和回滚。

Spring事务的代理对象执行某个方法时的步骤：

1. 判断当前执行的方法是否存在`@Transactional` 注解
2. 如果存在，则利用事务管理器（TransactionMananger）新建一个数据库连接，开启一个事务。
3. 修改数据库连接的autocommit为false。
4. 执行业务方法。
5. 执行完了之后如果没有出现异常，**则提交，否则回滚。**

Spring事务是否会失效的判断标准：

**某个加了@Transactional注解的方法被调用时，要判断到底是不是直接被代理对象调用的，如果是则事务会生效，如果不是则失效。**