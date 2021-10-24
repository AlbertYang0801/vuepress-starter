# MySQL高级



## 视图

视图是 MySQL从 5.0.1 版本提供的新功能，是一种虚拟存在的表，视图本身并不保存任何数据，**本质上对应一条 SELECT 语句**。只保存了 SQL 逻辑，不保存查询结果，在使用视图时会动态生成数据。

### 应用场景

1. 查询结果使用 SQL 较为复杂。

2. 复用 SQL。

3. **封装复杂 SQL 的实现细节，简化查询操作**。

4. **保护数据查询安全性**。

   > 某银行为了提高数据安全性，不让私有化产品直接访问它们的生产数据库，而是将需要的查询结果创建对应的视图，再创建一个只拥有视图权限的账号，很好的保证了生产环境数据的安全性。

### 视图操作

1. 授权

   为某个用户授予创建视图的权限。

   ```sql
   GRANT CREATE VIEW TO username;
   ```

2. 创建视图

   ```sql
   create view class_user
   AS 
   select a.id,a.classname from class a
   inner join `user` b
   on a.id = b.class
   ```

3. 修改视图

   ```sql
   alter view class_user
   as 
   select * from user
   ```

4. 删除视图

   ```sql
   drop view class_user
   ```

5. 查看视图结构

   ```sql
   desc class_user
   ```

    查询结果如下：

![image-20211024210949828](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211024210949.png)

6. 查询视图

   查询视图和查询表是一样的操作。

   <img src="https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20211024211653.png" alt="image-20211024211653529" style="zoom:50%;" />

   

