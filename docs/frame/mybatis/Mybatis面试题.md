

# Mybatis面试题

## #{} 和 ${} 的区别

- `#`

  Mybatis 会将 SQL 中的 `#{}` 替换成 `？`，对将所有传入的参数作为字符串处理。

  对 SQL 进行预编译处理，通过调用 `PreparedStatement` 的 set 方法来赋值。

- `$`

  Mybatis 会将 `${}` 直接替换成传入的参数，直接拼接的形式来赋值参数，容易造成 SQL 注入的风险。

  ```xml
  select * from user where username = ${}
  ```

  传入 `aa or 1=1`，对应 SQL 为：

  ```
  select * from user where username = aa or 1=1 
  ```

  使用场景：一般用于传表名或者字段名。

## PageHelper 的实现原理

