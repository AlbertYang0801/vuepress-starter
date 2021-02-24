package com.albert.util;


import java.io.*;

/**
 * @author Albert
 * @date 2021/2/20 下午2:38
 */
public class ShellUtils {

    /**
     * 在指定目录下执行单个命令
     *
     * @param filePath 目录
     * @param command  命令
     */
    public static void exec(String filePath, String command) throws IOException {
        //指定目录
        File dir = new File(filePath);
        //执行进程命令
        Process process = Runtime.getRuntime().exec(command, null, dir);
        printResult(process);
    }

    /**
     * 按照顺序执行多个命令
     *
     * @param filePath 目录
     * @param commands 命令
     */
    public static void exec(String filePath, String[] commands) {
        try {
            //指定目录
            File dir = new File(filePath);
            for (String command : commands) {
                //执行进程命令
                Process process = Runtime.getRuntime().exec(command, null, dir);
                //打印返回的信息
                printResult(process);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**
     * 打印命令返回的信息
     */
    private static void printResult(Process process) throws IOException {
        // 记录dos命令的返回信息
        StringBuilder resStr = new StringBuilder();
        // 获取返回信息的流
        InputStream in = process.getInputStream();
        Reader reader = new InputStreamReader(in);
        BufferedReader bReader = new BufferedReader(reader);
        for (String res = ""; (res = bReader.readLine()) != null; ) {
            resStr.append(res + "\n");
        }
        System.out.println(resStr.toString());
        bReader.close();
        reader.close();
        process.getOutputStream().close();
    }


}
