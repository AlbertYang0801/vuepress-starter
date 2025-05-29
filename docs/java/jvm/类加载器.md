# 类加载器

## 什么是类加载器

类加载器（ClassLoader）就是在系统运行过程中动态的将编译后的.class字节码文件加载到JVM中的工具。在IDE中编写的源代码文件都是`.java`文件，通过编译对应生成`.class`文件。而类加载器就是用来将`.class`文件加载到JVM中的工具。

## 类加载器类型

![image-20250529160429290](https://s2.loli.net/2025/05/29/VPw5Nc8sYFb3nUC.png)



Java默认提供了三个类加载器，分别是 AppClassLoader、ExtClassLoader、BootstrapClassLoader，除此之外还可以自定义类加载器。类加载器之间是父级的关系，但不是通过继承实现父级关系的，而是通过组合的形式来实现的，在`ClassLoader`的源码中就体现了组合的关系。

```java
//源码
public abstract class ClassLoader {

    private static native void registerNatives();
    static {
        registerNatives();
    }
  
    //通过组合关系将父级注入进来
    private final ClassLoader parent;
    
    ......
}
```

### 1.BootstrapClassLoader

根类加载器，默认加载系统变量`sun.boot.class.path`指定的类库，是最顶级的类加载器。

- 查看Java系统变量`sun.boot.class.path`指定的类库。

```java
        //查看Java系统变量
        System.getProperties().list(System.out);
        //查看sun.boot.class.path指定的类库
        String property = System.getProperty("sun.boot.class.path");
        String[] split = property.split(":");
        for (String path : split) {
            System.out.println(path);
        }

// output
//       /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/resources.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/rt.jar
//      /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/sunrsasign.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/jsse.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/jce.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/charsets.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/jfr.jar
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/classes
```

根据结果可以看到都是jdk里面的包，我们熟悉的`java.lang`包就位于`rt.ja`r包里面。

- 通过ExtClassLoader获取BootstrapClassLoader

  Java中可以通过ClassLoader类来获取父级的ClassLoader，但是在Java中通过ExtClassLoader获取BootstrapClassLoader时为null，因为BootstrapClassLoader是用C/C++编写的，Java中无法获取其实例。

```java
        //AppClassLoader
        ClassLoader appClassLoader = ClassLoader.getSystemClassLoader();
        //ExtClassLoader
        ClassLoader extClassLoader = appClassLoader.getParent();
        System.out.println(extClassLoader);	//output sun.misc.Launcher$ExtClassLoader@cc34f4d
        //BoostrapClassLoader
        ClassLoader boostrapClassLoader = extClassLoader.getParent();
        System.out.println(boostrapClassLoader); //output null
```

### 2.ExtClassLoader

通过Java实现的扩展类加载器，用来加载系统指定的扩展类库，默认加载系统变量`java.ext.dirs`指定的类库。由于是Java实现的，我们可以在程序中获取它的实例并使用。

- 查看Java系统变量`java.ext.dirs`指定的类库。

```java
        String property = System.getProperty("java.ext.dirs");
        String[] split = property.split(":");
        for (String path : split) {
            System.out.println(path);
        }

//output
//        /Users/yangjunwei/Library/Java/Extensions
//        /Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home/jre/lib/ext
//        /Library/Java/Extensions
//        /Network/Library/Java/Extensions
//        /System/Library/Java/Extensions
//        /usr/lib/java
```

### 3.AppClassLoader

AppClassLoader也叫应用类加载器，也是Java实现的类加载器。它的作用是加载应用程序`classpath`下所有的类库，调用`getClassLoader()`方法返回的都是它的实例。自定义加载器默认的父级就是AppClassLoader。

### 4.自定义类加载器

除了Java默认提供的三种类加载器外，还可以自定义类加载器。自定义类加载器通过继承`ClassLoader`类实现，重写`findCLass()`类来实现。

## 类加载器创建过程

因为 BootStarpClassLoader 是由 C/C++ 编写的，它本身是虚拟机的一部分，所以它并不是一个JAVA类，无法通过JAVA引用，JVM启动的时候就能通过 BootstrapClassLoader 加载其所指定路径下的类库。JAVA中对应的有一个虚拟机入口类 `Launcher` 类，可以在构造方法中看到ExtClassLoader和AppClassLoader的创建。同时可以看到`bootClassPath`有指定BootstarpClassLoader默认加载系统变量`sun.boot.class.path`指定的类库。

```java
public class Launcher {
    private static URLStreamHandlerFactory factory = new Launcher.Factory();
    private static Launcher launcher = new Launcher();
    private static String bootClassPath = System.getProperty("sun.boot.class.path");
    private ClassLoader loader;
    private static URLStreamHandler fileHandler;
  
    public Launcher() {
            Launcher.ExtClassLoader var1;
            try {
                //加载ExtClassLoader
                var1 = Launcher.ExtClassLoader.getExtClassLoader();
            } catch (IOException var10) {
                throw new InternalError("Could not create extension class loader", var10);
            }

            try {
                //加载AppClassLoader
                this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
            } catch (IOException var9) {
                throw new InternalError("Could not create application class loader", var9);
            }

            .......
    }
}
```

### 1. BootstrapClassLoader的创建过程

在`Launcher`类中并没有BootStarpClassLoader的创建过程，因为BootStarpClassLoader是由C/C++编写的，它本身是虚拟机的一部分，所以它并不是一个JAVA类，无法通过JAVA引用，JVM启动的时候就能通过BootstrapClassLoader加载其所指定路径下的类库。

- 扩展1：怎么判断某个类是否能在`BootStarpClassLoader`加载？

这里简单介绍一下，后续双亲委派会详细介绍。

在`ClassLoader`类的1012行存在一个`native`关键字修饰的方法`findBootstrapClass`，就是用来调用`本地方法库`来实现判断的。

```java
    private Class<?> findBootstrapClassOrNull(String name)
    {
        if (!checkName(name)) return null;

        return findBootstrapClass(name);
    }

    // return null if not found
    private native Class<?> findBootstrapClass(String name);
```

- 扩展2：BootStarpClassLoader在虚拟机的哪个位置？

  本地方法库（待验证）

### 2.ExtClassLoader的创建过程

在上方`Launcher`类的构造方法中指定了`ExtClassLoader`的创建。

```java
 public Launcher() {
        Launcher.ExtClassLoader var1;
        try {
          	//创建ExtClassLoader
            var1 = Launcher.ExtClassLoader.getExtClassLoader();
        } catch (IOException var10) {
            throw new InternalError("Could not create extension class loader", var10);
        }
   			......
 }
```

对应的扩展类的创建过程的源码如下：

```java
				public static Launcher.ExtClassLoader getExtClassLoader() throws IOException {
          // 懒汉式双重加载
  				if (instance == null) {
                Class var0 = Launcher.ExtClassLoader.class;
                synchronized(Launcher.ExtClassLoader.class) {
                    if (instance == null) {
                      	//调用创建方法
                        instance = createExtClassLoader();
                    }
                }
            }

            return instance;
        }
				
				//创建方法
        private static Launcher.ExtClassLoader createExtClassLoader() throws IOException {
            try {
                return (Launcher.ExtClassLoader)AccessController.doPrivileged(new PrivilegedExceptionAction<Launcher.ExtClassLoader>() {
                    public Launcher.ExtClassLoader run() throws IOException {
                      	//加载系统变量`java.ext.dirs`指定的类库
                        File[] var1 = Launcher.ExtClassLoader.getExtDirs();
                        int var2 = var1.length;

                        for(int var3 = 0; var3 < var2; ++var3) {
                            MetaIndex.registerDirectory(var1[var3]);
                        }
												//调用构造方法创建
                        return new Launcher.ExtClassLoader(var1);
                    }
                });
            } catch (PrivilegedActionException var1) {
                throw (IOException)var1.getException();
            }
        }
```

在加载了系统变量指定的类库后，调用了`ExtClassLoader`的构造方法加载，在调用父类的构造方法`URLClassLoader`时候指定了父级`ClassLoader`为`null`

```java
//构造方法
public ExtClassLoader(File[] var1) throws IOException {
  		//传入的父级ClassLoader为null
			super(getExtURLs(var1), (ClassLoader)null, Launcher.factory);
			SharedSecrets.getJavaNetAccess().getURLClassPath(this).initLookupCache(this);
}

//父类构造方法
public URLClassLoader(URL[] urls, ClassLoader parent,
                      URLStreamHandlerFactory factory) {
    super(parent);
    // this is to make the stack depth consistent with 1.1
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        security.checkCreateClassLoader();
    }
    acc = AccessController.getContext();
    ucp = new URLClassPath(urls, factory, acc);
}
```

- 扩展1：`ExtClassLoader`的父类是`BootStarpClassLoader`，是怎么调用`BootStarpClassLoader`的？

在Java中通过`ExtClassLoader`获取`BootstrapClassLoader`时结果为null，这是因为Java无法调用`BootstrapClassLoader`实例。具体调用过程可以参考源码`Launcher`中`loadClass()`方法的实现过程，在判断检查类是否加载之前，若`parent`为空，则就会调用`BootstrapClassLoader`。这也解释了为什么`ExtClassLoader`在创建的时候指定`parent`为`null`的原因。

```java
    protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // 首先，检查类是否已经被加载
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                 				//父加载器不为空
                        c = parent.loadClass(name, false);
                    } else {
                        //父加载器为null，调用BootstrapClassLoader
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }

               ......
        }
    }
```

### 3.AppClassLoader的创建过程

在`Launcher`类的构造方法中同样指定了`AppClassLoader`的创建，但是在创建`AppClassLoader`时将`ExtClassLoader`作为参数传了进去。

```java
public Launcher() {
            Launcher.ExtClassLoader var1;
            try {
                //加载ExtClassLoader
                var1 = Launcher.ExtClassLoader.getExtClassLoader();
            } catch (IOException var10) {
                throw new InternalError("Could not create extension class loader", var10);
            }

            try {
                //加载AppClassLoader(ExtClassLoader实例作为参数传入)
                this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
            } catch (IOException var9) {
                throw new InternalError("Could not create application class loader", var9);
            }

            .......
    }
```

对应的扩展类的创建过程的源码如下：

```java
				 public static ClassLoader getAppClassLoader(final ClassLoader var0) throws IOException {
           	//加载`java.class.path`系统变量
            final String var1 = System.getProperty("java.class.path");
            final File[] var2 = var1 == null ? new File[0] : Launcher.getClassPath(var1);
            return (ClassLoader)AccessController.doPrivileged(new PrivilegedAction<Launcher.AppClassLoader>() {
                public Launcher.AppClassLoader run() {
                    URL[] var1x = var1 == null ? new URL[0] : Launcher.pathToURLs(var2);
                  	//调用构造方法，传入classPath对应路径和ExtClassLoader的实例对象
                    return new Launcher.AppClassLoader(var1x, var0);
                }
            });
        }
```

在加载了系统变量指定的类库后，调用了`AppClassLoader`的构造方法加载，在调用父类的构造方法`URLClassLoader`时候指定了父级`ClassLoader`为`ExtClassLoader的实例对象`，这也证明了`ExtClassLoader`为`AppClassLoader`的父级。

```java
//构造方法
AppClassLoader(URL[] var1, ClassLoader var2) {
            super(var1, var2, Launcher.factory);
            this.ucp.initLookupCache(this);
        }

//父类构造方法
public URLClassLoader(URL[] urls, ClassLoader parent,
                      URLStreamHandlerFactory factory) {
    super(parent);
    // this is to make the stack depth consistent with 1.1
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        security.checkCreateClassLoader();
    }
    acc = AccessController.getContext();
    ucp = new URLClassPath(urls, factory, acc);
}
```

### 自定义类加载器的创建过程

1. 继承`ClassLoader`类，标示该类是一个类加载器。
2. 重写`loadClass()`方法，实现寻找`.class`文件的方式。
3. 调用`defineClass()`方法，加载读取的`.class`文件。

## 双亲委派模型

双亲委派总结来说就是`向上委托，向下加载`。

![image-20250529160458213](https://s2.loli.net/2025/05/29/SEWuDLhPzgVJxKM.png)

### 类加载流程

1. 当我们需要加载一个应用程序`classpath`下的自定义类的时候，`AppClassLoader`会首先判断自己是否加载过这个类，如果已经加载过则直接返回类的实例，若没有加载过则委托给自己的父类加载器`ExtClassLoader`。
2. `ExtClassLoader`也会首先判断是否加载过，若加载过直接返回类的实例。若没有则委托给自己的父类加载器`BootstrapClassLoader`。
3. `BootstrapClassLoader`收到类的加载任务之后，也会首先判断是否加载过，若加载过直接返回类的实例。不同的是，若没有加载过就会在自己负责的加载路径`sun.boot.class.path`搜索这个类并加载。如果找到了，则执行加载任务并返回类的实例，否则将加载任务交给`ExtClassLoader`去执行。
4. `ExtClassLoader`同样会在自己负责的加载路径`java.ext.dirs`搜索这个类并加载。如果找到了，则执行加载任务并返回类的实例，否则将加载任务交给`AppClassLoader`去执行。
5. 当`BootstrapClassLoader`和`ExtClassLoader`都没能成功加载到这个类时，就需要`AppClassLoader`来尝试加载。`AppClassLoader`会在`classpath`下搜索这个类并加载，如果找到了，则执行加载任务并返回类的实例，否则将抛出`ClassNotFoundException`异常。

### 重要方法

### 1. loadClass()方法

- 类加载过程主要在`ClassLoader`的`loadClass()`方法中实现，结合`ClassLoader`类可以发现其使用了`责任链模式`。

```java
public abstract class ClassLoader {

    private static native void registerNatives();
    static {
        registerNatives();
    }

		//父结点
    private final ClassLoader parent;
  
  	......
  
    protected Class<?> loadClass(String name, boolean resolve)
            throws ClassNotFoundException
        {
            synchronized (getClassLoadingLock(name)) {
                // 首先，检查类是否被加载过
                Class<?> c = findLoadedClass(name);
                if (c == null) {
                    long t0 = System.nanoTime();
                    try {
                      	//如果父级不为空
                        if (parent != null) {
                          	//递归调用父级的该方法LoadClass()
                            c = parent.loadClass(name, false);
                        } else {
                          	//如果父级为null，意为父级为BootstrapClassLoader。（具体见下方代码）
                            c = findBootstrapClassOrNull(name);
                        }
                    } catch (ClassNotFoundException e) {
                        // ClassNotFoundException thrown if class not found
                        // from the non-null parent class loader
                    }

                    if (c == null) {
                        // If still not found, then invoke findClass in order
                        // to find the class.
                        long t1 = System.nanoTime();
                      	//如果父级都没有找到类，选择加载
                        c = findClass(name);

                        // this is the defining class loader; record the stats
                        sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                        sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                        sun.misc.PerfCounter.getFindClasses().increment();
                    }
                }
                if (resolve) {
                    resolveClass(c);
                }
                return c;
            }
        }
  
  			......
          
          
        /**
         * Returns a class loaded by the bootstrap class loader;
         * or return null if not found.
         */
        private Class<?> findBootstrapClassOrNull(String name)
        {
          	//检查该类是否已经加载过
            if (!checkName(name)) return null;
						//调用底层通信方法
            return findBootstrapClass(name);
        }

        // native关键字修饰，从本地方法库调用BootstarpCLassLoader
        private native Class<?> findBootstrapClass(String name);
          
          
  }
```

### 2.findClass()方法

- 根据名称或位置加载.class字节码

在`ClassLoader`类中，`findClass()`方法如下，直接抛出异常，不满足加载类的需求，这就要求需要在子类中重写该方法。

```java
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        throw new ClassNotFoundException(name);
    }
```

`AppClassLoader`和`ExtClassLoader`都有同样的父类`URLClassLoader`，`URLClassLoader`中就重写了`findClass()`方法。

从URL搜索路径中查找并加载具有指定名称的类。引用JAR文件的所有URL都会根据需要加载和打开，直到找到该类为止。。

```java
public class URLClassLoader extends SecureClassLoader implements Closeable {

		......
      
    protected Class<?> findClass(final String name)
            throws ClassNotFoundException
        {
            final Class<?> result;
            try {
                result = AccessController.doPrivileged(
                    new PrivilegedExceptionAction<Class<?>>() {
                        public Class<?> run() throws ClassNotFoundException {
                            String path = name.replace('.', '/').concat(".class");
                            Resource res = ucp.getResource(path, false);
                            if (res != null) {
                                try {
                                    return defineClass(name, res);
                                } catch (IOException e) {
                                    throw new ClassNotFoundException(name, e);
                                }
                            } else {
                                return null;
                            }
                        }
                    }, acc);
            } catch (java.security.PrivilegedActionException pae) {
                throw (ClassNotFoundException) pae.getException();
            }
            if (result == null) {
                throw new ClassNotFoundException(name);
            }
            return result;
        }
  		
  			......
          
  }
```

### 3. defineClass()方法

- 使用从指定资源获得的类字节定义一个类。生成的Class必须先解析，然后才能使用。

### 为什么需要双亲委派模型？

- 通过从下往上委派的方式，可以避免类的重复加载。当父类加载器已经加载过一个类时，子类不会再重新加载。

- 通过双亲委派的方式，保证了核心库的安全性。即核心库已有的类，是不会重复加载的。

  > 比如重写了String 类，在加载时会向上委托判断是否加载过，如果加载过则不再加载。能有效防止核心类被篡改。

- 保证类的唯一性。（待深入研究）

  当类的包路径相同，且是同一个类加载器加载的时候，这两个类就是相同的。如果是不同的两个类加载器加载的类，在JVM中不会判断为同一个类。

### 如何主动破坏双亲委派机制？

双亲委派机制主要在`loadClass()`方法里面，我们可以实现一个自定义类加载器，重写`loadClass()`方法，不进行双亲委派机制即可。

## Tomcat打破双亲委派机制

### Tomcat为什么要打破双亲委派机制？

1. tomcat 作为 web 容器，可以部署多个应用。不同应用可能依赖同一个第三方类库的不同版本。需要保证每个应用的类库都是独立的，相互隔离的。

   > 如果使用默认的类加载机制，默认只能根据类名去加载一份，所以无法加载同一个类库的不同版本。

2. web 容器也有自己依赖的类库，要与应用的类库区分开。

   > 如果是默认的类加载机制，web 容器和应用重复的类库只能加载一次。如果应用类库被篡改了，可能会影响到 web 容器的正常使用。

3. web 容器能支持 jsp 的修改，而且无需重启。

   > jsp文件最后也是编译成 .class 文件的，如果按照默认的类加载机制，修改后的 jsp 文件是无法被类加载器加载的。

![image-20250529160516478](https://s2.loli.net/2025/05/29/PlXjfYutJxTzhB6.png)

**WebappClassLoader 破坏了双亲委派模型。**

> 各个Webapp私有的类加载器，加载路径中的class只对当前Webapp可见，比如加载war包里相关的类，每个war包应用都有自己的WebappClassLoader，实现相互隔离，比如不同war包应用引入了不同的spring版本，这样实现就能加载各自的spring版本；