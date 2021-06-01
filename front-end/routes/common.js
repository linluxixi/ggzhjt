//1.导入express
const express = require('express')

//2.创建路由对象
const router = express.Router()

//3.编写路由
router.get('/users', function (req, res) {
  //加载模板文件
  res.render('users')
})

//4.导出路由对象
module.exports = router
