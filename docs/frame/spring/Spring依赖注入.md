# Spring依赖注入

**依赖注入就是通过spring将bean所需要的一些参数传递到bean实例对象的过程（将依赖关系注入到对象中，不需要每次都new对象）**

- set方法注入
- 构造方法注入
- 注解注入

## 注解注入的区别

- @Resource
  
    byName注入
    
    ![](https://s2.loli.net/2025/05/30/KCvmoWrP1AyziVt.png)
    
- Autowired
  
    byType注入