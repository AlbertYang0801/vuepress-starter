
//------------------------------------Java---------------------------------
//高并发
const concurrent = require('./sidebar/concurrent');
//io
const io = require('./sidebar/io');
//jvm
const jvm = require('./sidebar/jvm');
//Java容器
const collection = require('./sidebar/collection');
//io
const cache = require('./sidebar/cache');

//------------------------------------框架---------------------------------
const spring = require('./sidebar/spring');
const springboot = require('./sidebar/springboot');
const mybatis = require('./sidebar/mybatis');
const springcloud = require('./sidebar/springcloud');
const netty = require('./sidebar/netty');


//------------------------------------设计模式---------------------------------
//设计模式
const design = require('./sidebar/design');
//工具向
const util = require('./sidebar/util');

//mysql
const mysql = require('./sidebar/mysql');
//redis
const redis = require('./sidebar/redis');

//elasticsearch
const elasticsearch = require('./sidebar/elasticsearch');
//docker
const docker = require('./sidebar/docker');

//k8s
const k8s = require('./sidebar/k8s');

const project = require('./sidebar/project');


// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/java/concurrent/": concurrent,
    "/java/io/": io,
    "/java/collection": collection,
    "/java/jvm/": jvm,
    "/java/cache/": cache,

    "/frame/spring/": spring,
    "/frame/springboot/": springboot,
    "/frame/mybatis/": mybatis,
    "/frame/springcloud/": springcloud,
    "/frame/netty/": netty,


    "/design/": design,
    "/util/": util,


    "/database/mysql": mysql,
    "/database/redis": redis,
    "/middleware/es": elasticsearch,
    "/middleware/docker": docker,
    "/middleware/k8s": k8s,
    "/project": project,

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