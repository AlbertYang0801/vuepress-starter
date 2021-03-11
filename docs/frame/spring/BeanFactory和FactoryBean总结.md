

## BeanFactory和FactoryBean总结

### BeanFactory总结

BeanFactory 是 Spring 中的一个接口，提供了 IOC 容器最基本的形式，给具体的 IOC 容器实现提供了规范。

其本质是一个 IOC 容器或对象工厂，所有的 Bean 都是由 BeanFactory （IOC容器）来进行管理的。Spring 有许多 BeanFactory 的实现类，附件了许多功能。

```java
public interface BeanFactory {
  
  Object getBean(String name) throws BeansException;
  
	<T> T getBean(String name, Class<T> requiredType) throws BeansException;

	Object getBean(String name, Object... args) throws BeansException;

	......
	
	boolean containsBean(String name);

	boolean isSingleton(String name) throws NoSuchBeanDefinitionException;
	
	boolean isPrototype(String name) throws NoSuchBeanDefinitionException;
	
	......
  
}
```



### FactoryBean总结

FactoryBean 也是 Spring 中的一个接口，但是和 BeanFactory 不同的是，其为 IOC 中 Bean 的实现提供了更加灵活的方式。其中应用了工厂模式和装饰模式，我们可以在对应的 `getObject()` 方法中增加获取 Bean 对象的方法。

FactoryBean 以 Bean 结尾，表示其也是一个 Bean。但是不同于普通的 Bean，从 BeanFactory 获取该实例的时候，返回的 Bean 是 FactoryBean 的 `getObject()` 方法返回的对象，而不是 FactoryBean 本身。如果想要获取 FactoryBean 本身就需要在类名之前加一个 `&` 符号来获取。

#### 功能练习

创建一个 继承FactoryBean的类 `FactoryBeanDemo` ，一个测试类 `FactoryBeanServiceImpl`（未注入到容器中）, 获取容器中的 Bean 工具类 `SpringBeanUtil`。

```java
//继承FactoryBean
@Component
public class FactoryBeanDemo implements FactoryBean {
    @Override
    public Object getObject() throws Exception {
        //返回FactoryBeanServiceImpl
        return new FactoryBeanServiceImpl();
    }

    @Override
    public Class<?> getObjectType() {
        return FactoryBeanServiceImpl.class;
    }


}

//测试类(未注入到容器中)
public class FactoryBeanServiceImpl {

    public void print() {
        System.out.println("bean init!");
    }


}

@Component
public class SpringBeanUtil implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext app) throws BeansException {
        applicationContext = app;
    }

    @SuppressWarnings("unchecked")
    public static <T> T getBean(String name) {
        return (T) applicationContext.getBean(name);
    }

    public static <T> T getBean(Class<T> cls) {
        return applicationContext.getBean(cls);
    }


}
```

**1. 获取 FactoryBean 实例**

通过API 测试获取 FactoryBean 实例，实际返回的是 FactoryBean 的 `getObject()` 方法返回的对象。

```java
    @SneakyThrows
    @GetMapping("/factoryBean/test")
    public String testFactoryBean() {
        //从容器中获取factoryBeanDemo 实例，返回的是FactoryBean的是 getObject()方法返回的对象
        Object bean = SpringBeanUtil.getBean("factoryBeanDemo");
        Class<?> aClass = bean.getClass();
        System.out.println(aClass.getName());
        return "Hello";
    }
  

    //output
    //com.design.practice.spring.factorybean.FactoryBeanServiceImpl
```

**2. 获取 FactoryBean 对象本身**

在类名之前加一个 `&` 符号来获取对象。

```java
    @SneakyThrows
    @GetMapping("/factoryBean/testMine")
    public String testFactoryBeanMine() {
        //从容器中获取FactoryBean对象
        FactoryBeanDemo bean = SpringBeanUtil.getBean("&factoryBeanDemo");
        Class<?> aClass = bean.getClass();
        System.out.println(aClass.getName());
        return "Hello";
    }

//output
//com.design.practice.spring.factorybean.FactoryBeanDemo

```

**3. 获取未注入到容器中的类**

使用 FactoryBean ，可以将 FactoryBean 的 `getObject()` 返回的对象注入到容器中。

通过结果可以发现，可以成功的从容器中获取 `FactoryBeanServiceImpl` 类的实例。

```java
@GetMapping("/factoryBean/test")
public String testFactoryBean(){
    //尝试从容器中获取未主动注入的类
    FactoryBeanServiceImpl bean = SpringBeanUtil.getBean(FactoryBeanServiceImpl.class);
    bean.print();
    return "Hello";
}

//output
//bean init!
```



### 参考链接

[Spring系列之FactoryBean](https://blog.csdn.net/zknxx/article/details/79572387?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_baidulandingword-0&spm=1001.2101.3001.4242)
