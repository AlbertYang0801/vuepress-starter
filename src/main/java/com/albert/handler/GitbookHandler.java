package com.albert.handler;

import com.albert.util.ShellUtils;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 第一步：执行gitbook build命令
 * @author Albert
 * @date 2021/2/20 下午4:26
 */
@Component
public class GitbookHandler extends Handler {

    @Override
    protected String handlerWork() {
        try {
            ShellUtils.exec(configInfo.getGitbookPath(), "gitbook build");
            System.out.println("第一步：gitbook build success!");
        } catch (IOException e) {
            e.printStackTrace();
            return "第一步：执行gitbook build命令出错";
        }
        return "";
    }


}
