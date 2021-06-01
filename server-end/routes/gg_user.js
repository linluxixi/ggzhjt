//这个路由对应的数据表gg_user

//1.导入express
const express = require('express')
// 导入mysql操作库
const mysql = require('../db/mysql.js')
//2.创建路由对象
const router = express.Router()
//3.编写路由
//返回表所有数据
router.get('/gg_user', function (req, res) {
  //操作数据库
  const sql = `select * from gg_user`
  //返回函数
  mysql.getAll(sql, function (data) {
    res.send(data)
  })
})

//根据id查询单条记录接口,得到的是一个对象
router.get('/gg_user/:id', function (req, res) {
  let id = req.params.id
  // 1. 编写sql
  const sql = `select * from gg_user where user_id=${id}`
  // 2. 执行sql
  mysql.getOne(sql, function (data) {
    res.send(data)
  })
})

//登录界面注册接口
router.post('/gg_user/add', function (req, res) {
  // console.log(req.body)
  const { user_name, user_password, user_type } = req.body
  // 1. 编写sql
  const sql = `insert into gg_user values (null, '${user_name}',MD5('${user_password}'),'common',0,1)`
  // console.log(sql)
  // 2. 执行sql
  mysql.exec(sql, function (data) {
    // 处理返回的格式
    res.send({
      user_id: data.insertId,
      user_name: user_name,
      user_password: user_password,
      user_type: user_type,
    })
  })
})

//后台添加接口
router.post('/gg_users/add', function (req, res) {
  // console.log(req.body)
  const { user_name, user_password, user_type } = req.body
  // 1. 编写sql
  const sql = `insert into gg_user values (null, '${user_name}',MD5('${user_password}'),'${user_type}',0,1)`
  // console.log(sql)
  // 2. 执行sql
  mysql.exec(sql, function (data) {
    // 处理返回的格式
    res.send({
      user_id: data.insertId,
      user_name: user_name,
      user_password: user_password,
      user_type: user_type,
    })
  })
})

//登录
router.post('/user/login', function (req, res) {
  const { user_name, user_password } = req.body
  const sql = `select user_id, user_name, user_type from gg_user where user_name='${user_name}' and user_password=MD5('${user_password}')`
  mysql.getOne(sql, function (data) {
    // 处理返回的格式
    res.send(data)
  })
})

//登录改用户状态
router.put('/user/login', function (req, res) {
  const { user_name, user_password } = req.body
  const sql = `update  gg_user set user_onlinestatus='1' where user_name='${user_name}' and user_password=MD5('${user_password}')`
  mysql.getOne(sql, function (data) {
    // 处理返回的格式
    res.send(data)
  })
})

//下线改用户登陆状态
router.put('/user/off/:id', function (req, res) {
  const { user_name, user_password } = req.body
  const sql = `update  gg_user set user_onlinestatus='0' where user_id='${user_id}')`
  mysql.getOne(sql, function (data) {
    // 处理返回的格式
    res.send(data)
  })
})

//用户管理
router.get('/admin', function (req, res) {
  if (req.query.page && req.query.limit) {
    // 返回分页数据
    const { page, limit } = req.query
    const offset = (page - 1) * limit

    const sql = `select * from gg_user limit ${offset}, ${limit}` //不会
    mysql.getAll(sql, function (data) {
      res.send(data)
    })
  } else if (req.query.count) {
    // 返回总记录数
    const sql = `select count(*) as num from gg_user `
    mysql.getOne(sql, function (data) {
      res.send(data)
    })
  } else {
    // 操作数据库
    // 1. 编写sql
    const sql = `select * from gg_user `
    // 2. 执行sql
    mysql.getAll(sql, function (data) {
      // 返回数据
      res.send(data)
    })
  }
})

//修改请求
router.put('/gg_user', function (req, res) {
  console.log(req.body)
  const { user_id, user_password } = req.body
  const sql = `update gg_user set user_password='${user_password}' where user_id=${user_id}`
  console.log(sql)
  mysql.exec(sql, function (data) {
    res.send(data)
  })
})

//删除接口
router.delete('/gg_user/:id', function (req, res) {
  console.log(req.params)
  const sql = `delete from gg_user where user_id=${req.params.id}`
  mysql.exec(sql, function (data) {
    res.send(data)
  })
})

//4.导出对象
module.exports = router
