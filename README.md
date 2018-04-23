# promise-aplus-implementation

[![Build Status](https://travis-ci.org/Cphayim/promise-aplus-implementation.svg?branch=master)](https://travis-ci.org/Cphayim/promise-aplus-implementation)

## 说明

目录包含了一个符合 [Promises/A+](https://promisesaplus.com/) 规范的实现以及一个简化版实现

```
.
├── promise-easy.js
└── promise.js
```

注：简化版存在一些 bug，但仍然符合大部分使用场景

## 如何测试？

`package.json` 依赖中包含了 Promise/A+ 的测试套件 [promises-tests](https://github.com/promises-aplus/promises-tests)


```sh
$ npm install
$ npm test
```
