package com.albert.handler;

import cn.hutool.core.date.LocalDateTimeUtil;
import com.albert.util.ShellUtils;
import org.springframework.stereotype.Component;

/**
 * 第三步：提交项目内容到github
 *
 * @author Albert
 * @date 2021/2/20 下午3:55
 */
@Component
public class GitHandler extends Handler {

    private final String addCommand = "git add .";
    private String commitCommand = "git commit -m {msg}";
    private String pushCommand = "git push {remote} {branch}";

    @Override
    protected String handlerWork() {
        try {
            commitCommand = commitCommand.replace("{msg}", getCommitMsg());
            //拼接push命令
            pushCommand = pushCommand.replace("{remote}", configInfo.getGithubRemote())
                    .replace("{branch}", configInfo.getGithubBranch());

            //需要执行的git命令
            String[] commands = {addCommand, commitCommand, pushCommand};
            ShellUtils.exec(configInfo.getGithubProjectPath(), commands);
            System.out.println("第三步：将项目推送到github成功!");
        } catch (Exception e) {
            e.printStackTrace();
            return "第三步：将项目推送到github出错";
        }
        return "";
    }

    /**
     * git提交信息格式：gitbook-script-publish-yyyy-MM-dd～HH:mm:ss
     */
    private String getCommitMsg() {
        return "gitbook-script-publish-" + LocalDateTimeUtil.format(LocalDateTimeUtil.now(), "yyyy-MM-dd～HH:mm:ss");
    }


}
