# IOC

其中构造方法注入和工厂方法注入是强依赖，因为Bean创建和属性注入放到一起了。

比如构造方法注入，创建对象的同时进行属性注入，这种属于强依赖。

而强依赖是解决不了循环依赖的问题的，因为创建对象和属性注入属于一体不可分的。

我们解决循环依赖是先创建对象，然后属性注入的时候利用三级缓存解决的。

```java
    public BeanTest(@Value("spring.port") String port, String name) {
        System.out.println(port);
    }
```

IOC容器有两类，BeanFactory 和 ApplicationContext。

- BeanFactory 延迟创建 Bean。
- ApplicationContext 启动时初始化所有 Bean。

Summer Framework也仅实现Annotation配置+`@ComponentScan`扫描方式完成容器的配置。

## 扫描类 - ResourceResolver

1. 扫描指定文件夹下的所有类
2. 扫描指定jar包下的所有类

## 配置项注入 - PropertyResolver

- 加载配置文件 application.properties 里面的配置项到内存中。
- 扫描@Value注解

> 注解类似标识，给类或者方法增加注解标识，后续通过扫描注解可以实现注解具体的功能。
> 

## 扫描Bean

1. 扫描指定包下所有的类
    - 扫描@Component下所有的类
    - 扫描@Import导入的类
2. 加载需要放入容器的Bean
    - 扫描加了@Component注解的类
    - 扫描加了@Configuration的类
        - 同时扫描配置类里面加了@Bean注解的方法，作为Bean注入。
            
            ```java
            //扫描Configuration注解
            Configuration configuration = ClassUtils.findAnnotation(clazz, Configuration.class);
            if (configuration != null) {
                //扫描Configuration注解里面的@Bean
                scanFactoryMethods(beanName, clazz, defs);
             }
            
            var def = new BeanDefinition(ClassUtils.getBeanName(method), beanClass, factoryBeanName, method, getOrder(method),
                                    method.isAnnotationPresent(Primary.class),
                                    // init method:
                                    bean.initMethod().isEmpty() ? null : bean.initMethod(),
                                    // destroy method:
                                    bean.destroyMethod().isEmpty() ? null : bean.destroyMethod(),
                                    // @PostConstruct / @PreDestroy method:
                                    null, null);
            ```
            

### @Bean注入

可以指定该Bean 注入，同时指定 initMethod 和 destroyMethod 方法。

注入的Bean可以是普通 Java 类。

```java
@Configuration
public class AppConfig {

    /**
     * @Configuration扫描注入Bean的同时，会扫描该类的所有方法
     * 将加了@Bean注解的方法也注入进来
     * methodName作为BeanName，返回值作为BeanClass
     * @param helloService
     * @return
     */
    @Bean(initMethod = "init",destroyMethod = "destory")
    public HelloB hello(@Autowired HelloService helloService) {
        return new HelloB(helloService);
    }

}
```

## 创建 BeanDefinition

### BeanDefinition

```java
public class BeanDefinition {

    //全局唯一 beanName
    String name;

    //Bean声明类型
    //声明类型和实际类型有区别
    Class<?> beanClass;

    //Bean实例对象
    Object instance = null;

    //构造方法
    Constructor<?> constructor = null;

    //工厂方法名称
    String factoryName = null;

    //工厂方法
    String factoryMethod = null;

    //Bean顺序
    int order;

    //是否标识@Primary
    //类型相同的Bean，配置了该注解的优先使用
    boolean primary;

    String initMethodName;

    String destroyMethodName;

    //init/destroy方法
    //对应 @PostConstruct和 @PreDestroy 方法
    Method initMethod;
  
    Method destroyMethod;

}
```

- beanClass是声明类型
    
    比如DataSource是声明类型，但是Bean的实际类型是它的子类 HikariDataSource。
    
    不过BeanDefinition中需要的是声明类型，因为实际类型可以通过 bean.getClass 直接获得：
    
    ```java
        @Bean(initMethod="init", destroyMethod="close")
        DataSource createDataSource() {
            return new HikariDataSource(...);
        }
    ```
    
- Order
    
    相同 Class 类型 Bean 设置执行顺序
    
    ```java
        public List<BeanDefinition> findBeanDefinitions(Class<?> type) {
            return this.beans.values().stream()
                    //类型过滤
                    //isAssignableFrom()方法用于判断当前Class对象所表示的类或接口是否可以被指定的另一个Class对象所表示的类或接口所赋值。
                    .filter(def -> type.isAssignableFrom(def.getBeanClass()))
                    .sorted().collect(Collectors.toList());
        }
    ```
    
    ```java
        @Override
        public int compareTo(BeanDefinition definition) {
            //比较order
            int compare = Integer.compare(this.order, definition.getOrder());
            if (compare != 0) {
                return compare;
            }
            //order相同再比较name
            return this.name.compareTo(definition.getName());
        }
    ```
    
- primary
    
    类型相同的Bean，优先使用加了该注解的Bean。
    
    - 类型相同的Bean只允许指定一个@primary。
    - 获取到之后只将标注了@primary的Bean返回。
    
    ```java
    @Nullable
        public BeanDefinition findBeanDefinition(Class<?> type) {
            //查询某个类型下所有Bean，包含子类、实现类
            List<BeanDefinition> beanDefinitions = findBeanDefinitions(type);
            if (beanDefinitions.isEmpty()) {
                return null;
            }
            //找到唯一一个Bean
            if (beanDefinitions.size() == 1) {
                return beanDefinitions.getFirst();
            }
            //more than 1 beans,require @Primary
            List<BeanDefinition> primaryDefs = beanDefinitions.stream().filter(BeanDefinition::isPrimary).toList();
            //@Primary唯一标注的Bean
            if (primaryDefs.size() == 1) {
                return primaryDefs.getFirst();
            }
            if (primaryDefs.isEmpty()) {
                throw new NoUniqueBeanDefinitionException(String.format("Multiple bean with type '%s' found, but no @Primary specified.", type.getName()));
            } else {
                throw new NoUniqueBeanDefinitionException(String.format("Multiple bean with type '%s' found, and multiple @Primary specified.", type.getName()));
            }
        }
    ```
    

### 工厂方法和工厂名称

在Spring里面，加了@Configuration注解的类就是一个工厂类。

加了@Bean的方法都是一个工厂方法，对应一个Bean。

> 也就是说@Configuration的类需要遍历注入多个Bean，在创建普通Bean之前要先把@Configuration对应的工厂类创建出来。
> 

```java
void scanFactoryMethods(String factoryBeanName, Class<?> clazz, Map<String, BeanDefinition> defs) {
        for (Method method : clazz.getDeclaredMethods()) {
            //扫描方法上的@Bean注解
            Bean bean = method.getAnnotation(Bean.class);
            if (bean != null) {
                int mod = method.getModifiers();
                //abstract
                if (Modifier.isAbstract(mod)) {
                    throw new BeanDefinitionException("@Bean method " + clazz.getName() + "." + method.getName() + " must not be abstract.");
                }
                //final
                if (Modifier.isFinal(mod)) {
                    throw new BeanDefinitionException("@Bean method " + clazz.getName() + "." + method.getName() + " must not be final.");
                }
                //private
                if (Modifier.isPrivate(mod)) {
                    throw new BeanDefinitionException("@Bean method " + clazz.getName() + "." + method.getName() + " must not be private.");
                }
                Class<?> beanClass = method.getReturnType();
                if (beanClass.isPrimitive()) {
                    throw new BeanDefinitionException("@Bean method " + clazz.getName() + "." + method.getName() + " must not return primitive type.");
                }
                if (beanClass == void.class || beanClass == Void.class) {
                    throw new BeanDefinitionException("@Bean method " + clazz.getName() + "." + method.getName() + " must not return void.");
                }
                var def = new BeanDefinition(ClassUtils.getBeanName(method), beanClass, factoryBeanName, method, getOrder(method),
                        method.isAnnotationPresent(Primary.class),
                        // init method:
                        bean.initMethod().isEmpty() ? null : bean.initMethod(),
                        // destroy method:
                        bean.destroyMethod().isEmpty() ? null : bean.destroyMethod(),
                        // @PostConstruct / @PreDestroy method:
                        null, null);
                addBeanDefinitions(defs, def);
                log.debug("define bean: {}", def);
            }
        }
    }
```

### 创建逻辑

根据扫描到的 Bean 创建 BeanDefinition。

```java
/**
     * 根据扫描的ClassName创建BeanDefinition
     */
    Map<String, BeanDefinition> createBeanDefinitions(Set<String> classNameSet) {
        Map<String, BeanDefinition> defs = new HashMap<>();
        for (String className : classNameSet) {
            // 反射获取Class
            Class<?> clazz = null;
            try {
                clazz = Class.forName(className);
            } catch (ClassNotFoundException e) {
                throw new BeanCreationException(e);
            }
            //Annotation、enum、interface、record不需要加载
            if (clazz.isAnnotation() || clazz.isEnum() || clazz.isInterface() || clazz.isRecord()) {
                continue;
            }
            // 是否标注@Component?
            Component component = ClassUtils.findAnnotation(clazz, Component.class);
            if (component != null) {
                log.info("found component: " + clazz.getName());
                int mod = clazz.getModifiers();
                if (Modifier.isAbstract(mod)) {
                    throw new BeanDefinitionException("@Component class " + clazz.getName() + " must not be abstract.");
                }
                if (Modifier.isPrivate(mod)) {
                    throw new BeanDefinitionException("@Component class " + clazz.getName() + " must not be private.");
                }

                String beanName = ClassUtils.getBeanName(clazz);
                var def = new BeanDefinition(beanName, clazz, getSuitableConstructor(clazz), getOrder(clazz), clazz.isAnnotationPresent(Primary.class),
                        // named init / destroy method:
                        null, null,
                        // 扫描@PostConstruct注解
                        ClassUtils.findAnnotationMethod(clazz, PostConstruct.class),
                        // 扫描@PreDestroy注解
                        ClassUtils.findAnnotationMethod(clazz, PreDestroy.class));
                addBeanDefinitions(defs, def);
                log.debug("define bean: {}", def);

                //扫描Configuration注解
                Configuration configuration = ClassUtils.findAnnotation(clazz, Configuration.class);
                if (configuration != null) {
                    //扫描Configuration注解里面的@Bean
                    scanFactoryMethods(beanName, clazz, defs);
                }
            }
        }
        return defs;
    }
```

## 创建Bean

### Spring依赖注入

### 依赖注入四种方法

- 构造方法注入
    
    ```java
        public HelloA(@Autowired HelloService helloService) {
            this.helloService = helloService;
        }
    ```
    
- 工厂方法注入
    
    ```java
        @Bean(initMethod = "init", destroyMethod = "destory")
        public HelloB helloB(@Autowired HelloService helloService) {
            return new HelloB(helloService);
        }
    ```
    
- set方法注入
    
    ```java
        @Autowired
        public HelloC setHelloService(HelloService helloService) {
            this.helloService = helloService;
            return this;
        }
    ```
    
- 字段注入
    
    ```java
        @Autowired
        HelloService helloService;
    ```
    

### 循环依赖的问题

其中**构造方法注入和工厂方法注入是强依赖**，因为Bean创建和属性注入放到一起了。

比如构造方法注入，创建对象的同时进行属性注入，这种属于强依赖。

而强依赖是解决不了循环依赖的问题的，因为创建对象和属性注入属于一体不可分的。

我们解决循环依赖是先创建对象，然后属性注入的时候利用三级缓存解决的。

### 带入参的构造方法/工厂方法

构造方法所有参数都需要被Spring管理，不然Spring无法创建Bean实例，因为不知道给入参填充具体什么值。

比如入参包含普通类型字段。

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373cc%E6%89%8B%E5%86%99Spring23fc0f0a-d000-42b6-9681-5aa128214394IOC2502bfa8-c6a2-4991-92c0-277b7f63bb00image.png)

<aside>
💡 所以我们在创建Bean的过程中，需要校验构造方法或者工厂方法的入参，如果没有被Spring管理，Spring不知道应该如何为这个属性提供一个合适的值。因此，它抛出一个BeanCreationException 异常，以指示配置错误。

</aside>

### 入参类型

在Spring中，构造方法和工厂方法注入Bean的时候，入参能使用的注解只包含`@Autowired`和`@Value`。

- `@Autowired`用于依赖注入，即注入其他由Spring管理的bean。
    
    @Autowired 注解是按照类型注入，需要保证容器中只有一个该类型的Bean 或者 就要加`@Primary`注解标识优先使用哪个Bean。
    
    ![](Spring0c673815-8e8c-4dca-ab06-1de85f1373cc%E6%89%8B%E5%86%99Spring23fc0f0a-d000-42b6-9681-5aa128214394IOC2502bfa8-c6a2-4991-92c0-277b7f63bb00image_1.png)
    
- `@Value`用于设置基本类型或字符串类型的值，这些值通常来自配置文件或其他非bean资源。
    
    ```java
        public BeanTest(@Value("${server.port}") String port) {
            System.out.println("spring.port =>" + port);
        }
    ```
    

### 创建Bean的过程

对于IOC容器来说，创建Bean过程分为两步。

1. 创建Bean实例，注入强依赖。
    
    如果遇到循环依赖直接报错，因为解决不了。
    
2. 属性注入
    
    对Bean实例进行属性注入，包括 **set 方法注入** 和 **字段注入**。
    

### 强依赖检测

```java
        //首先进行循环依赖检测
        if (!this.createingBeanNames.add(def.getName())) {
            //重复创建Bean导致的循环依赖
            //强依赖抛出异常
            //比如创建某个Bean的时候，先把Bean添加到set中。然后执行构造方法，触发循环依赖，发现set已经包含了该Bean
            //A->B, B->A
            throw new UnsatisfiedDependencyException();
        }
```

### 创建Bean的方式

先进行第一步，创建Bean实例，注入强依赖。

1. 构造方法创建对象
2. 工厂方法创建对象
    
    @Configuration类里面标注了@Bean注解的方法，都是工厂方法对应的Bean对象。
    
3. 校验 @Configuration类型的Bean。
    
    @Configuration类型的Bean是工厂，不允许使用@Autowired创建:
    
    > 因为会导致潜在的循环依赖，比如 @Configuration->A， A->B, @Configuration里面的@Bean包含B，而B只能在@Configuration初始化之后初始化。
    > 
4. 校验入参
    
    入参要求必须包含`@Autowired`和`@Value`注解，不然就抛出 `BeanCreationException`。
    
5. 解析入参
    - 如果是@Value注入，从PropertyResolver中获取指定配置。
    - 如果是@Autowired注入，则递归创建依赖的Bean的实例。
6. 创建Bean实例

## 初始化Bean

Spring依赖注入的其中两种方式，set方式和字段注入都发生在初始化Bean阶段。

此时Bean实例已经创建出来了，可以给Bean实例进行属性注入了。

### 属性注入

属性需要是`@Value`或`@Autowired`注解修饰。

- static修饰的字段无法注入
- final修饰的字段无法注入。
    
    因为属性注入节点是在创建Bean之后，而final修饰的字段在创建Bean过程已经初始化了。在属性注入节点无法修改其内容。所以不能注入final修饰的字段属性。
    

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373cc%E6%89%8B%E5%86%99Spring23fc0f0a-d000-42b6-9681-5aa128214394IOC2502bfa8-c6a2-4991-92c0-277b7f63bb00image_2.png)

- 注入需要同时注入父类的属性到当前Bean

### 字段属性注入

```java
@Component
public class Test {

    @Autowired
    private HelloA helloA;
    @Value("server.port")
    private String value;

}
```

- 解析@Value注解，获取获取@Value注解真实配置，反射设置为字段真实值。
    
    ```java
            //@Value注入
            if (value != null) {
                //获取@Value注解真实配置
                Object propValue = this.propertyResolver.getRequiredProperty(value.value(), accessibleType);
                if (field != null) {
                    log.debug("Field injection: {}.{} = {}", def.getBeanClass().getName(), accessibleName, propValue);
                    //设置obj的某个字段值
                    field.set(bean, propValue);
                }
                ......
            }
    ```
    
- 解析@Autowired注解
    
    从 BeanDefinition 工厂中，找到注入Bean的实例，作为属性值设置给当前Bean
    
    ```java
    //@Autowired注入
            if (autowired != null) {
                String name = autowired.name();
                boolean required = autowired.value();
                //获取属性对应的Bean实例
                Object depends = name.isEmpty() ? findBean(accessibleType) : findBean(name, accessibleType);
                //bean not found
                if (required && depends == null) {
                    throw new UnsatisfiedDependencyException(String.format("Dependency bean not found when inject %s.%s for bean '%s': %s", clazz.getSimpleName(),
                            accessibleName, def.getName(), def.getBeanClass().getName()));
                }
                if (depends != null) {
                    if (field != null) {
                        log.debug("Field injection: {}.{} = {}", def.getBeanClass().getName(), accessibleName, depends);
                        //属性对应的beanObj，设置为bean的field值
                        field.set(bean, depends);
                    }
                    if (method != null) {
                        log.debug("Mield injection: {}.{} ({})", def.getBeanClass().getName(), accessibleName, depends);
                        //将对象作为入参传入，并执行bean对应的method
                        method.invoke(bean, depends);
                    }
                }
            }
    ```
    

### 方法属性注入

```java
@Component
public class Test {

    private HelloService helloService;
    private String port;

    /**
     * set方法注入
     *
     * @param helloService
     */
    @Autowired
    public Test setHelloService(HelloService helloService) {
        this.helloService = helloService;
        return this;
    }

    /**
     * @Value
     *
     * @param port
     */
    public void setHelloService(@Value("server.port") String port) {
        this.port = port;
    }
  
    @Bean(initMethod = "init")
    SpecifyInitBean createSpecifyInitBean(@Value("${app.title}") String appTitle, @Value("${app.version}") String appVersion) {
        return new SpecifyInitBean(appTitle, appVersion);
    }
    

}
```

- 解析@Value注解，获取获取@Value注解真实配置，作为入参调用方法。
    
    ```java
            //@Value注入
            if (value != null) {
                Object propValue = this.propertyResolver.getRequiredProperty(value.value(), accessibleType);
                 ......
                //@Value在method级别，只能作为入参
                //然后类似执行普通方法一样调用所在方法
                if (method != null) {
                    log.debug("Method injection: {}.{} ({})", def.getBeanClass().getName(), accessibleName, propValue);
                    //调用了obj的method，并传入入参propValue
                    method.invoke(bean, propValue);
                }
            }
    ```
    
- 解析@Autowired注解
    
    从 BeanDefinition 工厂中，找到注入Bean的实例，作为入参调用该Method。
    
    ```java
    //@Autowired注入
            if (autowired != null) {
                String name = autowired.name();
                boolean required = autowired.value();
                //获取属性对应的Bean实例
                Object depends = name.isEmpty() ? findBean(accessibleType) : findBean(name, accessibleType);
                //bean not found
                if (required && depends == null) {
                    throw new UnsatisfiedDependencyException(String.format("Dependency bean not found when inject %s.%s for bean '%s': %s", clazz.getSimpleName(),
                            accessibleName, def.getName(), def.getBeanClass().getName()));
                }
                if (depends != null) {
                    ......
                    if (method != null) {
                        log.debug("Mield injection: {}.{} ({})", def.getBeanClass().getName(), accessibleName, depends);
                        //将对象作为入参传入，并执行bean对应的method
                        method.invoke(bean, depends);
                    }
                }
            }
    ```
    

## BeanPostProcessor

BeanPostProcessor 支持替换 Bean 或者增强 Bean，常被用于AOP场景。

每个Bean在创建的时候都要执行所有的BeanPostProcessor方法。

走完BeanPostProcessor方法后的beanObj有可能改变。这样就会产生BeanName不变，BeanObj改变的情况。

```java
        //调用BeanPostProcessor处理Bean
        //每个Bean在创建的时候要执行所有的BeanPostProcessor方法
        for (BeanPostProcessor beanPostProcessor : beanPostProcessors) {
            //BeanPostProcessor的before方法
            //增强Bean或者AOP
            Object processed = beanPostProcessor.postProcessBeforeInitialization(def.getInstance(), def.getName());
            if (processed == null) {
                throw new BeanCreationException(String.format("PostBeanProcessor returns null when process bean '%s' by %s", def.getName(), processor));
            }
            //如果BeanPostProcessor替换了原始Bean，需要更换Bean的引用。
            //ProxyObj在这里发生了
            if (def.getInstance() != processed) {
                log.debug("Bean '{}' was replaced by post processor {}.", def.getName(), beanPostProcessors.getClass().getName());
                def.setInstance(processed);
            }
        }
```

BeanPostProcessor的用法

```java
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if(bean instanceof StudentService){
            StudentService studentService = (StudentService) bean;
            studentService.setEmail("albert@gmail.com");
            return studentService;
        }
        return BeanPostProcessor.super.postProcessAfterInitialization(bean, beanName);
    }

}
```

### 测试

1. 没有继承关系的类
    - beanName不变，beanType改变
    
    ```java
        /**
         * 测试增强类无继承管理
         * beanName不变，beanType改变
         */
        @Test
        public void testBeanPostProcessor() {
            StudentServiceProxy studentService = SpringUtil.getBean("studentService");
            Assert.assertEquals(studentService.getEmail(),"albert@gmail.com");
            Assert.assertEquals(studentService.getClass().getName(),"com.albert.spring.bean.StudentServiceProxy");
        }
    ```
    
2. 有继承关系的类
    - beanName不变，beanType改变
    - 目前Bean对象对应的是子类，但是通过父类也可以调用到子类实例。
    
    > StudentService已经脱离了IoC容器的管理，因为此时StudentService对应的BeanDefinition中，存放的instance是StudentServiceProxy。
    > 
    
    ```java
        /**
         * 测试存在继承关系
         * beanName不变，beanType改变
         *
         */
        @Test
        public void testBeanPostProcessor2() {
            //java支持向上转型，子类实例可以当作父类实例来使用
            StudentService studentService = SpringUtil.getBean(StudentService.class);
            Assert.assertEquals(studentService.getClass().getName(),"com.albert.spring.bean.StudentServiceProxy");
            Assert.assertEquals(studentService.toString(),"proxy");
            //子类方法
            Assert.assertEquals(studentService.test(),2);
            //obj的字段属性，其实就是proxy的字段。而不是父类的字段属性
            Assert.assertNull(studentService.email);
        }
    ```
    
     
    

### 注入原则

一个Bean如果被Proxy替换。

- 依赖它的Bean应该注入Proxy。
1. ，则依赖它的Bean应注入Proxy，即上图的`MvcController`应注入`UserServiceProxy`；
2. 一个Bean如果被Proxy替换，如果要注入依赖，则应该注入到原始对象，即上图的`JdbcTemplate`应注入到原始的`UserService`。