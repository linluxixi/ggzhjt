 // 第二大步: 添加功能
 $('#add').keyup(function (e) {
    // 获取输入框中的数据
    var todo = $(this).val()

    if (todo == '') return

    // 判断, 如果按下回车键
    if (e.keyCode == '13') {
      // 在ul中添加一个li
      $('.todo-list ul').prepend(
        `<li><p>${todo}</p><a href="#">删除</a></li>`
      )
      // 清空输入框
      $(this).val('')
    }
  })

  // 第三大步: 修改功能
  // 使用click等事件, 只能绑定已经存在的dom元素.
  // 对于动态生成(创建)的元素不能使用这种方式
  // 类似于onclick
  // $('li').click(function () {
  //   console.log('li...')
  // })

  // 类似于addEventListener
  /* @param [string]: 事件名
   ** @param [selector]: 选择器, 动态创建的元素
   ** @param [fun]: callback, 回调函数
   */
  $('ul').on('click', 'p', function () {
    // console.log('li...')
    var p = $(this)
    // 1. 获取li中的文本内容
    var text = $(this).text() //
    // 方法一: 先根据空格将字符串转换成数组, 然后取数组的第一个元素
    console.log(text)

    var input = $(`<input type="text" value="${text}" />`)
    // 2. 创建一个input框, 设置该input框的value值
    p.html(input)

    // 不让input的点击向上冒泡
    input.click(function (e) {
      e.stopPropagation()
      // return false
    })

    // blur事件, 键盘事件
    input.blur(function () {
      // 获取当前输入框的val值, 重新设置回p元素中
      p.html($(this).val())
    })
    input.keyup(function (e) {
      if (e.keyCode == '13') {
        // 获取当前输入框的val值, 重新设置回p元素中
        p.html($(this).val())
      }
    })
  })

  // 第四步: 删除
  $('ul').on('click', 'a', function () {
    console.log(this)
    // console.log($(this).parent())
    $(this).parent().remove()
  })