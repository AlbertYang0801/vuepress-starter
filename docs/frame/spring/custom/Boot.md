# Boot

SpringBoot 内置了 Tomcat，IOC容器和 WebMVC 模块，所以能直接启动。

## 启动类

```java
@Slf4j
public class SummerApplication {

    static final String CONFIG_APP_YAML = "/application.yml";
    static final String CONFIG_APP_PROP = "/application.properties";

    public static void run(String webDir, String baseDir, Class<?> configClass, String... args) throws Exception {
        new SummerApplication().start(webDir, baseDir, configClass, args);
    }

    public void start(String webDir, String baseDir, Class<?> configClass, String... args) throws Exception {
        //printBanner();

        final long startTime = System.currentTimeMillis();
        final int javaVersion = Runtime.version().feature();
        final long pid = ManagementFactory.getRuntimeMXBean().getPid();

        final String user = System.getProperty("user.name");
        final String pwd = Paths.get("").toAbsolutePath().toString();
        log.info("Starting {} using Java {} with PID {} (started by {} in {})", configClass.getSimpleName(), javaVersion, pid, user, pwd);

        PropertyResolver propertyResolver = WebUtils.createPropertyResolver();
        Server server = startTomcat(webDir, baseDir, configClass, propertyResolver);

        // started info:
        final long endTime = System.currentTimeMillis();
        final String appTime = String.format("%.3f", (endTime - startTime) / 1000.0);
        final String jvmTime = String.format("%.3f", ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0);
        log.info("Started {} in {} seconds (process running for {})", configClass.getSimpleName(), appTime, jvmTime);

        server.await();
    }

    /**
     * webDir和baseDir是启动嵌入式Tomcat的参数
     *
     * @param webDir           挂载的webapp路径
     * @param baseDir          tomcat扫描的类路径
     * @param configClass      配置类，供IOC容器扫描
     * @param propertyResolver 属性解析器
     * @return
     */
    private static Server startTomcat(String webDir, String baseDir, Class<?> configClass, PropertyResolver propertyResolver) throws LifecycleException {
        int port = propertyResolver.getProperty("${server.port:8080}", int.class);
        //实例化 tomcat
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.getConnector().setThrowOnFailure(true);
        //添加一个默认的webapp，挂载到"/"
        Context context = tomcat.addWebapp("", new File(webDir).getAbsolutePath());

        WebResourceRoot resources = new StandardRoot(context);
        resources.addPreResources(new DirResourceSet(resources, "/WEB-INF/classes", new File(baseDir).getAbsolutePath(), "/"));
        context.setResources(resources);

        context.addServletContainerInitializer(new ContextLoaderInitializer(configClass, propertyResolver), Set.of());
        tomcat.start();
        return tomcat.getServer();
    }

    protected void printBanner() {
        String banner = ClassPathUtils.readString("/banner.txt");
        banner.lines().forEach(System.out::println);
    }

}
```

## 初始化Servlet容器

```java
@Slf4j
public class ContextLoaderInitializer implements ServletContainerInitializer {

    final Class<?> configClass;
    final PropertyResolver propertyResolver;

    public ContextLoaderInitializer(Class<?> configClass, PropertyResolver propertyResolver) {
        this.configClass = configClass;
        this.propertyResolver = propertyResolver;
    }

    @Override
    public void onStartup(Set<Class<?>> set, ServletContext servletContext) throws ServletException {
        log.info("Servlet container start. ServletContext = {}", servletContext);

        String encoding = propertyResolver.getProperty("${summer.web.character-encoding:UTF-8}");
        servletContext.setRequestCharacterEncoding(encoding);
        servletContext.setResponseCharacterEncoding(encoding);

        //设置Servlet容器
        WebMvcConfiguration.setServletContext(servletContext);
        //注册IOC容器
        ApplicationContext applicationContext = new AnnotationConfigApplicationContext(this.configClass, this.propertyResolver);
        log.info("Application context loaded : {}", applicationContext);
        WebUtils.registerFilters(servletContext);
        //注册MVC主要类 - DispatcherServlet
        WebUtils.registerDispatcherServlet(servletContext, this.propertyResolver);
    }

}
```