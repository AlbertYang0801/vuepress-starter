# 映射器-mapper

- SqlSession提供了SqlId。
- 而SqlSessionFactroy 提供了开启SqlSession的能力。]
- MapperRegistry 包含了所有Mapper的SqlId，包含注册发现Mapper的能力。

## MapperFactory

![](https://s2.loli.net/2025/06/10/3aMBbz7oh8LgsOe.png)

### MapperProxy

在mybatis中，调用mapper里面的方法就可以执行SQL。其实是因为mybatis隐藏了实现细节。

具体做法是根据mapper里面点的方法生成代理逻辑，在调用该方法时其实是走的代理类的逻辑。

而代理类封装了操作数据库的逻辑，代理类即为mapperProxy。

### MapperProxyFactory

工厂方法封装了mapper接口生成代理类的逻辑，通过工厂方法即可获取对应mapper的代理类，减少mapperProxy的重复创建逻辑。

引入简单工厂模式，隐蔽创建proxy类的细节。

### SqlSession

- 提供与数据库交互的能力。
- 获取mapper映射器。
- 管理事务。

> SqlSession、DefaultSqlSession 用于定义执行 SQL 标准、获取映射器以及将来管理事务等方面的操作。基本我们平常使用 Mybatis 的 API 接口也都是从这个接口类定义的方法进行使用的。
> 

![](https://s2.loli.net/2025/06/10/XgTAMqKvia43hbl.png)

> sqlSession 才是真正执行 SQL 的地方。
> 

### 实现类

sqlSession规定了SqlId。

sqlSession的实现类，包含了执行SQL的代理逻辑。比如DefaultSqlSession。

![](https://s2.loli.net/2025/06/10/j9eO5G3NudZngQX.png)

### SqlSessionFactory

SqlSessionFactory 是一个简单工厂模式，用于提供 SqlSession 服务，屏蔽创建细节，延迟创建过程。

```java
public interface SqlSessionFactory {

    SqlSession openSession();

}
```

### MapperRegistry

MapperRegistry 提供包路径的扫描和映射器代理类注册机服务，完成接口对象的代理类注册处理。

```java
public class MapperRegistry {

    /**
     * 将已添加的映射器代理加入到 HashMap
     * 封装mapper对应的
     */
    private final Map<Class<?>, MapperProxyFactory<?>> knownMappers = new HashMap<>();

    public <T> T getMapper(Class<T> type, SqlSession session) {
        MapperProxyFactory<?> mapperProxyFactory = knownMappers.get(type);
        if (mapperProxyFactory == null) {
            throw new RuntimeException("Type " + type + " is not known to the MapperRegistry.");
        }
        try {
            return (T) mapperProxyFactory.newInstance(session);
        } catch (Exception e) {
            throw new RuntimeException("Error getting mapper instance. Cause: " + e, e);
        }
    }

    public <T> void addMapper(Class<T> type) {
        /**
         * mapper必须是接口才能注册
         */
        if (type.isInterface()) {
            if (hasMapper(type)) {
                throw new RuntimeException("Type " + type + " is already known to the MapperRegistry.");
            }
            //value是mapper代理类的工厂，通过该工厂可以获取mapper的代理类
            knownMappers.put(type,new MapperProxyFactory<>(type));
        }
    }

    /**
     * 扫描Mapper
     *
     * @param packageName
     */
    public void addMapper(String packageName) {
        // 扫描class
        Set<Class<?>> mapperSet = ClassScanner.scanPackage(packageName);
        for (Class<?> aClass : mapperSet) {
            addMapper(aClass);
        }
    }

    public <T> boolean hasMapper(Class<T> type) {
        return knownMappers.containsKey(type);
    }

}
```

### Mapper-xml

扫描配置文件中的自定义Mapper。

```xml
<configuration>

    <!--    映射文件配置   -->
    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
    </mappers>

</configuration>
```