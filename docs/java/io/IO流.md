



## 什么是流？

每个文件保存在计算机上时，是以**二进制形式**存在的，只有 0 和 1。

> 比如一张图片保存在计算机上时，都是 0 和 1 组成，最终可以经过各种转换演变成了图片显示出来。

流就是将**文件的二进制内容在各个设备之间进行传输**的过程的比喻。

> 比如我们将图片从计算机复制到另一个文件夹的时候，将图片的二进制数据一点点的传递，类似于数据像水流一样一点点的流动到了目的地，所以整体传输的二进制数据称为数据流。

## 什么是IO流？

I/O 流是 Input/Output 的缩写，用于处理设备之间的数据传输。如读/写文件，网络通信等。

在 Java 中，对于数据的输入/输出操作都是基于 流（stream） 的方式进行。

### 流的分类？

根据程序和设备数据流向的不同，可以将流分为：**输入流 **和 **输出流**。

- 输入流：从设备（磁盘等）将数据输入到程序中。
- 输出流：将程序中的数据输出到设备（磁盘等）上保存。

根据操作的数据单位的不同，可以将流分为：**字节流 **和 **字符流**。

- 字节流：以字节为单位进行数据传输（1 Byte=8 bit）。
- 字符流：以字符为单位进行数据传输（1字符=2字节）。

> 字符流的本质上也是通过字节流读取，Java 中的字符采用 Unicode 标准，在读取和输出的过程中，通过以字符为单位，查找对应的码表将字节转换为对应的字符。

---

**什么时候需要用字节流，什么时候又要用字符流？**

- 字符流只针对字符数据进行传输，对于文本文件（txt,java,cpp）使用**字符流**处理。
- 对于非文本文件（mp3,jpg,doc,ppt) 使用**字节流**处理。

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





## 转换流

字符流和字节流之间的转换是有严格定义的：

- 输入流：可以将 字节流 => 字符流
- 输出流：可以将字符流 => 字节流

为什么输入流不能 **字符流 => 字节流**，输出流不能 **字节流 => 字符流**？

> 在存储设备上，数据都是以字节为单位存储，所以**输入到内存时必定是先以字节为单位**输入，**输出到存储设备时最终必须是以字节为单位**输出。字节流才是计算机最根本的存储方式，而字符流是在字节流的基础上对数据进行转换，进而输出字符，每个字符本质还是以字节为单位存储。

| 转换流/数据类型  | 输入输出 | 字节流和字符流之间的转换 |
| ---------------- | -------- | ------------------------ |
| 字节流 => 字符流 | 输入     | InputStreamReader        |
| 字符流 => 字节流 | 输出     | OutputStreamWriter       |

https://juejin.cn/post/7001735044825874462#heading-5

https://juejin.cn/post/6869537077122301965#heading-5