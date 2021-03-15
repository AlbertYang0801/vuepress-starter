
## Spring 中 Bean 加载流程

### 流程图

有待补充。

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210315164906.png)

### 创建流程

1. 加载 `ApplicationContext` 上下文环境。
2. `ApplicationContext` 通过扫描、读取配置，将 Bean对象封装为 `BeanDefinition` 对象，并注册到 `BeanDefinitionMap` 中。
3. 在 `ApplicationContext` 执行完成之后会调用对应的后置处理器 `BeanFactoryProcessor` 和其子类 `BeanDefinitionRegistryPostProcessor ` 对应方法，可以修改和注册 `BeanDefinition` 到 `BeanDefinitionMap`。
4. 到这一步，存放类定义的 `BeanDefinitionMap` 注册完成。
5. 调用 `BeanFactory` 容器创建 Bean，因为 `BeanFactory` 才是创建 Bean 的容器，在调用之前会做判断是否符合创建条件，此时会对 `FactoryBean` 类型的 Bean 作处理。
6. 满足条件的调用 `BeanFactory` 的 `getBean()` 方法，继续调用 `doGetBean` 方法。
7. 首先会先判断单例池中是否已经存在 Bean，若不存在则会调用`createBean()` 方法。
8. `createBean()` 的方法对应的就是 `IOC中Bean的创建流程`。



### IOC中Bean的创建流程

1. 调用`createBean()` 方法，执行对应的后置处理器 `BeanPostProcessor` 方法。
2. 执行 Bean 的实例化，Spring 内部通过 `反射  `的方式实例化 Bean。（`BeanDefinition` 里面保存了 Bean 的 `ClassnName` 信息）
3. 将 Bean 内部属性注入到 Bean 的实例化对象，比如 `@Autowired` 和 `@Value ` 注解对应的属性注入。（这一步骤会发生 `循环依赖`，Spring 内部通过 `三级缓存` 来解决）
4. 进行 Bean 的初始化操作。对应 `@PostConstruct` 注解和实现了 `initializingBean ` 接口等初始化方式 。
   - 调用 `@PostConstruct` 注解标注的方法。
   - 调用实现 `initializingBean` 接口重写的 `afterPropertiesSet()` 方法。
   - 调用一下 调用 `Aware` 包装方法。
5. 在上述每个步骤完成之后会调用对应的 `BeanPostProcessors()` 后置方法，提供Bean创建的扩展和功能的解耦合。
6. 初始化完成之后，会将生成的 Bean 实例添加到  单例池（一级缓存)  中。
7. 执行 AOP 方法。

源码位置：`AbstractApplicationContext` 类的 261行

### 相关解释

#### 1、BeanDefinition

`BeanDefinition` 对象为 Bean 的定义，包含了 Bean 的  `ClassName`（用于实例化时的反射）、Bean 的作用域、是否懒加载等信息。Bean 在代码层面其实对应的就是 `BeanDefinition`。

```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
    String SCOPE_SINGLETON = "singleton";
    String SCOPE_PROTOTYPE = "prototype";
    int ROLE_APPLICATION = 0;
    int ROLE_SUPPORT = 1;
    int ROLE_INFRASTRUCTURE = 2;

    void setParentName(@Nullable String var1);

    @Nullable
    String getParentName();

    void setBeanClassName(@Nullable String var1);

    @Nullable
    String getBeanClassName();

    void setScope(@Nullable String var1);

    @Nullable
    String getScope();

    void setLazyInit(boolean var1);

    boolean isLazyInit();

    void setDependsOn(@Nullable String... var1);

    @Nullable
    String[] getDependsOn();

    void setAutowireCandidate(boolean var1);

    boolean isAutowireCandidate();

    void setPrimary(boolean var1);

    boolean isPrimary();

    void setFactoryBeanName(@Nullable String var1);

    @Nullable
    String getFactoryBeanName();

    void setFactoryMethodName(@Nullable String var1);

    @Nullable
    String getFactoryMethodName();

    ConstructorArgumentValues getConstructorArgumentValues();

    default boolean hasConstructorArgumentValues() {
        return !this.getConstructorArgumentValues().isEmpty();
    }

    MutablePropertyValues getPropertyValues();

    default boolean hasPropertyValues() {
        return !this.getPropertyValues().isEmpty();
    }

    void setInitMethodName(@Nullable String var1);

    @Nullable
    String getInitMethodName();

    void setDestroyMethodName(@Nullable String var1);

    @Nullable
    String getDestroyMethodName();

    void setRole(int var1);

    int getRole();

    void setDescription(@Nullable String var1);

    @Nullable
    String getDescription();

    ResolvableType getResolvableType();

    boolean isSingleton();

    boolean isPrototype();

    boolean isAbstract();

    @Nullable
    String getResourceDescription();

    @Nullable
    BeanDefinition getOriginatingBeanDefinition();
}
```

#### 2、BeanDefinitionMap

存放 `BeanDefinition` 对象。key 是 BeanName，value 是 `BeanDefinition` 对象。

```java
//源码片段
private final Map<String, BeanDefinition> beanDefinitionMap;

beanDefinitionMap.put(beanName, beanDefinition);
```

#### 3、BeanFactoryProcessor

Bean工厂的后置处理器，可重写 `postProcessBeanFactory()` 方法，参数为 `BeanFactory` 子类。可以获取工厂，然后操作工厂内的对象。可插拔，可以通过注解控制使用与否。

```java
@Component
public class MyBeanFactoryPostProcessorsDemo implements BeanFactoryPostProcessor {
    /**
     * BeanFactory的后置处理器
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) throws BeansException {
        ScannedGenericBeanDefinition car = (ScannedGenericBeanDefinition) factory.getBeanDefinition("car");
        //修改Bean的BeanDefinition
        car.setBeanClass(Tank.class);
    }


}
```

#### 4、BeanDefinitionRegistryPostProcessor

`BeanDefinition` 注册处理器，可以手动注册 `BeanDefinition` 对象。可插拔，可以通过注解控制使用与否。

```java
@Component
public class MyBeanFactoryPostProcessorsDemo implements BeanDefinitionRegistryPostProcessor {
  
    /**
     * BeanDefinition的后置处理器
     */
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanDefinitionRegistry) throws BeansException {
        RootBeanDefinition rootBeanDefinition = new RootBeanDefinition();
        rootBeanDefinition.setBeanClass(Car.class);
        beanDefinitionRegistry.registerBeanDefinition("car2",rootBeanDefinition);
    }


}
```

#### 5、单例池（一级缓存）

真正存放 Bean实例的地方。key是 BeanName，value 是 Bean 实例。

```java
private final Map<String, Object> singletonObjects = new ConcurrentHashMap(256);

singletonObjects.put(beanName, singletonObject);
```

