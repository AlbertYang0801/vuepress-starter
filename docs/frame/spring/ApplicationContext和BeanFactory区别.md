# ApplicationContext和BeanFactory区别

### ApplicationContext 总结

ApplicationContext 容器上下文，包含了 BeanFactory 的所有功能，还额外提供了以下功能：

- MessageSource，提供国际化的消息访问
- 资源访问，如 URL 和文件
- 事件传播

### 工具类

可以通过实现 `ApplicationContextAware` 接口注入 ApplicationContext

```java
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

### BeanFactory总结

BeanFactory 是 Spring 中的一个接口，提供了 IOC 容器最基本的形式，给具体的 IOC 容器实现提供了规范。

其本质是一个 IOC 容器或对象工厂，所有的 Bean 都是由 BeanFactory （IOC容器）来进行管理的。Spring 有许多 BeanFactory 的实现类，附加了许多功能。

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

### ApplicationContext 和 BeanFactory的对比

### 关系

ApplicationContext 继承自 BeanFactory，所以 ApplicationContext 拥有 BeanFactory 的所有功能。

ApplicationContext 一般称为`应用上下文`，而 BeanFactory 称为 `IOC容器`。

### 相同点

- 都可以作为容器。
- 都可以通过 `getBean()` 方法获取对象。

注意：ApplicationContext 的 `getBean()` 方法，实际上还是调用了 BeanFactory 的 `getBean()` 方法。

### 不同点

1. 实例化 Bean 对象
    - BeanFactory 是延迟加载，实例化的时候并不会实例化 Bean，只有在调用 `getBean()` 方法后才会创建 Bean对象。
    - ApplicationContext 在初始化的时候加载，在启动的时候就把所有的 Bean 对象进行实例化了。
        
        注意：如果Bean没有完全注入，BeanFactory 加载后，会在第一次调用 `getBean()` 方法才会抛出异常，而 ApplicationContext 会在初始化的时候就会加载 Bean 并且进行检查。所以选择 ApplicationContext 的好处还有**能及时检查依赖是否完全注入**。
        
2. 支持后置处理器
    - BeanFactory 和 ApplicationContext 都支持后置处理器。
    - BeanFactory需要手动注册。
    - **ApplicationContext 实现了自动注册**。

### 总结

- ApplicationContext 功能更为全面，一般使用 ApplicationContext 作为容器使用。
- BeanFactory 职责单一，负责 Bean 的加载和实例化，维护 Bean 之间的关系，负责 Bean 的生命周期。功能较少，占内存少，适合内存受限的设备使用。