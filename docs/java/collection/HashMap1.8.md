# HashMap - 1.8





## put 方法



```java
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //1.如果当前桶为空，需要初始化
        if ((tab = table) == null || (n = tab.length) == 0)
            //resize()中判断是否进行初始化
            n = (tab = resize()).length;
        //2.若添加元素位置对应桶为空，在桶位置创建一个系统（添加元素）
        if ((p = tab[i = (n - 1) & hash]) == null)
            //初始化Node
            tab[i] = newNode(hash, key, value, null);
        //3.若在添加元素对应位置发生了Hash冲突，则进行解决冲突
        else {
            Node<K,V> e; K k;
            //3.1 比较桶首个元素的hash值，key值是否一致
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                //一致，说明添加的元素key和桶首个key值一致（需最后覆盖value）
                e = p;
            //3.2 判断当前桶是否为红黑树
            else if (p instanceof TreeNode)
                //按照红黑树得方式添加元素
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            //3.3 桶是个链表
            else {
                //遍历链表（p:头结点; e:子结点）
                for (int binCount = 0; ; ++binCount) {
                    //若结点无后续结点（从头结点开始）
                    if ((e = p.next) == null) {
                        //将添加的元素初始化为Node，新增到当前结点后（尾插法）
                        p.next = newNode(hash, key, value, null);
                        //若新增元素后的链表达到树长度预设阈值（TREEIFY_THRESHOLD=8），则需要将链表转化为红黑树
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            //将链表转换为红黑树
                            treeifyBin(tab, hash);
                        break;
                    }
                    //如果找到key相同，则直接推出
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    //重置当前遍历元素为p.next(下一结点)
                    p = e;
                }
            }
            //4.e不为空，说明桶内已经存在相同的元素了。
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    //覆盖value
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        //判断是否需要扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```



## get 方法

```java
    public V get(Object key) {
        Node<K,V> e;
        //查询对应的结点Node
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }

	final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        //桶数组不为空，查询元素对应桶不为空
        if ((tab = table) != null && (n = tab.length) > 0 &&
            //赋值查询元素对应桶
            (first = tab[(n - 1) & hash]) != null) {
            //匹配到头结点，直接返回头结点
            if (first.hash == hash && // always check first node
                ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            //头结点下一结点不为空
            if ((e = first.next) != null) {
                //桶结构为红黑树
                if (first instanceof TreeNode)
                    //按照红黑树查找思路查找元素
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                //桶结构为链表
                do {
                    //从链表头结点的下一结点开始遍历
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        //hash和key都匹配，返回结点
                        return e;
                } while ((e = e.next) != null);
            }
        }
        //未查询到，返回null
        return null;
    }
```



### 红黑树查找思路

1. 找到红黑树的根结点。
2. 将传入的hash值和根结点hash值（rootHash）比较。
3. 若 hash>rootHash，则遍历根结点的右子树。
4. 若 hash<rootHash，则遍历根结点的左子树。

```java
    final Node<K,V> getNode(int hash, Object key) {
       ......
            //头结点下一结点不为空
            if ((e = first.next) != null) {
                //桶结构为红黑树
                if (first instanceof TreeNode)
                    //按照红黑树查找思路查找元素
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                //桶结构为链表
                ......
            }
        }
        //未查询到，返回null
        return null;
    }

		//先获取红黑树的根结点，再匹配元素
        final TreeNode<K,V> getTreeNode(int h, Object k) {
            //当前结点的父结点不为空，则查询根结点。
            return ((parent != null) ? root() : this).find(h, k, null);
        }

		//获取根结点
        final TreeNode<K,V> root() {
      		//向上遍历红黑树
            for (TreeNode<K,V> r = this, p;;) {
                //若父结点为空，说明该结点未根结点。
                if ((p = r.parent) == null)
                    return r;
                r = p;
            }
        }

		//从根结点开始查询红黑树，匹配值
        final TreeNode<K,V> find(int h, Object k, Class<?> kc) {
            //根节点
            TreeNode<K,V> p = this;
            //循环遍历红黑树
            do {
                int ph, dir; K pk;
                //左子树，右子树
                TreeNode<K,V> pl = p.left, pr = p.right, q;
                //根节点hash值rootHash>匹配元素hash
                if ((ph = p.hash) > h)
                    //左子树查询
                    p = pl;
                else if (ph < h)
                   //右子树查询
                    p = pr;
				//根节点匹配成功，返回根节点
                else if ((pk = p.key) == k || (k != null && k.equals(pk)))
                    return p;
                //左子树为空，遍历右子树
                else if (pl == null)
                    p = pr;
                //右子树为空，遍历左子树
                else if (pr == null)
                    p = pl;
                else if ((kc != null ||
                          (kc = comparableClassFor(k)) != null) &&
                         (dir = compareComparables(kc, k, pk)) != 0)
                    p = (dir < 0) ? pl : pr;
                else if ((q = pr.find(h, k, kc)) != null)
                    return q;
                else
                    p = pl;
            } while (p != null);
            return null;
        }
```











## 1.8 和 1.7 的不同点

1. 1.7 和 1.8 比较改动了什么？

2. 为什么在解决 Hash 冲突的时候，不直接用红黑树？而选择先用链表再转换为红黑树？

3. AVL 树和红黑树的区别？为什么选择红黑树？

4. 怎么生成红黑树？

5. 红黑树怎么查找元素？

6. 链表什么时候转换为红黑树。为什么阈值是 8？

7. 当链表转换为红黑树后，什么时候退化成链表？

8. 线程安全问题？

   - 扩容导致的死循环问题。
   - put 导致元素丢失。
   - put 非 null 元素 get 时得到 null。

9. 1.7中的线程安全问题在1.8中得到解决了吗？

   链表插入方式改为尾插法，死循环问题得到解决，另外两个问题还存在。

10. 为什么改为尾插法？



