# Spring中Bean加载流程

### 流程图

![](https://s2.loli.net/2025/05/30/TJOI2v3Vabmi1gM.png)

![](https://s2.loli.net/2025/05/30/IidkmZsHKcyuMFA.png)

![](https://s2.loli.net/2025/05/30/36BlinrzPkRgQSH.png)

### 创建流程

1. 加载 `ApplicationContext` 上下文环境。
2. `ApplicationContext` 通过扫描、读取配置，将 Bean对象封装为 `BeanDefinition` 对象，并注册到 `BeanDefinitionMap` 中。
3. 在 `ApplicationContext` 执行完成之后会调用对应的后置处理器 `BeanFactoryProcessor` 和其子类 `BeanDefinitionRegistryPostProcessor` 对应方法，可以修改和注册 `BeanDefinition` 到 `BeanDefinitionMap`。
4. 到这一步，存放类定义的 `BeanDefinitionMap` 注册完成。
5. 调用 `BeanFactory` 容器创建 Bean，因为 `BeanFactory` 才是创建 Bean 的容器，在调用之前会做判断是否符合创建条件，此时会对 `FactoryBean` 类型的 Bean 作处理。
6. 满足条件的调用 `BeanFactory` 的 `getBean()` 方法，继续调用 `doGetBean` 方法。
7. 首先会先判断单例池中是否已经存在 Bean，若不存在则会调用`createBean()` 方法。
8. `createBean()` 的方法对应的就是 `IOC中Bean的创建流程`。

### IOC中Bean的创建流程

1. 调用`createBean()` 方法，执行对应的后置处理器 `BeanPostProcessor` 方法。
2. 执行 Bean 的实例化，Spring 内部通过 `反射` 的方式实例化 Bean。（`BeanDefinition` 里面保存了 Bean 的 `ClassnName` 信息）
3. 将 Bean 内部属性注入到 Bean 的实例化对象，比如 `@Autowired` 和 `@Value` 注解对应的属性注入。（这一步骤会发生 `循环依赖`，Spring 内部通过**`三级缓存`**来解决）
4. 进行 Bean 的初始化操作。对应 `@PostConstruct` 注解和实现了 `initializingBean` 接口等初始化方式 。
    - 调用 `@PostConstruct` 注解标注的方法。
    - 调用实现 `initializingBean` 接口重写的 `afterPropertiesSet()` 方法。
    - 调用 `Aware` 包装方法。
5. 在上述每个步骤完成之后会调用对应的 `BeanPostProcessors()` 后置方法，提供Bean创建的扩展和功能的解耦合。
6. 判断 Bean 是否需要被 AOP 增强（查找切面，匹配当前类），如果需要 AOP，则进行动态代理生成代理对象。
7. 初始化完成之后，会将生成的 Bean 实例添加到 单例池（一级缓存) 中。
    - 如果类进行了 AOP，则将代理对象放入单例池，使用该 Bean 时，使用的都是增强后的代理对象。
    - 如果Bean类型是原型（Prototype）类，不会放到单例池中。下次 getBean 会创建一个新的对象。

源码位置：`AbstractApplicationContext` 类的 261行

1. 利用该类的构造方法来实例化得到一个对象（但是如何一个类中有多个构造方法，Spring则会进行选择，这个叫做**推断构造方法**）
2. 得到一个对象后，Spring会判断该对象中是否存在被@Autowired注解了的属性，把这些属性找出来并由Spring进行赋值（**依赖注入**）
3. 依赖注入后，Spring会判断该对象是否实现了BeanNameAware接口、BeanClassLoaderAware接口、BeanFactoryAware接口，如果实现了，就表示当前对象必须实现该接口中所定义的setBeanName()、setBeanClassLoader()、setBeanFactory()方法，那Spring就会调用这些方法并传入相应的参数（**Aware回调**）
4. Aware回调后，Spring会判断该对象中是否存在某个方法被@PostConstruct注解了，如果存在，Spring会调用当前对象的此方法（**初始化前**）
5. 紧接着，Spring会判断该对象是否实现了InitializingBean接口，如果实现了，就表示当前对象必须实现该接口中的afterPropertiesSet()方法，那Spring就会调用当前对象中的afterPropertiesSet()方法（**初始化**）
6. 最后，Spring会判断当前对象需不需要进行AOP，如果不需要那么Bean就创建完了，如果需要进行AOP，则会进行动态代理并生成一个代理对象做为Bean（**初始化后**）

### 相关解释

### 1、BeanDefinition

`BeanDefinition` 对象为 Bean 的定义，包含了 Bean 的 `ClassName`（用于实例化时的反射）、Bean 的作用域、是否懒加载等信息。Bean 在代码层面其实对应的就是 `BeanDefinition`。

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

### 2、BeanDefinitionMap

存放 `BeanDefinition` 对象。key 是 BeanName，value 是 `BeanDefinition` 对象。

```java
//源码片段
private final Map<String, BeanDefinition> beanDefinitionMap;

beanDefinitionMap.put(beanName, beanDefinition);
```

### 3、BeanFactoryProcessor

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

### 4、BeanDefinitionRegistryPostProcessor

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

### 5、单例池（一级缓存）

真正存放 Bean实例的地方。key是 BeanName，value 是 Bean 实例。

```java
private final Map<String, Object> singletonObjects = new ConcurrentHashMap(256);

singletonObjects.put(beanName, singletonObject);
```