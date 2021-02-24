package com.albert.handler;


import cn.hutool.core.util.StrUtil;
import com.albert.config.ConfigInfo;

import java.util.Objects;

/**
 * @author Albert
 * @date 2021/2/20 下午3:55
 */
public abstract class Handler {

    public static ConfigInfo configInfo;

    protected Handler nextHandler;

    public void setNextNode(Handler nextHandler) {
        this.nextHandler = nextHandler;
    }

    /**
     * 处理逻辑
     */
    abstract protected String handlerWork();

    public String work() {
        String workMsg = handlerWork();
        //结点返回错误信息
        if (StrUtil.isNotEmpty(workMsg)) {
            return workMsg;
        }
        //本结点处理成功后调用下一结点
        if (Objects.nonNull(nextHandler)) {
            return nextHandler.work();
        }
        return "任务全部执行完成!";
    }


}
