# kafka消费模型

kafka消费模型分为两种。

1. 消费组消费
   
    消费组里面的单个消费者消费一个分区的数据。
    
    > 如果消费者数量大于分区数量，则多余的消费者不消费分区的数据。所以若采用这种消费模型，应 保证消费者数量和分区数量一致。
    > 
    
    ![20220308113526.png](https://s2.loli.net/2025/06/26/ga5sFodDmb3ikf9.png)
    
2. 消费者-worker进程消费。

![20220307152737.png](https://s2.loli.net/2025/06/26/9paiUIGQxw54Yqo.png)

> 第一种消费模型，每个分区对应一个 consumer。
> 

第二种消费模型，只消费数据不处理，处理的工作单独交给 worker线程池，这样可以避免很多 consumer产生的问题。不要把很重的处理逻辑放到消费者中。

> 难以保证 offset 的语义正确性，可能导致重复消费。
> 

![image.png](https://s2.loli.net/2025/06/26/mQFtJ7b3dEprOLz.png)

---

da的kafka消费者数量只有 1 个，单线程去消费数据，使用 while 循环，不断地去 poll 数据（单次最多500条）。

> 若要提高消费者数量，可以多开几个线程来执行 while 循环。
> 

![20220307152311.png](https://s2.loli.net/2025/06/26/bunjlqgUVAhX2RN.png)

单线程消费的情况下，为了提高数据处理速度，使用了10个worker线程来处理数据，poll 到数据后，直接提交数据到worker线程池进行数据处理。

![20220307153101.png](https://s2.loli.net/2025/06/26/XifcoAsSEMmOuJp.png)

---

[https://www.cnblogs.com/huxi2b/p/6124937.html](https://www.cnblogs.com/huxi2b/p/6124937.html)

[【原创】Kafka Consumer多线程实例 - huxihx - 博客园](https://www.cnblogs.com/huxi2b/p/6124937.html)