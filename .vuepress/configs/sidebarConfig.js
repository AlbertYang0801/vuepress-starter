// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/threadpool/": [
        {
            "title": "线程池",
            "collapsable": false,
            "children": [
                {
                    "title": "四种拒绝策略",
                    "path": "/concurrent/threadpool/四种拒绝策略"
                }
            ]
        }
    ],
    "/study/english/": [
        {
            "title": "英语",
            "collapsable": false,
            "children": [
                {
                    "title": "第一节",
                    "path": "/study/english/english01"
                },
                {
                    "title": "第二节",
                    "path": "/study/english/english02"
                },
                {
                    "title": "第三节",
                    "path": "/study/english/english03"
                }
            ]
        }
    ],
    "/study/math/": [
        {
            "title": "数学",
            "collapsable": false,
            "children": [
                {
                    "title": "第一节",
                    "path": "/study/math/math01"
                },
                {
                    "title": "第二节",
                    "path": "/study/math/math02"
                },
                {
                    "title": "第三节",
                    "path": "/study/math/math03"
                }
            ]
        }
    ]
}
module.exports = sidebarConfig;