# 文件操作-File类

`java.io.File` 类：**文件**和**文件目录路径**的抽象表示形式，File 类的一个对象，代表一个文件或者一个文件夹。

***File 能新建、删除、重命名文件和目录，但是 File 不能访问文件内容本身。若需要访问文件内容，则需要使用IO流。***

---

## 文件相关扩展

1. 相对路径和绝对路径

   - 相对路径

     相对于某个文件的路径。

     - 当前目录：`./` 

     - 上级目录：`../`

   - 绝对路径

     文件目录所在全路径，包含根目录。

   ```java
       @Test
       public void filePath() {
           //1.绝对路径
           File file = new File("/Users/yangjunwei/IdeaProjects/JavaAdvanced/file-demo/file/");
           System.out.println(file);///Users/yangjunwei/IdeaProjects/JavaAdvanced/file-demo/file
           System.out.println(JsonUtil.toString(file.list()));//["666.xls","CheckTest.py","MySqlTools.py","2222.xls","1111.xls","测试csv.csv"]
   
           //2.相对路径
           File file1 = new File("../io/data.txt");
           System.out.println(file1.getName()); //data.txt
           //获取文件绝对路径（不会解析符号..和.）
           System.out.println(file1.getAbsolutePath());// /Users/yangjunwei/IdeaProjects/JavaAdvanced/javase-practice/../io/data.txt
           //获取文件绝对路径（会解析符号..和.）
           System.out.println(file1.getCanonicalPath());// /Users/yangjunwei/IdeaProjects/JavaAdvanced/io/data.txt
   
       }
   ```

2. 路径分隔符

   在不同操作系统下，路径分隔符是不相同的。

   - windows：`\\`
   - unix：`/`

   Java 支持跨平台，所以路径分隔符要确定。File 类提供了一个常量，能根据操作系统，动态提供分隔符。

   ```java
   public static final String separator
   ```

   测试代码

   ```java
       @Test
       public void testSeparator(){
           //file类提供的分隔符常量（根据操作系统动态提供分隔符）
           String separator = File.separator;
           System.out.println(separator);
       }
   
   //output
   //macOs分隔符结果为：/
   ```

## File类的实例化

- `File(String pathname)`

  可以是相对路径，也可以是绝对路径

- `File(String parent, String child)`

  以父路径加子路径进行实例化。

- `File(File parent, String child)`

  以父 File 对象和子路径进行实例化。

## File类的常用方法

```java

    @SneakyThrows
    @Test
    public void methodTest() {
        File file = new File("src/main/java/com/albert/javase/file/data.txt");
        //获取名称
        System.out.println(file.getName());
        //获取路径
        System.out.println(file.getPath());
        //获取上层文件目录
        System.out.println(file.getParent());
        //获取文件长度
        System.out.println(file.length());
        //获取最后一次修改时间
        System.out.println(file.lastModified());

        //2.相对路径
        File file1 = new File("../file/data.txt");
        System.out.println(file1.getName()); //data.txt
        //获取文件绝对路径（不会解析符号..和.）
        System.out.println(file1.getAbsolutePath());// /Users/yangjunwei/IdeaProjects/JavaAdvanced/javase-practice/../file/data.txt
        //获取文件绝对路径（会解析符号..和.）
        System.out.println(file1.getCanonicalPath());// /Users/yangjunwei/IdeaProjects/JavaAdvanced/file/data.txt

        //适用于文件目录
        File file2 = new File("src/main/java/com/albert/javase/file/");
        //获取指定文件目录下所有文件或文件目录的名称数组
        String[] list = file2.list();
        System.out.println(JsonUtil.toString(list));
        //获取指定文件目录下所有文件或文件目录的file数组
        File[] files = file2.listFiles();
        System.out.println(JsonUtil.toString(files));
    }

    /**
     * 测试File类的重命名功能
     * renameTo
     */
    @Test
    public void renameFile() {
        //旧文件
        File file = new File("/Users/yangjunwei/IdeaProjects/JavaAdvanced/javase-practice/src/main/java/com/albert/javase/file/data.txt");
        //新文件（不能已存在）
        File newFile = new File("/Users/yangjunwei/IdeaProjects/JavaAdvanced/javase-practice/src/main/java/com/albert/javase/file/data.txt");
        boolean b = file.renameTo(newFile);
        System.out.println(b);
    }

    /**
     * 判断文件属性
     */
    @Test
    public void testFile() {
        File file = new File("src/main/java/com/albert/javase/file/data.txt");
        //是否是文件夹
        System.out.println(file.isDirectory());
        //是否是文件
        System.out.println(file.isFile());
        //是否存在
        System.out.println(file.exists());
        //是否可读
        System.out.println(file.canRead());
        //是否可写
        System.out.println(file.canWrite());
        //是否隐藏
        System.out.println(file.isHidden());
    }

    /**
     * 测试文件的创建删除
     */
    @SneakyThrows
    @Test
    public void testFileCreate() {
        File file = new File("rc/main/java/com/albert/javase/file/hello.txt");
        if (!file.exists()) {
            //创建新文件
            file.createNewFile();
            System.out.println("创建成功！");
        } else {
            file.delete();
            System.out.println("删除文件成功");
        }
    }

    /**
     * 测试文件夹的创建删除
     */
    @Test
    public void testFolder() {
        File file = new File("src/main/java/com/albert/javase/file/file1/file2/file3");
        if (!file.exists()) {
            //创建多级文件夹，如果上级目录不存在，一起创建
            boolean mkdir = file.mkdirs();
            System.out.println("创建多个文件夹结果======》" + mkdir);
        } else {
            //要想删除成功，file3文件夹下不能有文件
            boolean delete = file.delete();
            System.out.println("删除文件结果======》" + delete);
        }

        File newFile = new File("src/main/java/com/albert/javase/file/file1/file2/file4");
        //创建单个文件夹
        boolean mkdir = newFile.mkdir();
        System.out.println("创建单个文件夹结果======》" + mkdir);
    }
```

## 相关练习

[练习代码地址](https://gitee.com/zztiyjw/JavaAdvanced/tree/master/javase-practice/src/main/java/com/albert/javase/io)

```java
/**
 * 遍历指定目录所有文件名称，包括子文件目录中的文件
 * 拓展1：计算指定目录占用空间的大小
 * 拓展2：删除指定文件目录及其下的所有文件
 */
@Test
@SneakyThrows
public void testThree(){
    String path = "src/main/java/com/albert/javase/file/one/";
    File file = new File(path);
    long folderLength = getFolderLength(file);
    System.out.println("文件目录占用空间大小=========》"+folderLength);
    boolean b = deleteFile(file);
    System.out.println(b);
}

/**
* 计算指定目录占用空间的大小
*/
private long getFolderLength(File file) {
    long length = 0;
    if(file.isFile()){
        length+=file.length();
        return length;
    }
    if(file.isDirectory()){
        File[] files = file.listFiles();
        for (File singleFile : files) {
            if(singleFile.isDirectory()){
                //递归
                length+=this.getFolderLength(singleFile);
            }else{
                length+=singleFile.length();
            }
        }
    }
    return length;
}

/**
* 删除指定文件目录及其下的所有文件
*/
private boolean deleteFile(File deleteFile) {
        if (!deleteFile.exists()) {
            return true;
        }
        //文件直接删除
        if (deleteFile.isFile()) {
            return deleteFile.delete();
        }
        //删除文件夹
        if (deleteFile.isDirectory()) {
            //获取文件夹下的所有文件夹或文件
            File[] files = deleteFile.listFiles();
            //先删除文件夹下的内容
            for (File file : files) {
                if (file.isDirectory()) {
                    //若是文件夹递归删除
                    this.deleteFile(file);
                } else {
                    //文件直接删除
                    file.delete();
                }
            }
            //删除文件夹
            deleteFile.delete();
        }
        return !deleteFile.exists();
    }

```



## 参考链接

[https://juejin.cn/post/7001735044825874462#heading-10](https://juejin.cn/post/7001735044825874462#heading-10)







