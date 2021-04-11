const moment = require('moment');

module.exports = {
    '@vuepress/last-updated':
        {
            //格式化时间插件
            transformer: (timestamp, lang) => {
                // 不要忘了安装 moment
                const moment = require('moment')
                moment.locale(lang)
                return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
            }
        },
    '@vuepress/back-to-top': true


};

