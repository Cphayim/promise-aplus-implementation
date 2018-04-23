/**
 * 完整的 Promise A+ 实现
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
      // 对于 resolve 函数来说，首先需要判断传入的值是否为 Promise 类型
      // 如果传入了 Promise 类型的值，则根据传入的 Promise 的状态来决定当前 Promise 的状态
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }

      // 状态只能够更变一次
      if (this.state !== PENDING) return
      this.state = RESOLVED
      this.value = value

      // resolvedCallbacks 队列中的回调总是异步执行的
      // 为了保证函数执行顺序，需要使用 setTimeout 包裹起来
      setTimeout(() => {
        this.resolvedCallbacks.forEach(cb => cb(this.value))
      }, 0)
    }

    const reject = value => {
      // 状态只能够更变一次
      if (this.state !== PENDING) return
      this.state = REJECTED
      this.value = value
      // rejectedCallbacks 队列中的回调总是异步执行的
      // 为了保证函数执行顺序，需要使用 setTimeout 包裹起来
      setTimeout(() => {
        this.rejectedCallbacks.forEach(cb => cb(this.value))
      }, 0)
    }

    try {
      fn(resolve, reject)
    } catch (error) {
      reject(error)
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

    // 每个 then 函数都需要返回一个新的 Promise 对象
    let promise2

    // 等待态的逻辑
    if (this.state === PENDING) {
      // 首先我们返回了一个新的 Promise 对象，并在 Promise 中传入了一个函数
      return (promise2 = new Promise((resolve, reject) => {
        // 函数的基本逻辑还是和之前一样，往回调数组中 push 函数
        // 同样，在执行函数的过程中可能会遇到错误，所以使用了 try...catch 包裹
        // 规范规定，执行 onFulfilled 或者 onRejected 函数时会返回一个 x，并且执行 Promise 解决过程
        this.resolvedCallbacks.push(() => {
          try {
            const x = onFulfilled(this.value)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })

        this.rejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.value)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }))
    }

    // 执行态的逻辑
    if (this.state === RESOLVED) {
      return (promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }))
    }

    // 拒绝态的逻辑
    if (this.state === REJECTED) {
      return (promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onRejected(this.value)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }))
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  static resolve(value) {
    return new Promise(resolve => resolve(value))
  }

  static reject(value) {
    return new Promise((resolve, reject) => reject(value))
  }
}

// 实现兼容多种 Promise 的 resolutionProcedure 函数
function resolutionProcedure(promise2, x, resolve, reject) {
  // 首先规范规定了 x 不能与 promise2 相等，这样会发生循环引用的问题
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  /**
   * 然后需要判断 x 的类型
   * 如果 x 为 Promise 的话，需要判断以下几个情况：
   * * 如果 x 处于等待态，Promise 需保持为等待态直至 x 被执行或拒绝
   * * 如果 x 处于其他状态，则用相同的值处理 Promise
   */
  // 如果是当前的 Promise 类型
  if (x instanceof Promise) {
    x.then(value => {
      resolutionProcedure(promise2, value, resolve, reject)
    }, reject)
  }

  // 兼容其他 Promise 实现
  let called = false
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolutionProcedure(promise2, y, resolve, reject)
          },
          e => {
            if (called) return
            called = true
            reject(e)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

// 测试
Promise.deferred = Promise.defer = function() {
  var dfd = {}
  dfd.promise = new Promise(function(resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

try {
  module.exports = Promise
} catch (error) {}
