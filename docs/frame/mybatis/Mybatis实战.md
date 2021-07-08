# Mybatis实战

## 插入

### 批量插入

- Mapper文件中自定义添加批量插入，包含主键返回。

```xml

<insert id="insertList" parameterType="java.util.List" keyProperty="id" useGeneratedKeys="true">
        insert into script_param (script_info_id, param_name,param_key, param_value)
        values
        <foreach collection="list" item="item" index="index" separator=",">
            (
                #{item.scriptInfoId,jdbcType=INTEGER},
                #{item.paramName,jdbcType=VARCHAR},
                #{item.paramKey,jdbcType=VARCHAR},
                #{item.paramValue,jdbcType=VARCHAR}
            )
        </foreach>

    </insert>
```

- Dao 层

```java
int insertList(List<ScriptParam> scriptParamList);
```

### 主键返回

数据库id设置自增或者由数据库指定，在使用逆向工程的情况下，insert语句返回的是影响的行数，而不是插入数据的id，若我们想要获取到主键id，则需要改写对应的Mapper.xml文件。

```xml
<insert ......>
		//主键返回语句，返回自增id
		<selectKey keyProperty="id" order="AFTER" resultType="long">
			SELECT LAST_INSERT_ID();
		</selectKey>
		.........
</insert>
```

或者

```xml
   <insert id="saveReturnPK1" parameterType="cn.lyn4ever.bean.User" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO `test`.`tb_user`(`username`, age) VALUES(#{username}, #{age})
   </insert>
```









## 删除

### 批量删除 - 逻辑删除

- Mapper文件使用 foreach关键字循环拼接主键。

```xml
    <update id="deleteList" parameterType="java.util.List">
        update script_param
            set delete_flag= 1
        where id in
        <foreach collection="list" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </update>
```



## 内置函数

### 判断单个参数为空（_parameter）

使用mybatis的内置函数_parameter（判断输入的简单类型参数是否为空）

**_parameter是mybatis的内置函数，是在输入类型为简单类型的时候，判断参数是否为空的时候要用到_parameter来代替输入的参数。**

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210707175009.png)



## 配置

### 更新语句影响行数

**在mybatis中的mapper.xml配置update语句，想要获取update语句执行后影响的记录行数**。
**解决办法:在数据库连接配置url后加上`&useAffectedRows=true`**

![](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210707175707.png)





## 逆向工程

### 问题一：逆向工程时会把其他数据库同名表同时生成

https://blog.csdn.net/zwj1030711290/article/details/105935086

解决办法是在Mybatis逆向工程的配置文件里的数据库连接地址中添加下列参数：

```xml
nullCatalogMeansCurrent=true
```

[参考链接](https://blog.csdn.net/zwj1030711290/article/details/105935086)



