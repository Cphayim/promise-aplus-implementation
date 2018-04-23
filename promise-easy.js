/**
 * 简单版 Promise 实现
 */
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

class Promise {
  constructor(fn) {
    this.state = PENDING
    this.value = null

    this.resolvedCallbacks = []
    this.rejectedCallbacks = []

    const resolve = value => {
      // 状态只能够更变一次
      if (this.state !== PENDING) return
      this.state = RESOLVED
      this.value = value
      this.resolvedCallbacks.forEach(cb => cb(this.value))
    }
    const reject = value => {
      // 状态只能够更变一次
      if (this.state !== PENDING) return
      this.state = REJECTED
      this.value = value
      this.rejectedCallbacks.forEach(cb => cb(this.value))
    }
  }

  then(onFulfilled, onRejected) {
    // 如果参数不是函数类型，创建一个默认回调函数，同时实现透传
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : err => {
            throw err
          }

    /**
     * 当前 Promise 的状态
     * 若为 pending，将回调加入队列
     * 否则执行对应的回调
     */
    switch (this.state) {
      case PENDING:
        this.resolvedCallbacks.push(onFulfilled)
        this.rejectedCallbacks.push(onRejected)
        break
      case RESOLVED:
        onFulfilled(this.value)
        break
      case REJECTED:
        onRejected(this.value)
        break
    }
  }
}
