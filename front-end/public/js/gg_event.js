// *************事件上报框*********************
// *************事件上报框*********************
$('#events').click(function () {
    $('.box').show(200, function () {})
  })
  function msgbox(n) {
    document.getElementById('inputbox').style.display = n
      ? 'block'
      : 'none' 
  }
  
  
  
  // 路况上报功能
  $('#suer').click(function (e) {
    // 阻止表单的默认行为
    //e.preventDefault()
    // 使用jq获取表单数据
    const sjData = $('#eventWindow').val()
    console.log(sjData)
    $.ajax({
      url: 'http://localhost:5000/gg_event/add',
      method: 'post',
      data: sjData,
    }).then((data) => {
      // console.log(res)
      console.log(data)
      console.log(sjData)
      // 窗口关闭
      if (res.success) {
        alert('上报成功')
      } else {
        alert('上报失败')
      }
    })
  })
  