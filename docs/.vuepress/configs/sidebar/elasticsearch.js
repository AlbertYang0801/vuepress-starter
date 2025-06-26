// 为以下路由添加左侧边栏
module.exports = [
    {
        "title": "Elasticsearch基础",
        "collapsable": true,
        "children": [
            "/middleware/es/Elasticsearch基础概念.md",
            "/middleware/es/Elasticsearch检索.md",
            "/middleware/es/Elasticsearch聚合查询.md",
            "/middleware/es/ES滚动查询-Scroll.md",
            "/middleware/es/批量操作Bulk和BulkProcessor.md",
            "/middleware/es/BulkProcessor死锁问题.md",
            "/middleware/es/并发场景修改文档.md",
            "/middleware/es/ES深度分页问题.md",
            "/middleware/es/ES集群.md",
            "/middleware/es/ES分片.md"
        ]
    },{
        "title": "原理总结",
        "collapsable": false,
        "children": [
            "/middleware/es/倒排索引原理.md",
            "/middleware/es/Elasticsearch写入原理.md",
            "/middleware/es/Elasticsearch查询原理.md",
            "/middleware/es/ES聚合查询原理.md"
        ]
    },{
        "title": "使用问题",
        "collapsable": false,
        "children": [
            "/middleware/es/ES参数调优.md",
            "/middleware/es/集群脑裂-参数配置.md",
            "/middleware/es/ES压测记录和esrally使用.md",
            "/middleware/es/ES的log4j2日志自动清理配置.md"
        ]
    }
]


