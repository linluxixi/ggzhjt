const express = require('express')
// 导入mysql操作库
const mysql = require('../db/mysql.js')
// 2. 创建路由对象
const router = express.Router()
// 3. 编写路由

//返回表中所有记录
router.get('/todos', function(req, res) {
  // 操作数据库
  // 1. 编写sql
  const sql = `select * from todo`
  // 2. 执行sql
  mysql.getAll(sql, function(data) {
    // 返回数据
    res.send(data)
  })
  
})

//根据id查询单条记录
router.get('/todos/:id', function(req, res) {
    let id = req.params.id 
    // 1. 编写sql
    const sql = `select * from todo where id=${id}`
    // 2. 执行sql
    mysql.getOne(sql, function(data) {
      res.send(data)
    })
  })

  //添加接口
  // 添加接口
router.post('/todos', function(req, res) {
    // console.log(req.body)
    const {content} = req.body
    // 1. 编写sql
    const sql = `insert into todo values (null, '${content}')`
    // console.log(sql)
    // 2. 执行sql
    mysql.exec(sql, function(data) {
      // 处理返回的格式
      res.send({
        id: data.insertId,
        content: content
      })
    })
  })

 // 修改接口
router.put('/todos', function(req, res) {
    console.log(req.body)
    const {id, content} = req.body
    const sql = `update todo set content='${content}' where id=${id}`
    console.log(sql)
  
    mysql.exec(sql, function(data) {
      res.send(data)
    })
  })

  // 删除接口
router.delete('/todos/:id', function(req, res) {
    const sql = `delete from todo where id=${req.params.id}`
    mysql.exec(sql, function(data) {
      res.send(data)
    })
  })



// 4. 导出对象
module.exports = router