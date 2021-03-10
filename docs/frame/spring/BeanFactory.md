

## BeanFactory总结

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

