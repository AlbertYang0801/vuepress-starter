# IO流

## 什么是流？

流（`Stream`），是一个抽象的概念，是指一连串的数据（字符或字节），是以先进先出的方式发送信息的通道。

> 每个文件保存在计算机上时，是以**二进制形式**存在的，只有 0 和 1。比如一张图片保存在计算机上时，都是 0 和 1 组成，最终可以经过各种转换演变成了图片显示出来。
>
> 比如我们将图片从计算机复制到另一个文件夹的时候，将图片的二进制数据一点点的传递，类似于数据像水流一样一点点的流动到了目的地，所以整体传输的二进制数据称为数据流。

## 什么是IO流？

I/O 流是 Input/Output 的缩写，用于处理设备之间的数据传输。如读/写文件，网络通信等。

在 Java 中，对于数据的输入/输出操作都是基于 流（stream） 的方式进行。

### 流的分类？

#### 1. 数据流向

根据程序和设备数据流向的不同，可以将流分为：**输入流 **和 **输出流**。

- 输入流：从设备（磁盘等）将数据输入到程序中。
- 输出流：将程序中的数据输出到设备（磁盘等）上保存。

#### 2. 操作的数据单位

 根据操作的数据单位的不同，可以将流分为：**字节流 **和 **字符流**。

- 字节流：以字节为单位进行数据传输（1 Byte=8 bit）。
- 字符流：以字符为单位进行数据传输（1字符=2字节）。

> 字符流的本质上也是通过字节流读取，Java 中的字符采用 Unicode 标准，在读取和输出的过程中，通过以字符为单位，查找对应的码表将字节转换为对应的字符。

**什么时候需要用字节流，什么时候又要用字符流？**

- 对于非文本文件（mp3,jpg,doc,ppt) 使用**字节流**处理。字节流能处理所有文件，但是对于文本文件的处理效率较低。
- 对于文本文件（txt,java,cpp）使用**字符流**处理，字符流只针对字符数据进行传输，只能处理文本文件。

#### 3. 流的功能

 根据功能的不同，可以将流分为：**节点流 **和 **处理流**。

- 节点流：节点流是**真正传输数据**的流对象，用于访问**特定的一个地方（节点）读写数据**，称为节点流。例如：访问文件、访问数组、访问管道、访问字符串。

- 处理流：处理流是对节点流的封装，通过对基础输入/输出流进行封装，提高读写效率或额外功能。

  比如 **缓冲流** 就是一种处理流，能够提高节点流的读写效率；

### IO流的总结

根据数据流向和数据类型的分类，对 IO 中最核心的 4 个顶层抽象类进行分类可得：

| 数据流向/数据类型 | 字节流       | 字符流 |
| ----------------- | ------------ | ------ |
| 输入流            | InputStream  | Reader |
| 输出流            | OutputStream | Writer |

 4 个顶层抽象类下面所有的成员类如下图。

![image-20200823091738251](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210907170703.awebp)

看到 **Stream** 就知道是**字节流**，看到 **Reader/Writer** 就知道是**字符流**。

>Java IO 有字节流转换为字符流的转换类，成为转换流。

根据流的功能进行分类，有以下几种。

![img](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210907174609.awebp)



## 节点流

节点流是**真正传输数据**的流对象，用于访问**特定的一个地方（节点）读写数据**，称为节点流。例如：访问文件、访问数组、访问管道、访问字符串。

### Java常用的节点流

| 类型   | 字节输入流           | 字节输出流                | 字符输入流      | 字符输出流      |
| ------ | -------------------- | ------------------------- | --------------- | --------------- |
| 文件   | FileInputStream      | FileOutputStrean          | FileReader      | FileWriter      |
| 管道   | PipedInputStream     | PipedOutputStream         | PipedReader     | PipedWriter     |
| 数组   | ByteArrayInputStream | ByteArrayOutputStreamChar | CharArrayReader | CharArrayWriter |
| 字符串 |                      |                           | StringReader    | StringWriter    |

### 文件字符流

#### 1. 文件字符输入流 - FileReader 

**构造方法**

- `FileReader(String fileName)`
- `FileReader(File file)`

**读取方法**

- `read()` ：*返回读入的一个字符。如果达到文件末尾，返回 -1*。
- `read(char cbuf[])`：*返回每次读入cbuf数组中的字符的个数。如果达到文件末尾，返回 -1。此方法会阻塞*。

```java
    /**
     * 测试FileReader的基本读取方法。
     * read(char cbuf[])方法
     */
    @Test
    public void testReadChars() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        File file = new File(path);
        try {
            //1.将文件加载到流对象
            FileReader fileReader = new FileReader(file);
            //2.创建一个空的字符数组(足够大)
            char[] chars = new char[1024];
            //3.将流对象中的数据读取到字符数组中
            fileReader.read(chars);
            //4.关闭流对象
            fileReader.close();
            String str = new String(chars);
          	//打印文件内容
            System.out.println(str);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```

#### 2. 文件字符输出流 - FileWriter 

**构造方法**

- `FileWriter(File file, boolean append)`

  append：是否在原文件上追加内容。(true：追加；false：覆盖)

- `FileWriter(File file)`

- `FileWriter(String fileName, boolean append)`

- `FileWriter(String fileName)`

**写入方法**

- `write(String str)`
- `write(char cbuf[], int off, int len)`
- `write(char cbuf[])`
- `write(String str, int off, int len)`

```java
     /**
     * 测试文件写入
     */
    @Test
    public void testWrite() {
        //要写入的文件可以不存在，并不会报异常，在输出的过程会自动创建文件
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        File file = new File(path);
        FileWriter fileWriter = null;
        try {
            //1.创建输出流（append可以指定覆盖原文件，还是追加原文件）
            fileWriter = new FileWriter(file, true);
            //2.写入数据
            fileWriter.write("测试插入数据\n");
            fileWriter.write("hello world\n");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (Objects.nonNull(fileWriter)) {
                try {
                    //3.关闭字符输出流
                    fileWriter.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
```

#### 3. FileWriter结合FileReader实现文件复制

```java
    /**
     * FileWriter结合FileReader实现文件复制
     */
    @Test
    public void testCopyFile() {

        String read = "src/main/java/com/albert/javase/io/file/data.txt";
        String write = "src/main/java/com/albert/javase/io/file/newdata.txt";

        FileReader fileReader = null;
        FileWriter fileWriter = null;
        try {
            //1.创建字符输入流、字符输出流
            fileReader = new FileReader(read);
            fileWriter = new FileWriter(write,false);
            //2.创建缓冲区
            char[] chars = new char[1024];
            int length;
            //3.循环写入数据
            while ((length=fileReader.read(chars))!=-1){
                fileWriter.write(chars,0,length);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (fileReader != null) {
                    fileReader.close();
                }
                if (fileWriter != null) {
                    fileWriter.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

```



### 文件字节流

#### 1. 文件字节输入流 - FileInputStream

**构造方法**

- `FileInputStream(String name)`
- `FileInputStream(File file)`

**输入方法**

- `read()`：*从此输入流读取一个字节的数据，如果达到文件末尾，返回 -1。如果无输入，此方法会阻塞。*
- `read(byte b[])`：*从输入流读取字节数组的个数，如果达到文件末尾，返回 -1。如果无输入，此方法会阻塞。*
- `read(byte b[], int off, int len)`

```java
    /**
     * 测试FileInputStream读取文本文件（可能出现中文乱码）,FileOutputStream 输出文件。
     * 原因：一个汉字对应2～4个字节，当缓冲区固定时（比如6），容易读取到半个汉字，就输出文件。
     * 解决办法：使用转换流转换为字符输入流
     */
    @Test
    public void testInput() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        String outputPath = "src/main/java/com/albert/javase/io/file/newdata.txt";

        FileInputStream fileInputStream = null;
        FileOutputStream fileOutputStream = null;

        try {
            //1.创建字节输入流
            fileInputStream = new FileInputStream(path);
            fileOutputStream = new FileOutputStream(outputPath);
            //2.创建字节数组
            byte[] bytes = new byte[5];
            int length;
            //3.从输入流读取数据到缓冲区
            while ((length = fileInputStream.read(bytes)) != -1) {
                //4.从缓冲区输出
                fileOutputStream.write(bytes, 0, length);
            }
            System.out.println("复制成功");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                //4.关闭字节输入流
                fileInputStream.close();
                fileOutputStream.flush();
                fileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
```



#### 2. 文件字节输出流 - FileOutputStream

**构造方法**

- `FileOutputStream(String name)`

- `FileOutputStream(String name, boolean append)`

  append：是否在原文件上追加内容。(true：追加；false：覆盖)

- `FileOutputStream(File file)`

- `FileOutputStream(File file, boolean append)`

**输出方法**

- `write(byte b[])`：*将指定字节数组中的字节输出到次文件输出流*
- `write(byte b[], int off, int len)`

```java
    /**
     * 测试FileInputStream读取文本文件（可能出现中文乱码）,FileOutputStream 输出文件。
     * 原因：一个汉字对应2～4个字节，当缓冲区固定时（比如6），容易读取到半个汉字，就输出文件。
     * 解决办法：使用转换流转换为字符输入流
     */
    @Test
    public void testInput() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        String outputPath = "src/main/java/com/albert/javase/io/file/newdata.txt";

        FileInputStream fileInputStream = null;
        FileOutputStream fileOutputStream = null;

        try {
            //1.创建字节输入流
            fileInputStream = new FileInputStream(path);
            fileOutputStream = new FileOutputStream(outputPath);
            //2.创建字节数组
            byte[] bytes = new byte[5];
            int length;
            //3.从输入流读取数据到缓冲区
            while ((length = fileInputStream.read(bytes)) != -1) {
                //4.从缓冲区输出
                fileOutputStream.write(bytes, 0, length);
            }
            System.out.println("复制成功");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                //4.关闭字节输入流
                fileInputStream.close();
                fileOutputStream.flush();
                fileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
```

#### 3. 使用FileInputStream和FileOutputStream进行图片（非文件）复制

```java
    /**
     * 使用FileInputStream和FileOutputStream进行图片（非文件）复制
     */
    @Test
    public void testIOPic() {
        String path = "src/main/java/com/albert/javase/io/file/hello.jpg";
        String outputPath = "src/main/java/com/albert/javase/io/file/newhello.jpg";

        FileInputStream fileInputStream = null;
        FileOutputStream fileOutputStream = null;
        try {
            //1.创建字节输入流和字节输出流
            fileInputStream = new FileInputStream(path);
            fileOutputStream = new FileOutputStream(outputPath);
            //2.创建字节数组
            byte[] bytes = new byte[5];
            int len;
            //3.循环（输入流-》字节数组-》输出流）
            while ((len = fileInputStream.read(bytes)) != -1) {
                fileOutputStream.write(bytes, 0, len);
            }
            System.out.println("复制成功");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (fileInputStream != null) {
                    fileInputStream.close();
                }
                if (fileOutputStream != null) {
                    fileOutputStream.flush();
                    fileOutputStream.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
```



## 缓冲流

为了提高数据读写的速度，Java 提供了带缓冲功能的流。

*缓冲流是一种处理流，能够增强节点流的读写速率，而真正的读写功能的时候还是节点流来实现的。*

在使用这些缓冲流的时候，会创建一个内部缓冲区数组，大小为 8192 个字节（8kb）。

![image-20210909103012394](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210909103012.png)

### 缓冲流的分类

缓冲流要与节点流搭配使用，根据数据操作单位（字节或字符）可以把缓冲流分为字节型和字符型。

- 字节型：BufferedInputStream 和 BufferedOutputStream。
- 字符型：BufferedReader 和 BufferedWriter。

### 缓冲流的过程

![原理图](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210909112828.png)

1. 读取过程

   - 第一次读取数据时，会从文件中读取 8192 个字节数据写入缓冲区，并将第一个返回调用者。
   - 再次读取数据时，直接从缓冲区获取。
   - 当缓冲区数据被读完后，再次从文件中读取 8192 个字节数据写入缓冲区。

2. 写入过程

   - 写入数据时，会将数据先写入到缓冲区。

   - 若缓冲区被写满，字节数达到 8192 个，则将缓冲区数据写入输出流，输出到文件。

   - 若最后一次执行结束，缓冲区未被写满，则可以调用`flush()`方法。

     `flush()` 方法可以强制将缓冲区的内容写入输出流。

3. 关闭流
   - 关闭流的时候，关闭最外层流，也会关闭对应的内层节点流。
   - 如果是带缓冲区的流对象的 `close()` 方法，不但会关闭流，还会在关闭流之前刷新缓冲区。
   - 必须调用 `flush()` 或 `close() ` 方法刷新缓冲区，这样数据才能写入到磁盘，不然数据都会留到缓冲区。

---

### 缓冲流和节点流速度对比

**缓冲流的作用是提供一个缓冲区，该缓冲区位于内存中，能够减少读写过程中 IO 操作的次数。**

#### 1. 数据写入的速率对比

如下图，节点流在输出的过程中每次读取到数据输出到磁盘上的过程就是一次 IO 操作。而缓冲流提供的缓冲区，在每次读取数据的时，先将数据放到缓冲区，直到缓冲区满了之后，再输出到磁盘。相比较大大**减少了输出到磁盘的 IO 操作**。

![临时文件 (9)](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210909145214.png)

#### 2. 数据读取的速率对比

如下图，节点流在读取数据时，每读取一次都是从磁盘读取数据到内存，对应一次IO操作。而缓冲流提供的缓冲区，在第一次读取数据时，从磁盘中读取缓冲区大小一致的数据放到缓冲区，然后返回一条数据到内存。第二次读取数据就直接从缓存区读数据，而不是从磁盘读取，**减少了读取磁盘的 IO 操作**。

![临时文件 (10)](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210909145306.png)

#### 3. 缓冲流真的比节点流快吗？

**缓冲流并不是绝对的比节点流快。**

当只需要进行一次 IO 操作的时候（读写一次数据量和缓冲区的数据量一致），节点流仅仅进行了一次 IO 操作。而缓冲流进行一次 IO 操作写入到缓冲区之后，还需要从缓冲区读取数据。这种情况下，缓冲流相较于节点流，多了一步操作。

![临时文件 (11)](https://cdn.jsdelivr.net/gh/AlbertYang0801/pic-bed@main/img/20210909145923.png)

### 缓冲流练习

1. 字节缓冲流实现非文本文件复制

   ```java
       /**
        * 缓冲流复制非文本文件-字节缓冲流
        * BufferedInputStream和BufferedOutputStream
        */
       @Test
       public void testBufferIoCopyPic() {
           String path = "src/main/java/com/albert/javase/io/file/hello.jpg";
           String outputPath = "src/main/java/com/albert/javase/io/file/newhello.jpg";
   
           FileInputStream fileInputStream = null;
           FileOutputStream fileOutputStream = null;
           BufferedInputStream bufferedInputStream = null;
           BufferedOutputStream bufferedOutputStream = null;
           try {
               //1.创建字节输入流和字节输出流
               fileInputStream = new FileInputStream(path);
               fileOutputStream = new FileOutputStream(outputPath);
   
               //2.创建对应的缓冲流
               bufferedInputStream = new BufferedInputStream(fileInputStream);
               bufferedOutputStream = new BufferedOutputStream(fileOutputStream);
   
               //3.创建字节数组
               byte[] bytes = new byte[1024];
               int length;
               while ((length = bufferedInputStream.read(bytes)) != -1) {
                   //缓冲区写入
                   bufferedOutputStream.write(bytes, 0, length);
               }
               System.out.println("复制成功");
           } catch (IOException e) {
               e.printStackTrace();
           } finally {
               try {
                   if (bufferedInputStream != null) {
                       bufferedInputStream.close();
                   }
                   if (bufferedOutputStream != null) {
   //                    bufferedOutputStream.flush();
                       //缓冲区的流对象在关闭流之前，会自动刷新缓冲区
                       bufferedOutputStream.close();
                   }
                   //关闭带缓冲区的流对象，会自动关闭节点流
   //                fileInputStream.close();
   //                fileOutputStream.close();
               } catch (IOException e) {
                   e.printStackTrace();
               }
           }
   
       }
   ```

2. 字符缓冲流实现文本文件复制

   ```java
       /**
        * 缓冲流复制文本文件-字符缓冲流
        * BufferedReader 和 BufferedWriter
        */
       @Test
       public void testCopyText() {
           String path = "src/main/java/com/albert/javase/io/file/data.txt";
           String outputPath = "src/main/java/com/albert/javase/io/file/newdata.txt";
           FileReader fileReader = null;
           FileWriter fileWriter = null;
           BufferedReader bufferedReader = null;
           BufferedWriter bufferedWriter = null;
   
           try {
               //节点流
               fileReader = new FileReader(path);
               fileWriter = new FileWriter(outputPath);
               //缓冲流
               bufferedReader = new BufferedReader(fileReader);
               bufferedWriter = new BufferedWriter(fileWriter);
             	//字符数组
               char[] chars = new char[1024];
               int length;
               while ((length = bufferedReader.read(chars)) != -1) {
                   bufferedWriter.write(chars, 0, length);
               }
           } catch (IOException e) {
               e.printStackTrace();
           } finally {
               try {
                   //关闭最外层流对象，对应节点流也会关闭
                   if (bufferedReader != null) {
                       //带有缓冲区的流对象关闭，会在关闭流之前刷新缓冲区
                       bufferedReader.close();
                   }
                   if (bufferedWriter != null) {
                       bufferedWriter.close();
                   }
               } catch (IOException e) {
                   e.printStackTrace();
               }
           }
   
       }
   ```

3. 统计文本中每个字符出现的次数，并输出统计结果到文本。

   ```java
       /**
        * 统计某个文本中，各个字符出现的次数
        * 并将字符统计结果输出到文本中
        */
       @Test
       public void countChar() {
           String path = "src/main/java/com/albert/javase/io/file/data.txt";
           String outputPath = "src/main/java/com/albert/javase/io/file/newdata.txt";
           FileReader fileReader = null;
           FileWriter fileWriter = null;
           BufferedReader bufferedReader = null;
           BufferedWriter bufferedWriter = null;
   
           Map<Character, Integer> map = Maps.newHashMap();
           try {
               //节点流
               fileReader = new FileReader(path);
               fileWriter = new FileWriter(outputPath);
               //缓冲流
               bufferedReader = new BufferedReader(fileReader);
               bufferedWriter = new BufferedWriter(fileWriter);
               int b;
               while ((b = bufferedReader.read()) != -1) {
                   char cValue = (char) b;
                   if (map.containsKey(cValue)) {
                       Integer value = map.get(cValue);
                       map.put(cValue, value + 1);
                   } else {
                       map.put(cValue, 1);
                   }
               }
               System.out.println(JsonUtil.toString(map));
               Set<Map.Entry<Character, Integer>> entries = map.entrySet();
               for (Map.Entry<Character, Integer> entry : entries) {
                   Character key = entry.getKey();
                   Integer value = entry.getValue();
                   bufferedWriter.write(key+"="+value);
                   bufferedWriter.write("\n");
               }
           } catch (IOException e) {
               e.printStackTrace();
           } finally {
               try {
                   //关闭最外层流对象，对应节点流也会关闭
                   if (bufferedReader != null) {
                       //带有缓冲区的流对象关闭，会在关闭流之前刷新缓冲区
                       bufferedReader.close();
                   }
                   if (bufferedWriter != null) {
                       bufferedWriter.close();
                   }
               } catch (IOException e) {
                   e.printStackTrace();
               }
           }
   
   
       }
   ```

   

### 缓冲流实现图片加密

图片的加密通过**异或运算**来完成。

- **异或运算**：*两个位相同为 0 ，不同为 1*。

  > 异或运算也可以这样理解：*男性和女性能生出孩子，否则就不行*。（来自某知乎大神相见恨晚的评论。）

- **异或运算特性**：*一个二进制数 A 和 另一个二进制数 B 异或运算两次的话，结果还是原来的二进制数 A。*

---

图片作为非文本，在输入输出时需要使用字节流来操作，针对每个字节与指定的**二进制数 B**进行异或运算，**第一次运算为加密，第二次进行相同的运算即可得到原字节完成解密** 。


```java
    /**
     * 使用缓冲流实现图片加密
     */
    @Test
    public void encyPic() {
        String path = "src/main/java/com/albert/javase/io/file/hello.jpg";
        //加密图片
        String encyOutputPath = "src/main/java/com/albert/javase/io/file/ency.jpg";
        //解密图片
        String decryptOutputPath = "src/main/java/com/albert/javase/io/file/decrypt.jpg";

        //加密（对图片每个字节进行异或运算）
        encyPic(path,encyOutputPath,10);
        //再次加密即可解密（对图片每个字节进行第二次异或运算，即可得到原字节）
      	//指定二进制数 B 为 10
        encyPic(encyOutputPath,decryptOutputPath,10);

    }

    private void encyPic(String path, String outputPath, int password) {
        FileInputStream fileInputStream = null;
        FileOutputStream fileOutputStream = null;
        BufferedInputStream bufferedInputStream = null;
        BufferedOutputStream bufferedOutputStream = null;
        try {
            //节点流
            fileInputStream = new FileInputStream(path);
            fileOutputStream = new FileOutputStream(outputPath);
            //缓冲流
            bufferedInputStream = new BufferedInputStream(fileInputStream);
            bufferedOutputStream = new BufferedOutputStream(fileOutputStream);
            int b;
            while ((b = bufferedInputStream.read()) != -1) {
                //将字节加密（字节b进行异或运算，解密时再进行一次异或运算即可得到b）
                //再次调用该方法即可得到原字节
                bufferedOutputStream.write(b ^ password);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                //关闭最外层流对象，对应节点流也会关闭
                if (bufferedInputStream != null) {
                    //带有缓冲区的流对象关闭，会在关闭流之前刷新缓冲区
                    bufferedInputStream.close();
                }
                if (bufferedOutputStream != null) {
                    bufferedOutputStream.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
```



## 转换流

转换流提供了在**字节流和字符流之间的转换**，很多时候我们使用转换流来解决文件乱码的问题。

字符流和字节流之间的转换是有严格定义的：

- 输入流：可以将 字节流 => 字符流
- 输出流：可以将 字符流 => 字节流

为什么输入流不能 **字符流 => 字节流**，输出流不能 **字节流 => 字符流**？

> 在存储设备上，数据都是以字节为单位存储，所以**输入到内存时必定是先以字节为单位**输入，**输出到存储设备时最终必须是以字节为单位**输出。
>
> 字节流才是计算机最根本的存储方式，而字符流是在字节流的基础上，通过**字符集的映射**对数据进行转换，将字节转换为字符的，每个字符本质还是以字节为单位存储。

### 转换流API

Java 提供了两个转换流的 API。

- InputStreamReader ：从**字节流转换为字符流**，将字节的输入流按指定字符集转换为字符的输入流。

  > 字节流中的数据都是字符时，转成字符流操作更高效。

- OutputStreamWriter：从**字符流转换为字节流**，将字符的输出流按指定字符集转换为字节的输出流。

| 转换流/数据类型  | 输入输出 | 字节流和字符流之间的转换 |
| ---------------- | -------- | ------------------------ |
| 字节流 => 字符流 | 输入流   | InputStreamReader        |
| 字符流 => 字节流 | 输出流   | OutputStreamWriter       |

### 转换流练习
```java
    /**
     * 测试InputStreamReader
     * 输入
     * 字节流=》字符流
     */
    @Test
    public void testInputStreamReader() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        FileInputStream fileInputStream = null;
        InputStreamReader inputStreamReader = null;
        try {
            fileInputStream = new FileInputStream(path);
            inputStreamReader = new InputStreamReader(fileInputStream, "UTF-8");
            char[] chars = new char[1024];
            int len;
            while ((len = inputStreamReader.read(chars)) != -1) {
                String content = new String(chars, 0, len);
                System.out.println(content);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**
     * 测试OutputStreamWriter
     * 输出流
     * 字符流=》字节流
     */
    @SneakyThrows
    @Test
    public void testInputStreamReader2() {
        String path = "src/main/java/com/albert/javase/io/file/newdata.txt";
        FileOutputStream fileOutputStream = null;
        OutputStreamWriter outputStreamWriter = null;
        try {
            fileOutputStream = new FileOutputStream(path);
            //将字节流转换为对应字符流输出
            outputStreamWriter = new OutputStreamWriter(fileOutputStream, "GBK");
            outputStreamWriter.write("这是一行测试数据");
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            outputStreamWriter.close();
        }

    }
```



## 数据流

数据输出流允许应用程序以适当方式将基本 Java 数据类型写入输出流中。然后，应用程序可以使用数据输入流将数据读入。

### 数据流API

- `DataInputStream`

  作为 `InputStream` 的外部流使用。

- `DataOutputStream`

  作为 `OutputStream` 的外部流使用。

### 数据流练习

```java
    /**
     * 将内存中的字符串，基本数据类型变量写入到文件中。
     */
    @Test
    public void testWrite() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        DataOutputStream dataOutputStream = null;
        try {
            dataOutputStream = new DataOutputStream(new FileOutputStream(path));
            dataOutputStream.writeUTF("我回来了");
            dataOutputStream.flush();
            dataOutputStream.writeInt(222);
            dataOutputStream.flush();
            dataOutputStream.writeBoolean(true);
            dataOutputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                dataOutputStream.close();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }

    /**
     * 从文件中读取字符串、基本数据类型到内存中
     */
    @Test
    public void testRead() {
        String path = "src/main/java/com/albert/javase/io/file/data.txt";
        DataInputStream dataInputStream = null;
        try {
            dataInputStream=new DataInputStream(new FileInputStream(path));
            String content = dataInputStream.readUTF();
            int i = dataInputStream.readInt();
            boolean b = dataInputStream.readBoolean();
            System.out.println(content);
            System.out.println(i);
            System.out.println(b);
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            try {
                dataInputStream.close();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }
```





## 序列化和反序列化

### 序列化的定义

- **序列化**：把 Java 对象转换为字节序列的过程。

  *不能够序列化 `static` 和 `transient` 修饰的成员变量。*

- **反序列化**：把字节序列恢复为 Java 对象的过程。

### 序列化的作用

- 把对象的字节序列保存到硬盘，通常存放在一个文件中。（持久化对象）
- 在网络上传送对象的字节序列。（网络传输对象）

### 序列化的实现

只有实现了 `Serializable` 或者 `Externalizable` 接口的类的对象才能被序列化为字节序列。*否则会抛出 `NotSerializableException` 异常。*

> Externalizable继承了Serializable，该接口中定义了两个抽象方法：writeExternal()与readExternal()。当使用Externalizable接口来进行序列化与反序列化的时候需要重写writeExternal()与readExternal()方法。若没有重写方法，输出内容为空。
>
> 在使用Externalizable进行序列化的时候，在读取对象时，会调用被序列化类的无参构造器去创建一个新的对象，然后再将被保存对象的字段的值分别填充到新对象中。所以，实现Externalizable接口的类必须要提供一个public的无参的构造器。

---

1. Serializable

   - 自定义对象

     > 自定义对象实现 `Serializable` 接口，通过对象流进行序列化和反序列化。

     ```java
     	/**
          * 实现Serializable接口支持序列化
          */
         @Data
         @NoArgsConstructor
         @AllArgsConstructor
         class Person implements Serializable {
     
             private String name;
             private int age;
     
         }	
     ```

   - 使用对象流

     ```java
     		/**
          * 测试对象流的写入
          */
         @Test
         public void testWrite() {
             String path = "src/main/java/com/albert/javase/io/file/data.bat";
             ObjectOutputStream objectOutputStream = null;
             try {
                 Person person = new Person("小明", 10);
                 objectOutputStream = new ObjectOutputStream(new FileOutputStream(path));
                 //序列化
                 objectOutputStream.writeObject(person);
                 objectOutputStream.flush();
             } catch (IOException ioException) {
                 ioException.printStackTrace();
             } finally {
                 try {
                     objectOutputStream.close();
                 } catch (IOException ioException) {
                     ioException.printStackTrace();
                 }
             }
         }
     
         /**
          * 测试对象流的读取
          */
         @Test
         public void testRead() {
             String path = "src/main/java/com/albert/javase/io/file/data.bat";
             ObjectInputStream objectInputStream = null;
             try {
                 objectInputStream = new ObjectInputStream(new FileInputStream(path));
                 //反序列化
                 Person person = (Person) objectInputStream.readObject();
                 System.out.println(JsonUtil.toString(person));
             } catch (IOException | ClassNotFoundException ioException) {
                 ioException.printStackTrace();
             } finally {
                 try {
                     objectInputStream.close();
                 } catch (IOException ioException) {
                     ioException.printStackTrace();
                 }
             }
         }
     ```

   

2. Externalizable

   - 自定义对象

     ```java
     /**
      * 实现Externalizable接口支持序列化
      * 反序列化机制根据重写的两个方法实现
      * 若没有实现内容，则反序列化的对象属性都是默认值。
      */
     @Data
     @NoArgsConstructor
     @AllArgsConstructor
     class OldMan implements Externalizable {
     
         private String name;
         private int age;
     
         @Override
         public void writeExternal(ObjectOutput out) throws IOException {
             out.writeUTF(name);
             out.write(age);
         }
     
         @Override
         public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException 		{
             name = in.readUTF();
             age = in.read();
         }
     }
     ```

   - 使用对象流

     ```java
         /**
          * 测试Externalizable序列化
          */
         @Test
         public void testExternalizableWrite() {
             String path = "src/main/java/com/albert/javase/io/file/data.bat";
             ObjectOutputStream objectOutputStream = null;
             try {
                 OldMan oldMan = new OldMan("小明", 10);
                 objectOutputStream = new ObjectOutputStream(new FileOutputStream(path));
                 objectOutputStream.writeObject(oldMan);
                 objectOutputStream.flush();
             } catch (IOException ioException) {
                 ioException.printStackTrace();
             } finally {
                 try {
                     objectOutputStream.close();
                 } catch (IOException ioException) {
                     ioException.printStackTrace();
                 }
             }
         }
     
         /**
          * 测试Externalizable反序列化
          */
         @Test
         public void testExternalizableRead() {
             String path = "src/main/java/com/albert/javase/io/file/data.bat";
             ObjectInputStream objectInputStream = null;
             try {
                 objectInputStream = new ObjectInputStream(new FileInputStream(path));
                 OldMan person = (OldMan) objectInputStream.readObject();
                 System.out.println(JsonUtil.toString(person));
             } catch (IOException | ClassNotFoundException ioException) {
                 ioException.printStackTrace();
             } finally {
                 try {
                     objectInputStream.close();
                 } catch (IOException ioException) {
                     ioException.printStackTrace();
                 }
             }
         }
     ```

     

### Transient关键字

Transient 关键字的作用：**控制变量某个属性的序列化**。加上该关键字的属性，在被反序列化的时候，会被设置为初始值。

```java
/**
 * 实现Serializable接口支持序列化
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class Person implements Serializable {
		//反序列化不输出该属性
    transient private String name;
    private int age;

}

//output
//{"name":null,"age":10}
```

### serialVersionUID的理解

实现 `Serializable` 接口的类都有一个表示序列化版本标识符的静态变量-`serialVersionUID`；

- 手动配置- `private static final long serialVersionUID = 475463534532L;`

- 自动配置

  若是类没有显示定义这个静态常量，它的值是 Java 运行时环境根据类的内部细节自动生成的。

---

Java 的序列化机制是在运行时判断类的 `serialVersionUID ` 来验证版本一致性的。在反序列化时，JVM 会把传来的字节流中的 `serialVersionUID ` 和 本地实体类的 `serialVersionUID` 比较，如果相同就认为是一致的，可以进行反序列化，负责就会抛出版本不一致异常（InvalidCastException）。



## 对象流

对象流是用来存取基本数据类型和对象的处理流。对象流的对象有 `ObjectInputStream` 和 `OjbectOutputSteam`。

*用于存储和读取基本数据类型数据或对象的处理流。它的强大之处就是可以把Java中的对象写入到数据源中，也能把对象从数据源中还原回来。*

```java
/**
     * 测试对象流的写入
     */
    @Test
    public void testWrite() {
        String path = "src/main/java/com/albert/javase/io/file/data.bat";
        ObjectOutputStream objectOutputStream = null;
        try {
            Person person = new Person("小明", 10);
            objectOutputStream = new ObjectOutputStream(new FileOutputStream(path));
            //序列化
            objectOutputStream.writeObject(person);
            objectOutputStream.flush();
        } catch (IOException ioException) {
            ioException.printStackTrace();
        } finally {
            try {
                objectOutputStream.close();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }

    /**
     * 测试对象流的读取
     */
    @Test
    public void testRead() {
        String path = "src/main/java/com/albert/javase/io/file/data.bat";
        ObjectInputStream objectInputStream = null;
        try {
            objectInputStream = new ObjectInputStream(new FileInputStream(path));
            //反序列化
            Person person = (Person) objectInputStream.readObject();
            System.out.println(JsonUtil.toString(person));
        } catch (IOException | ClassNotFoundException ioException) {
            ioException.printStackTrace();
        } finally {
            try {
                objectInputStream.close();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }
```









## 参考链接

- [https://juejin.cn/post/7001735044825874462#heading-5](https://juejin.cn/post/7001735044825874462#heading-5)
- [https://juejin.cn/post/6869537077122301965#heading-5](https://juejin.cn/post/6869537077122301965#heading-5)
- [【叙述】Java的IO流的缓冲流的原理（前面简单阐述，后面带源码剖析）](https://blog.csdn.net/qq_43019319/article/details/107283238?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-2.no_search_link&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-2.no_search_link)
- https://www.zhihu.com/question/47794528/answer/672095170