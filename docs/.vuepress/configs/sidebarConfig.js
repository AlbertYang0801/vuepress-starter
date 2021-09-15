//高并发
const concurrent = require('./sidebar/concurrent');
//io
const io = require('./sidebar/io');

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
//elasticsearch
const elasticsearch = require('./sidebar/elasticsearch');




// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/java/concurrent/": concurrent,
    "/java/io/": io,
    "/design/": design,
    "/util/": util,
    "/frame/spring/": spring,
    "/java/collection": collection,
    "/java/jvm/": jvm,
    "/database/mysql": mysql,
    "/database/redis": redis,
    "/middleware/es": elasticsearch,
    "/personal/": [
        {
            "title": "个人随笔",
            "collapsable": true,
            "children": [
                // "/personal/work/oppo出差随笔.md"
            ],
            "title": "琐碎记录",
            "collapsable": true,
            "children": [
                "/personal/琐碎记录.md"
            ]
        }
    ]
}
module.exports = sidebarConfig;