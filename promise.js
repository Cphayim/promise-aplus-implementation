/**
 * @class   Promise
 * @constructor
 * @param   {Function} executor 立即执行函数，接收两个参数 (resolve, reject)
 * @return  返回 Promise 实例
 */
function Promise(executor) {

  var _this = this

  /**
   * @property {Array} resolvedCallbacks 
   * @desc 用于存放 resolved 时执行的回调函数的数组
   */
  _this.resolvedCallbacks = []
  /**
   * @property {Array} rejectedCallbacks
   * @desc 用于存放 rejected 时执行的回调函数的数组
   */
  _this.rejectedCallbacks = []

  /**
   * @property  {String} status  'pending' | 'resolved' | 'rejected'
   * @desc      Promise States
   * 一个 promise 必须处于以下状态之一 : pending, fulfilled, or rejected.
   * 初始时处于 pending 状态，状态一经更变，无法再次修改
   * 
   * 当 promise 处于 pending 状态时:
   *    状态可能过渡到 resolved 或 rejected
   * 
   * 当 promise 处于 resolved 状态时:
   *    不能过渡到其它任何状态
   *    必须有一个不能改变的 value (任何合法的 JavaScript 类型，包括 undefined 或另一个 promise)
   * 
   * 当 promise 处于 rejected 状态时:
   *    不能过渡到其它任何状态
   *    必须有一个不能改变的 reason 来表明拒绝的原因
   * 
   * 标准定义：https://promisesaplus.com/#promise-states
   */
  _this.status = 'pending'

  /**
   * @function resolve
   * @desc 将当前实例的状态设置为 resolved，并执行 resolvedCallbacks 中的回调
   * 将作为参数传递给 executor
   * @param {any} value 成功时传递给 onResolved 的值
   */
  function resolve(value) {
    if (_this.status === 'pending') {
      _this.status = 'resolved'
      _this.data = value

      var f
      for (var i = 0, length = _this.resolvedCallbacks.length; i < length; i++) {
        f = _this.resolvedCallbacks[i]
        f(value)
      }
    }
  }

  /**
   * @function reject
   * @desc 将当前实例的状态设置为 rejected，并执行 rejectedCallbacks 中的回调
   * 将作为参数传递给 executor
   * @param {any} reason 失败时传递给 onRejected 的值
   */
  function reject(reason) {
    if (_this.status === 'pending') {
      _this.status = 'rejected'
      _this.data = reason

      var f
      for (var i = 0, length = _this.rejectedCallbacks.length; i < length; i++) {
        f = _this.rejectedCallbacks[i]
        f(reason)
      }
    }
  }

  try {
    executor(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

/**
 * @class   Promise
 * @method  then
 * @param   {Function}  onResolved 
 *  可选 
 *  若 onResolved 不是一个函数，它将被忽略
 *  若 onResolved 是一个函数，它将在 promise 状态为 fulfill
 * @param   {Function}  onRejected 可选，当 promise.status 为 rejected 时回调，异步
 * @return  返回一个新的 Promise 实例
 */
Promise.prototype.then = function (onResolved, onRejected) {
  var _this = this

  // 若 onResolved 不是函数类型，则忽略它
  if (typeof onResolved !== 'function') {
    onResolved = function () { }
  }
  // 若 onRejected 不是函数类型，则忽略它
  if (typeof onRejected !== 'function') {
    onRejected = function () { }
  }

  // 用于保存返回的 promise 对象
  var promise2

  if (_this.status === 'resolved') {
    promise2 = new Promise(function (resolve, reject) {
      try {
        var x = onResolved(_this.data)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  if (_this.status === 'rejected') {
    promise2 = new Promise(function (resolve, reject) {
      try {
        var x = onRejected(_this.data)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  if (_this.status === 'pending') {
    promise2 = new Promise(function (resolve, reject) {

      _this.resolvedCallbacks.push(function (value) {
        try {
          var x = onResolved(value)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (error) {
          reject(error)
        }
      })

      _this.rejectedCallbacks.push(function (reason) {
        try {
          var x = onRejected(reason)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  return promise2
}

/**
 * promises-aplus-tests obj
 */
Promise.deferred = function () {
  var dfd = {}
  dfd.promise = new Promise(function (resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise 
