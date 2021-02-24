package com.albert.handler;


import com.albert.util.FileCopyUtils;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 第二步：从_book目录下复制文件到项目目录
 * @author Albert
 * @date 2021/2/20 下午3:55
 */
@Component
public class CopyHandler extends Handler {

    @Override
    protected String handlerWork() {
        try {
            FileCopyUtils.copyFile(configInfo.getGitbookPath()+"/_book", configInfo.getGithubProjectPath());
            System.out.println("第二步：将_book目录文件复制到项目目录成功!");
        } catch (IOException e) {
            e.printStackTrace();
            return "第二步：将_book目录文件复制到项目目录出错";
        }
        return "";
    }


}
