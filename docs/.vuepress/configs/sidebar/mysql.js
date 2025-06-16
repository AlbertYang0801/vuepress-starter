module.exports = [
    {
        title: "MySQL基础",
        collapsable: false,
        children: [
            "/database/mysql/MySQL基础架构.md",
            "/database/mysql/InnoDB存储引擎.md",
            "/database/mysql/MySQL日志系统.md",
            "/database/mysql/一条更新SQL的执行过程.md",
            "/database/mysql/事务隔离.md",
            "/database/mysql/B树和B+树.md",
            "/database/mysql/索引.md",
            "/database/mysql/锁.md",
            "/database/mysql/行锁.md"
        ]
    }, {
        title: "MySQL总结",
        collapsable: false,
        children: [
            "/database/mysql/SQL语句的抖动问题.md",
            "/database/mysql/索引失效的场景.md",
            "/database/mysql/explain使用总结.md",
            "/database/mysql/慢查询日志.md"
        ]
    }, {
        title: "问题总结",
        collapsable: false,
        children: [
            "/database/mysql/OrderBy和limit混用的bug.md",
            "/database/mysql/MySQL的binlog日志过期删除.md",
            "/database/mysql/MySQL根据idb文件恢复数据.md"
        ]
    }
]


