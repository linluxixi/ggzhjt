//默认下拉栏隐藏
$('#function li ul').attr('style', 'display:none;')

// 点击导航栏，下拉框向下滑动
$(document).ready(function () {
  $('#function li').hover(
    function () {
      $('ul', this).slideDown(200)
      $(this).children('a:first').addClass('hov')
    },
    function () {
      $('ul', this).slideUp(100)
      $(this).children('a:first').removeClass('hov')
    }
  )
})

//导航栏下拉框点击事件
//工具
//默认情况下隐藏工具条
$('#measureTool').attr('style', 'display:none;')
$('#labelTool').attr('style', 'display:none;')

//弹出测量工具条
$('#measure').click(function () {
  $('#labelTool').attr('style', 'display:none;')
  $('#measureTool').show(200, function () {})
})

//弹出标注工具条
// $('#label').click(function () {
//   $('#measureTool').attr('style', 'display:none;')
//   $('#labelTool').show(200, function () {})
// })

var user_name = sessionStorage.getItem('user_name')
$('#userName').html(user_name)
