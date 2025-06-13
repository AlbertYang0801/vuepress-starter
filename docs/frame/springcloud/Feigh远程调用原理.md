# Feigh远程调用原理

## 思路

根据接口地址和 FeignClient构建http请求。

1. 构建 http请求模版，包含 header、body、method等参数信息。
2. 设置 options，包含超时时间参数配置。
3. 根据 clientName 从 nacos（类似map，保存clientName和访问地址的对应关系）中获取访问地址。
4. 根据访问地址和http请求参数发起http请求。

## 代码入口

`io/github/openfeign/feign-core/10.4.0/feign-core-10.4.0.jar!/feign/ReflectiveFeign.class`

```java
public class ReflectiveFeign extends Feign {
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      if ("equals".equals(method.getName())) {
        try {
          Object otherHandler =
              args.length > 0 && args[0] != null ? Proxy.getInvocationHandler(args[0]) : null;
          return equals(otherHandler);
        } catch (IllegalArgumentException e) {
          return false;
        }
      } else if ("hashCode".equals(method.getName())) {
        return hashCode();
      } else if ("toString".equals(method.getName())) {
        return toString();
      }
	  //根据method，提交请求（args参数）
      return dispatch.get(method).invoke(args);
    }
 }
```

`SynchronousMethodHandler` 请求类：

```java
final class SynchronousMethodHandler implements MethodHandler {
@Override
  public Object invoke(Object[] argv) throws Throwable {
    //构造请求模版
    RequestTemplate template = buildTemplateFromArgs.create(argv);
    //创建options，超时条件等
    Options options = findOptions(argv);
    //重试机制
    Retryer retryer = this.retryer.clone();
    while (true) {
      try {
        return executeAndDecode(template, options);
      } catch (RetryableException e) {
        try {
          retryer.continueOrPropagate(e);
        } catch (RetryableException th) {
          Throwable cause = th.getCause();
          if (propagationPolicy == UNWRAP && cause != null) {
            throw cause;
          } else {
            throw th;
          }
        }
        if (logLevel != Logger.Level.NONE) {
          logger.logRetry(metadata.configKey(), logLevel);
        }
        continue;
      }
    }
  }

}
```

`RequestTemplate` 类:

RequestTemplate 类包含了请求中的参数，header、body、method、uri。

```java
public final class RequestTemplate implements Serializable {

  private static final Pattern QUERY_STRING_PATTERN = Pattern.compile("(?<!\\{)\\?");
  private final Map<String, QueryTemplate> queries = new LinkedHashMap<>();
  private final Map<String, HeaderTemplate> headers = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
  private String target;
  private String fragment;
  private boolean resolved = false;
  private UriTemplate uriTemplate;
  private HttpMethod method;
  private transient Charset charset = Util.UTF_8;
  private Request.Body body = Request.Body.empty();
  private boolean decodeSlash = true;
  private CollectionFormat collectionFormat = CollectionFormat.EXPLODED;
}
```

`Options` 类：

```java
public static class Options {

  private final int connectTimeoutMillis;
  private final int readTimeoutMillis;
  //重定向
  private final boolean followRedirects;

  public Options(int connectTimeoutMillis, int readTimeoutMillis, boolean followRedirects) {
    this.connectTimeoutMillis = connectTimeoutMillis;
    this.readTimeoutMillis = readTimeoutMillis;
    this.followRedirects = followRedirects;
  }
  
  }
```

`executeAndDecode` 类

```java
Object executeAndDecode(RequestTemplate template, Options options) throws Throwable {
  Request request = targetRequest(template);

  if (logLevel != Logger.Level.NONE) {
    logger.logRequest(metadata.configKey(), logLevel, request);
  }

  Response response;
  long start = System.nanoTime();
  try {
    //发起请求
    response = client.execute(request, options);
  } catch (IOException e) {
    if (logLevel != Logger.Level.NONE) {
      logger.logIOException(metadata.configKey(), logLevel, e, elapsedTime(start));
    }
    throw errorExecuting(request, e);
  }
  long elapsedTime = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

  boolean shouldClose = true;
  try {
    if (logLevel != Logger.Level.NONE) {
      response =
          logger.logAndRebufferResponse(metadata.configKey(), logLevel, response, elapsedTime);
    }
    if (Response.class == metadata.returnType()) {
      if (response.body() == null) {
        return response;
      }
      if (response.body().length() == null ||
          response.body().length() > MAX_RESPONSE_BUFFER_SIZE) {
        shouldClose = false;
        return response;
      }
      // Ensure the response body is disconnected
      byte[] bodyData = Util.toByteArray(response.body().asInputStream());
      return response.toBuilder().body(bodyData).build();
    }
    if (response.status() >= 200 && response.status() < 300) {
      if (void.class == metadata.returnType()) {
        return null;
      } else {
        Object result = decode(response);
        shouldClose = closeAfterDecode;
        return result;
      }
    } else if (decode404 && response.status() == 404 && void.class != metadata.returnType()) {
      Object result = decode(response);
      shouldClose = closeAfterDecode;
      return result;
    } else {
      throw errorDecoder.decode(metadata.configKey(), response);
    }
  } catch (IOException e) {
    if (logLevel != Logger.Level.NONE) {
      logger.logIOException(metadata.configKey(), logLevel, e, elapsedTime);
    }
    throw errorReading(request, response, e);
  } finally {
    if (shouldClose) {
      ensureClosed(response.body());
    }
  }
}
```

`FeignBlockingLoadBalancerClient` 类：

```java
@Override
public Response execute(Request request, Request.Options options) throws IOException {
   final URI originalUri = URI.create(request.url());
   String serviceId = originalUri.getHost();
   Assert.state(serviceId != null,
         "Request URI does not contain a valid hostname: " + originalUri);
   ServiceInstance instance = loadBalancerClient.choose(serviceId);
   if (instance == null) {
      String message = "Load balancer does not contain an instance for the service "
            + serviceId;
      if (LOG.isWarnEnabled()) {
         LOG.warn(message);
      }
      return Response.builder().request(request)
            .status(HttpStatus.SERVICE_UNAVAILABLE.value())
            .body(message, StandardCharsets.UTF_8).build();
   }
   String reconstructedUrl = loadBalancerClient.reconstructURI(instance, originalUri)
         .toString();
   Request newRequest = Request.create(request.httpMethod(), reconstructedUrl,
         request.headers(), request.requestBody());

   return delegate.execute(newRequest, options);
}
```