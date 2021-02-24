package com.albert.script;

import com.albert.config.ConfigInfo;
import com.albert.handler.CopyHandler;
import com.albert.handler.GitHandler;
import com.albert.handler.GitbookHandler;
import com.albert.handler.Handler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

/**
 * gitbook定时同步脚本-启动项目
 *
 * @author Albert
 * @date 2021/2/20 下午2:57
 */
@Slf4j
@Component
public class GitbookAutoScript {

    @Resource
    ConfigInfo configInfo;

    @Resource
    GitbookHandler gitbookHandler;

    @Resource
    CopyHandler copyHandler;

    @Resource
    GitHandler gitHandler;

    @PostConstruct
    public void initConfig(){
        Handler.configInfo = configInfo;
    }

    @Scheduled(cron = "${auto.sync.gitbook.cron}")
    public void scheduledPublish() {
        log.info("start sync gitbook tsak");
        gitbookHandler.setNextNode(copyHandler);
        copyHandler.setNextNode(gitHandler);
        //执行信息
        String msg = gitbookHandler.work();
        System.out.println(msg);
        log.info("sync gitbook stak end");
    }


}
