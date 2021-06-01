// 1. 导入mysql包
const mysql = require('mysql')
// 2. 创建数据库连接
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: '光谷智慧系统',
})
// 3. 连接数据库
con.connect()

// 封装一个函数, 执行sql语句, 返回结果
function getAll(sql, callback) {
  con.query(sql, function (err, data) {
    if (err) throw err
    // 调用回调函数, 把数据库的数组(实参)传递给回调函数
    callback(data)
  })
}

function getOne(sql, callback) {
  con.query(sql, function (err, data) {
    if (err) throw err

    // 如果data是一个空数组
    if (data.length == 0) {
      // 查询不到数据, 返回一个空对象
      callback({})
    } else {
      // 如果可以查询到数据, 返回数组的第一条记录
      callback(data[0])
    }
  })
}

function exec(sql, callback) {
  con.query(sql, function (err, data) {
    if (err) throw err

    callback(data)
  })
}
module.exports = {
  // 获取所有的数据
  getAll: getAll,
  getOne, // 当属性名和属性值相等时, 可以这个简写
  exec,
}
