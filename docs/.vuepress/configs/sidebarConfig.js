const concurrent = require('./sidebar/concurrent');
const design = require('./sidebar/design');
const util = require('./sidebar/util');
const spring = require('./sidebar/spring');


// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/": concurrent,
    "/design/": design,
    "/util/": util,
    "/frame/spring/": spring,

    "/jvm/": [
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
            "title": "学习计划表",
            "collapsable": true,
            "children": [
                "/personal/学习计划表.md"
            ]
        },
        {
            "title": "个人随笔",
            "collapsable": true,
            "children": [
                "/personal/work/oppo出差随笔.md"
            ]
        }
    ]
}
module.exports = sidebarConfig;