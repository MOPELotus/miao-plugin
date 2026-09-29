import { Cfg, Common, Data, Version } from '#miao'
import fs from 'node:fs'
import lodash from 'lodash'
import HelpTheme from './HelpTheme.js'
import { miaoPath } from '#miao.path'

const helpPath = `${miaoPath}/resources/help`

const Help = {
    // 保留原有的render方法，返回详细的帮助信息
    async render(e) {
        if (!/喵喵/.test(e.msg) && !Cfg.get('help', false)) {
            return false;
        }

        let helpText = "这是帮助信息：\n";

        let custom = {};
        let help = {};
        if (fs.existsSync(`${helpPath}/help-cfg.js`)) {
            console.log('miao-plugin: 检测到存在help-cfg.js配置\n建议将help-cfg.js移为config/help.js或重新复制config/help_default.js进行配置~');
            help = await import(`file://${helpPath}/help-cfg.js?version=${new Date().getTime()}`);
        } else if (fs.existsSync(`${helpPath}/help-list.js`)) {
            console.log('miao-plugin: 检测到存在help-list.js配置，建议将help-list.js移为config/help.js或重新复制config/help_default.js进行配置~');
            help = await import(`file://${helpPath}/help-list.js?version=${new Date().getTime()}`);
        }

        let { diyCfg, sysCfg } = await Data.importCfg('help');

        // 兼容一下旧字段
        if (lodash.isArray(help.helpCfg)) {
            custom = {
                helpList: help.helpCfg,
                helpCfg: {}
            };
        } else {
            custom = help;
        }

        let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList;

        // 构建帮助信息文本
        lodash.forEach(helpList, (group) => {
            if (group.auth && group.auth === 'master' && !e.isMaster) {
                return true;
            }

            lodash.forEach(group.list, (item) => {
                helpText += `- ${item.name}: ${item.description}\n`; // 添加命令的描述
            });
        });

        // 返回帮助页面的详细信息
        return helpText;
    },

    // 新增text功能，发送帮助链接或简单文本
    async text(e) {
        const helpText = '点击查看机器人帮助：\nhttps://www.lotusshared.cn/yunzai/';
        e.reply(helpText);  // 发送文本帮助链接
    },

    async version(e) {
        return await Common.render('help/version-info', {
            currentVersion: Version.version,
            changelogs: Version.changelogs,
            elem: 'cryo'
        }, { e, scale: 1.2 });
    }
};
export default Help
