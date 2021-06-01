//这个路由对应的数据表gg_event

//1.导入express
const express = require('express')
// 导入mysql操作库
const mysql = require('../db/mysql.js')
//2.创建路由对象
const router = express.Router()

//添加接口,注册接口
router.post('/gg_event/add', function (req, res) {
    // console.log(req.body)
    const {user_name,event_mark,event_describe,event_status} = req.body
    // 1. 编写sql
    const sql = `insert into gg_events values (null,'${user_name}','${event_describe}','${event_mark}','1')`
    console.log(sql)
    // 2. 执行sql
    mysql.exec(sql, function (data) {
      // 处理返回的格式
      res.send({
        event_id:data.insertId,
        user_name:user_name,
        event_mark:event_mark,
        event_describe:event_describe,
        event_status:data.event_status,
      })
    })
  })

  //4.导出对象
module.exports = router