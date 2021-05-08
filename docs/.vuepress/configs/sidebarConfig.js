const concurrent = require('./sidebar/concurrent');
const design = require('./sidebar/design');
const util = require('./sidebar/util');
const spring = require('./sidebar/spring');
//Java容器
const collection = require('./sidebar/collection');


// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/": concurrent,
    "/design/": design,
    "/util/": util,
    "/frame/spring/": spring,
    "/java/collection": collection,

    "/java/jvm/": [
        {
            "title": "Jvm",
            "collapsable": false,
            "children": [
                "/java/jvm/类加载器.md"
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
            "title": "个人随笔",
            "collapsable": true,
            "children": [
                // "/personal/work/oppo出差随笔.md"
            ]
        }
    ]
}
module.exports = sidebarConfig;