
# 秒杀系统练习


## 课程简介

### 课程地址

[Java秒杀系统方案优化](https://coding.imooc.com/class/chapter/168.html)

[秒杀系统设计与实现.互联网工程师进阶与分析](https://github.com/qiurunze123/miaosha?utm_source=gold_browser_extension)

### 总结

Druid 可以对连接池进行监控。

使用消息队列异步下单 RabbitMQ。

大并发的压力在数据库，要减轻数据库的压力。



## 项目搭建

### redis

#### redis数据前缀-模版方法

不同模块需要有自己的前缀，但是存 redis 的过程有很多共同之处。所以使用抽象类提供公共构建方法，而各个实现类提供各个模块的前缀和其它细节，接口类约定前缀和其它细节的方法。

**模版模式**

接口->抽象类->实现类

- 接口提供规定方法。
- 抽象类实现共有方法。
- 实现类实现特殊方法。

[模版设计模式参考](https://blog.csdn.net/qq_43389371/article/details/102533980)



## 用户登录

- [http://localhost:8080/login/to_login](http://localhost:8080/login/to_login)
- 用户名：13000000000
- 密码：123456


### 为什么用户密码两次md5加密

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211029164244.png" alt="image-20211029164244131" style="zoom:50%;" />

- 第一次加密，采用**固定盐值**，主要是在用户端加密，防止明文泄漏密码。
- 第二次加密，采用的是随机盐值，主要是存储数据库中，防止数据库密码泄漏。

### 加密方法

- 第一次加密（客户端自己加密）

  明文密码 + 固定 salt 的字符拼接，然后使用 Md5 加密。

  **表单显示的是第一次加密后的值。**

- 第二次加密（服务端加密，存数据库）

  表单提交的密码（第一次加密后的密码） + 随机 salt的字符拼接，然后使用 Md5 加密。 

  **数据库保存的是第二次加密后的值。**

### 分布式session

用户登陆成功之后，生成 token，用作是否登陆校验的依据。

**登陆过程**

      1. 用户名密码校验通过。
      2. 随机生成 token。
      3. 将 token 值和用户信息存到 redis。
      4. 将 token 添加到 cookie 中，返回给客户端。

**再次访问**

延长 token 用户登陆的有效期，重新设置 cookie 和缓存信息。

### 注解实现参数校验

**场景**

减少代码中的参数校验，使用已存在的注解或自定义注解来实现优雅的参数校验。

1. 参数添加注解 `@Validated `

   ```java
       public Result<Boolean> login(@Validated LoginVo loginVo) {
           //登陆信息为空
           if (Objects.isNull(loginVo)) {
               return Result.error(CodeMsg.MOBILE_EMPTY);
           }
           return Result.success(miaoshaUserService.login(loginVo));
       }
   ```

2. 实体类增加校验注解

   ```java
   public class LoginVo {
   
       /**
        * 手机号
        */
       @NotNull
       @IsMobile		//自定义注解
       private String mobile;
       /**
        * 登陆密码
        */
       @NotNull
       @Length(max = 32)
       private String password;
    
     ......
     
   }
   ```

3. 增加自定义校验注解

   **基础信息类**

   ```java
   @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER })
   @Retention(RUNTIME)
   @Documented
   @Constraint(validatedBy = {IsMobileValidator.class })
   public @interface  IsMobile {
   	
   	boolean required() default true;
   	
   	String message() default "手机号码格式错误";
   
   	Class<?>[] groups() default { };
   
   	Class<? extends Payload>[] payload() default { };
   }
   ```

   **实现类**

   ```java
   public class IsMobileValidator implements ConstraintValidator<IsMobile, String> {
   
       private boolean required = false;
   
       @Override
       public void initialize(IsMobile constraintAnnotation) {
           required = constraintAnnotation.required();
       }
   
       @Override
       public boolean isValid(String value, ConstraintValidatorContext context) {
           if (StringUtils.isEmpty(value)) {
               return false;
           }
           if (required) {
               //必填
               return ValidatorUtil.isMobile(value);
           }
           return false;
       }
   
   
   }
   ```
   
   

### 自定义参数处理器-参数注入用户信息

**场景**

在成功登陆之后，访问一些接口的时候需要获取当前登录的用户信息。

而获取登陆用户信息需要根据 token 查询 redis，每个接口都查询一次较为繁琐。

通过 SpringMVC 的自定义参数处理器，在 Controller 层对用户信息自动封装。

1. Controller 层

   将对象 MiaoshaUser 作为方法参数构建（自定义参数处理器根据类名解析）。

   ```java
   		@RequestMapping("/to_list")
       public String toGoodsList(Model model, MiaoshaUser user) {
           model.addAttribute("user", user);
           //TODO 查询商品列表
           return "goods_list";
       }
   ```

2. SpringMVC 配置类

   该类不仅可以设置自定义参数处理器，还可以添加拦截器、跨域处理器等。

   ```java
   @Configuration
   public class WebConfig extends WebMvcConfigurationSupport {
   
       @Autowired
       UserArgumentResolver userArgumentResolver;
   
       /**
        * 新增参数处理器
        */
       @Override
       public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
         	//新增用户信息自定义参数处理器
           argumentResolvers.add(userArgumentResolver);
       }
   
   }
   ```

3. 用户信息自定义参数处理器

   实现 `HandlerMethodArgumentResolver` 类。

   ```java
   @Service
   public class UserArgumentResolver implements HandlerMethodArgumentResolver {
   
       @Autowired
       MiaoshaUserService miaoshaUserService;
   
       /**
        * 满足条件，进行 resolveArgument 里的逻辑处理
        */
       @Override
       public boolean supportsParameter(MethodParameter methodParameter) {
           Class<?> parameterType = methodParameter.getParameterType();
           //请求参数包含 MiaoshaUser 时满足
           return parameterType == MiaoshaUser.class;
       }
   
       @Override
       public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer,
                                     NativeWebRequest webRequest, WebDataBinderFactory webDataBinderFactory) {
           //获取request和response
         	HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
           HttpServletResponse response = webRequest.getNativeResponse(HttpServletResponse.class);
           //从请求体中获取token
           String paramToken = request.getParameter(MiaoshaUserService.COOKIE_NAME);
         	//从cookie中获取token
           String cookieValue = getCookieValue(request, MiaoshaUserService.COOKIE_NAME);
           if (StringUtils.isEmpty(cookieValue) && StringUtils.isEmpty(paramToken)) {
               return null;
           }
           String token = StringUtils.isEmpty(cookieValue) ? paramToken : cookieValue;
           //获取用户信息
           return miaoshaUserService.getMiaoshaUserByToken(response, token);
       }
   
       private String getCookieValue(HttpServletRequest request, String cookiName) {
           Cookie[] cookies = request.getCookies();
           if (cookies == null || cookies.length <= 0) {
               return null;
           }
           for (Cookie cookie : cookies) {
               if (cookie.getName().equals(cookiName)) {
                   return cookie.getValue();
               }
           }
           return null;
       }
   
   
   }
   ```

   

### 全局异常处理器

1. 异常处理器类

   ```java
   @ControllerAdvice
   @ResponseBody
   public class GlobalExceptionHandler {
   
       /**
        * 处理不同类型的异常
        */
       @ExceptionHandler(value = Exception.class)
       public Result<String> exceptionHandler(Exception e) {
           if (e instanceof GlobalException) {
               GlobalException globalException = (GlobalException) e;
               return Result.error(globalException.getCm());
           } else if (e instanceof BindException) {
               BindException bindException = (BindException) e;
               List<ObjectError> allErrors = bindException.getAllErrors();
               ObjectError objectError = allErrors.get(0);
               String defaultMessage = objectError.getDefaultMessage();
               return Result.error(CodeMsg.BIND_ERROR.fillArgs(defaultMessage));
           } else {
               return Result.error(CodeMsg.SERVER_ERROR);
           }
       }
   
   
   }
   ```

2. 自定义异常类

   ```java
   public class GlobalException extends RuntimeException{
   
   	private static final long serialVersionUID = 1L;
   
   	/**
   	 * 异常信息（搭配返回值）
   	 */
   	private CodeMsg cm;
   	
   	public GlobalException(CodeMsg cm) {
   		super(cm.toString());
   		this.cm = cm;
   	}
   
   	public CodeMsg getCm() {
   		return cm;
   	}
   
   }
   
   ```



## 数据库设计

1. 秒杀用户表

   ```sql
   CREATE TABLE `miaosha_user` (
     `id` bigint(20) NOT NULL COMMENT '用户ID，手机号码',
     `nickname` varchar(255) NOT NULL,
     `password` varchar(32) DEFAULT NULL COMMENT 'MD5(MD5(pass明文+固定salt) + salt)',
     `salt` varchar(10) DEFAULT NULL,
     `head` varchar(128) DEFAULT NULL COMMENT '头像，云存储的ID',
     `register_date` datetime DEFAULT NULL COMMENT '注册时间',
     `last_login_date` datetime DEFAULT NULL COMMENT '上蔟登录时间',
     `login_count` int(11) DEFAULT '0' COMMENT '登录次数',
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   ```

   

2. 商品表

   ```sql
   CREATE TABLE `goods` (
     `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
     `goods_name` varchar(16) DEFAULT NULL COMMENT '商品名称',
     `goods_title` varchar(64) DEFAULT NULL COMMENT '商品标题',
     `goods_img` varchar(64) DEFAULT NULL COMMENT '商品的图片',
     `goods_detail` longtext COMMENT '商品的详情介绍',
     `goods_price` decimal(10,2) DEFAULT '0.00' COMMENT '商品单价',
     `goods_stock` int(11) DEFAULT '0' COMMENT '商品库存，-1表示没有限制',
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
   ```

   

3. 秒杀商品表

   ```sql
   CREATE TABLE `miaosha_goods` (
     `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '秒杀的商品表',
     `goods_id` bigint(20) DEFAULT NULL COMMENT '商品Id',
     `miaosha_price` decimal(10,2) DEFAULT '0.00' COMMENT '秒杀价',
     `stock_count` int(11) DEFAULT NULL COMMENT '库存数量',
     `start_date` datetime DEFAULT NULL COMMENT '秒杀开始时间',
     `end_date` datetime DEFAULT NULL COMMENT '秒杀结束时间',
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
   ```

   

4. 订单信息表

   ```sql
   CREATE TABLE `order_info` (
     `id` bigint(20) NOT NULL AUTO_INCREMENT,
     `user_id` bigint(20) DEFAULT NULL COMMENT '用户ID',
     `goods_id` bigint(20) DEFAULT NULL COMMENT '商品ID',
     `delivery_addr_id` bigint(20) DEFAULT NULL COMMENT '收货地址ID',
     `goods_name` varchar(16) DEFAULT NULL COMMENT '冗余过来的商品名称',
     `goods_count` int(11) DEFAULT '0' COMMENT '商品数量',
     `goods_price` decimal(10,2) DEFAULT '0.00' COMMENT '商品单价',
     `order_channel` tinyint(4) DEFAULT '0' COMMENT '1pc，2android，3ios',
     `status` tinyint(4) DEFAULT '0' COMMENT '订单状态，0新建未支付，1已支付，2已发货，3已收货，4已退款，5已完成',
     `create_date` datetime DEFAULT NULL COMMENT '订单的创建时间',
     `pay_date` datetime DEFAULT NULL COMMENT '支付时间',
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=1565 DEFAULT CHARSET=utf8mb4;
   ```

   

5. 秒杀订单表

   ```sql
   CREATE TABLE `miaosha_order` (
     `id` bigint(20) NOT NULL AUTO_INCREMENT,
     `user_id` bigint(20) DEFAULT NULL COMMENT '用户ID',
     `order_id` bigint(20) DEFAULT NULL COMMENT '订单ID',
     `goods_id` bigint(20) DEFAULT NULL COMMENT '商品ID',
     PRIMARY KEY (`id`),
     UNIQUE KEY `u_uid_gid` (`user_id`,`goods_id`) USING BTREE
   ) ENGINE=InnoDB AUTO_INCREMENT=1551 DEFAULT CHARSET=utf8mb4;
   ```

   

## 秒杀过程

1. 判断库存剩余量。

   > redis预减库存，为了异步创建订单，防止超卖。

2. 判断是否重复秒杀。

3. 减少库存量

4. 创建基础订单。

5. 创建秒杀订单。




## JMeter压测

### 环境安装

[JMeter篇01：JMeter在Mac下的安装](https://www.jianshu.com/p/bce9077d883c)

1. 安装 JDK1.8

2. 下载 JMeter

   [Apache JMeter - Download Apache JMeter](http://jmeter.apache.org/download_jmeter.cgi) 

3. 解压到指定目录

   ![image-20211102141146593](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211102141146.png)

   ![image-20211108144743280](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211108144743.png)

4. 执行启动命令

   切换到 `bin` 目录，执行 `sh jmeter` 命令。

---



### 压测结果

1. 商品列表

   QPS - 1042

   ![image-20211102162201678](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211102162201.png)

2. 商品详情

   QPS - 1029

   ![image-20211102162321115](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211102162321.png)



## 缓存优化

使用缓存技术，提高访问能力，主要减少数据库的压力。

其中利用缓存不仅指利用 redis 缓存数据，还利用到浏览器的缓存，来缓存页面。

### 页面缓存

现有页面加载每次都需要请求数据库加载数据，通过将页面手动渲染并存放到缓存中，可以减少数据库访问次数。

将页面进行手动渲染，通过对 thymeleaf 进行手动渲染得到 html 页面结果，将静态化页面结果存到 redis 中，并设置过期时间 60 s。

（由于页面的访问需要请求服务端，没有利用浏览器的缓存，最终不使用直接缓存页面的方式。）

*Freemarker 页面静态化技术类似，通过将模版和数据结合生成静态页面。*

### URL缓存

URL缓存还是页面缓存，只是根据 URL 的不同，缓存也不同，应用于商品详情接口，每个商品都对应有一份缓存。

（由于页面的访问需要请求服务端，没有利用浏览器的缓存，最终不使用直接缓存页面的方式。）

### 对象缓存

对象缓存是更加细粒度的缓存，将一些对象信息（比如用户信息）存到缓存中，减少数据库的压力。

（推荐使用，将对象存到缓存，减轻访问数据库的压力）

**为什么不能先更新缓存，再更新数据库？**

因为先更新缓存，会发生缓存和数据库数据不一致的问题。

读取操作是先读缓存，缓存若没有，则读取数据库，并加载到缓存中。

若是更新缓存时，先将缓存删除，再添加缓存的话（若此时其它请求查询，则会先查数据库，再加载到缓存中），最终缓存中保存的是旧数据，而数据库保存的是最新数据。

**编码规范要求：** *service 不能调用其它 dao，只能调用其它 service，只能调用自己的 dao。*

POST 和 GET 请求的区别？

- GET 请求是幂等的（请求多次结果是一致的），代表从服务端获取数据，不会对服务端数据产生影响。
- POST 代表对服务端提交数据，对服务端数据会产生影响。



### 商品详情静态化

将前端页面静态化， 利用浏览器缓存，提高页面访问能力。

将前端与后端进行分离，脱离*后端直接返回模版渲染视图*的方式，采用前端发送 ajax 请求向后端获取数据。这样访问页面时会直接加载静态文件，还可以利用浏览器的缓存访问，无需经过服务端。

（要求保证静态页面一定时间内没有变化，比如商品详情页面。）



### 浏览器缓存

客户端访问静态化页面时，可以直接从浏览器缓存加载，而不经过服务端。

![image-20211105105813041](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211105105813.png)

比如商品详情页面，加载商品详情的时候可以看到 status code 为 200，提示 from disk cache。意为从浏览器缓存读取的该页面，而且响应头里的 Cache-Control 规定了 max-age=3600，意为页面缓存 3600s。

静态页面的标识是服务端来约定的，在 springboot 中可以对静态资源进行设置，包括开启缓存、静态资源指定目录等。

保证了静态页面加载时是从浏览器自身的缓存加载，而不需要请求服务端。

```java
#static
spring.resources.add-mappings=true
#制定浏览器缓存页面的时间（s)
spring.resources.cache-period= 3600
spring.resources.chain.cache=true 
spring.resources.chain.enabled=true
spring.resources.chain.gzipped=true
spring.resources.chain.html-application-cache=true
spring.resources.static-locations=classpath:/static/
```



### 对象登陆拦截器

加一个拦截器，在接口使用，若用户未登录，直接返回。



## 超卖问题

![image-20211105221325921](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211105221326.png)

### 用户同时发起多个请求

在高并发情况下，同一个用户可能会同时发起多个请求。所以需要限制一个用户只能秒杀某个商品一次。

通过数据库来解决问题。

秒杀订单表 miaosha_order 增加唯一索引（用户Id和商品Id字段），保证一个用户只能秒杀一个商品一次。

```sql
  UNIQUE KEY `u_uid_gid` (`user_id`,`goods_id`) USING BTREE
```



### 超库存

减库存的更新语句增加判断条件。

> ```
>  因为Mysql有行锁，where条件找到一行记录，单次update请求拥有对这个记录的排它锁。所以更新库存不会有并发问题。
> * 同时加判断条件 stock_count >0 防止库存变为0，解决超卖问题。
> ```

```java
    /**
     * 秒杀商品-库存减1
     */
    @Update("update miaosha_goods set stock_count = stock_count -1  where id = #{goodsId} and stock_count >0 ")
    int decrStock(@Param("goodsId") long goodsId);
```





## 秒杀接口优化

异步下单。

**可能存在的问题**

1. 如何优化判断用户是否秒杀过？

   秒杀成功时，向 redis 中增加缓存，拼接用户Id和商品Id作为key。

   在秒杀时根据用户Id和商品Id查询缓存，若查询到结果，则判断为用户已经秒杀过商品。

   *可以减少数据库访问*。

2. 减少库存的时候如何保证 MySQL 和 Redis 里的库存保持一致？

   redis里缓存商品库存数量，是用来预减库存，主要是为了限制请求大量的落到DB。

   比如商品库存有10个，有1000个请求同时进来，通过redis缓存预减库存，可以将1000个请求拦截到剩下10个。最终只会有10个请求落到DB，大大减少DB的压力。

   而redis的库存最大的作用就是对请求进行过滤，没必要与MySQL中的库存数量保证强一致性。因为秒杀的结果是秒杀不成功占大比重，redis库存数量没必要与MySQL中的库存数量保持强一致性，只要redis能够发挥拦截大部分请求的作用即可。

   

3. 客户端如何轮询秒杀结果？

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211105221614.png" alt="image-20211105221614550" style="zoom: 67%;" />

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211105221654.png" alt="image-20211105221654004" style="zoom: 67%;" />

---

### 集成RabbitMQ

docker 安装 RabbitMQ。

#### 四种模式

1. Direct直连模式

   使用默认交换机。

   生产者 -> 队列 -> 消费者

   生产者向向指定队列发送消息，而消费者监听指定队列就能获取消息。

   

2. Topic模式

   又称为routingKey模式。

   队列指定routingKey然后绑定到交换机。向交换机发消息时，会根据routingKey发送到指定队列。

   生产者（路由key）-> 交换机 <- 不同队列（路由key）<消费者。

   

3. Fanout模式

   广播模式。

   队列与交换机绑定，生产者向交换机发送消息后，交换机绑定的所有队列都会收到消息。



---

### 第一阶段：减少访问

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211119154100.png" alt="临时文件 (20)" style="zoom: 67%;" />

![20211119154100](../../yjw/TyporaWorkSpace/pic/20211119154100.png)

---

### 第二阶段：下订单

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211119143719.png" alt="未命名文件 (3)" style="zoom:67%;" />

### 第三阶段：前端轮询

<img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211119143748.png" alt="未命名文件 (4)" style="zoom:67%;" />



## 安全

### 隐藏秒杀接口

秒杀接口 path 中添加随机 code 值。

1. 请求后端获取随机 code 值，并缓存 code。
2. path中拼接随机 code 值请求后端秒杀接口。
3. 对比 path 中的 code 值和缓存 code 作对比。



### 接口限流

自定义注解 AccessLimit

拦截器对自定义注解判断。

使用缓存判断接口请求次数。



## 限时订单

使用 activemq 进行限时订单处理，增加订单状态，status=6 已取消。

1. 创建订单成功之后，向 MQ 发送延时消息（5分钟、30分钟）。
2. n 分钟之后，consumer 消费到数据。检查数据库中订单的支付状态，若未支付，则更新状态为已取消。

### 集成 ActiveMQ

运行 docker 镜像。

```shell
docker run -d --name myactivemq -p 61616:61616 -p 8161:8161 webcenter/activemq:latest
```

- 管理界面

  [http://localhost:8161/](http://localhost:8161/)



## 更新秒杀商品库存

涉及到保证 **缓存和数据库数据一致** 的问题。

1. redis中保存了商品的库存数量。
2. 数据库中包含商品的库存数量。

----



1. 为什么是删除缓存而不是更新缓存？

2. 为什么先更新数据库？

3. 先更新数据库，再删除缓存会有并发问题吗？

4. 如何保证更新数据库和删除缓存的原子性？

   - 为缓存设置过期时间。

     > 这种方案下，我们可以对存入缓存的数据设置过期时间，所有的写操作以数据库为准，对缓存操作只是尽最大努力即可。也就是说如果数据库写成功，缓存更新失败，那么只要到达过期时间，则后面的读请求自然会从数据库中读取新值然后回填缓存。
     >
     > 这样保证缓存和数据库一致是弱一致性、也是最终一致性。

   - 借助 mq 的消息重试机制，删除缓存数据。

     > 写入数据库操作成功后，删除缓存的操作交给 mq 来做。如果删除缓存失败，触发 mq 的重试机制。

     









