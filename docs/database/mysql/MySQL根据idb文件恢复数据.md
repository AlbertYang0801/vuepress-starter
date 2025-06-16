# MySQL根据idb文件恢复数据

### MySQL根据idb文件恢复数据

1. MySQl解除表名
   
    `Plain Text  ALTER TABLE 表名 DISCARD TABLESPACE`
    
2. 复制 idb 文件到 data目录。
   
    ![](https://s2.loli.net/2025/06/16/oPNsDZAih5vyGnY.png)
    
3. idb 文件增加权限。
   
    ```
    chown mysql:mysql user_tenant.ibd
    ```
    
    ![](https://s2.loli.net/2025/06/16/U5F9JLwSdniyZGM.png)
    
4. 重新导入表数据文件
   
    ```
    ALTER TABLE 表名 IMPORT TABLESPACE
    ```