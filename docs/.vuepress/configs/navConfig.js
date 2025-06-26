module.exports = [
    {"text": "首页", "link": "/"},
    {
        "text": "Java", items: [
            {text: "JVM", link: '/java/jvm/'},
            {text: "高并发", link: '/java/concurrent/'},
            {text: "IO", link: '/java/io/'},
            {text: '缓存', link: '/java/cache/'},
            {text: '集合', link: '/java/collection/'}
        ]
    },
    {
        text: '框架',
        items: [
            {text: 'Spring', link: '/frame/spring/'},
            {text: 'MyBatis', link: '/frame/mybatis/'},
            {text: 'SpringBoot', link: '/frame/springboot/'},
            {text: 'SpringCloud', link: '/frame/springcloud/'},
            {text: 'Netty', link: '/frame/netty/'}
        ]
    },
    {
        "text": "数据库", items: [
            {text: 'MySQL', link: '/database/mysql/'},
            {text: "Redis", link: '/database/redis/'},
            {text: "ClickHouse", link: '/database/clickhouse/'}
        ]
    },
    {
        text: "中间件",
        items: [
            {text: 'Elasticsearch', link: '/middleware/es/'}
        ]
    },
    {
        text: "云原生",
        items: [
            {text: 'Docker', link: '/middleware/docker/'},
            {text: 'Kubernetes', link: '/middleware/k8s/'}
        ]
    },
    {"text": "设计模式", "link": "/design/"},
    {"text": "工具向", "link": "/util/"},
    {"text": "项目总结", "link": "/project/"},
    {"text": "关于我", "link": "/personal/"}
]
