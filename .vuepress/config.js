const plugins = require('./configs/plugins'); // 导入插件配置,如:包括返回顶部,图片缩放,pwa等插件
const navConfig = require('./configs/navConfig'); // 导航栏
const sidebarConfig = require('./configs/sidebarConfig'); // 左侧边栏


module.exports = {
    base: "/technology-station/",
    title: '技术小站',
    description: '博观而约取,厚积而薄发',
    keywords: 'AlbertYang的技术博客, AlbertYang', // 关键字
    plugins, // 外部插件配置
    themeConfig: {
        nav: navConfig,		//导航栏
        sidebar: sidebarConfig, //侧边栏配置，自定义
        sidebarDepth: 2,    //侧边栏深度
        lastUpdated: '上次更新',
        // logo: "/images/logo.png", // 左上角logo
        repo: 'itclanCode/blogcode', // 链接的仓库
        repoLabel: 'GitHub', // 链接的名称
        docsDir: 'docs',
        editLinks: true, // 通过配置editLinks来设置是否出现编辑链接
        editLinkText: '发现有错误?前往GitHub指正', // 指明编辑功能的文字内容
        smoothScroll: true, // 点击左侧侧边栏,页面滚动效果,smoothScroll 选项来启用页面滚动效果,true为启动,false禁用
        displayAllHeaders: false // 默认情况下，侧边栏只会显示由当前活动页面的标题（headers）组成的链接, 设置为 true 来显示所有页面的标题链接
    }
}
