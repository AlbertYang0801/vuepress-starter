# Spi机制

SPI机制，全称Service Provider Interface，是Java提供的一种标准的服务发现机制。它允许第三方服务提供者扩展某个接口的实现，而无需修改接口的源代码或重新打包。

Spring SPI机制常用于 starter 构建和基础库实现。

通过 spi 机制，确保自动配置生效的类包含 FileAutoConfiguration

![](https://s2.loli.net/2025/05/30/bd8fDigzmZ5pGjV.png)

使用 SPI可以可插拔的注入配置，比如 `EnableAutoConfiguration`，如果需要 MinIO的配置类，加在类里面即可开启MinIO的功能。

[www.jb51.net](https://www.jb51.net/article/280443.htm)

[SPI机制是什么？_java_会飞的IT蜗牛-华为云开发者联盟](https://huaweicloud.csdn.net/63874ededacf622b8df8a9b9.html?spm=1001.2101.3001.6650.6&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Eactivity-6-123450610-blog-123956861.235%5Ev43%5Epc_blog_bottom_relevance_base4&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Eactivity-6-123450610-blog-123956861.235%5Ev43%5Epc_blog_bottom_relevance_base4&utm_relevant_index=13)

## JDK-SPI

Service Provider Interface，是JDK提供的服务提供发现机制，能够**动态的替换接口实现。**

接口的实现由 provider 实现，provider 只用在提交的 jar 包里的`META-INF/services`下根据平台定义的接口新建文件，并添加进相应的实现类内容就好。

### 接口实现类

![](https://s2.loli.net/2025/05/30/aJXxP2FBnCINwZ4.png)

![](Spring0c673815-8e8c-4dca-ab06-1de85f1373ccSpi%E6%9C%BA%E5%88%B6c5fb8f0c-19c9-4443-b6f0-58d9a65b7427image_2.png)

### service配置

![](https://s2.loli.net/2025/05/30/8Huo64GdT1C3ANR.png)

JVM在加载类之前，会先扫描 `META-INF/services`下面的类，扫描全路径类名，通过反射加载到JVM中。

### Ck源码中的SPI

实现了 Driver，并且指定了实现类。

![](https://s2.loli.net/2025/05/30/Q34pWZD8g1lbxrF.png)

![](https://s2.loli.net/2025/05/30/cvsGMBaWjKN965X.png)

## Spring-SPI

SpringFramework中的SPI比JDK原生的SPI更高级实用，**因为它不仅限于接口或抽象类，而可以是任何一个类、接口或注解**。
SpringBoot中大量用到SPI机制加载自动配置类和特殊组件等（如`@EnableAutoConfiguration`）。

### 规范

- SPI文件必须放在项目的META-INF目录下。
- 文件名必须命名为 `spring.factories` (实际上是一个properties文件)。
- 文件内容：被检索的类/接口/注解的全限定名作为properties的key，具体要检索的类的全限定名作为value，多个类之间用英文逗号隔开。

### SPI机制原理

```java
// 规定SPI文件名称及位置
public static final String FACTORIES_RESOURCE_LOCATION = "META-INF/spring.factories";
// 存储SPI机制加载的类及其映射
private static final Map<ClassLoader, MultiValueMap<String, String>> cache = new ConcurrentReferenceHashMap<>();

public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
    String factoryTypeName = factoryType.getName();
    // 利用缓存机制提高加载速度
    return loadSpringFactories(classLoader).getOrDefault(factoryTypeName, Collections.emptyList());
}

private static Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader) {
    // 解析之前先检查缓存，有则直接返回
    MultiValueMap<String, String> result = cache.get(classLoader);
    if (result != null) {
        return result;
    }
    try {
        // 真正的加载动作，利用类加载器加载所有的spring.factories（多个，包括我们自定义框架本身自带的），并逐个配置解析
        Enumeration<URL> urls = (classLoader != null ?
            classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
            ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));
        result = new LinkedMultiValueMap<>();
        while (urls.hasMoreElements()) {
            // 提取出每个spring.factories文件
            URL url = urls.nextElement();
            UrlResource resource = new UrlResource(url);
            // 以properties的方式读取
            Properties properties = PropertiesLoaderUtils.loadProperties(resource);
            for (Map.Entry<?, ?> entry : properties.entrySet()) {
                // 逐个收集key和value
                String factoryTypeName = ((String) entry.getKey()).trim();
                // 如果一个key配置了多个value，使用英文逗号分割
                for (StrinfactoryImplementationName:StringUtils.commaDelimitedListToStringArray((Strinentry.getValue())) {
                    result.add(factoryTypeName, factoryImplementationName.trim());
                }
            }
        }
        // 存入缓存中
        cache.put(classLoader, result);
        return result;
    } catch (IOException ex) {
        throw new IllegalArgumentException("Unable to load factories from location ["+
			FACTORIES_RESOURCE_LOCATION + "]", ex);
    }
}

```

### 自动注入Redis的配置

Spi设置配置类

> 如果想关闭redis整体功能，直接在该配置文件删掉配置即可。不需要修改源代码，实现解耦。
> 

![](https://s2.loli.net/2025/05/30/wt2R3fVKLkdgc6H.png)

配置类加载redis相关配置

![](https://s2.loli.net/2025/05/30/xOjSn3EWRkHIw2N.png)

### 源码中的SPI

一般 starter 中很多，可以动态覆盖是否开启配置。

### Arthas

![](https://s2.loli.net/2025/05/30/kCcZ8iPBTjVN5FG.png)