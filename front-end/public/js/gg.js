function closeIconInfo() {
  $('#upMap-Notice').hide('slow')
  $('#update-Notice').hide('slow')
}

$(function () {
  //发布公告事件
  $('#publishNotices').click(function () {
    $('#upMap-Notice').show(200, function () {})
    $('#see-Notice').hide(200, function () {})
  })
  //点击查看公告
  $('#openNotices').click(function () {
    $('#upMap-Notice').hide(200, function () {})
    $('#notice').show(200, function () {})
    $('#see-Notice').show(200, function () {})
    getNotices()
  })
  //时间选择器
  $('#datetimepicker2').datetimepicker({
    format: 'YYYY-MM-DD hh:mm',
    locale: moment.locale('zh-cn'),
  })

  $('#add').click(function (e) {
    // 阻止表单的默认行为
    e.preventDefault()
    // 使用jq获取表单数据
    const formData = $('.STYLE-NAME').serialize()
    console.log(formData)
    $.ajax({
      url: 'http://localhost:5000/gg_notice/add',
      method: 'post',
      data: formData,
    }).then((res) => {
      console.log(res)
      if (res.affectedRows) {
        alert('发布成功')
      } else {
        alert('发布失败')
      }
    })
  })
})

// 发送http请求,渲染页面
function getNotices() {
  // 发送GET请求
  $.ajax({
    url: 'http://localhost:5000/notice', // 请求的URL
    type: 'get', // HTTP请求方式
    success: function (res) {
      console.log(res)
      $('#notice .container').empty() // 先将ul节点清空,再进行动态渲染
      res.forEach(function (item) {
        // 依次取出数组每一个元素,调用函数
        console.log(item)
        // 动态渲染页面,新建li标签,将数据库中数据展示在页面中
        const noticeDate = item.notice_time.split('T')[0]
        const noticeHour = (
          parseInt(item.notice_time.split('T')[1].split(':')[0]) + 8
        ).toString()
        const noticeMinute = item.notice_time.split('T')[1].split(':')[1]
        const noticeSecond = item.notice_time
          .split('T')[1]
          .split(':')[2]
          .split('.')[0]
        const noticeTime = `${noticeDate} ${noticeHour}:${noticeMinute}:${noticeSecond}`
        $('#notice .container').append(
          `<div class="notice_container clearfix">
            <p class="notice_content" title="点击查看详情">${item.notice_content}</p>
            <p class="notice_info">
              <span class="notice_time fr">${noticeTime}</span>
              <span class="user_name fr">发布用户:${item.user_name}</span>
            </p>
          </div>`
        )
      })
    },
  })
}
// 关闭公告
$('#notice p.title .close').click(function () {
  $('#notice').hide(300)
  $('#see-Notice').hide(300, function () {})
})
// 点击--查看公告详情
$('#notice .container').on('click', 'p.notice_content', function () {
  var notice_content = this.innerHTML
  $('#noticeDetails .details').empty()
  $('#noticeDetails').show(300)
  $('#noticeDetails .details').text(notice_content)
})
// 关闭公告详情
$('#noticeDetails p.title .close').click(function () {
  $('#noticeDetails').hide(300)
})
