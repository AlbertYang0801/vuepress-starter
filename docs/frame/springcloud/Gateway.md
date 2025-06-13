# Gateway

## 请求流程

<img src="https://s2.loli.net/2025/06/10/RBVjazHT3NinfQe.png" alt="image.png" style="zoom:50%;" />

- **Gateway Handler（网关处理器）**：网关处理器是 Spring Cloud Gateway 的核心组件，负责将请求转发到匹配的路由上。它根据路由配置和断言条件进行路由匹配，选择合适的路由进行请求转发。网关处理器还会依次应用配置的过滤器链，对请求进行处理和转换。
- **Gateway Filter Chain（网关过滤器链）**：网关过滤器链由一系列过滤器组成，按照配置的顺序依次执行。每个过滤器可以在请求前、请求后或请求发生错误时进行处理。过滤器链的执行过程可以修改请求、响应以及执行其他自定义逻辑。

## 限流

SpringGateway 基于 redis+Lua 脚本限流。

### RequestRateLimiter

基于 redis+lua 脚本采用令牌桶实现了限流。

<img src="https://s2.loli.net/2025/06/10/TvY1yJh8rA4W6fj.png" alt="image.png" style="zoom:50%;" />