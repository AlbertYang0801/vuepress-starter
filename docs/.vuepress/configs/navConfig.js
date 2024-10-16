module.exports = [
    {"text": "首页", "link": "/"},
    {
        "text": "Java篇", items: [
            {text: 'Java 容器', link: '/java/collection/'},
            {text: "Java 虚拟机", link: '/java/jvm/'},
            {text: "Java 高并发", link: '/java/concurrent/'},
            {text: "Java IO", link: '/java/io/'},

        ]
    },
    {
        "text": "数据库", items: [
            {text: 'MySQL', link: '/database/mysql/'},
            {text: "Redis", link: '/database/redis/'}
        ]
    },
    {
        text: '框架篇',
        items: [
            {text: 'Spring', link: '/frame/spring/'},
            {text: 'SpringBoot', link: '/frame/springboot/'},
            {text: 'MyBatis', link: '/frame/mybatis/'}
        ]
    },
    {
        text: "进阶篇",
        items: [
            {text: 'Elasticsearch', link: '/middleware/es/'},
            {text: 'Docker', link: '/middleware/docker/'},
            {text: 'Kubernetes', link: '/middleware/k8s/'},
        ]
    },
    {"text": "设计模式", "link": "/design/"},
    {"text": "工具向", "link": "/util/"},
    {"text": "项目总结", "link": "/project/"},
    {"text": "关于我", "link": "/personal/"}
]
