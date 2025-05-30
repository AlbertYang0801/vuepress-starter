# Spring自定义注解扫描

## Spring管理的类

以下两种方式都可以实现。

### 使用@ComponentScan + Bean定义

```java
@Configuration
@ComponentScan(basePackages = {"your.package.to.scan"}) // 指定要扫描的包
public class AppConfig {

    @Autowired
    private ListableBeanFactory beanFactory;

    @PostConstruct
    public void processAnnotatedBeans() {
        String[] beanNames = beanFactory.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
            if (beanDefinition.getSource() instanceof StandardMethodMetadata) {
                StandardMethodMetadata metadata = (StandardMethodMetadata) beanDefinition.getSource();
                Annotation[] annotations = metadata.getAnnotations();
                for (Annotation annotation : annotations) {
                    if (annotation.annotationType().equals(MyCustomAnnotation.class)) {
                        Class<?> beanClass = beanFactory.getType(beanName);
                        System.out.println("Found annotated class: " + beanClass.getName());
                        // 这里可以进一步处理
                    }
                }
            }
        }
    }
}
```

### BeanPostProcessor

每个类在初始化完成之后会执行`BeanPostProcessor`

```java
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        Class<?> beanClass = bean.getClass();
        if (beanClass.isAnnotationPresent(MyCustomAnnotation.class)) {
            MyCustomAnnotation annotation = beanClass.getAnnotation(MyCustomAnnotation.class);
            System.out.println("Bean with custom annotation: " + beanClass.getName());
            // 这里可以进一步处理注解信息
        }
        return bean;
    }

    // postProcessAfterInitialization 方法也可以根据需要实现
}
```

### 自定义注解 - MyRpcServerInterface

```java
@Retention(RetentionPolicy.RUNTIME) // 使注解在运行时可见
@Target(ElementType.TYPE) // 表示该注解可以应用于类上
public @interface MyRpcServerInterface {

    /**
     * 方法名（接口类手动指定，防止注解扫描到 impl）
     */
    String className() default "";

}

```

## 接口类

没有被 Spring 管理的类，比如 Feign 接口。

需要根据路径扫描，然后获取类之后，添加到 Spring 容器中。

### 开关类 - `EnableRpcClients`

首先自定义一个开关注解，import `RpcClientsRegistrar`类

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(RpcClientsRegistrar.class) //import，该类生效
public @interface EnableRpcClients {

}
```

### 注册类 - `RpcClientsRegistrar`

继承 ImportBeanDefinitionRegistrar 类，在 import 时候会生效。

> 参考 FeignClientsRegistrar，Feign 的场景就是接口类扫描。
> 
- 扫描包，获取包含指定注解 MyRpcClient 的类。
- 将类进行动态代理。
- 将动态代理后的类注入到 Spring 容器中。

```java
@Component
@Slf4j
public class RpcClientsRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware, EnvironmentAware {

    private ResourceLoader resourceLoader;

    private Environment environment;

    @Autowired
    ApplicationContext applicationContext;

    /**
     * 实现ImportBeanDefinitionRegistrar的方法，在配置类 import 时生效
     *
     * @param importingClassMetadata
     * @param registry
     * @param importBeanNameGenerator
     */
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry, BeanNameGenerator importBeanNameGenerator) {
        registerRpcClients(importingClassMetadata, registry);
    }

    public void registerRpcClients(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        //资源加载器，扫描包
        ClassPathScanningCandidateComponentProvider scanner = getScanner();
        scanner.setResourceLoader(this.resourceLoader);
        //扫描类路径
        Set<String> basePackages = getBasePackages(metadata);
        //扫描指定注解
        AnnotationTypeFilter annotationTypeFilter = new AnnotationTypeFilter(MyRpcClient.class);
        scanner.addIncludeFilter(annotationTypeFilter);

        for (String basePackage : basePackages) {
            //获取当前包下符合条件的BeanDefinition
            Set<BeanDefinition> candidateComponents = scanner.findCandidateComponents(basePackage);
            for (BeanDefinition bean : candidateComponents) {
                try {
                    //获取接口Class
                    Class<?> clazz = Class.forName(bean.getBeanClassName());
                    //必须是接口加 MyRpcClient 注解
                    if (clazz.isInterface() && clazz.isAnnotationPresent(MyRpcClient.class)) {
                        // 获取注解
                        MyRpcClient annotation = clazz.getAnnotation(MyRpcClient.class);
                        log.info(" MyRpcClient 接口名 {} 加载进来 {}", clazz.getName(), annotation.value());
                        //加到 Spring 容器
                        BeanDefinitionBuilder beanDefinitionBuilder =
                                //动态代理
                                BeanDefinitionBuilder.genericBeanDefinition(clazz, () -> getRemoteProxyObject(clazz, annotation.value()));
                        beanDefinitionBuilder.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
                        BeanDefinition beanDefinition = beanDefinitionBuilder.getBeanDefinition();
                        //注册单例bean
                        registry.registerBeanDefinition(annotation.value(), beanDefinition);
                    }
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    protected ClassPathScanningCandidateComponentProvider getScanner() {
        return new ClassPathScanningCandidateComponentProvider(false, this.environment) {
            @Override
            protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
                boolean isCandidate = false;
                if (beanDefinition.getMetadata().isIndependent()) {
                    if (!beanDefinition.getMetadata().isAnnotation()) {
                        isCandidate = true;
                    }
                }
                return isCandidate;
            }
        };
    }

    protected Set<String> getBasePackages(AnnotationMetadata importingClassMetadata) {
        Set<String> basePackages = new HashSet<>();
        //EnableRpcClients 类路径
        basePackages.add(ClassUtils.getPackageName(importingClassMetadata.getClassName()));
        return basePackages;
    }

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    /**
     * 对接口进行动态代理
     * 最终调用实现了 InvocationHandler 的 DynProxy 类
     *
     * @param serviceInterface
     * @param <T>
     * @return
     */
    public <T> T getRemoteProxyObject(final Class<?> serviceInterface, String annotationValue) {
        return (T) Proxy.newProxyInstance(serviceInterface.getClassLoader(), new Class<?>[]{serviceInterface},
                new DynProxy(annotationValue));
    }

}

```

代理类：

```java
public class DynProxy implements InvocationHandler {

    private final String annotationValue;

    public DynProxy(String annotationValue) {
        this.annotationValue = annotationValue;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //组装 body
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("className", annotationValue);
        dataMap.put("methodName", method.getName());
        dataMap.put("paramType", method.getParameterTypes());
        dataMap.put("param", args);
        //调用远程服务
        //懒加载模式
        return SpringUtil.getBean(ClientBusiHandler.class).send(dataMap);
    }

}

```

### 自定义注解 - MyRpcClient

```java
@Retention(RetentionPolicy.RUNTIME) // 使注解在运行时可见
@Target(ElementType.TYPE) // 表示该注解可以应用于类上
public @interface MyRpcClient {

    /**
     * 服务名
     */
    String value() default "";

}

```