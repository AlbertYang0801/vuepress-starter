package com.albert.config;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 从配置文件读取配置
 * @author Albert
 * @date 2021/2/19 上午10:17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Configuration
public class ConfigInfo {

    @Value("${gitbook.path}")
    private String gitbookPath;

    @Value("${github.project.path}")
    private String githubProjectPath;

    @Value("${github.remote}")
    private String githubRemote;

    @Value("${github.branch}")
    private String githubBranch;



}
