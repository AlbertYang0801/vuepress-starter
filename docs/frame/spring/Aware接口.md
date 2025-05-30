# Aware接口

在Spring框架中，`Aware`接口提供了一种机制，允许Bean在初始化过程中获取Spring容器的特定上下文信息或资源。这些接口通常被称作回调接口，因为它们允许Spring容器在特定时刻回调Bean，以便将一些重要的信息注入给Bean。

### ApplicationContextAware

当Spring容器在初始化一个实现了`ApplicationContextAware`接口的Bean时，它会调用`setApplicationContext`方法，将当前的应用上下文传入。

```java
public interface ApplicationContextAware extends Aware {
    void setApplicationContext(ApplicationContext var1) throws BeansException;
}
```

```java
@Component
public class BeanAware implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    //在初始化该Bean时候，Spring会扫描Aware方法，并传入参数执行Aware对应的方法
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    public String sayHello(){
        HelloAwareService bean = applicationContext.getBean(HelloAwareService.class);
        return bean.sayHello();
    }

}
```

## Aware接口作用

1. **实现`BeanNameAware`接口后，重写`setBeanName`方法，可以对单个`Bean`进行扩展修改；**
2. **实现`BeanFactoryAware`接口后，重写`setBeanFactory`方法，可以对`Bean`工厂中的所有Bean进行扩展修改；**
3. **实现`ApplicationContextAware`接口后，重写`setApplicationContext`方法后，可以对`整个容器`进行扩展修改；**
4. **这几个接口的执行顺序分别是`BeanNameAware`>`BeanFactoryAware`>`ApplicationContextAware`；**