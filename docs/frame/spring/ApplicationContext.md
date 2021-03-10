

## ApplicationContext总结

### 概述

ApplicationContext 容器上下文，包含了 BeanFactory 的所有功能，还额外提供了以下功能：

- MessageSource，提供国际化的消息访问
- 资源访问，如 URL 和文件
- 事件传播

所以 ApplicationContext 比 BeanFactory 优先。

### 工具类


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

