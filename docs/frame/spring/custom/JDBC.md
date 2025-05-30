# JDBC

### DataSource

自动注入DataSource

```java
@Configuration
public class JdbcConfiguration {

    /**
     * 自动注入HikariDataSource
     *
     * @param url
     * @param username
     * @param password
     * @param driver
     * @param maximumPoolSize
     * @param minimumPoolSize
     * @param connTimeout
     * @return
     */
    @Bean
    DataSource dataSource(@Value("${summer.datasource.url}") String url,
                          @Value("${summer.datasource.username}") String username,
                          @Value("${summer.datasource.password}") String password,
                          @Value("${summer.datasource.driver-class-name:}") String driver,
                          @Value("${summer.datasource.maximum-pool-size:20}") int maximumPoolSize,
                          @Value("${summer.datasource.minimum-pool-size:1}") int minimumPoolSize,
                          @Value("${summer.datasource.connection-timeout:30000}") int connTimeout) {
        var config = new HikariConfig();
        config.setAutoCommit(false);
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        if (driver != null) {
            config.setDriverClassName(driver);
        }
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumPoolSize);
        config.setConnectionTimeout(connTimeout);
        return new HikariDataSource(config);
    }

}
```

通过 `@Import` 可以自动注入DataSource

```java
@Import(JdbcConfiguration.class)
@ComponentScan
@Configuration
public class AppConfig {

}
```

### JdbcTemplate

JdbcTemplate模版方法，提供了大量以回调方法为参数的模版方法。

> 单一职责，由JdbcTemplate处理获取连接、释放连接、捕获SQLException。上层代码专注于使用Connection去操作数据库。
> 

这样就可以基于该模版方法扩展，比如 execute 方法。利用模版方法操作数据库，实际操作逻辑在回调方法中。

```java
    /**
     * 使用dataSource执行数据库操作
     * @param action
     * @return
     * @param <T>
     */
    public <T> T execute(ConnectionCallback<T> action){
        try (Connection connection = dataSource.getConnection()){
            //提供Connection，供上层代码使用
            T t = action.doInConnection(connection);
            return t;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
```

### SQL模块

Java提供了java.sql模块操作数据库

![](https://s2.loli.net/2025/05/30/2ZFN63rHv5ge9pc.png)

### 自动映射类型

利用函数式接口规定好模版，然后定义不同实现。

```java
@FunctionalInterface
public interface RowMapper<T> {

    /**
     * 处理结果集
     * @param rs
     * @param rowNum
     * @return
     * @throws SQLException
     */
    @Nullable
    T mapRow(ResultSet rs, int rowNum) throws SQLException;

}

```

```java
/**
 * 处理String类型结果
 */
class StringRowMapper implements RowMapper<String> {

    static StringRowMapper INSTANCE = new StringRowMapper();

    @Override
    public String mapRow(ResultSet rs, int rowNum) throws SQLException {
        return rs.getString(1);
    }
}

/**
 * 处理Boolean类型结果
 */
class BooleanRowNumber implements RowMapper<Boolean> {

    static BooleanRowNumber INSTANCE = new BooleanRowNumber();

    @Nullable
    @Override
    public Boolean mapRow(ResultSet rs, int rowNum) throws SQLException {
        return rs.getBoolean(rowNum);
    }

}

/**
 * 处理Number类型结果
 */
class NumberRowMapper implements RowMapper<Number> {

    static NumberRowMapper INSTANCE = new NumberRowMapper();

    @Nullable
    @Override
    public Number mapRow(ResultSet rs, int rowNum) throws SQLException {
        return (Number) rs.getObject(rowNum);
    }

}
```

### 自动映射Bean

类似于Mybatis里面的查询结果映射到 Result。

- 先根据SQL里面的 label 映射set 方法
- 再映射字段

```sql
select id,user_name as userName,age from User
```

比如这个SQL的，label为 `userName`和`age`。

就会先调用`setAge`方法，然后直接赋值属性`userName`。

```java
class User{

  String userName;
  
  String age;
  
  void setAge(String age){
    this.age = age
  }

}
```

```java
@Slf4j
public class BeanRowMapper<T> implements RowMapper<T> {

    Class<T> clazz;

    Constructor<T> constructor;

    Map<String, Field> fields = new HashMap<>();
    Map<String, Method> methods = new HashMap<>();

    /**
     * 注入目标类的方法和字段信息
     * @param clazz
     */
    public BeanRowMapper(Class<T> clazz) {
        this.clazz = clazz;
        try {
            this.constructor = clazz.getConstructor();

        } catch (ReflectiveOperationException e) {
            throw new DataAccessException(String.format("No public default constructor found for class %s when build BeanRowMapper.", clazz.getName()), e);
        }
        for (Field field : clazz.getFields()) {
            //方法名称
            String name = field.getName();
            this.fields.put(name, field);
            log.debug("Add row mapping: {} to field {}", name, name);
        }

        //set方法
        for (Method method : clazz.getMethods()) {
            Parameter[] parameters = method.getParameters();
            if (parameters.length == 1) {
                String name = method.getName();
                if (name.length() >= 4 && name.startsWith("set")) {
                    String prop = Character.toLowerCase(name.charAt(3)) + name.substring(4);
                    this.methods.put(prop, method);
                    log.debug("Add row mapping: {} to {}({})", prop, name, parameters[0].getType().getSimpleName());
                }
            }
        }
    }

    /**
     * 根据DB SQL的返回结果通过反射设置Bean
     * SQL里面的结果，可以映射到Obj的field和set方法
     * @param rs
     * @param rowNum
     * @return
     * @throws SQLException
     */
    @Nullable
    @Override
    public T mapRow(ResultSet rs, int rowNum) throws SQLException {
        T bean;
        try {
           bean = this.constructor.newInstance();
            ResultSetMetaData metaData = rs.getMetaData();
            //字段数量
            int columnCount = metaData.getColumnCount();
            for (int i = 1; i <= columnCount; i++) {
                //根据sql别名获取字段信息
                String columnLabel = metaData.getColumnLabel(i);
                Method method = this.methods.get(columnLabel);
                if(method != null) {
                    //从SQL查询结果集获取真实值
                    //执行方法，入参为DB返回字段对应值
                    method.invoke(bean,rs.getObject(columnLabel));
                }else{
                    Field field = this.fields.get(columnLabel);
                    if(field != null) {
                        //为字段设置属性
                        field.set(bean,rs.getObject(columnLabel));
                    }
                }
            }
        }catch (ReflectiveOperationException e){
            throw new DataAccessException(String.format("Could not map result set to class %s", this.clazz.getName()), e);
        }
        return bean;
    }

}

```

### update主键返回

```java
/**
     * 只允许插入一条，然后返回该条主键
     * update and 主键返回
     *
     * @param sql
     * @param params
     * @return
     */
    public Number updateAndReturnGeneratedKey(String sql, Object... params) {
        return execute(
                (Connection con) -> {
                    //主键返回
                    var ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    bindArgs(ps, params);
                    return ps;
                },
                (PreparedStatement ps) -> {
                    int n = ps.executeUpdate();
                    if (n == 0) {
                        throw new DataAccessException("0 rows inserted.");
                    }
                    if (n > 1) {
                        throw new DataAccessException("Multiple rows inserted.");
                    }
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        while (keys.next()) {
                            //直接返回第一个key
                            return (Number) keys.getObject(1);
                        }
                    }
                    throw new DataAccessException("Should not reach here.");
                }
        );
    }
```