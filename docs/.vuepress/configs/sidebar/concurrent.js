// 为以下路由添加左侧边栏
module.exports = [
    {
        "title": "一、多线程基础",
        "collapsable": true,
        "children": [
            "/concurrent/basic/多线程基础"
        ]
    },
    {
        "title": "二、线程池",
        "collapsable": true,
        "children": [
            "/concurrent/threadpool/线程池概述",
            "/concurrent/threadpool/线程池的调度过程",
            "/concurrent/threadpool/JDK提供的线程池"
        ]
    }, {
        "title": "三、synchronized",
        "collapsable": true,
        "children": [
            "/concurrent/synchronized/synchronized概述",
            "/concurrent/synchronized/同步代码块和同步方法",
            "/concurrent/synchronized/synchronized和Lock的区别"
        ]
    }, {
        "title": "四、锁",
        "collapsable": true,
        "children": [
            "/concurrent/lock/自旋锁",
            "/concurrent/lock/可重入锁和不可重入锁",
            "/concurrent/lock/公平锁和非公平锁",
            "/concurrent/lock/重入锁ReentrantLock",
            "/concurrent/lock/重入锁的好搭档Condition",
            "/concurrent/lock/读写锁ReadWriteLock",
            "/concurrent/lock/锁优化",
        ]
    }, {
        "title": "五、并发控制工具",
        "collapsable": true,
        "children": [
            "/concurrent/tool/倒计数器CountdownLatch",
            "/concurrent/tool/信号量Semaphore",
            "/concurrent/tool/循环栅栏CyclicBarrier",
            "/concurrent/tool/LockSupport阻塞工具",
            "/concurrent/tool/ReadLimiter限流",
            "/concurrent/tool/ThreadLocal"
        ]
    }, {
        "title": "六、并发容器",
        "collapsable": true,
        "children": [
            "/concurrent/container/线程安全的Map",
            "/concurrent/container/线程安全的List",
            "/concurrent/container/BlockQueue阻塞队列"
        ]
    }
]

