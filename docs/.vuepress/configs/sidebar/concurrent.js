// 为以下路由添加左侧边栏
module.exports = [
    {
        "title": "一、多线程基础",
        "collapsable": true,
        "children": [
            "/java/concurrent/basic/多线程基础"
        ]
    },
    {
        "title": "二、线程池",
        "collapsable": true,
        "children": [
            "/java/concurrent/threadpool/线程池概述",
            "/java/concurrent/threadpool/线程池的调度过程",
            "/java/concurrent/threadpool/线程池的创建过程",
            "/java/concurrent/threadpool/线程池的状态",
            "/java/concurrent/threadpool/线程池的关闭",
            "/java/concurrent/threadpool/JDK提供的线程池"
        ]
    }, {
        "title": "三、synchronized",
        "collapsable": true,
        "children": [
            "/java/concurrent/synchronized/synchronized概述",
            "/java/concurrent/synchronized/同步代码块和同步方法",
            "/java/concurrent/synchronized/synchronized和Lock的区别"
        ]
    }, {
        "title": "四、锁",
        "collapsable": true,
        "children": [
            "/java/concurrent/lock/自旋锁",
            "/java/concurrent/lock/可重入锁和不可重入锁",
            "/java/concurrent/lock/公平锁和非公平锁",
            "/java/concurrent/lock/重入锁ReentrantLock",
            "/java/concurrent/lock/重入锁的好搭档Condition",
            "/java/concurrent/lock/读写锁ReadWriteLock",
            "/java/concurrent/lock/锁优化",
        ]
    }, {
        "title": "五、并发控制工具",
        "collapsable": true,
        "children": [
            "/java/concurrent/tool/倒计数器CountdownLatch",
            "/java/concurrent/tool/信号量Semaphore",
            "/java/concurrent/tool/循环栅栏CyclicBarrier",
            "/java/concurrent/tool/LockSupport阻塞工具",
            "/java/concurrent/tool/ReadLimiter限流",
            "/java/concurrent/tool/ThreadLocal"
        ]
    }, {
        "title": "六、并发容器",
        "collapsable": true,
        "children": [
            "/java/concurrent/container/线程安全的Map",
            "/java/concurrent/container/线程安全的List",
            "/java/concurrent/container/BlockQueue阻塞队列"
        ]
    }, {
        "title": "七、无锁",
        "collapsable": true,
        "children": [
            "/java/concurrent/nolock/CAS",
            "/java/concurrent/nolock/AtomicInteger"
        ]
    }
]

