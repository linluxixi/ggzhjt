//这个路由对应的数据表gg_user

//1.导入express
const express = require('express')
// 导入mysql操作库
const mysql = require('../db/mysql.js')
//2.创建路由对象
const router = express.Router()
//3.编写路由

//返回表中所有记录
router.get('/notice', function (req, res) {
  // 操作数据库
  // 1. 编写sql
  const sql = `select * from gg_notice order by notice_time desc`
  // 2. 执行sql
  mysql.getAll(sql, function (data) {
    // 返回数据
    res.send(data)
  })
})

//根据id查询单条记录
router.get('/notice/:id', function (req, res) {
  let id = req.params.id
  // 1. 编写sql
  const sql = `select * from gg_notice where id=${id}`
  // 2. 执行sql
  mysql.getOne(sql, function (data) {
    res.send(data)
  })
})

//发布公告
router.post('/gg_notice/add', function (req, res) {
  // console.log(req.body)
  const { message, name, time } = req.body
  // 1. 编写sql
  const sql = `insert into gg_notice values (null, '${message}','${time}', '${name}')`
  // console.log(sql)
  // 2. 执行sql
  mysql.exec(sql, function (data) {
    // 处理返回的格式
    res.send(data)
  })
})

// 修改接口
router.put('/notice', function (req, res) {
  console.log(req.body)
  const { id, content } = req.body
  const sql = `update todo set content='${content}' where id=${id}`
  console.log(sql)

  mysql.exec(sql, function (data) {
    res.send(data)
  })
})

// 删除接口
router.delete('/notice/:id', function (req, res) {
  // console.log(req.params)
  const sql = `delete from gg_notice where id=${req.params.id}`
  // console.log(sql)
  mysql.exec(sql, function (data) {
    res.send(data)
  })
})

//4.导出对象
module.exports = router
