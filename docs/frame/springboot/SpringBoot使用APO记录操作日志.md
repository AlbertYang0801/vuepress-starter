# SpringBoot使用APO记录操作日志

通过织入自定义注解 @Log，再进行解析记录操作日志。

1. 自定义注解 @Log
    
    ```java
    @Target({ElementType.PARAMETER, ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    public @interface Log {
    
        /**
         * 模块
         */
        String title() default "default";
    
        /**
         * 业务类型
         */
        BusinessType businessType() default BusinessType.OTHER;
    
        /**
         * 是否需要保存request参数和值
         */
        boolean isSaveRequestData() default true;
    }
    ```
    
    使用
    
    ```java
    	@GetMapping("/skb_capture/startOrStop")
        @Log(title = "探针管理", businessType = BusinessType.UPDATE)
        public R<String> startOrStopAgentSkbCapture(@RequestParam("id") Integer[] id,
                                                    @RequestParam("operate") String operate) {
            return R.ok(agentStatusService.startOrStopHcMineSkbCapture(id, operate));
        }
    ```
    
2. LogAspect 类
    
    ```java
    @Aspect
    @Component
    @Slf4j
    public class LogAspect {
        @Autowired
        private SysOperLogServiceImpl logService;
    
        // 配置织入点
        @Pointcut("@annotation(org.vlis.apm.server.web.annotation.Log)")
        public void logPointCut() {
        }
    
        /**
         * 处理完请求后执行
         *
         * @param joinPoint 切点
         */
        @AfterReturning(pointcut = "logPointCut()", returning = "jsonResult")
        public void doAfterReturning(JoinPoint joinPoint, Object jsonResult) {
            handleLog(joinPoint, null, jsonResult);
        }
    
        /**
         * 拦截异常操作
         *
         * @param joinPoint 切点
         * @param e         异常
         */
        @AfterThrowing(value = "logPointCut()", throwing = "e")
        public void doAfterThrowing(JoinPoint joinPoint, Exception e) {
            handleLog(joinPoint, e, null);
        }
    
        protected void handleLog(final JoinPoint joinPoint, final Exception e, Object jsonResult) {
            try {
                // 获得注解
                Log controllerLog = getAnnotationLog(joinPoint);
                if (controllerLog == null) {
                    return;
                }
    
                // *========数据库日志=========*//
                SysOperLog operLog = new SysOperLog();
                operLog.setStatus(0);
                HttpServletRequest request = getRequest();
                if (request == null) {
                    return;
                }
                // 请求的地址
                String ip = ServletUtil.getClientIP(request);
                operLog.setOperIp(ip);
                // 返回参数
                operLog.setJsonResult(JSONUtil.toJsonStr(jsonResult));
                operLog.setOperUrl(request.getRequestURI());
                String username = Convert.toStr(request.getHeader("h-username"), StrUtil.EMPTY);
                if (StrUtil.isNotBlank(username)) {
                    operLog.setOperName(username);
                }
    
                if (e != null) {
                    operLog.setStatus(1);
                    operLog.setErrorMsg(ExceptionUtil.stacktraceToString(e, 1000));
                }
                String className = joinPoint.getTarget().getClass().getName();
                String methodName = joinPoint.getSignature().getName();
                operLog.setMethod(className + "." + methodName + "()");
                operLog.setRequestMethod(request.getMethod());
                // 处理设置注解上的参数
                getControllerMethodDescription(joinPoint, controllerLog, operLog);
                //同步入库
                logService.save(operLog);
            } catch (Exception exp) {
                log.error("日志aop异常", exp);
            }
        }
    
        public HttpServletRequest getRequest() {
            try {
                RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
                if (requestAttributes == null) {
                    return null;
                }
                ServletRequestAttributes servletRequestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                return servletRequestAttributes.getRequest();
            } catch (Exception e) {
                log.error("获取request异常", e);
            }
            return null;
        }
    
        /**
         * 获取注解中对方法的描述信息 用于Controller层注解
         *
         * @param log     日志
         * @param operLog 操作日志
         */
        public void getControllerMethodDescription(JoinPoint joinPoint, Log log, SysOperLog operLog) {
            // 设置action动作
            operLog.setBusinessType(log.businessType().ordinal());
            // 设置标题
            operLog.setTitle(log.title());
            // 是否需要保存request，参数和值
            if (log.isSaveRequestData()) {
                // 获取参数的信息，传入到数据库中。
                setRequestValue(joinPoint, operLog);
            }
        }
    
        /**
         * 获取请求的参数，放到log中
         *
         * @param operLog 操作日志
         */
        private void setRequestValue(JoinPoint joinPoint, SysOperLog operLog) {
            String requestMethod = operLog.getRequestMethod();
            if (HttpMethod.PUT.name().equals(requestMethod) || HttpMethod.POST.name().equals(requestMethod)|| HttpMethod.DELETE.name().equals(requestMethod)|| HttpMethod.GET.name().equals(requestMethod)) {
                String params = argsArrayToString(joinPoint.getArgs());
                operLog.setOperParam(StrUtil.sub(params, 0, 2000));
            }
        }
    
        /**
         * 是否存在注解，如果存在就获取
         */
        private Log getAnnotationLog(JoinPoint joinPoint) {
            Signature signature = joinPoint.getSignature();
            MethodSignature methodSignature = (MethodSignature) signature;
            Method method = methodSignature.getMethod();
    
            if (method != null) {
                return method.getAnnotation(Log.class);
            }
            return null;
        }
    
        /**
         * 参数拼装
         */
        private String argsArrayToString(Object[] paramsArray) {
            StringBuilder params = new StringBuilder(StrUtil.EMPTY);
            if (ArrayUtil.isNotEmpty(paramsArray)) {
                for (Object o : paramsArray) {
                    if (ObjectUtil.isNotNull(o) && !isFilterObject(o)) {
                        try {
                            String jsonObj = JSONUtil.toJsonStr(o);
                            params.append(jsonObj).append(" ");
                        } catch (Exception e) {
                            log.error("", e);
                        }
                    }
                }
            }
            return params.toString().trim();
        }
    
        /**
         * 判断是否需要过滤的对象。
         *
         * @param o 对象信息。
         * @return 如果是需要过滤的对象，则返回true；否则返回false。
         */
        @SuppressWarnings("rawtypes")
        public boolean isFilterObject(final Object o) {
            Class<?> clazz = o.getClass();
            if (clazz.isArray()) {
                return clazz.getComponentType().isAssignableFrom(MultipartFile.class);
            } else if (Collection.class.isAssignableFrom(clazz)) {
                Collection collection = (Collection) o;
                for (Object value : collection) {
                    return value instanceof MultipartFile;
                }
            } else if (Map.class.isAssignableFrom(clazz)) {
                Map map = (Map) o;
                for (Object value : map.entrySet()) {
                    Map.Entry entry = (Map.Entry) value;
                    return entry.getValue() instanceof MultipartFile;
                }
            }
            return o instanceof MultipartFile || o instanceof HttpServletRequest || o instanceof HttpServletResponse
                    || o instanceof BindingResult;
        }
    }
    ```