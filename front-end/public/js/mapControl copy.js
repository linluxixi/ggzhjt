$(function () {
  //用户名赋值
  var user_name = sessionStorage.getItem('user_name')
  $('#userName').html(user_name)
  // ******************************<- 地图加载及地图控件->*************************************

  // 添加天地图矢量图层
  const TiandiMap_vec = new ol.layer.Tile({
    opacity: 0.7,
    title: '天地图矢量图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=' +
        '6d920502fcab6bf5f0d52cf63024f956', // + 之后为天地图密钥
      wrapX: false,
    }),
  })
  // 添加天地图矢量注记图层
  const TiandiMap_cva = new ol.layer.Tile({
    title: '天地图矢量注记图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=' +
        '6d920502fcab6bf5f0d52cf63024f956', // + 之后为天地图密钥
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  // 添加天地图影像图层
  const TiandiMap_img = new ol.layer.Tile({
    name: '天地图影像图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' +
        '6d920502fcab6bf5f0d52cf63024f956', //parent.TiandituKey()为天地图密钥,
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  // 天地图影像注记图层
  const TiandiMap_cia = new ol.layer.Tile({
    name: '天地图影像注记图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' +
        '6d920502fcab6bf5f0d52cf63024f956', //parent.TiandituKey()为天地图密钥,
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  // 地图文档
  const docLayer = new Zondy.Map.Doc(
    '', //参数1: opt_name,名称,可为空
    '光谷智慧交通', //参数2: opt_hdfName,IGServer发布的瓦片地图实际名称
    {
      ip: 'localhost',
      port: '6163',
    }
  )
  // 实例化map对象,设置地图参数
  const map = new ol.Map({
    target: 'mapCon',
    layers: [
      docLayer,
      TiandiMap_vec,
      TiandiMap_cva,
      TiandiMap_img,
      TiandiMap_cia,
    ],
    // 视图信息
    view: new ol.View({
      projection: 'EPSG:4326', // 参考系,每一个坐标系都被分配 EPSG 代码,4326是指WGS84坐标，3857是指球面墨卡托投影
      center: [114.37, 30.49], // 中心点
      zoom: 13, // 当前显示级数
      maxZoom: 18,
      minZoom: 2,
    }),
  })

  // 下载图片
  // document
  // .getElementById('exportPic')
  // .addEventListener('click', function () {
  //   map.once('rendercomplete', function (event) {
  //     var canvas = event.context.canvas
  //     if (navigator.msSaveBlob) {
  //       navigator.msSaveBlob(canvas.msToBlob(), 'map.png')
  //     } else {
  //       canvas.toBlob(function (blob) {
  //         saveAs(blob, 'map.png')
  //       })
  //     }
  //   })
  //   map.renderSync()
  // })

  // 地图切换点击事件
  // 默认隐藏影像图
  TiandiMap_img.setVisible(false)
  TiandiMap_cia.setVisible(false)
  $('#vectorMap').on('click', function () {
    $('#vectorMap').css('border', '2px solid #23adec')
    $('#imgMap').css('border', 'none')
    TiandiMap_vec.setVisible(true)
    TiandiMap_cva.setVisible(true)
    TiandiMap_img.setVisible(false)
    TiandiMap_cia.setVisible(false)
  })
  $('#imgMap').on('click', function () {
    $('#imgMap').css('border', '2px solid #23adec')
    $('#vectorMap').css('border', 'none')
    TiandiMap_vec.setVisible(false)
    TiandiMap_cva.setVisible(false)
    TiandiMap_img.setVisible(true)
    TiandiMap_cia.setVisible(true)
  })

  // 地图控件
  // 放大缩小
  const zoomSliderControl = new ol.control.ZoomSlider()
  map.addControl(zoomSliderControl)
  // 视图跳转控件
  const zoomToExtentControl = new ol.control.ZoomToExtent({
    extent: [114.31, 30.455, 114.43, 30.525], // 显示范围两对角坐标
  })
  map.addControl(zoomToExtentControl)
  // 鼠标实时位置
  function WENS(a, b) {
    var x = a.toFixed(2)
    var y = b.toFixed(2)
    if (x > 0) {
      x = x + '°E'
    } else if (x < 0) {
      x = x * -1 + '°W'
    }
    if (y > 0) {
      y = y + '°N'
    } else if (y < 0) {
      y = y + '°S'
    }
    return [x, y]
  }
  $('#mapCon').on('mousemove', function (e) {
    var pos = {
      x: e.offsetX,
      y: e.offsetY,
    }
    var mapSize = map.getSize()
    var temp = map.getView().calculateExtent(mapSize)
    var mapExtentL = {
      x: temp[0],
      y: temp[1],
    } //左下经纬度
    var mapExtentR = {
      x: temp[2],
      y: temp[3],
    } //右上经纬度
    pos = {
      x: mapExtentL.x + (pos.x * (temp[2] - temp[0])) / mapSize[0],
      y: mapExtentR.y - (pos.y * (temp[3] - temp[1])) / mapSize[1],
    }
    var pos0 = WENS(pos.x, pos.y)
    $('#lon').text('经度: ' + pos0[0])
    $('#lat').text('纬度: ' + pos0[1])
  })
  // 比例尺
  var scaleLineControl = new ol.control.ScaleLine({
    units: 'metric', // 单位
  })
  map.addControl(scaleLineControl)

  // ************************************<-子菜单显示->***********************************
  $('#function li.fl').hover(function () {
    $(this).find('ul').stop().slideToggle()
  })
  // ************************************<-标注功能->*************************************
  // 点击"标注"工具条显示
  $('#tools #label').click(function () {
    stopAddIcon()
    $('#labelTool').toggle(500)
  })
  // 声明变量
  var draw
  var drawType
  var center
  var iconName
  var iconNote

  // 图形层
  var drawSource = new ol.source.Vector({
    wrapX: false,
  })
  var drawLayer = new ol.layer.Vector({
    source: drawSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: '#2facff',
        width: 4,
      }),
      image: new ol.style.Icon({
        anchor: [0.5, 60],
        anchorOrigin: 'top-right',
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        offsetOrigin: 'top-right',
        // offset:[0,10],
        // 图标缩放比例
        scale: 0.5,
        // 透明度
        opacity: 0.75,
        // 图标的url
        src: '/images/traffic/label-point.png',
      }),
    }),
  })
  // 文字标注层
  var textSource = new ol.source.Vector({
    wrapX: false,
  })
  var textLayer = new ol.layer.Vector({
    source: textSource,
    style: new ol.style.Style({
      text: new ol.style.Text({
        // 位置
        textAlign: 'left',
        // 基准线
        textBaseline: 'top',
        // 文字样式
        font: 'bold 15px 微软雅黑',
        // 文本内容
        text: '',
        // 文本填充样式（即文字颜色）
        fill: new ol.style.Fill({
          color: '#000',
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
    }),
  })
  map.addLayer(drawLayer)
  map.addLayer(textLayer)

  // 实现popup的html标签
  var container1 = document.getElementById('popup1')
  var container2 = document.getElementById('popup2')
  var content1 = document.getElementById('popup-content1')
  var content2 = document.getElementById('popup-content2')
  // 添加OverLay类
  var popup1 = new ol.Overlay({
    element: container1,
    autoPan: true,
    positioning: 'bottom-center',
    stopEvent: true,
    autoPanAnimation: {
      duration: 250,
    },
  })
  var popup2 = new ol.Overlay({
    element: container2,
    autoPan: true,
    positioning: 'bottom-center',
    stopEvent: true,
    autoPanAnimation: {
      duration: 250,
    },
  })
  map.addOverlay(popup1)
  map.addOverlay(popup2)

  // 交互式添加标注
  function addIcon() {
    if (drawSource == null) {
      drawSource = new ol.source.Vector({
        wrapX: false,
      })
    }
    // 添加交互控件
    draw = new ol.interaction.Draw({
      source: drawSource,
      type: drawType,
    })
    map.addInteraction(draw)
    // 绘制完成事件
    draw.on('drawend', function (e) {
      stopAddIcon()
      var coord = e.feature.getGeometry().getCoordinates()
      if (drawType == 'Point') {
        center = coord
      } else if (drawType == 'LineString') {
        var length = coord.length
        center = coord[length - 1]
      } else if (drawType == 'Polygon') {
        var extent = e.feature.getGeometry().extent_
        center = ol.extent.getCenter(extent)
      }
      map.getView().animate({
        center: center,
        duration: 500,
      })
      // 编辑信息弹窗
      content1.innerHTML = ''
      popup1.setPosition(undefined)
      // 在popup中加载当前要素的具体信息
      const info = `<div class="name clearfix"><span>名称: </span><input type="text" class="fr"></div>
      <div class="note clearfix"><span>备注: </span><textarea name="note" id="" cols="30" rows="5" class="fr"></textarea></div>`
      content1.insertAdjacentHTML('beforeend', info)
      popup1.setPosition(center)
    })
  }
  // 编辑信息弹窗点击事件
  // 保存按钮
  $('#popup1 .bottom-btn .save').click(function () {
    // 获取输入的信息
    iconName = $('#popup1 .name input').val()
    iconNote = $('#popup1 .note textarea').val()
    if (iconName != '') {
      // 得到当前正在添加的图形feature
      const getSource = map.getLayers().array_[5].getSource()
      const leng = getSource.getFeatures().length
      const drawFeature = getSource.getFeatures()[leng - 1]
      // 在同一坐标添加文字注记,注记内容为iconName
      var textFeature = new ol.Feature({
        geometry: new ol.geom.Point(center),
        name: iconName,
      })
      textFeature.setStyle(
        new ol.style.Style({
          text: new ol.style.Text({
            // 位置
            textAlign: 'left',
            // 基准线
            textBaseline: 'top',
            // 文字样式
            font: 'bold 15px 微软雅黑',
            // 文本内容
            text: textFeature.get('name'),
            // 文本填充样式（即文字颜色）
            fill: new ol.style.Fill({
              color: '#000',
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 2,
            }),
          }),
        })
      )
      textSource.addFeature(textFeature)
      // 传参
      drawFeature.id_ = [iconName, iconNote, popup1.getPosition()]
      textFeature.id_ = [iconName, iconNote, popup1.getPosition()]
      // 编辑窗口关闭
      content1.innerHTML = ''
      popup1.setPosition(undefined)
      addIcon() //可继续绘制
    } else {
      alert('请输入名称')
    }
  })
  // 删除/关闭点击事件
  $('#popup1 .close,#popup1 .delete').click(function () {
    // 得到当前正在添加的图形feature
    const getSource = map.getLayers().array_[5].getSource()
    const leng = getSource.getFeatures().length
    const drawFeature = getSource.getFeatures()[leng - 1]
    // 移除该要素
    drawSource.removeFeature(drawFeature)
    content1.innerHTML = ''
    popup1.setPosition(undefined)
    addIcon()
  })

  // 点击图形出现popup2弹窗
  map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature, layer) {
        return feature
      }
    )
    iconName = feature.id_[0]
    iconNote = feature.id_[1]
    center = feature.id_[2]
    if (feature) {
      // 清空popup的内容容器
      content2.innerHTML = ''
      popup2.setPosition(undefined)
      // 在popup中加载当前要素的具体信息
      const info = `<div class="name clearfix"><span>名称: </span><div class="fr">${iconName}</div></div>
    <div class="note clearfix"><span>备注: </span><div class="fr">${iconNote}</div></div>`
      content2.insertAdjacentHTML('beforeend', info)
      // 点坐标/线长度/区面积
      // if (feature.getGeometry().getCoordinates().length == 1) {
      //   //feature是面
      // } else {
      //   if (feature.getGeometry().floatCoordinates.length == 2) {
      //     // feature是点
      //     var center0 = center[0].toFixed(2)
      //     var center1 = center[1].toFixed(2)
      //     $('#popup2 .info').text('坐标为 ' + center0 + ',' + center1)
      //   } else {
      //     //feature是线
      //   }
      // }
      // 定义popup的位置
      if (popup2.getPosition() == undefined) {
        // 设置popup的位置-----从获取到的feature中获取坐标
        popup2.setPosition(center)
      }
    }
  })

  // popup2点击事件
  // 关闭键
  $('#popup2 .close').click(function () {
    content2.innerHTML = ''
    popup2.setPosition(undefined)
  })
  // 删除键
  $('#popup2 .delete').click(function () {
    var position = popup2.getPosition()
    var delDrawFeature
    var drawFeatures = map.getLayers().array_[5].getSource().getFeatures()
    var delTextFeature
    var textFeatures = map.getLayers().array_[6].getSource().getFeatures()
    for (const i in drawFeatures) {
      if (drawFeatures[i].id_[2] == position) {
        delDrawFeature = drawFeatures[i]
      }
    }
    for (const i in textFeatures) {
      if (textFeatures[i].id_[2] == position) {
        delTextFeature = textFeatures[i]
      }
    }
    // 删除要素
    drawSource.removeFeature(delDrawFeature)
    textSource.removeFeature(delTextFeature)
    content2.innerHTML = ''
    popup2.setPosition(undefined)
  })

  // 停止标注
  function stopAddIcon() {
    map.removeInteraction(draw)
  }

  // 工具条点击事件
  $('#labelTool .close').click(function () {
    if (popup1.getPosition() == undefined) {
      popup2.setPosition(undefined)
      $('#labelTool').hide(500)
      stopAddIcon()
    }
  })
  $('#labelTool p .point').click(function () {
    if (popup1.getPosition() == undefined) {
      popup2.setPosition(undefined)
      stopAddIcon()
      drawType = 'Point'
      addIcon()
    }
  })
  $('#labelTool p .line').click(function () {
    if (popup1.getPosition() == undefined) {
      popup2.setPosition(undefined)
      stopAddIcon()
      drawType = 'LineString'
      addIcon()
    }
  })
  $('#labelTool p .polygon').click(function () {
    if (popup1.getPosition() == undefined) {
      popup2.setPosition(undefined)
      stopAddIcon()
      drawType = 'Polygon'
      addIcon()
    }
  })
  $('#labelTool p .clear').click(function () {
    drawSource = null
    drawLayer.setSource(drawSource)
    textSource = null
    textLayer.setSource(textSource)
    content1.innerHTML = ''
    popup1.setPosition(undefined)
    content2.innerHTML = ''
    popup2.setPosition(undefined)
    stopAddIcon()
  })
  $('#labelTool p .pause').click(function () {
    if (popup1.getPosition() == undefined) {
      popup2.setPosition(undefined)
      stopAddIcon()
    }
  })

  // ************************************<-显示实时路况->*************************************
  // 点击"设置"弹出窗口
  $('#viewSetting').click(function () {
    $('#viewSettingWindow').toggle(300)
  })

  // 路况设置窗口点击事件
  // 关闭点击事件
  $('#viewSettingWindow p.title i').click(function () {
    $('#viewSettingWindow').hide(500)
  })

  // '确定'点击事件
  var minFlow = parseInt($('#viewSettingWindow .minTrafficFlow').val())
  var maxFlow = parseInt($('#viewSettingWindow .maxTrafficFlow').val())
  $('#viewSettingWindow button').click(function () {
    minFlow = parseInt($('#viewSettingWindow .minTrafficFlow').val())
    maxFlow = parseInt($('#viewSettingWindow .maxTrafficFlow').val())
    if (
      $('#trafficToggle img').attr('src') == '/images/traffic/trafficOn.png'
    ) {
      trafficSource = null
      trafficLayer.setSource(trafficSource)
      queryTraffic()
    }
    $('#viewSettingWindow').hide(500)
  })

  // 按钮点击事件
  $('#trafficToggle').click(function () {
    if (
      $('#trafficToggle img').attr('src') == '/images/traffic/trafficOff.png'
    ) {
      // 实况关闭时
      $('#trafficToggle img').attr('src', '/images/traffic/trafficOn.png')
      $('#trafficToggle').css('border', '2px solid #23adec')
      queryTraffic()
    } else if (
      $('#trafficToggle img').attr('src') == '/images/traffic/trafficOn.png'
    ) {
      // 实况打开时
      $('#trafficToggle img').attr('src', '/images/traffic/trafficOff.png')
      $('#trafficToggle').css('border', '2px solid #8a8a8a')
      trafficSource = null
      trafficLayer.setSource(trafficSource)
    }
  })

  // 点击显示路况:1.查询道路数据  2.图形绘制在地图中
  // 实例化图层显示路况
  var trafficSource = new ol.source.Vector({
    wrapX: false,
  })
  var trafficLayer = new ol.layer.Vector({
    source: trafficSource,
  })
  map.addLayer(trafficLayer)

  // 根据车流量属性查询道路数据
  function queryTraffic() {
    var queryStruct = new Zondy.Service.QueryFeatureStruct()
    queryStruct.IncludeGeometry = true
    //实例化查询参数对象
    var queryParam = new Zondy.Service.QueryParameter({
      resultFormat: 'json',
      struct: queryStruct,
      cursorType: null,
    })
    //设置查询分页号
    queryParam.pageIndex = 0
    //设置查询要素数目
    queryParam.recordNumber = 100
    //查询条件
    queryParam.where = '1>0'
    //实例化地图文档查询服务对象
    var queryService = new Zondy.Service.QueryDocFeature(
      queryParam,
      '光谷智慧交通',
      '1',
      {
        ip: 'localhost',
        port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
      }
    )
    queryService.query(queryTrafficSuccess, queryError)
  }

  function queryTrafficSuccess(result) {
    //将MapGIS要素JSON反序列化为ol.Feature类型数组
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
    var flow
    for (const i in features) {
      flow = parseInt(features[i].values_.values_.车流量)
      if (flow <= minFlow) {
        // 畅通道路
        features[i].setStyle(
          new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 204, 51, 0.5)',
            }),
            stroke: new ol.style.Stroke({
              color: '#17a85d',
              width: 8,
            }),
          })
        )
      } else if (flow < maxFlow && flow > minFlow) {
        // 繁忙道路
        features[i].setStyle(
          new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 204, 51, 0.5)',
            }),
            stroke: new ol.style.Stroke({
              color: '#e4cc35',
              width: 8,
            }),
          })
        )
      } else if (flow >= maxFlow) {
        // 拥堵道路
        features[i].setStyle(
          new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 204, 51, 0.5)',
            }),
            stroke: new ol.style.Stroke({
              color: '#f7574f',
              width: 8,
            }),
          })
        )
      }
    }
    trafficSource = null
    trafficSource = new ol.source.Vector({
      wrapX: false,
    })
    trafficLayer.setSource(trafficSource)
    trafficSource.addFeatures(features)
  }

  function queryError() {
    console.log('查询失败')
  }

  // ************************************<-事件--查询->*************************************
  // 创建事件标注层
  var eventsLabelSource = new ol.source.Vector({
    wrapX: false,
  })
  var eventsLabelLayer = new ol.layer.Vector({
    source: eventsLabelSource,
  })
  map.addLayer(eventsLabelLayer)
  // 事件--查询 点击事件
  $('li#queryEvents').click(function () {
    queryByCircle()
  })

  // 画圆几何查询
  function queryByCircle() {
    // 添加交互控件
    draw = new ol.interaction.Draw({
      source: drawSource,
      type: 'Circle',
    })
    map.addInteraction(draw)
    // 绘制完成
    draw.on('drawend', function (e) {
      var circleCenter = e.feature.getGeometry().getCenter()
      var point = new Zondy.Object.Point2D(circleCenter[0], circleCenter[1])
      var radius = e.feature.getGeometry().getRadius()
      var geom = new Zondy.Object.Circle(point, radius)
      //初始化查询结构对象，设置查询结构包含几何信息
      var queryStruct = new Zondy.Service.QueryFeatureStruct()
      //是否包含几何图形信息
      queryStruct.IncludeGeometry = true
      //是否包含属性信息
      queryStruct.IncludeAttribute = true
      //是否包含图形显示参数
      queryStruct.IncludeWebGraphic = false
      // 定义查询规则
      var rule = new Zondy.Service.QueryFeatureRule({
        //是否将要素的可见性计算在内
        EnableDisplayCondition: false,
        //是否完全包含
        MustInside: false,
        //是否仅比较要素的外包矩形
        CompareRectOnly: false,
        //是否相交
        Intersect: true,
      })
      //实例化查询参数对象
      var queryParam = new Zondy.Service.QueryParameter({
        geometry: geom,
        resultFormat: 'json',
        struct: queryStruct, // 查询结构
        rule: rule, // 查询规则
        cursorType: null, // 显示查询的要素数量
      })
      queryParam.pageIndex = 0
      queryParam.recordNumber = 100
      //实例化地图文档查询服务对象
      var queryService = new Zondy.Service.QueryDocFeature(
        queryParam,
        '光谷智慧交通',
        '3',
        {
          ip: 'localhost',
          port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
        }
      )
      //执行查询操作，querySuccess为查询回调函数
      queryService.query(queryEventsSuccess, queryError)
    })
  }
  // 事件等级
  function eventsLevel(a) {
    var level
    switch (a) {
      case '1':
        level = '特大事故'
        break
      case '2':
        level = '重大事故'
        break
      case '3':
        level = '一般事故'
        break
      case '4':
        level = '轻微事故'
        break
    }
    return level
  }
  // 事件处理状态
  function eventsStatus(a) {
    var status
    switch (a) {
      case '1':
        status = '处理中'
        break
      case '2':
        status = '已归档'
        break
      case '0':
        status = '待处理'
        break
    }
    return status
  }
  // 查询成功函数
  function queryEventsSuccess(result) {
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
    // 删除绘制的圆形feature
    const getSource = map.getLayers().array_[5].getSource()
    const leng = getSource.getFeatures().length
    const circleFeature = getSource.getFeatures()[leng - 1]
    drawSource.removeFeature(circleFeature)
    stopAddIcon()
    $('#eventsTable table tr.title').siblings().remove() //清空表格元素
    if (features.length > 0) {
      // 遍历查询要素,列出表格
      for (const i in features) {
        var value = features[i].values_.values_
        $('#eventsTable table tr.title').after(`<tr class="events">
      <td class="key">${value.事件编号}</td>
      <td>${value.事件类型}</td>
      <td>${eventsLevel(value.事件等级)}</td>
      <td>${value.发生时间}</td>
      <td>${value.发生地点}</td>
      <td>${value.车牌号}</td>
      <td>${value.驾驶员}</td>
      <td>${eventsStatus(value.处理状态)}</td>
      </tr>`)
        features[i].setStyle(
          new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 60],
              anchorOrigin: 'top-right',
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              offsetOrigin: 'top-right',
              // offset:[0,10],
              //图标缩放比例
              scale: 0.5,
              //透明度
              opacity: 0.75,
              //图标的url
              src: '/images/traffic/label-point.png',
            }),
            text: new ol.style.Text({
              // 位置
              textAlign: 'left',
              // 基准线
              textBaseline: 'top',
              // 文字样式
              font: '600 15px 微软雅黑',
              // 文本内容
              text: value.事件编号,
              // 文本填充样式（即文字颜色）
              fill: new ol.style.Fill({
                color: '#333',
              }),
              stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3,
              }),
            }),
          })
        )
      }
      $('#eventsTable .eventsTable').show(300)
      eventsLabelSource = null
      eventsLabelSource = new ol.source.Vector({
        wrapX: false,
      })
      eventsLabelLayer.setSource(eventsLabelSource)
      eventsLabelSource.addFeatures(features)
    }
  }

  // 事件查询表点击事件
  // 关闭
  $('#eventsTable .btn .close').click(function () {
    $('#eventsTable .eventsTable').hide(300)
    $('#eventsTable table tr.title').siblings().remove() //清空表格元素
    eventsLabelSource = null
    eventsLabelLayer.setSource(eventsLabelSource)
    map.getView().animate({
      zoom: 13,
      center: [114.37, 30.49],
      duration: 500,
    })
  })

  // 展开/收起
  $('#eventsTable .btn .iconfont').click(function () {
    $('#eventsTable .eventsTable').slideToggle(300)
  })

  // 生成统计图(柱状图/饼图)
  var columnBox = document.getElementById('column')
  var pieBox = document.getElementById('pie')
  $('#eventsTable .btn .statistics').click(function () {
    // 查询获取所有事件点
    var queryStruct = new Zondy.Service.QueryFeatureStruct()
    queryStruct.IncludeGeometry = true
    var queryParam = new Zondy.Service.QueryParameter({
      resultFormat: 'json',
      struct: queryStruct,
      cursorType: null,
    })
    queryParam.pageIndex = 0
    queryParam.recordNumber = 100
    queryParam.where = '1>0'
    var queryService = new Zondy.Service.QueryDocFeature(
      queryParam,
      '光谷智慧交通',
      '3',
      {
        ip: 'localhost',
        port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
      }
    )
    queryService.query(queryAllEventsForstatistics, queryError)
  })

  function queryAllEventsForstatistics(result) {
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
    var eventsNum1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var eventsNum2 = [0, 0, 0, 0, 0, 0] //刮擦,碰撞,翻车,碾压,失火,其他
    for (const i in features) {
      var value = features[i].values_.values_
      var eventsMon = parseInt(value.发生时间.split('.')[1])
      var eventsType = value.事件类型
      // 得到各月事件数
      switch (eventsMon) {
        case 1:
          eventsNum1[0] = eventsNum1[0] + 1
          break
        case 2:
          eventsNum1[1] = eventsNum1[1] + 1
          break
        case 3:
          eventsNum1[2] = eventsNum1[2] + 1
          break
        case 4:
          eventsNum1[3] = eventsNum1[3] + 1
          break
        case 5:
          eventsNum1[4] = eventsNum1[4] + 1
          break
        case 6:
          eventsNum1[5] = eventsNum1[5] + 1
          break
        case 7:
          eventsNum1[6] = eventsNum1[6] + 1
          break
        case 8:
          eventsNum1[7] = eventsNum1[7] + 1
          break
        case 9:
          eventsNum1[8] = eventsNum1[8] + 1
          break
        case 10:
          eventsNum1[9] = eventsNum1[9] + 1
          break
        case 11:
          eventsNum1[10] = eventsNum1[10] + 1
          break
        case 12:
          eventsNum1[11] = eventsNum1[11] + 1
          break
      }
      // 得到各类事件数
      switch (eventsType) {
        case '刮擦':
          eventsNum2[0] = eventsNum2[0] + 1
          break
        case '碰撞':
          eventsNum2[1] = eventsNum2[1] + 1
          break
        case '翻车':
          eventsNum2[2] = eventsNum2[2] + 1
          break
        case '碾压':
          eventsNum2[3] = eventsNum2[3] + 1
          break
        case '失火':
          eventsNum2[4] = eventsNum2[4] + 1
          break
        case '其他':
          eventsNum2[5] = eventsNum2[5] + 1
          break

        default:
          break
      }
    }
    var eventsSum = 0
    for (const i in eventsNum2) {
      eventsSum = eventsSum + eventsNum2[i]
    }
    if (features.length > 0) {
      $('#highCharts').toggle(500)
      // 柱状图
      var chart1 = {
        type: 'column',
      }
      var title1 = {
        text: '每月交通事故统计',
      }
      var subtitle1 = {
        text: `总计:${eventsSum}起`,
      }
      var xAxis1 = {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        crosshair: true,
      }
      var yAxis1 = {
        min: 0,
        title: {
          text: '事故 (起)',
        },
      }
      var tooltip1 = {
        headerFormat: '<span style="font-size:10px">{point.key}</span><p>',
        pointFormat: '<p>{point.y:1f} 起</p>',
        footerFormat: '</p>',
        shared: true,
        useHTML: true,
      }
      var plotOptions1 = {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      }
      var credits1 = {
        enabled: false,
      }
      var series1 = [
        {
          name: '交通事故',
          data: eventsNum1,
        },
      ]
      var jsonColumn = {}
      jsonColumn.chart = chart1
      jsonColumn.title = title1
      jsonColumn.subtitle = subtitle1
      jsonColumn.tooltip = tooltip1
      jsonColumn.xAxis = xAxis1
      jsonColumn.yAxis = yAxis1
      jsonColumn.series = series1
      jsonColumn.plotOptions = plotOptions1
      jsonColumn.credits = credits1
      $('#column').highcharts(jsonColumn)

      // 饼图
      var chart2 = {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
      }
      var title2 = {
        text: '各类交通事故统计',
      }
      var subtitle2 = {
        text: `总计:${eventsSum}起`,
      }
      var tooltip2 = {
        pointFormat: '<b>{point.percentage:.1f} %</b>',
      }
      var plotOptions2 = {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color:
                (Highcharts.theme && Highcharts.theme.contrastTextColor) ||
                'black',
            },
          },
        },
      }
      var series2 = [
        {
          type: 'pie',
          name: '',
          data: [
            ['刮擦', eventsNum2[0]],
            ['碰撞', eventsNum2[1]],
            ['翻车', eventsNum2[2]],
            ['碾压', eventsNum2[3]],
            ['失火', eventsNum2[4]],
            ['其他', eventsNum2[5]],
          ],
        },
      ]

      var jsonPie = {}
      jsonPie.chart = chart2
      jsonPie.title = title2
      jsonPie.subtitle = subtitle2
      jsonPie.tooltip = tooltip2
      jsonPie.series = series2
      jsonPie.plotOptions = plotOptions2
      $('#pie').highcharts(jsonPie)
    }
  }
  $('#highCharts i.close').click(function () {
    $('#highCharts').hide(500)
  })
  // 生成热力图
  var heatMapSource = null
  var heatMapLayer = new ol.layer.Heatmap({
    //矢量数据源（读取本地的KML数据）
    source: heatMapSource,
    //热点半径
    radius: 15,
    //模糊尺寸
    blur: 15,
  })
  map.addLayer(heatMapLayer)
  $('#eventsTable .btn .heatMap').click(function () {
    if (heatMapSource == null) {
      heatMapSource = new ol.source.Vector({
        wrapX: false,
      })
      heatMapLayer.setSource(heatMapSource)
      // 查询获取所有事件点
      var queryStruct = new Zondy.Service.QueryFeatureStruct()
      queryStruct.IncludeGeometry = true
      var queryParam = new Zondy.Service.QueryParameter({
        resultFormat: 'json',
        struct: queryStruct,
        cursorType: null,
      })
      queryParam.pageIndex = 0
      queryParam.recordNumber = 100
      queryParam.where = '1>0'
      var queryService = new Zondy.Service.QueryDocFeature(
        queryParam,
        '光谷智慧交通',
        '3',
        {
          ip: 'localhost',
          port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
        }
      )
      queryService.query(queryAllEventsForHeatMap, queryError)
    } else if (heatMapSource != null) {
      heatMapSource = null
      heatMapLayer.setSource(heatMapSource)
    }
  })

  function queryAllEventsForHeatMap(result) {
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
    heatMapSource.addFeatures(features)
  }

  // 表格点击事件
  $('#eventsTable table').on('click', '.events', function () {
    var eventsNumber = this.children[0].innerHTML
    var eventsLabel = eventsLabelSource.getFeatures()
    // 颜色复原
    for (const i in eventsLabel) {
      var textColor = eventsLabel[i].style_.text_.fill_.color_
      if (textColor != '#333') {
        eventsLabel[i].style_.text_.fill_.color_ = '#333'
      }
    }
    // 突出显示
    for (const i in eventsLabel) {
      if (eventsLabel[i].style_.text_.text_ == eventsNumber) {
        eventsLabel[i].style_.text_.fill_.color_ = '#3da8d3'
        var eventsCenter = eventsLabel[i].getGeometry().getCoordinates()[0]
        map.getView().animate({
          zoom: 16,
          center: eventsCenter,
          duration: 500,
        })
      }
    }
  })
})
