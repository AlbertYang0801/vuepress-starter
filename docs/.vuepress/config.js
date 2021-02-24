const plugins = require('./configs/plugins'); // 导入插件配置,如:包括返回顶部,图片缩放,pwa等插件
const navConfig = require('./configs/navConfig'); // 导航栏
const sidebarConfig = require('./configs/sidebarConfig'); // 左侧边栏


module.exports = {
    base: "/blog/",
    title: '技术小站',
    description: '生活不止眼前的代码，还有迈向田野的步伐',
    plugins, // 外部插件配置
    markdown: {
        lineNumbers: true // 代码块是否显示行号
    },
    themeConfig: {
        nav: navConfig,		//导航栏
        sidebar: sidebarConfig, //侧边栏配置，自定义
        sidebarDepth: 2,    //侧边栏深度
        lastUpdated: '上次更新',
        // logo: "/images/logo.png", // 左上角logo
        // repo: 'itclanCode/blogcode', // 链接的仓库
        // repoLabel: 'GitHub', // 链接的名称
        docsDir: 'docs',
        // editLinks: true, // 通过配置editLinks来设置是否出现编辑链接
        // editLinkText: '发现有错误?前往GitHub指正', // 指明编辑功能的文字内容
    }
}
