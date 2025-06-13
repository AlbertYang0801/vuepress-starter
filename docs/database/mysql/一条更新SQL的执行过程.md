# 一条更新SQL的执行过程

[juejin.cn](https://juejin.cn/post/6920076107609800711#heading-9)

```java
mysql> update T set c=c+1 where ID=2;
```

## 执行流程

1. 执行器先找引擎取出 ID=2 这一行记录。
    - 如果该行记录在 `Buffer Pool` 中存在，会直接返回数据给执行器。
    - 如果该行记录不存在，则会先进行如下操作，再返回数据给执行器。
        - 从磁盘中查找数据。
        - 将数据写入内存 `Buffer Pool` 中。
        - 将数据写入 `undo.log`（记录 insert、update、delete等修改数据的操作）。
2. 执行器获取到引擎给的行数据，把这条数据更新 c+1，得到新的一行数据，再调用引擎接口写入新数据。
3. 引擎会将新数据写入`Buffer Pool` 中，同时将更新的操作记录写入`redo log buffer`中。然后告知执行器更新完成，可以提交事务。
   
    此时 `redo log` 处于 `prepare`阶段（一阶段提交）。
    
4. 执行器生成更新操作的 `bin.log` 记录，并将 `bin.log` 追加到磁盘文件中。
5. 执行器调用引擎的提交事务接口。
   
    引擎把刚才写入到 `redo.log` 的状态改为 `commit` 状态（二阶段提交），至此更新完成。
    

![](https://s2.loli.net/2025/06/13/B7FTunfIVkCcdjR.png)

---

### 执行流程图

![](https://s2.loli.net/2025/06/13/jsGzBW5hlZyrfPU.png)