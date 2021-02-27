const concurrent = require('./sidebar/concurrent'); // 左侧边栏
const design = require('./sidebar/design'); // 左侧边栏
const util = require('./sidebar/util'); // 左侧边栏


// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/": concurrent,
    "/design/": design,
    "/util/": util,

    "/jvm": [
        {
            "title": "JVM",
            "collapsable": false,
            "children": [
                "/jvm/类加载器.md"
            ]
        }
    ],
    "/server/": [
        {
            "title": "服务器向",
            "collapsable": false,
            "children": [
                "/server/端口占用问题.md"
            ]
        }
    ],
    "/personal/": [
        {
            "title": "工作",
            "collapsable": true,
            "children": [
                "/personal/work/oppo出差随笔.md"
            ]
        }
    ]
}
module.exports = sidebarConfig;