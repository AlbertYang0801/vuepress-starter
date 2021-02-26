package com.albert.script;

import com.albert.config.ConfigInfo;
import com.albert.handler.CopyHandler;
import com.albert.handler.GitHandler;
import com.albert.handler.GitbookHandler;
import com.albert.handler.Handler;

/**
 * gitbook手动脚本-不需要启动项目
 * 需手动指定参数
 *
 * @author Albert
 * @date 2021/2/20 下午4:55
 */
public class GitbookManualScript {

    /**
     * gitbook目录
     */
    private final static String GITBOOK_PATH = "/Users/yangjunwei/vuepress-starter/docs";
    /**
     * github对应本地项目目录
     */
    private final static String GITHUB_PROJECT_PATH = "/Users/yangjunwei/IdeaProjects/vuepress-technology-station";
    /**
     * github对应remote
     */
    private final static String GITHUB_REMOTE = "origin";
    /**
     * github分支名称
     */
    private final static String GITHUB_BRANCH = "main";

    static {
        Handler.configInfo = ConfigInfo.builder()
                .gitbookPath(GITBOOK_PATH)
                .githubProjectPath(GITHUB_PROJECT_PATH)
                .githubRemote(GITHUB_REMOTE)
                .githubBranch(GITHUB_BRANCH)
                .build();
    }

    public static void publish() {
        GitbookHandler gitbookHandler = new GitbookHandler();
        CopyHandler copyHandler = new CopyHandler();
        GitHandler gitHandler = new GitHandler();

        gitbookHandler.setNextNode(copyHandler);
        copyHandler.setNextNode(gitHandler);
        //执行信息
        String msg = gitbookHandler.work();
        System.out.println(msg);
    }

    public static void main(String[] args) {
        //调用脚本
        GitbookManualScript.publish();
    }


}
