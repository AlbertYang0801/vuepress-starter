## CAS总结

### 悲观和乐观策略

锁有着悲观锁和乐观锁之分，悲观锁拥有资源的时候，认为随时会有人来篡改拥有的资源，所以在其拥有资源时不允许其他人访问。而乐观锁在拥有资源的时候不认为会有人来篡改其所拥有的资源，所以在其拥有资源的时候允许其他人访问。悲观锁和乐观锁是一种思想，对应的也是一种策略。

加锁和使用 synchronized 其实就是一种悲观的策略，因为总是假设临界区的操作会产生冲突，如果有多个线程需要访问临界区资源，加锁和使用 synchronized 会阻塞其它线程。

而无锁其实就是一种乐观的策略，它在操作的时候会假设访问资源不会冲突，所有的线程之间不存在阻塞，也就不存在等待，线程会持续执行。如果遇到冲突的话，无锁就使用了 `CAS` 来鉴别线程冲突，一旦检测到冲突产生，就重试当前操作直到没有冲突为止。

### CAS 算法介绍

`CAS` 算法的过程是：它包含三个参数 （V，E，N），其中 V 表示要更新的变量，E 表示预期值，N表示新值。仅当 V 值等于 E 值时，才会将 V 的值设置为 N 。如果 V 值和 E 值不同，说明已经有其他线程做了更新，则当前线程什么都不做。最后，`CAS` 返回当前 V 的真实值。CAS 操作就是一种乐观策略的体现，允许多个线程同时操作，但是只有一个线程能成功修改，其余失败的线程不会被挂起，仅仅是被告知失败，并且允许再次尝试。

### CAS 操作造成的 ABA 问题

假设现在有两个线程 m 和 n，存在一个变量 `num =  A` 。m 线程首先获取变量得到的是 A ，在执行 CAS 操作之前，n 线程将变量 num 的值修改为 B ，然后又修改为 A。线程 n 修改变量的过程 线程 m 是无感知的，在线程 n 修改之后，m 线程执行 CAS 操作，由于此时变量 `num = A ` ，与 线程 m 开始获取的一致，所以CAS 操作可以正常执行。

虽然整个流程线程 m 可以正常执行，但是变量 num 被修改过，也就是发生过 ABA 问题。

例子：超市推出活动，若客人余额小于20元的话，超市可以赠送20元，但是这个赠送只有一次。

```java
		static AtomicReference<Integer> personMoney = new AtomicReference<>();

    static {
        personMoney.set(19);
    }

    /**
     * 购买
     */
    public static void buy() {
      	//循环消费，模拟客人消费
        while (true){
            int money = personMoney.get();
            if(money>20){
                System.out.println("开始消费");
                personMoney.compareAndSet(money,money-20);
            }
        }
    }

    /**
     * 赠送充值20，只允许充值一次。（会产生ABA问题）
     */
    public static void recharge() {
      	//获取客人余额
        Integer money = personMoney.get();
      	//赠送20元
        while (true) {
            if (money < 20) {
              	//CAS操作
                boolean b = personMoney.compareAndSet(money, money+20);
                if (b) {
                    System.out.println("充值成功");
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(()->{
            recharge();
        }).start();
        new Thread(()->{
            buy();
        }).start();
        System.out.println(personMoney.get());
    }
```

设某个客人初始余额为19元，超市发现后会为其充值20元。但是客人随即消费了20元，超市发现后继续为其充值20元，违反了只充值一次的规定。

可以发现 ABA 问题的原因其实就是 CAS 操作只对值进行比较。

**ABA问题的解决办法**

针对 ABA 问题，可以使用**版本号机制**来解决，在每次操作完数据之后，修改对应的版本号，而不仅仅是对值进行操作。对应的比较时同时比较值和版本号。

Java 中提供了 AtomicStampedReference 类，引入了一个版本号的机制来解决 ABA 问题。

下面使用 AtomicStampedReference 来解决上方例子的 ABA 问题。

```java
    static AtomicStampedReference<Integer> personMoney = new AtomicStampedReference<>(19,10);

    /**
     * 购买
     */
    public static void buy() {
        while (true){
            int money = personMoney.getReference();
            int stamp = personMoney.getStamp();
            if(money>20){
                System.out.println("开始消费");
                personMoney.compareAndSet(money,money-20,stamp,stamp+1);
            }
        }
    }

    /**
     * 充值，只允许充值一次。（使用AtomicStampedReference可解决ABA问题）
     */
    public static void recharge() {
        Integer money = personMoney.getReference();
        int stamp = personMoney.getStamp();
        System.out.println(money);
        while (true) {
            if (money < 20) {
                boolean b = personMoney.compareAndSet(money, money+20,stamp,stamp+1);
                if (b) {
                    System.out.println("充值成功");
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(()->{
            recharge();
        }).start();
        new Thread(()->{
            buy();
        }).start();
        System.out.println(personMoney.getReference());
    }

//19
//充值成功
//39
//开始消费
```

从结果判断，超市成功做到了只充值一次，这也意味着普通的 CAS 操作造成的 ABA 问题得到了很好的解决。