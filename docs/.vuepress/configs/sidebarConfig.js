const concurrent = require('./sidebar/concurrent'); // 左侧边栏


// 为以下路由添加左侧边栏
const sidebarConfig = {
    "/concurrent/": concurrent,
    "/server/": [
        {
            "title": "服务器向",
            "collapsable": false,
            "children": [
                "/server/端口占用问题.md"
            ]
        }
    ], "/util/": [
        {
            "title": "工具向",
            "collapsable": false,
            "children": [
                {
                    "title": "GitBook",
                    "collapsable": true,
                    "children": [
                        "/util/gitbook/gitbook使用总结.md",
                        "/util/gitbook/Gitbook插件.md",
                        "/util/gitbook/Gitbook搭配GitHubPages搭建主页.md",
                        "/util/gitbook/Gitbook本地环境搭建.md",
                        "/util/gitbook/Gitbook自动发布GitHub脚本.md",
                    ]
                },
                "/util/Java实现复制文件夹下的所有文件.md",
                "/util/Java实现执行系统命令.md",
                "/util/Java实现markdown增加目录.md",
                "/util/PicGo+GitHub搭建图床.md"
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