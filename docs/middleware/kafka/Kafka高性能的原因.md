# Kafka高性能的原因

1. 写数据是按照磁盘顺序读写。
   
    保证顺序读写，比随机写性能要高很多。
    
    数据保存在 log 中，并对 log 进行了分段（logSegment）技术，对 logSegment 还增加了日志索引。
    
2. 数据传输的零拷贝，使的数据在内核空间中就完成了读写操作。
   
    零拷贝原理：
    
    ![image.png](https://s2.loli.net/2025/06/26/Vi2nFAkDtSjKycW.png)
    
3. 读写数据的批量处理以及压缩传输。
   
    > Kafka 消息的压缩发生在Producer 和 Broker。Producer 会将批量发送的数据压缩，Broker 会将压缩的数据保存下来，而消费者会去解压缩。
    > 

### 零拷贝

- 传统数据文件拷贝过程
  
    整个过程需要在内核空间和应用空间之间拷贝 2 次。
    
    ![image.png](https://s2.loli.net/2025/06/26/dByMz7faUmVNsJ9.png)
    
- 零拷贝
  
    为什么叫做零拷贝，就是因为不需要在应用空间和内核空间拷贝。
    
    1. 读取磁盘文件加载到内核空间里面的 `Read Buffer`之后。
    2. 直接将文件数据发给网卡接口。
    
    > 整个过程不需要将数据拷贝到应用空间，也不需要将数据拷贝到 Socket Buffer。
    > 
    
    ![image.png](https://s2.loli.net/2025/06/26/DYiuOVohmcT2SqC.png)