# Spring事务总结

### 编程式事务

在代码中硬编码，不推荐使用。

### 声明式事务

- 基于注解的声明式事务
- 基于 XML 的声明式事务

### @Transactional 注解

Exception 分为运行时异常 RuntimeException 和非运行时异常。事务管理能保证出现异常情况的时候保证数据的一致性。

默认 `@Transactional` 注解只会在遇到 RuntimeException 类型异常或者 Error时，才会回滚事务。遇到其它异常，Spring 不会回滚事务。

### 作用范围

当 `@Transactional`注解作用于类上的时，该类的所有方法都将具有该类型的事务属性，同样的我们也可以在方法级别上使用该注解来覆盖类级别的定义。

### @Ttransactional(rollbackFor=Exception.class)

在注解上配置 `rollbackFor` 属性并指定异常类，则在目标方法中抛出的异常类及其子类时，事务同样会回滚。

比如配置 `rollbackFor=Exception.class` 时，若在目标方法出现 Exception 类及其子类异常时便会回滚。

### @Ttransactional 只有应用到 public 方法才会生效

只有 `@Ttransactional` 注解应用到 public 方法上时，才能进行事务管理。

## 事务失效的情况

声明式事务是基于 AOP实现的。

Spring事务是否会失效的判断标准：

所以**声明式事务的核心，就是动态代理生成的那个对象，没有用到那个对象，事务就没戏。**

1. **方法不是public的**：Spring的AOP代理只适用于public方法。如果事务方法不是public，Spring将无法创建代理，事务将不会起作用。
   
    > @Transactional的事务管理是通过代理实现的，Spring在启动的时候会扫描有该注解的方法，框架对非public的方法未实现代理。
    > 
2. **没有被Spring管理的Bean中调用**：如果事务方法不由Spring管理的Bean调用，事务也不会起作用。
3. **异常不被声明**：默认情况下，Spring的事务只在运行时异常(RuntimeException)发生时才回滚。如果方法抛出的是Checked异常，且没有在事务的声明中指定回滚规则，事务不会自动回滚。
4. **事务方法内部调用同一个类的另一个方法**：如果在同一个类中，一个方法没有声明事务，而另一个方法声明了事务，调用时事务不会生效。
   
    > 方法自调用的时候，调用的不是动态代理类的方法，而是直接调用了被代理对象的方法。
    > 
    
    ```java
    public class UserService{
       @Transactional
       public void sayHello(){}
       //自调用
       public void useSayHello(){sayHello();}
    }
    ```
    
5. **多线程环境下的事务作用域**：每个线程都有自己的事务作用域，如果在多线程环境下，每个线程操作自己的事务，其他线程的事务不会影响当前线程的事务。
6. **事务传播行为不正确**：如果使用了错误的事务传播行为，可能导致事务失效。
7. **数据库本身不支持事务或者配置错误**：数据库本身不支持事务或者配置不当也可能导致事务失效。
8. **事务管理器配置错误**：如果事务管理器没有正确配置，或者没有指定正确的数据源，事务可能不会正确执行。
9. **异常捕获但未重新抛出**：如果捕获了事务方法中抛出的异常，但没有重新抛出，事务可能不会回滚。
   
    > 如果异常被自己捕获了，那么动态代理对象感知步到异常，也不会回滚。
    > 
10. **异步方法内无事务**：如果在异步方法内部执行事务性操作，而该异步方法没有声明事务，事务不会传播到异步执行的环境中。

### 参考链接

[透彻的掌握 Spring 中 @transactional 的使用](https://developer.ibm.com/zh/articles/j-master-spring-transactional-use/)

1. 方法不是public的：Spring的AOP代理只适用于public方法。如果事务方法不是public，Spring将无法创建代理，事务将不会起作用。
2. 没有被Spring管理的Bean中调用：如果事务方法不由Spring管理的Bean调用，事务也不会起作用。
3. 异常不被声明：默认情况下，Spring的事务只在运行时异常(RuntimeException)发生时才回滚。如果方法抛出的是Checked异常，且没有在事务的声明中指定回滚规则，事务不会自动回滚。
4. 事务方法内部调用同一个类的另一个方法：如果在同一个类中，一个方法没有声明事务，而另一个方法声明了事务，调用时事务不会生效。
5. 多线程环境下的事务作用域：每个线程都有自己的事务作用域，如果在多线程环境下，每个线程操作自己的事务，其他线程的事务不会影响当前线程的事务。
6. 事务传播行为不正确：如果使用了错误的事务传播行为，可能导致事务失效。
7. 数据库本身不支持事务或者配置错误：数据库本身不支持事务或者配置不当也可能导致事务失效。
8. 事务管理器配置错误：如果事务管理器没有正确配置，或者没有指定正确的数据源，事务可能不会正确执行。
9. 异常捕获但未重新抛出：如果捕获了事务方法中抛出的异常，但没有重新抛出，事务可能不会回滚。
10. 异步方法内无事务：如果在异步方法内部执行事务性操作，而该异步方法没有声明事务，事务不会传播到异步执行的环境中。
11. 方法不是public的：Spring的AOP代理只适用于public方法。如果事务方法不是public，Spring将无法创建代理，事务将不会起作用。
12. 没有被Spring管理的Bean中调用：如果事务方法不由Spring管理的Bean调用，事务也不会起作用。
13. 异常不被声明：默认情况下，Spring的事务只在运行时异常(RuntimeException)发生时才回滚。如果方法抛出的是Checked异常，且没有在事务的声明中指定回滚规则，事务不会自动回滚。
14. 事务方法内部调用同一个类的另一个方法：如果在同一个类中，一个方法没有声明事务，而另一个方法声明了事务，调用时事务不会生效。
15. 多线程环境下的事务作用域：每个线程都有自己的事务作用域，如果在多线程环境下，每个线程操作自己的事务，其他线程的事务不会影响当前线程的事务。
16. 事务传播行为不正确：如果使用了错误的事务传播行为，可能导致事务失效。
17. 数据库本身不支持事务或者配置错误：数据库本身不支持事务或者配置不当也可能导致事务失效。
18. 事务管理器配置错误：如果事务管理器没有正确配置，或者没有指定正确的数据源，事务可能不会正确执行。
19. 异常捕获但未重新抛出：如果捕获了事务方法中抛出的异常，但没有重新抛出，事务可能不会回滚。
20. 异步方法内无事务：如果在异步方法内部执行事务性操作，而该异步方法没有声明事务，事务不会传播到异步执行的环境中。

## Spring事务和AOP的关系

Spring事务是通过AOP实现的，对代理对象的每个方法进行拦截。

在方法开始前开始事务，在方法执行结束后根据是否有异常进行提交和回滚。

Spring事务的代理对象执行某个方法时的步骤：

1. 判断当前执行的方法是否存在`@Transactional` 注解
2. 如果存在，则利用事务管理器（TransactionMananger）新建一个数据库连接，开启一个事务。
3. 修改数据库连接的autocommit为false。
4. 执行业务方法。
5. 执行完了之后如果没有出现异常，**则提交，否则回滚。**

Spring事务是否会失效的判断标准：

**某个加了@Transactional注解的方法被调用时，要判断到底是不是直接被代理对象调用的，如果是则事务会生效，如果不是则失效。**

## Spring事务的7种传播行为

事务传播行为是：事务传播行为指的是当一个事务方法被另一个事务方法调用时，这个方法是怎么运行的。

| 传播行为 | 含义 |
| --- | --- |
| **REQUIRED** | 支持当前事务，如果**当前没有事务，就新建一个事务**。这是最常见的选择。 |
| SUPPORTS | 支持当前事务，如果**当前没有事务，就以非事务方式执行**。 |
| MANDATORY | 支持当前事务，如果**当前没有事务，就抛出异常**。 |
| REQUIRED_NEW | 新建事务，**如果当前存在事务，把当前事务挂起。** |
| NOT_SUPPORTED | 以非事务方式执行操作，如果**当前存在事务，就把当前事务挂起。** |
| NEVER | 以非事务方式执行，如果当前存在事务，则抛出异常。 |
| NESTED | 表示如果当前已经存在一个事务，那么该方法将会在嵌套事务中运行。嵌套的事务可以独立于当前事务进行单独的提交或回滚。如果当前事务不存在，那么其行为和 PROPAGATION_REQUIRED一样。注意各厂商对这种传播行为的支持是有所差异的，可以参考资源管理器的文档来确认它们是够支持嵌套事务 |

### PROPAGATION_REQUIRED_NEW 的流程

要求在事务里运行，如果当前有事务，将当前事务挂起。

1. 首先，代理对象执行a()方法前，先利用事务管理器新建一个数据库连接a
2. 将数据库连接a的autocommit改为false
3. 把数据库连接a设置到ThreadLocal中
4. 执行a()方法中的sql
5. 执行a()方法过程中，调用了b()方法（注意用代理对象调用b()方法）
    - 代理对象执行b()方法前，判断出来了当前线程中已经存在一个数据库连接a了，表示当前线程其实已经拥有一个Spring事务了，则进行挂起
    - 挂起就是把ThreadLocal中的数据库连接a从ThreadLocal中移除，并放入一个挂起资源对象

中

- 挂起完成后，再次利用事务管理器新建一个数据库连接b
- 将数据库连接b的autocommit改为false
- 把数据库连接b设置到ThreadLocal中
- 执行b()方法中的sql
- b()方法正常执行完，则从ThreadLocal中拿到数据库连接b进行提交
- 提交之后会恢复所挂起的数据库连接a，这里的恢复，其实只是把在挂起资源对象中所保存的数据库连接a再次设置到ThreadLocal中
  
    b()方法事务执行完毕，重置 ThreadLocal状态，将oldTransactionInfo放入ThreadLocal
    
    ```java
    		private void restoreThreadLocalStatus() {
    			// Use stack to restore old transaction TransactionInfo.
    			// Will be null if none was set.
    			transactionInfoHolder.set(this.oldTransactionInfo);
    		}
    ```
    
1. a()方法正常执行完，则从ThreadLocal中拿到数据库连接a进行提交

### 事务传播行为练习

```java
@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void insertUserA() {
        userMapper.insert(new UserDo().build("小A"));
        insertUserB();
    }

    @Transactional(propagation = Propagation.NESTED, rollbackFor = Exception.class)
    public void insertUserB() {
        userMapper.insert(new UserDo().build("小B"));
        //回滚之后会继续向上抛出异常，虽然不是一个事务，但是两个SQL还是都会回滚
        int i = 10 / 0;
    }
```

### 强制手动回滚

```java
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void callBack() {
        userMapper.insert(new UserDo().build("小B"));
        try {
            int i = 10 / 0;
        } catch (Exception e) {
            //强制回滚
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.error("抛出异常，强制回滚");
        }
    }
```

## 事务执行逻辑

1. 开启事务@`EnableTransactionManagement`、`TransactionManagementConfigurationSelector.class`
   
    ```java
    @MapperScan("com.albert.mysql.mapper")
    @SpringBootApplication
    @EnableTransactionManagement
    public class MysqlApplication {
    
        public static void main(String[] args) {
            SpringApplication.run(MysqlApplication.class, args);
        }
    
    }
    ```
    
2. 注册类
    - `AutoProxyRegistrar`
      
        主要作用是开启自动代理功能，因为开启事务是在原方法类基础上生成代理对象完成的。
        
    - `ProxyTransactionManagementConfiguration`
      
        配置类，定义了三个配置类，包含扫描事务注解和代理逻辑。
        
    
    ```java
    public class TransactionManagementConfigurationSelector extends AdviceModeImportSelector<EnableTransactionManagement> {
    
    	/**
    	 * Returns {@link ProxyTransactionManagementConfiguration} or
    	 * {@code AspectJ(Jta)TransactionManagementConfiguration} for {@code PROXY}
    	 * and {@code ASPECTJ} values of {@link EnableTransactionManagement#mode()},
    	 * respectively.
    	 */
    	@Override
    	protected String[] selectImports(AdviceMode adviceMode) {
    		switch (adviceMode) {
    			case PROXY:
    				return new String[] {AutoProxyRegistrar.class.getName(),
    						ProxyTransactionManagementConfiguration.class.getName()};
    			case ASPECTJ:
    				return new String[] {determineTransactionAspectClass()};
    			default:
    				return null;
    		}
    	}
    
    	private String determineTransactionAspectClass() {
    		return (ClassUtils.isPresent("javax.transaction.Transactional", getClass().getClassLoader()) ?
    				TransactionManagementConfigUtils.JTA_TRANSACTION_ASPECT_CONFIGURATION_CLASS_NAME :
    				TransactionManagementConfigUtils.TRANSACTION_ASPECT_CONFIGURATION_CLASS_NAME);
    	}
    
    }
    ```
    
3. 配置类`ProxyTransactionManagementConfiguration`
    - `AnnotationTransactionAttributeSource`
      
        用来判断某个类上是否存在@Transactional注解，或者判断某个方法上是否存在@Transactional注解的
        
    - `TransactionInterceptor`
      
        代理逻辑，当某个类中存在@Transactional注解时，到时就产生一个代理对象作为Bean，代理对象在执行某个方法时，最终就会进入到TransactionInterceptor的`invoke()`方法。
        
    
    ```java
    	@Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
    	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    	public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor(
    			TransactionAttributeSource transactionAttributeSource, TransactionInterceptor transactionInterceptor) {
    
    		BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
    		advisor.setTransactionAttributeSource(transactionAttributeSource);
    		advisor.setAdvice(transactionInterceptor);
    		if (this.enableTx != null) {
    			advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
    		}
    		return advisor;
    	}
    
    	@Bean
    	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    	public TransactionAttributeSource transactionAttributeSource() {
            //用来判断某个类上是否存在@Transactional注解，或者判断某个方法上是否存在@Transactional注解的
    		return new AnnotationTransactionAttributeSource();
    	}
    
    	@Bean
    	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    	public TransactionInterceptor transactionInterceptor(TransactionAttributeSource transactionAttributeSource) {
            //代理逻辑，当某个类中存在@Transactional注解时，到时就产生一个代理对象作为Bean，代理对象在执行某个方法时，最终就会进入到TransactionInterceptor的invoke()方法。
    		TransactionInterceptor interceptor = new TransactionInterceptor();
    		interceptor.setTransactionAttributeSource(transactionAttributeSource);
    		if (this.txManager != null) {
    			interceptor.setTransactionManager(this.txManager);
    		}
    		return interceptor;
    	}
    ```
    
4. 事务方法 invoke 的基本逻辑
    - 创建事务
    - 执行业务逻辑
    - 有异常回滚事务
    - 提交事务
    
    ```java
            PlatformTransactionManager ptm = asPlatformTransactionManager(tm);
    		final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);
    
    		if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
    			// Standard transaction demarcation with getTransaction and commit/rollback calls.
                //创建事务
    			TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr, joinpointIdentification);
    
    			Object retVal;
    			try {
    				// This is an around advice: Invoke the next interceptor in the chain.
    				// This will normally result in a target object being invoked.
                    //执行业务逻辑
    				retVal = invocation.proceedWithInvocation();
    			}
    			catch (Throwable ex) {
    				// target invocation exception
                    //如果发生异常进行事务回滚
    				completeTransactionAfterThrowing(txInfo, ex);
    				throw ex;
    			}
    			finally {
                    //清除事务信息
    				cleanupTransactionInfo(txInfo);
    			}
    
    			if (retVal != null && vavrPresent && VavrDelegate.isVavrTry(retVal)) {
    				// Set rollback-only in case of Vavr failure matching our rollback rules...
    				TransactionStatus status = txInfo.getTransactionStatus();
    				if (status != null && txAttr != null) {
    					retVal = VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
    				}
    			}
                //执行完成，提交事务
    			commitTransactionAfterReturning(txInfo);
    			return retVal;
    		}
    ```
    

**整个过程的核心：**

在执行某个方法时，判断当前是否已经存在一个事务，就是判断当前线程的ThreadLocal中是否存在一个数据库连接对象，如果存在则表示已经存在一个事务了。

同一个方法里面使用 ThreadLocal保存当前事务信息

```java
	private static final ThreadLocal<TransactionInfo> transactionInfoHolder =
			new NamedThreadLocal<>("Current aspect-driven transaction");
```

oldTransactionInfo