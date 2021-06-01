const signInBtn = document.getElementById('signIn')
const signUpBtn = document.getElementById('signUp')
const firstForm = document.getElementById('form1')
const secondForm = document.getElementById('form2')
const container = document.querySelector('.container')

signInBtn.addEventListener('click', () => {
  container.classList.remove('right-panel-active')
})

signUpBtn.addEventListener('click', () => {
  container.classList.add('right-panel-active')
})

firstForm.addEventListener('submit', (e) => e.preventDefault())
secondForm.addEventListener('submit', (e) => e.preventDefault())

// 注册功能
$('#btn1').click(function (e) {
  // 阻止表单的默认行为
  e.preventDefault()
  // 使用jq获取表单数据
  const formData = $('#form1').serialize()
  console.log(formData)
  $.ajax({
    url: 'http://localhost:5000/gg_user/add',
    method: 'post',
    data: formData,
  }).then((res) => {
    console.log(res)
    if (res.success) {
      alert('注册成功')
      location.href =
        'https://blog.csdn.net/weixin_39890629/article/details/112040261'
    } else {
      alert('注册成功')
    }
  })
})

// 登录
$('#btn2').click(function (e) {
  // 阻止表单的默认行为
  e.preventDefault()
  // 使用jq获取表单数据
  const formData = $('#form2').serialize()
  // console.log(formData)
  $.ajax({
    url: 'http://localhost:5000/user/login',
    type: 'post',
    data: formData,
    dataType: 'json', //数据类型是json型
    success: function (data) {
      //成功时返回的值
      console.log(data) //可以在控制台查看打印的值
      sessionStorage.setItem('user_name', data.user_name)
      sessionStorage.setItem('user_type', data.user_type)
      if (data.user_type == 'common') {
        location.href = '/users'
      } else if (data.user_type == 'traffic' || data.user_type == 'admin') {
        location.href = '/traffic'
      } else {
        alert('用户名或密码输入错误')
      }
    },
  })

  //更改用户状态
  $.ajax({
    url: 'http://localhost:5000/user/login',
    type: 'put',
    data: formData,
    dataType: 'json', //数据类型是json型
    success: function (data) {
      //成功时返回的值
      console.log(data) //可以在控制台查看打印的值
    },
  })
})

//登录功能
$(function () {
  function getLists() {
    $.ajax({
      url: 'http://localhost:5000/gg_user',
      type: 'get',
      success: function (res) {
        console.log(res)
      },
    })
  }
  getLists()
})
//记住密码
var user = document.getElementById('username')
var password = document.getElementById('password')
var check = document.getElementById('remember')
var btn = document.getElementById('btn2')
// 获取设置的本地存储的用户名的值
var loUser = localStorage.getItem('user')
// 获取设置的本地存储的密码的值
var loPass = localStorage.getItem('pass')
// 将本地存储的值设置给用户名和密码
user.value = loUser
password.value = loPass
// 判断本地存储值不为空的时候将勾选的checked设置为空
if (loUser !== '' && loPass !== '') {
  check.setAttribute('checked', '')
}
btn.onclick = function () {
  if (check.checked) {
    // alert("选中");
    // 勾选框勾选的时候设置本地的用户名和密码的val为输入的值
    localStorage.setItem('user', user.value)
    localStorage.setItem('pass', password.value)
  } else {
    // alert('未勾选');
    // 勾选框未勾选的时候设置本地的用户名和密码为空
    localStorage.setItem('user', '')
    localStorage.setItem('pass', '')
  }
}
