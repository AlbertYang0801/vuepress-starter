

# Mybatis面试题

## #{} 和 ${} 的区别

Mybatis 在处理 #{} 时，会讲 SQL 中的 #{} 替换成 ？，对 SQL 进行预编译处理，通过调用 PreparedStatement 的 set 方法来赋值。

Mybatis 在处理 ${} 时，会直接把 ${} 