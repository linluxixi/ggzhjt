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
      crossOrigin: 'Anonymous',

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
      crossOrigin: 'Anonymous',
    }
  )
  // 实例化map对象,设置地图参数
  const map = new ol.Map({
    target: 'mapCon',
    layers: [
      TiandiMap_vec,
      TiandiMap_cva,
      TiandiMap_img,
      TiandiMap_cia,
      docLayer,
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

  // *******************************************下载图片*********************************
  document.getElementById('exportToPic').addEventListener('click', function () {
    map.once('postcompose', function (event) {
      var canvas = event.context.canvas
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), 'map.png')
      } else {
        canvas.toBlob(function (blob) {
          saveAs(blob, 'map.png')
        })
      }
    })
    map.renderSync()
    // rendercomplete
  })

  // ***********************************监控部分******************************************
  // 监控
  $('#monitor').click(function () {
    if (drawSource == null) {
      drawSource = new ol.source.Vector({
        wrapX: false,
      })
    }
    stopAddIcon()
    //实例化交互绘制类对象并添加到地图容器中
    draw = new ol.interaction.Draw({
      //绘制层数据源
      source: drawSource,
      type: 'Point',
    })
    map.addInteraction(draw)
    draw.on('drawend', function (e) {
      const point = e.feature.getGeometry().getCoordinates()
      queryByPoint(point[0], point[1])
      stopAddIcon
      map.getView().animate({
        zoom: 16,
        center: point,
        duration: 500,
      })
    })
  })

  //关闭监控窗口
  $('#turnoff-Monitoring').click(function () {
    $('#Monitor').css('display', 'none')
    eventsLabelSource = null
    eventsLabelLayer.setSource(eventsLabelSource)
    map.getView().animate({
      zoom: 13,
      center: [114.37, 30.49],
      duration: 500,
    })
  })

  function queryByPoint(x, y) {
    //创建一个用于查询的点形状
    pointObj = new Zondy.Object.Point2D(x, y)
    // turnoff - Monitoring //设置查询点的搜索半径
    pointObj.nearDis = 0.001
    //初始化查询结构对象，设置查询结构包含什么信息
    var queryStruct = new Zondy.Service.QueryFeatureStruct()
    //是否包含几何图形信息
    queryStruct.IncludeGeometry = true
    //是否包含属性信息
    queryStruct.IncludeAttribute = true
    //是否包含图形显示参数
    queryStruct.IncludeWebGraphic = true
    //指定查询规则
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
      geometry: pointObj,
      resultFormat: 'json',
      struct: queryStruct,
      rule: rule,
      //显示查询到的要素数量
      cursorType: null,
    })
    //设置查询分页号
    queryParam.pageIndex = 0
    //设置查询要素数目
    queryParam.recordNumber = 20
    //实例化地图文档查询服务对象
    var queryService = new Zondy.Service.QueryDocFeature(
      queryParam,
      '光谷智慧交通',
      2,
      {
        ip: 'localhost',
        port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
      }
    )
    //执行查询操作，querySuccess为查询回调函数
    queryService.query(queryMonitorSuccess, queryError)
  }
  //查询失败回调
  function queryError(e) {
    alert(e)
  }
  //查询成功回调
  function queryMonitorSuccess(result) {
    //初始化Zondy.Format.PolygonJSON类
    var format = new Zondy.Format.PolygonJSON()
    //将MapGIS要素JSON反序列化为ol.Feature类型数组
    var features = format.read(result)
    if (features.length > 0) {
      $('#Monitor').show(300)
      // 删除绘制的点
      const getSource = map.getLayers().array_[5].getSource()
      const leng = getSource.getFeatures().length
      const pointFeature = getSource.getFeatures()[leng - 1]
      drawSource.removeFeature(pointFeature)
      stopAddIcon()
      features[0].setStyle(
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
            text: features[0].values_.values_.位置,
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
      eventsLabelSource = null
      eventsLabelSource = new ol.source.Vector({
        wrapX: false,
      })
      eventsLabelLayer.setSource(eventsLabelSource)
      eventsLabelSource.addFeatures(features)
    }
  }

  // function stopQuery() {
  //   map.removeInteraction(draw)
  //   clear()
  // }

  // function clear() {
  //   highLightSource = null
  //   highLightLayer.setSource(highLightSource)
  //   highLightSource = new ol.source.Vector({
  //     wrapX: false
  //   })
  //   highLightLayer.setSource(highLightSource)
  // }
  // map.on('click', function (evt) {
  //   console.log(evt)
  //   //判断当前单击处是否有要素，捕获到要素时弹出popup
  //   var feature = map.forEachFeatureAtPixel(
  //     evt.pixel,
  //     function (feature, layer) {
  //       return feature
  //     }
  //   )
  //   if (feature) {
  //     //   //清空popup的内容容器
  //     //   content.innerHTML = ''
  //     //在popup中加载当前要素的具体信息
  //     //   setInfo()
  //     $('#Monitor').css('display', 'block')
  //   }
  // })

  //**********************************************目录树*********************************
  //map中的图层数组
  var layer = new Array()
  //图层名称数组
  var layerName = new Array()
  //图层可见属性数组
  var layerVisibility = new Array()
  /**
   * 加载图层列表数据
   * @param {ol.Map} map 地图对象
   * @param {string} id 图层列表容器ID
   */
  function loadLayersControl(map, id) {
    //图层目录容器
    var treeContent = document.getElementById(id)
    //获取地图中所有图层
    var layers = map.getLayers()
    console.log(111)

    for (var i = 0; i < layers.getLength() - 2; i++) {
      //获取每个图层的名称、是否可见属性
      layer[i] = layers.item(i)
      console.log(layer[i])
      console.log(typeof layer[i])
      if (layer[i].values_.title) {
        layerName[i] = layer[i].values_.title
      } else if (layer[i].layerName) {
        layerName[i] = layer[i].layerName
      } else {
        layerName[i] = layer[i].get('name')
      }
      layerVisibility[i] = layer[i].getVisible()
      //新增li元素，用来承载图层项
      var elementLi = document.createElement('li')
      // 添加子节点
      treeContent.appendChild(elementLi)
      //创建复选框元素
      var elementInput = document.createElement('input')
      elementInput.type = 'checkbox'
      elementInput.name = 'layers'
      elementLi.appendChild(elementInput)
      //创建label元素
      var elementLable = document.createElement('label')
      elementLable.className = 'layer'
      //设置图层名称
      setInnerText(elementLable, layerName[i])
      elementLi.appendChild(elementLable)
      //设置图层默认显示状态
      if (layerVisibility[i]) {
        elementInput.checked = true
      }
      //为checkbox添加变更事件
      addChangeEvent(elementInput, layer[i])
    }
  }
  /**
   * 为checkbox元素绑定变更事件
   * @param {input} element checkbox元素
   * @param {ol.layer.Layer} layer 图层对象
   */
  function addChangeEvent(element, layer) {
    element.onclick = function () {
      if (element.checked) {
        //显示图层
        layer.setVisible(true)
      } else {
        //不显示图层
        layer.setVisible(false)
      }
    }
  }
  /**
   * 动态设置元素文本内容（兼容）
   */
  function setInnerText(element, text) {
    if (typeof element.textContent == 'string') {
      element.textContent = text
    } else {
      element.innerText = text
    }
  }
  //加载图层列表数据
  loadLayersControl(map, 'layerTree')

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
    stopAddIcon()
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
    stopAddIcon()
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
  function closeEventsTable() {
    $('#eventsTable .eventsTable').hide(300)
    $('#eventsTable .eventsTable .updateEventsBtn').hide()
    $('#eventsTable table tr.title').siblings().remove() //清空表格元素
    $('#searchContent input').val()
    eventsLabelSource = null
    eventsLabelLayer.setSource(eventsLabelSource)
    map.getView().animate({
      zoom: 13,
      center: [114.37, 30.49],
      duration: 500,
    })
  }
  $('#eventsTable .tableBtn .close').click(function () {
    closeEventsTable()
  })

  // 展开/收起
  $('#eventsTable .tableBtn .iconfont').click(function () {
    $('#eventsTable .eventsTable').slideToggle(300)
  })

  // 生成统计图(柱状图/饼图)
  $('#eventsTable .tableBtn .statistics').click(function () {
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
  $('#eventsTable .tableBtn .heatMap').click(function () {
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

  // ************************************<-事件--搜索查询->*************************************

  var RegExp = [/刮/g, /擦/g, /碰/g, /撞/g, /翻/g, /碾/g, /压/g, /火/g]
  // 定义搜索事件函数
  function searchEvents(a) {
    // 关键字为空
    if (a == '') {
      alert('请输入搜索关键字')
    } else {
      // 分别匹配关键词
      var keyIndex = 100
      for (const i in RegExp) {
        if (RegExp[i].test(a)) {
          keyIndex = i
          break
        }
      }
      // 匹配刮擦事件
      if (keyIndex == 0 || keyIndex == 1) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='刮擦'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
      // 匹配碰撞事件
      else if (keyIndex == 2 || keyIndex == 3) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='碰撞'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
      // 匹配翻车事件
      else if (keyIndex == 4) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='翻车'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
      // 匹配碾压事件
      else if (keyIndex == 5 || keyIndex == 6) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='碾压'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
      // 匹配失火事件
      else if (keyIndex == 7) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='失火'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
      // 匹配其他事件
      else {
        alert('未找到匹配的事件\n为您找到其他类型事件')
        var queryStruct = new Zondy.Service.QueryFeatureStruct()
        queryStruct.IncludeGeometry = true
        var queryParam = new Zondy.Service.QueryParameter({
          resultFormat: 'json',
          struct: queryStruct,
          cursorType: null,
        })
        queryParam.pageIndex = 0
        queryParam.recordNumber = 100
        queryParam.where = "事件类型='其他'"
        var queryService = new Zondy.Service.QueryDocFeature(
          queryParam,
          '光谷智慧交通',
          '3',
          {
            ip: 'localhost',
            port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
          }
        )
        queryService.query(searchEventsSuccess, queryError)
      }
    }
  }
  // 搜索查询成功
  function searchEventsSuccess(result) {
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
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
  // 输入框回车事件
  $('#searchContent input').keyup(function (e) {
    if (e.keyCode == 13) {
      keyWord = $('#searchContent input').val()
      console.log(keyWord)
      searchEvents(keyWord)
    }
  })
  // 搜索键点击事件
  $('#searchBtn').click(function () {
    keyWord = $('#searchContent input').val()
    console.log(keyWord)
    searchEvents(keyWord)
  })

  // ***********************************事件--更新****************************************

  // 点击"更新" 交互式框选
  $('#updateEvents').click(function () {
    stopAddIcon()
    closeEventsTable()
    draw = new ol.interaction.Draw({
      source: drawSource,
      type: 'Point',
      // geometryFunction: geometryFunction,
      // maxPoints: 2,
    })
    map.addInteraction(draw)
    draw.on('drawend', function (e) {
      var coord = e.feature.getGeometry().getCoordinates()
      map.getView().animate({
        zoom: 16,
        center: coord,
        duration: 500,
      })

      // 点查询
      // 点形状
      pointObj = new Zondy.Object.Point2D(coord[0], coord[1])
      pointObj.nearDis = 0.001
      //初始化查询结构对象，设置查询结构包含几何信息
      var queryStruct = new Zondy.Service.QueryFeatureStruct()
      queryStruct.IncludeGeometry = true
      queryStruct.IncludeAttribute = true
      queryStruct.IncludeWebGraphic = false
      // 定义查询规则
      var rule = new Zondy.Service.QueryFeatureRule({
        EnableDisplayCondition: false,
        MustInside: false,
        CompareRectOnly: false,
        Intersect: true,
      })
      //实例化查询参数对象
      var queryParam = new Zondy.Service.QueryParameter({
        geometry: pointObj,
        resultFormat: 'json',
        struct: queryStruct, // 查询结构
        rule: rule, // 查询规则
        cursorType: null,
      })
      //设置查询分页号
      queryParam.pageIndex = 0
      //设置查询要素数目
      queryParam.recordNumber = 1
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
      queryService.query(updateEventsSuccess, queryError)
    })
  })
  var eventsID = 0 //事件FID
  var eventsAttValue = [] //事件属性值
  var eventsCenter //事件点坐标
  // 查询成功回调函数
  function updateEventsSuccess(result) {
    var format = new Zondy.Format.PolygonJSON()
    var features = format.read(result)
    // 赋值
    eventsID = result.SFEleArray[0].FID
    eventsAttValue = result.SFEleArray[0].AttValue
    eventsCenter = features[0].getGeometry().getCoordinates()
    // 删除绘制的点
    const getSource = map.getLayers().array_[5].getSource()
    const leng = getSource.getFeatures().length
    const circleFeature = getSource.getFeatures()[leng - 1]
    drawSource.removeFeature(circleFeature)
    stopAddIcon()
    var value = features[0].values_.values_
    $('#eventsTable table tr.title').after(`<tr class="events">
      <td class="key">${value.事件编号}</td>
      <td>${value.事件类型}</td>
      <td>${eventsLevel(value.事件等级)}</td>
      <td>${value.发生时间}</td>
      <td>${value.发生地点}</td>
      <td>${value.车牌号}</td>
      <td>${value.驾驶员}</td>
      <td class="eventsStatus"><p title="点击修改状态">${eventsStatus(
        value.处理状态
      )}</p></td>
      </tr>`)
    features[0].setStyle(
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
          text: value.事件编号 + ' ' + eventsStatus(value.处理状态),
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
    $('#eventsTable .eventsTable .updateEventsBtn').show()
    $('#eventsTable .eventsTable').show(300)
    eventsLabelSource = null
    eventsLabelSource = new ol.source.Vector({
      wrapX: false,
    })
    eventsLabelLayer.setSource(eventsLabelSource)
    eventsLabelSource.addFeatures(features)
  }
  // 修改处理状态
  var formerStatus, presentStatus
  $('#eventsTable .eventsTable').on('click', 'td.eventsStatus p', function () {
    // 获取td元素当前值
    var td = $(this)
    formerStatus = td.text()
    // 清空当前盒子,替换为选择框
    td.empty()
    td.after(`<select name="eventsStatus" id="eventsStatus">
    <option value="" selected>请选择</option>
    <option value="待处理">待处理</option>
    <option value="处理中">处理中</option>
    <option value="已归档">已归档</option>
  </select>`)
    // select失焦事件
    $('#eventsTable .eventsTable').on(
      'blur',
      'select#eventsStatus',
      function () {
        // 获取选择的值
        presentStatus = $(this).val()
      }
    )
    // 阻止冒泡
    return false
  })
  // 确认更新
  var eventsColor = 0
  $('#eventsTable .eventsTable button.ensure').click(function () {
    if (presentStatus == '' || presentStatus == formerStatus) {
      alert('事件处理状态未改变')
    } else {
      // 修改样式
      // 几何信息
      var gpoint = new Zondy.Object.GPoint(
        eventsCenter[0][0],
        eventsCenter[0][1]
      )
      var fGeom = new Zondy.Object.FeatureGeometry({
        PntGeom: [gpoint],
      })
      if (presentStatus == '待处理') {
        // 属性信息
        var attValue = [
          eventsAttValue[0],
          eventsAttValue[1],
          eventsAttValue[2],
          eventsAttValue[3],
          eventsAttValue[4],
          eventsAttValue[5],
          eventsAttValue[6],
          0,
        ]
        eventsColor = 6
      } else if (presentStatus == '处理中') {
        // 属性信息
        var attValue = [
          eventsAttValue[0],
          eventsAttValue[1],
          eventsAttValue[2],
          eventsAttValue[3],
          eventsAttValue[4],
          eventsAttValue[5],
          eventsAttValue[6],
          1,
        ]
        eventsColor = 4
      } else if (presentStatus == '已归档') {
        // 属性信息
        var attValue = [
          eventsAttValue[0],
          eventsAttValue[1],
          eventsAttValue[2],
          eventsAttValue[3],
          eventsAttValue[4],
          eventsAttValue[5],
          eventsAttValue[6],
          2,
        ]
        eventsColor = 90
      }
      // 图形符号参数
      var pointInfo = new Zondy.Object.CPointInfo({
        Angle: 0,
        Color: eventsColor,
        SymID: 21, // mapgis中的符号代码
        SymHeight: 5,
        SymWidth: 5,
      })
      var webGraphicInfo = new Zondy.Object.WebGraphicsInfo({
        InfoType: 1,
        PntInfo: pointInfo,
      })
      // 创建一个要素
      var newFeature = new Zondy.Object.Feature({
        fGeom: fGeom, // 几何信息
        GraphicInfo: webGraphicInfo, // 图形参数
        AttValue: attValue, //属性信息
      })
      // 设置要素为点要素   1:点  2:线  3:区  0:未定义
      newFeature.setFType(1)
      // 设置FID
      newFeature.setFID(eventsID)
      // 创建一个要素数据集
      var featureSet = new Zondy.Object.FeatureSet()
      featureSet.clear()
      // 设置属性结构
      var cAttStruct = new Zondy.Object.CAttStruct({
        FldName: [
          '事件编号',
          '事件类型',
          '事件等级',
          '发生时间',
          '发生地点',
          '车牌号',
          '驾驶员',
          '处理状态',
        ],
        FldNumber: 8,
        FldType: [
          'string',
          'string',
          'short',
          'string',
          'string',
          'string',
          'string',
          'short',
        ],
      })
      featureSet.AttStruct = cAttStruct
      // 添加要素到要素数据集
      featureSet.addFeature(newFeature)
      // 创建一个编辑服务类
      var editService = new Zondy.Service.EditDocFeature('光谷智慧交通', 3, {
        ip: 'localhost',
        port: '6163', //访问IGServer的端口号，.net版为6163，Java版为8089
      })
      // 执行更新点要素集功能
      editService.update(featureSet, onSuccess)
    }
  })

  function onSuccess() {
    docLayer.refresh()
    console.log('更新成功')
  }

  // 取消点击事件
  $('#eventsTable .eventsTable button.cancel').click(function () {
    closeEventsTable()
  })

  // *******************************测量****************************************
  // 8.测量及导出
  // 创建全局变量draw绘制对象
  var measureDraw
  // 创建空的数据源
  var measureSource = new ol.source.Vector({
    wrapX: false,
  })
  // 创建空的矢量图层
  var measureVector = new ol.layer.Vector({
    source: measureSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  })
  // 添加矢量图层到地图容器中
  map.addLayer(measureVector)
  // 定义绘制类型对象---获取下拉菜单dom对象
  // var typeSelect = document.getElementById('measuretype')
  var typeSelect = 'none'
  // 当前绘制的要素
  var measureFeature
  // 测量工具提示框对象
  var measureTooltipElement
  // 测量工具中显示的测量值
  var measureTooltip
  var listener
  //创建一个WGS84球体对象
  var wgs84Sphere = new ol.Sphere(6378137)

  // 长度测量
  function setLength() {
    typeSelect = 'LineString'
    map.removeControl(mousePositionControl)
    map.removeInteraction(measureDraw)
    addInteraction()
    createMeasureTooltip()
  }
  // 面积测量
  function setArea() {
    typeSelect = 'Polygon'
    map.removeControl(mousePositionControl)
    map.removeInteraction(measureDraw)
    addInteraction()
    createMeasureTooltip()
  }
  // 取消测量
  function cancelMeasure() {
    typeSelect = 'none'
    measureSource = new ol.source.Vector({
      wrapX: false,
    })
    //添加绘制层数据源
    measureVector.setSource(measureSource)
    map.removeInteraction(measureDraw)
    map.removeOverlay(measureTooltip)
    $('.tooltip-static').remove()
    map.addControl(mousePositionControl)
  }

  function addInteraction() {
    // 获取当前选择的绘制类型
    var measuretype = typeSelect
    // 实例化交互绘制类对象并添加到地图容器中
    measureDraw = new ol.interaction.Draw({
      // 绘制层数据源
      source: measureSource,
      // 几何图形类型
      type: measuretype,
      // 绘制几何图形的样式
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      }),
    })
    map.addInteraction(measureDraw)
    //绑定交互绘制工具开始绘制的事件

    measureDraw.on(
      'drawstart',
      function (e) {
        measureFeature = e.feature //绘制的要素
        var tooltipCoord = e.coordinate // 绘制的坐标
        //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
        listener = measureFeature.getGeometry().on('change', function (e) {
          var geom = e.target //绘制几何要素
          var output
          // obj instanceof class类的实例
          if (geom instanceof ol.geom.Polygon) {
            // 输出多边形的面积
            output = formatArea(geom)
            // 获取多变形内部点的坐标(不理解getInteriorPoint())
            tooltipCoord = geom.getInteriorPoint().getCoordinates()
          } else if (geom instanceof ol.geom.LineString) {
            // 输出多线段的长度
            output = formatLength(geom)
            // 获取多线段的最后一个点的坐标
            tooltipCoord = geom.getLastCoordinate()
          }
          //将测量值设置到测量工具提示框中显示
          measureTooltipElement.innerHTML = output
          //设置测量工具提示框的显示位置
          measureTooltip.setPosition(tooltipCoord)
        })
      },
      this
    )
    measureDraw.on(
      'drawend',
      function (e) {
        //设置测量提示框的样式
        measureTooltipElement.className = 'tooltip tooltip-static'
        //Offset偏移量[左右,上下]
        measureTooltip.setOffset([-7, -7])
        //置空当前绘制的要素对象
        measureFeature = null
        //置空测量工具提示框对象
        measureTooltipElement = null
        //重新创建一个测试工具提示框显示结果
        createMeasureTooltip()
        // ol.Observable提供了从事件目标注册和移除监听器的功能
        // unByKey(key)，移除对应 key 的监听器，key 一般是由 on() 或者 once() 返回的。
        ol.Observable.unByKey(listener)
      },
      this
    )
  }
  // 创建一个新的测量工具提示框（tooltip）
  function createMeasureTooltip() {
    //创建测量提示框的div
    measureTooltipElement = document.createElement('div')
    measureTooltipElement.setAttribute('id', 'lengthLabel')
    //设置测量提示要素的样式
    measureTooltipElement.className = 'tooltip tooltip-measure'
    //创建一个测量提示的覆盖标注
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    })
    //将测量提示的覆盖标注添加到地图中
    map.addOverlay(measureTooltip)
  }

  // 测量长度输出
  var formatLength = function (line) {
    var sphere = new ol.Sphere()
    var sourceProj = map.getView().getProjection()
    var length = sphere.getLength(line, {
      projection: sourceProj,
      radius: 6371008.8,
    })
    // length = Math.round(line.getLength() * 100) / 100 //直接得到线的长度
    var output
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km' //换算成KM单位
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm' //m为单位
    }
    // console.log(output)
    return output //返回线的长度
  }
  // 测量面积输出
  var formatArea = function (polygon) {
    var area
    var sphere = new ol.Sphere()
    var sourceProj = map.getView().getProjection() //地图数据源投影坐标系
    var geom = polygon.clone().transform(sourceProj, 'EPSG:4326') //将多边形要素坐标系投影为EPSG:4326
    area = Math.abs(
      sphere.getArea(geom, {
        projection: sourceProj,
        radius: 6378137,
      })
    ) //获取面积
    var output
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>' //换算成KM单位
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>' //m为单位
    }
    return output //返回多边形的面积
    // console.log(output)
  }
})
