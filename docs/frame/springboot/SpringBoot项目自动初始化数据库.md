# SpringBoot项目自动初始化数据库

## 背景

在 SpringBoot 启动的时候若配置文件中配置的数据库不存在，则自动创建数据库，并执行初始化SQL。

### 思路

1. 判断数据库是否存在。
2. 手动注入Datasource。
    
    在数据库未创建时，启动会报错
    
3. 初始化表。

### 解决方式

1. 启动类排除 `DataSourceAutoConfiguration.class` ，采用手动注入的方式。
    
    如果配置的数据库不存在，SpringBoot启动的时候会提示找不到数据库，所以要排除掉，然后手动注入。
    
    ```java
    @SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
    @MapperScan(basePackages = "org.vlis.cloudnevro.dao")
    public class ApiServerApplication {
    
        public static void main(String[] args) {
            SpringApplication.run(ApiServerApplication.class, args);
        }
    
    }
    ```
    
2. 配置文件内容
    
    ```yaml
    spring:
      datasource:
        url: jdbc:mysql://localhost:3306/cloudnevro?useUnicode=true&characterEncoding=UTF-8&useSSL=false&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true
        password: root
        username: 123456
        driverClassName: com.mysql.cj.jdbc.Driver
        hikari:
          idle-timeout: 120000
          minimum-idle: 20
          maximum-pool-size: 200
          keepalive_time: 60000
          #建议根据mysql的wait_timeout属性（默认28800000ms）配置
          max-lifetime: 28000000
        #初始化SQL脚本
        sql-script-encoding: UTF-8
        initialization-mode: always
    ```
    
3. 创建 hikari 对应的配置类，加载配置文件中 hikari 有关的配置。
    
    ```java
    @ConfigurationProperties(
            prefix = "spring.datasource.hikari"
    )
    @Component
    public class HikariProperties extends HikariConfig {
    
    }
    ```
    
4. 数据库初始化类
    
    ```java
    @Configuration
    @Slf4j
    public class DataSourceConfig {
    
        @Autowired
        DataSourceProperties dataSourceProperties;
    
        @Autowired
        HikariProperties hikariProperties;
    
        /**
         * 初始化数据库
         */
        @PostConstruct
        public void init() {
            Connection connection = null;
            Statement statement = null;
            try {
                log.info("start init database!");
                Class.forName(dataSourceProperties.getDriverClassName());
                URI uri = new URI(dataSourceProperties.getUrl().replace("jdbc:", ""));
                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                connection = DriverManager.getConnection("jdbc:mysql://" + host + ":" + port, dataSourceProperties.getUsername(), dataSourceProperties.getPassword());
                statement = connection.createStatement();
                //数据库若不存在则创建
                String initSql = "CREATE DATABASE IF NOT EXISTS `" + path.replace("/", "") + "` DEFAULT CHARACTER SET `utf8mb4` COLLATE `utf8mb4_0900_ai_ci`;";
                statement.executeUpdate(initSql);
                statement.close();
                connection.close();
            } catch (URISyntaxException | ClassNotFoundException | SQLException e) {
                log.error("init database error ===> {}", e.getMessage());
            } finally {
                try {
                    if (statement != null && !statement.isClosed()) {
                        statement.close();
                    }
                    if (connection != null && !connection.isClosed()) {
                        connection.close();
                    }
                } catch (SQLException throwables) {
                    log.error("init database close error ===> ", throwables);
                }
            }
        }
    
        /**
         * 手动注入DataSource
         * @return HikariDataSource
         */
        @Bean
        public DataSource dataSource() {
            log.info("start create datasource!");
            hikariProperties.setDriverClassName(dataSourceProperties.getDriverClassName());
            hikariProperties.setJdbcUrl(dataSourceProperties.getUrl());
            hikariProperties.setUsername(dataSourceProperties.getUsername());
            hikariProperties.setPassword(dataSourceProperties.getPassword());
            return new HikariDataSource(hikariProperties);
        }
    
    }
    ```
    
5. 数据表初始化类
    
    ```java
    @Configuration
    @DependsOn("dataSourceConfig")
    @Slf4j
    public class DataSourceTableInit {
    
        @Resource
        private HikariDataSource dataSource;
    
        @Value("classpath:sql/init.sql")
        private org.springframework.core.io.Resource sqlScriptData;
    
        @Bean
        public DataSourceInitializer dataSourceInitializer(final DataSource dataSource) {
            DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
            dataSourceInitializer.setDataSource(dataSource);
            dataSourceInitializer.setDatabasePopulator(databasePopulator());
            if (checkTable()) {
                log.info("sys_config table exist! not execute dataSourceInitializer");
                dataSourceInitializer.setEnabled(false);
            }
            return dataSourceInitializer;
        }
    
        private DatabasePopulator databasePopulator() {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            //可以加入其它的sql脚本文件
            populator.addScript(sqlScriptData);
            return populator;
        }
    
        private boolean checkTable() {
            Connection connection;
            try {
                log.info("start check sys_config table");
                connection = dataSource.getConnection();
                DatabaseMetaData metaData = connection.getMetaData();
                //检查表名，url需配置nullCatalogMeansCurrent=true，否则会去其它库查表
                ResultSet resultSet = metaData.getTables(null, null, "sys_config", null);
                boolean checkResult = resultSet.next();
                log.info("check sys_config table result ===> {}", checkResult);
                return checkResult;
            } catch (SQLException e) {
                log.error("check sys_config table error! {} ", e.getMessage());
            }
            return true;
        }
    
    }
    ```