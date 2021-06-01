// 获取日期时间,实时更新
$(function () {
  $(function () {
    setInterval(getTime, 1000) //每隔一秒执行一次
  })
  //时间数字小于10，则在之前加个“0”补位。
  function checkTime(i) {
    var num = i < 10 ? '0' + i : i
    return num
  }
  // 获取实时时间
  function getTime() {
    var myDate = new Date()
    var M = myDate.getMonth() + 1 //获取当前月份(0-11,0代表1月)
    var d = myDate.getDate() //获取当前日(1-31)
    var h = myDate.getHours() //获取当前小时数(0-23)
    var m = myDate.getMinutes() //获取当前分钟数(0-59)
    var s = myDate.getSeconds() //获取当前秒数(0-59)
    var days = myDate.getDay() //获取星期(0-6)
    switch (days) {
      case 1:
        days = '星期一'
        break
      case 2:
        days = '星期二'
        break
      case 3:
        days = '星期三'
        break
      case 4:
        days = '星期四'
        break
      case 5:
        days = '星期五'
        break
      case 6:
        days = '星期六'
        break
      case 0:
        days = '星期日'
        break
    }
    //检查是否小于10
    M = checkTime(M)
    d = checkTime(d)
    h = checkTime(h)
    m = checkTime(m)
    s = checkTime(s)
    // 设置时间
    now_time = h + ' : ' + m + ' : ' + s
    now_date = M + '月' + d + '日 ' + days
    $('#time #nowTime span.time').text(now_time)
    $('#time #nowDate span.date').text(now_date)
  }
})
