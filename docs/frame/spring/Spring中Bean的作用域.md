# Spring中Bean的作用域

## 作用域类型

- **singleton**
    
    单例模式。
    
    使用 `singleton` 定义的 Bean 在 Spring 容器中只有一个实例，是 **Bean 默认的作用域**。
    
- **prototype**
    
    原型模式
    
    每次通过 Spring 容器获取 `prototype` 定义的 Bean 时，**容器都将创建一个新的 Bean 实例。**
    
- request
    
    在一次 HTTP 请求中，容器会返回该 Bean 的同一个实例。而对不同的 HTTP 请求，会返回不同的实例，该作用域仅在当前 HTTP Request 内有效。
    
- session
    
    在一次 HTTP Session 中，容器会返回该 Bean 的同一个实例。而对不同的 HTTP 请求，会返回不同的实例，该作用域仅在当前 HTTP Session 内有效。
    
- global session
    
    在一个全局的 HTTP Session 中，容器会返回该 Bean 的同一个实例。该作用域仅在使用 portlet context 时有效。
    

## Spring 单例Bean 的线程安全问题

### 问题原因

Spring 中的 bean 默认都是单例的。

- 无状态 Bean 不存在线程安全问题。
    
    如果单例 Bean 是一个无状态 Bean，也就是线程中的操作不会对 Bean 的成员执行查询以外的操作，那么这个 Bean 就是线程安全的。 比如 SpringMVC 的 Controller、Sevice、Dao等，这些 Bean 大多是无状态的。
    
- 有状态 Bean 存在线程安全问题。
    
    当 Bean对象中存在可变的成员变量，并且有线程会去修改这个变量，此时多线程操作该 Bean 就会出现线程安全问题。
    

### 解决办法

- 改变 Bean 的作用域为 `prototype`；
    
    相当于每次请求都会创建一个新的 bean 实例，自然不会存在线程安全问题。
    
- 在类中定义一个 `ThreadLocal` 成员变量，将需要的可变成员变量保存在 `ThreadLocal` 中（推荐的一种方式）。
    
    `ThreadLocal` 本质上使用了以 `空间换时间` 的方式，为每个线程都提供一个独立的变量副本，从而保证了多线程之间访问变量时不会产生冲突。
    

### 练习例子

**线程不安全**

创建一个存在可变成员变量的测试类，默认的 Bean 是单例的，若是存在可变成员变量则是有状态 Bean，会产生线程安全问题。

```java
@Component
public class DefaultSingleBean {

    String msg = "默认消息";

}
```

创建一个API接口，开启两条线程获取 Bean，其中一条线程修改 Bean里面的变量，另一个线程只读线程里的可变成员变量。

- 若 Bean 是线程安全的，在只读的线程里获取可变成员变量时得到的是默认值。
- 若 Bean 是线程不安全的，在只读的线程里可能会读取到另一个线程修改后的值。

```java
    @GetMapping("/safeBean/default")
    public void testThreadSafeBean() {
      	//修改值线程
        new Thread(() -> {
            //从ApplicationContext容器中获取
            DefaultSingleBean defaultSingleBean = SpringBeanUtil.getBean(DefaultSingleBean.class);
            defaultSingleBean.msg = "线程A信息";
            System.out.println(defaultSingleBean.msg);
        }).start();
      	//只读线程
        new Thread(() -> {
            //从ApplicationContext容器中获取
            DefaultSingleBean defaultSingleBean = SpringBeanUtil.getBean(DefaultSingleBean.class);
            System.out.println(defaultSingleBean.msg);
        }).start();
    }

//output
//线程A信息
//只读线程：线程A信息
```

**线程安全**

- 第一种方法：改变 Bean 的作用域为 `prototype`；

```java
/**
* 测试类-有状态的Bean
*/
@Component
@Scope("prototype")
public class BeanScopeSafeBean {

     //默认消息
     String msg = "默认消息";

}
```

创建一个API，测试修改Bean的作用域为prototype 来保证线程安全。

```java
   /**
     * 第一种方法：测试修改Bean的作用域为prototype 来保证线程安全
     */
    @GetMapping("/safeBean/beanScope")
    public void testThreadSafeBeanScope() {
        new Thread(() -> {
            //从ApplicationContext容器中获取
            BeanScopeSafeBean beanScopeSafeBean = SpringBeanUtil.getBean(BeanScopeSafeBean.class);
            beanScopeSafeBean.msg = "线程A信息";
            System.out.println(beanScopeSafeBean.msg);
        }).start();
        Thread.sleep(1000);
        new Thread(() -> {
            //从ApplicationContext容器中获取
            BeanScopeSafeBean beanScopeSafeBean = SpringBeanUtil.getBean(BeanScopeSafeBean.class);
            System.out.println(beanScopeSafeBean.msg);
        }).start();
    }

//output
//线程A信息
//默认消息
```

- 第二种方法：使用 `ThreadLocal` 封装成员变量；

```java
@Component
public class ThreadLocalSafeBean {

     /**
      * 使用ThreadLocal保证可变变量线程安全
      */
     ThreadLocal<String> threadLocalMsg = ThreadLocal.withInitial(()->"默认消息");

}
```

创建一个API，测试使用ThreadLocal解决线程安全的问题。

```java
    /**
     * 第二种方式：测试使用ThreadLocal解决线程安全的问题
     */
    @SneakyThrows
    @GetMapping("/safeBean/threadlocal")
    public void testThreadSafeBeanThreadLocal() {
        new Thread(() -> {
            //从ApplicationContext容器中获取
            ThreadLocalSafeBean threadLocalSafeBean = SpringBeanUtil.getBean(ThreadLocalSafeBean.class);
            threadLocalSafeBean.threadLocalMsg.set("线程A信息");
            System.out.println(threadLocalSafeBean.threadLocalMsg.get());
        }).start();
        Thread.sleep(1000);
        new Thread(() -> {
            //从ApplicationContext容器中获取
            ThreadLocalSafeBean threadLocalSafeBean = SpringBeanUtil.getBean(ThreadLocalSafeBean.class);
            System.out.println(threadLocalSafeBean.threadLocalMsg.get());
        }).start();
    }

//output
//线程A信息
//默认消息
```