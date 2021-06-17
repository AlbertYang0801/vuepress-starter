//高并发
const concurrent = require('./sidebar/concurrent');
//设计模式
const design = require('./sidebar/design');
//工具向
const util = require('./sidebar/util');
const spring = require('./sidebar/spring');
//Java容器
const collection = require('./sidebar/collection');
//mysql
const mysql = require('./sidebar/mysql');
//redis
const redis = require('./sidebar/redis');
//jvm
const jvm = require('./sidebar/jvm');



// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/": concurrent,
    "/design/": design,
    "/util/": util,
    "/frame/spring/": spring,
    "/java/collection": collection,
    "/java/jvm/": jvm,
    "/database/mysql": mysql,
    "/database/redis": redis,
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