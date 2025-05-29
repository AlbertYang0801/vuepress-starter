// 为以下路由添加左侧边栏
module.exports = [
    {
        "title": "类加载器",
        "collapsable": false,
        "children": [
            "/java/jvm/类加载器.md",
            "/java/jvm/对象创建.md"

        ]
    },{
        "title": "内存模型",
        "collapsable": false,
        "children": [
            "/java/jvm/JVM内存模型.md"
        ]
    },{
        "title": "垃圾回收",
        "collapsable": false,
        "children": [
            "/java/jvm/垃圾回收算法.md",
            "/java/jvm/垃圾回收器.md",
            "/java/jvm/G1收集器.md"

        ]
    },{
        "title": "故障排查",
        "collapsable": false,
        "children": [
            "/java/jvm/JDK调优命令.md",
            "/java/jvm/可视化工具.md"
        ]
    },{
        "title": "排障记录",
        "collapsable": false,
        "children": [
            "/java/jvm/CPU负载过高排查记录.md",
            "/java/jvm/内存问题排查总结.md",
            "/java/jvm/频繁GC排查.md"
        ]
    }
]
