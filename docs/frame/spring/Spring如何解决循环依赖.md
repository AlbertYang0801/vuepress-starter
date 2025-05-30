# Spring如何解决循环依赖

## 依赖注入的四种方法

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

其中构造方法注入和工厂方法注入是强依赖，因为Bean创建和属性注入放到一起了。

比如构造方法注入，创建对象的同时进行属性注入，这种属于强依赖。

而强依赖是解决不了循环依赖的问题的，因为创建对象和属性注入属于一体不可分的。

我们解决循环依赖是先创建对象，然后属性注入的时候利用三级缓存解决的。

## 循环依赖分析

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373ccSpring%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%BE%AA%E7%8E%AF%E4%BE%9D%E8%B5%963adb8787-2ee9-4cd4-abd7-ce590478b45620210315164906.png)

在创建 Bean 的过程中，有依赖注入的过程。

这个阶段会发生循环依赖。

*ABean创建–>依赖了B属性–>触发BBean创建—>B依赖了A属性—>需要ABean（但ABean还在创建过程中）*

## 依赖场景

1. 构造器注入循环依赖
    
    ```java
    @Service
    public class A {
        public A(B b) {
        }
    }
    
    @Service
    public class B {
        public B(A a) {
        }
    }
    
    //A a = new A(new B(new A(new B(new A()))));
    ```
    
    **构造器的循环依赖Spring是无法解决的。**
    
    因为Spring解决循环依赖是在对象实例化之后，依赖注入时解决的。
    
    构造器对应的是**实例化阶段**，无法解决循环依赖。
    
    强依赖是无法解决循环依赖的问题的，因为Bean对象创建和属性注入是一个阶段。我们解决循环依赖是分为两个阶段，创建对象和属性注入，在属性注入时可以解决循环依赖。
    
2. 依赖注入
    
    利用三级缓存可以解决。
    
    ```java
    @Service
    public class A {
        @Autowired
        private B b;
    }
    
    @Service
    public class B {
        @Autowired
        private A a;
    }
    ```
    
3. Prototype类的循环依赖
    
    无法解决，因为 Prototype作用域的类不会放到缓存中，Spring通过缓存解决循环依赖。
    

## 懒加载

### 懒加载的工作原理

当一个懒加载的 bean需要被初始化时，Spring会创建一个代理对象（通常是CGLIB 字节码动态代理）。

这个代理对象可以在其它类需要的时候，通过代理对象调用实际对象的方法。

而实际Bean在第一次使用的时候才会创建。

### 使用方式

@Lazy

## 三级缓存

Spring引入三级缓存解决依赖注入和set方法注入可能导致的循环依赖

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373ccSpring%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%BE%AA%E7%8E%AF%E4%BE%9D%E8%B5%963adb8787-2ee9-4cd4-abd7-ce590478b456image.png)

- `singletonObjects`
    
    单例池，缓存的是已经**经历了完整生命周期的Bean对象**。
    
    **已经实例化并且已经属性赋值。**
    
- `earlySingletonObjects`
    
    二级缓存，缓存的是**早期的 Bean 对象**，Bean的生命周期还没走完就放入了二级缓存。
    
    **已经实例化但是还未属性赋值。可以存放原对象，也可能存放代理对象。**
    
- `singletonFactories`
    
    三级缓存，缓存的是ObjectFactory，表示对象工厂，用来创建早期 Bean对象的工厂，可以通过该工厂创建出代理对象。
    

### 为什么引入二级缓存

在循环依赖场景 A→B→A 中，实例化之后将A对象放到二级缓存中，这样 B 需要引用 A 时，从二级缓存获取就可以了。

Bean 实例化之后，整个 Bean生命周期 **Bean对象的堆内存地址都不会改变**。所以 B依赖的A（缓存）和走完生命周期的 A是一个对象。

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373ccSpring%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%BE%AA%E7%8E%AF%E4%BE%9D%E8%B5%963adb8787-2ee9-4cd4-abd7-ce590478b456image_1.png)

### 为什么引入三级缓存

为了解决 AOP对象引入三级缓存。

Bean创建的生命周期可以简化为 **实例化 → 依赖注入 → AOP**。

AOP之后 Bean 实际上生成了一个代理对象，该代理对象和二级缓存里面存放的对象不是一个对象。这样就会导致 B 依赖的是 A的原始对象，但是需要的是 A的代理对象。

### 三级缓存的内容

三级缓存，缓存的是ObjectFactory，其实就是 一个函数式接口。

`() -> getEarlyBeanReference(beanName, mbd,bean)`

作用是能通过该函数获取一个对象的代理对象。

- 如果对象有 AOP，返回的就是 AOP 之后的代理对象。
- 如果对象没有 AOP，返回原对象。

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373ccSpring%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%BE%AA%E7%8E%AF%E4%BE%9D%E8%B5%963adb8787-2ee9-4cd4-abd7-ce590478b456image_2.png)

注意：调用该函数不是在放入三级缓存的时候。

### 三级缓存的执行流程

1. A 实例化。
2. 将 A 对应的 `ObjectFactory` 放入三级缓存中。
3. 依赖 B → 创建B → 实例化 B → 依赖 A。
    1. 从三级缓存获取 A 对应的 ObjectFactory。
    2. 通过 ObjectFactory 获取代理对象 A+(如果没有AOP，A+就是原对象)。
    3. 将代理对象 A+ 放到二级缓存，并且移除三级缓存中对应的 `ObjectFactory`。
    4. B 读取二级缓存中的 A+，完成依赖注入。
    5. 清除二级缓存中的 B，然后将 B 放到一级缓存。
4. B 注入完成之后，A完成依赖注入。
5. 继续 A 的生命周期。
6. 判断 A 是否需要 AOP。
- 如果需要 AOP，从二级缓存（earlySingletonObjects）中获取对象 A+，放入一级缓存。
- 如果不需要 AOP，将 A 放入一级缓存，并从二级缓存移除 A。