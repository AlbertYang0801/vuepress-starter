# ES压测记录和esrally使用


## 环境信息

- 压测环境
  
    ```
    http://10.1.11.200:39200/
    ```
    
- 开发环境
  
    ```java
    http://10.10.101.69:39200
    ```
    
- 测试环境
  
    ```java
    http://10.10.103.218:39200/
    ```
    

## esrally安装

### docker安装

1. 拉取镜像
   
    ```
    docker pull elastic/rally
    ```
    
2. 查看 track 列表
   
    ```
    docker run elastic/rally list tracks
    ```
    
3. 运行 rally镜像
    - root 用户启动：`u root`
    - 挂载本地磁盘：`v /home/rally:/tracks`
    
    ```
    docker run -it -u root -v  /home/rally:/tracks elastic/rally /bin/bash
    ```
    
4. 根据已有 es 索引创建 track
    - `-track=httpdata`：track 名称
    - `-target-hosts`：es 地址
    - `-indices`：指定索引名称，多个以逗号隔开
    - `-output-path`：track 挂在目录
    - `-client-options`：es 验证信息（可选）
    
    ```
    esrally create-track --track=httpdata --target-hosts=10.1.10.176:9200 --indices="bpm1.0-shiya_test-httpdata-1" --output-path=/tracks --client-options="use_ssl:false,basic_auth_user:'elastic',basic_auth_password:'elastic'"
    ```
    
    > 根据已有索引生成的 track，json 文件保留了索引的全部数据。
    > 
    
    ![20220210201727.png](https://s2.loli.net/2025/06/26/OPLqC2hRxYEsjMd.png)
    

### k8s安装

由于 es 使用 k8s 部署，所以将 esrally 部署到 k8s 同一个 namespace 下。

**esrally-pod.yaml**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: esrally
  namespace: cloudmonitor
  labels:
    app: rally
spec:
  restartPolicy: Always
  node-selector: 10.1.11.200-master
  containers:
  - name: rally
    image: elastic/rally:latest
    imagePullPolicy: Always
    command:
    - tail
    - -f
    - /dev/null
    #容器内部挂载路径
    volumeMounts:
    - name: rally-data
      mountPath: /tracks
 #本地挂载路径
 volumes:
  - name: rally-data
    hostPath:
      path: /home/rally
      
                    
```

## rally命令

1. 查看指定目录下的 track
   
    ```
    esrally list tracks --track-path=/tracks/httpdata
    ```
    
2. 启动 race，自定义 track。
    - 自定义 track，需要使用 `-track-path` 指定路径。
    - 官方自带的 track，使用 `-track` 即可。
    - 指定 `-test-mode`, 标识进行测试，只插入1000条数据。不指定则选择全量插入。
    
    ```
    esrally race --track-path=/tracks/httpdata --test-mode --pipeline=benchmark-only --target-hosts=10.1.10.176:9200 --client-options="use_ssl:false,basic_auth_user:'elastic',basic_auth_password:'elastic'"
    ```
    
    > 同时只能有一个trace，若想强制关闭正在运行的trace，可以在启动新的trace时，添加参数：--kill-running-processes
    > 

## track.json配置

![20220210202349.png](https://s2.loli.net/2025/06/26/DJzW146YKSMnFTx.png)

优化track.json

- 新增 mapping 的类型。
  
    ![20220214174513.png](https://s2.loli.net/2025/06/26/MGRH3AxETcYk2BS.png)
    
- 删除多余的 operation。
  
    ![20220214174533.png](https://s2.loli.net/2025/06/26/6Z9GRzkYn8TciI5.png)
    

## 测试方案

1. 在固定集群节点数和资源情况下，调整插入的文档数据量，测试不同数据量文档对插入的影响。
2. 固定插入文档数据量和集群节点数量，调整节点资源限制，测试不同节点资源下对插入的影响。
3. 固定插入文档数据量和节点资源限制，调整集群节点数量，测试不同节点数量下对插入的影响。

## 测试命令

```

创建不同的索引

esrally create-track --track=aggentity --target-hosts=10.1.11.200:39200  --indices="apm2.0-yanshi_default_default-npm_agg_entity-2022.02.11" --output-path=/tracks

esrally race --track-path=/tracks/aggentity --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 

esrally create-track --track=aggtopo --target-hosts=10.1.11.200:39200  --indices="apm2.0-yanshi_default_default-npm_agg_topology-2022.02.11" --output-path=/tracks

esrally race --track-path=/tracks/aggtopo --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 

esrally create-track --track=detailentity --target-hosts=10.1.11.200:39200  --indices="apm2.0-yanshi_default_default-npm_detail_entity-2022.02.11" --output-path=/tracks

http://10.10.103.218:39200/

esrally create-track --track=npmtopo --target-hosts=10.1.11.200:39200 --indices="apm2.0-yanshi_default_default-npm_detail_topology-2022.02.11
" --output-path=/tracks

esrally race --track-path=/tracks/npmtopo --test-mode --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 

esrally race --track-path=/tracks/npmtopo --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 

#进入容器

docker exec -it -u root a078cb866b23 /bin/bash

apm2.0-yanshi_default_default-npm_request_trace-2022.02.11

esrally race --track-path=/tracks/npmtrace --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 

 kubectl get statefulset.apps/es-cluster  -n cloudmonitor -o yaml

kubectl edit statefulset.apps/es-cluster  -n cloudmonitor 

esrally race --track-path=/tracks/detailentity --pipeline=benchmark-only --target-hosts=10.1.11.200:39200 
```

## 参考链接

- [官网-使用 Docker 运行 Rally](https://esrally.readthedocs.io/en/2.3.1/docker.html)
- [Rally-术语表](http://esrally.lyremelody.org/zh_CN/latest/glossary.html)