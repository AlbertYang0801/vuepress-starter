# MVC实现逻辑

1. 应用程序必须配置一个Summer Framework提供的 Listener；
2. Tomcat 完成 Servlet 容器的创建后，立刻根据配置创建Listener；
    1. Listener初始化时创建 IOC 容器；
    2. Listener继续创建DispatcherServlet实例，并向Servlet容器注册；
    3. DispatcherServlet初始化时获取到IOC容器中的Controller实例，因此可以根据URL调用不同Controller实例的不同处理方法。
    4. 容器中的Controller实例，因此可以根据URL调用不同Controller实例的不同处理方法。

## 注解

```java
@Controller
@RestController
@GetMapping
@PostMapping
@RequestBody
@ResponseBody
@RequestParam
@PathVariable
```

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PathVariable {

    String value();

}

```

## Dispatcher

`DispatcherServlet`内部负责从 IOC 容器找出所有`@Controller`和`@RestController`定义的Bean，扫描它们的方法，找出`@GetMapping`和`@PostMapping`标识的方法，这样就有了一个处理特定URL的处理器，我们抽象为`Dispatcher`。

每一个Dispatcher对应一个Controller的接口方法。

`DispatcherServlet`通过反射拿到一组`Dispatcher`对象，在`doGet()`和`doPost()`方法中，依次匹配URL。

## 注册流程

1. `ServletContext` 添加 `DispatcherServlet` 到容器中。
   
    `DispatcherServlet`继承了`HttpServlet`。
    
2. DispatcherServlet 扫描 `@RestController`注解和`@Controller`注解，扫描Controller类。
3. 扫描Controller类里面的`@GetMapping`和`@PostMapping`。
    1. 将扫描到的`GET`和`POST`方法，创建为`Dispatcher`，添加到DispatcherServlet中。

## 调用流程

1. Servlet容器会调用 `DispatcherServlet` 的方法处理HTTP请求。
    1. GET请求调用 `doGet`
       
        判断是否Resource请求。
        
    2. POST请求调用 `doPost`
2. 根据请求的 url 匹配`Dispatcher`。
3. 匹配到url后，调用`process()`方法。
    1. 解析入参注解。
    2. 反射调用方法获取返回值。
4. 根据返回值写入响应。
    1. void或null返回值无需写入
    2. String 或 byte[] 返回值写入响应
    3. Rest 类型写入 JSON 序列化结果
    4. ModelAndView类型调用ViewResolver写入渲染结果。

### @PathVariable

解析 url 路径为正则表达式，用来匹配@PathVariable类型的接口

```java
@GetMapping("/hello/{name}")
    @ResponseBody
    String hello(@PathVariable("name") String name) {
        return "Hello, " + name;
    }
```

```java
    public static Pattern compile(String path) throws ServletException {
        String regPath = path.replaceAll("\\{([a-zA-Z][a-zA-Z0-9]*)\\}", "(?<$1>[^/]*)");
        if (regPath.indexOf('{') >= 0 || regPath.indexOf('}') >= 0) {
            throw new ServletException("Invalid path: " + path);
        }
        return Pattern.compile("^" + regPath + "$");
    }
```

![](https://s2.loli.net/2025/05/30/QiegGUEBMP92ou6.png)