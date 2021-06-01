$(function () {
  //用户名赋值
  var user_name = sessionStorage.getItem('user_name')
  $('#userName').html(user_name)

  //*******************************************************加载图层

  var TiandiMap_vec = new ol.layer.Tile({
    title: '天地图矢量图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=' +
        'fd2a4c80b1be8c21d182649c0889a963',
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  var TiandiMap_cva = new ol.layer.Tile({
    title: '天地图矢量注记图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=' +
        'fd2a4c80b1be8c21d182649c0889a963',
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  var TiandiMap_img = new ol.layer.Tile({
    name: '天地图影像图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' +
        'fd2a4c80b1be8c21d182649c0889a963',
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  var TiandiMap_cia = new ol.layer.Tile({
    name: '天地图影像注记图层',
    source: new ol.source.XYZ({
      url:
        'http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' +
        'fd2a4c80b1be8c21d182649c0889a963',
      crossOrigin: 'Anonymous',
      wrapX: false,
    }),
  })
  const docLayer = new Zondy.Map.Doc(
    '', //参数1: opt_name,名称,可为空
    '光谷智慧交通', //参数2: opt_hdfName,IGServer发布的瓦片地图实际名称
    {
      ip: 'localhost',
      port: '6163',
      crossOrigin: 'Anonymous',
    }
  )
  const map = new ol.Map({
    layers: [
      TiandiMap_vec,
      TiandiMap_cva,
      TiandiMap_img,
      TiandiMap_cia,
      docLayer,
    ],
    target: 'mapCon',
    view: new ol.View({
      projection: 'EPSG:4326',
      center: [114.37, 30.49],
      maxZoom: 18,
      minZoom: 2,
      zoom: 13,
    }),
  })

  // **********************************************************************下载图片*************************************

  document.getElementById('exportPic').addEventListener('click', function () {
    map.once('rendercomplete', function (event) {
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
  })

  //*********************目录树*********************************
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

    for (var i = 0; i < layers.getLength(); i++) {
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

  // *********************************************测量功能  *****************************************

  $('#measureTool .close').click(function () {
    $('#measureTool').hide(300)
    stopAddIcon()
  })

  //加载测量的绘制矢量层
  var mea_source = new ol.source.Vector() //图层数据源
  var mea_vector = new ol.layer.Vector({
    source: mea_source,
    style: new ol.style.Style({
      //图层样式
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)', //填充颜色
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33', //边框颜色
        width: 2, // 边框宽度
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  })
  map.addLayer(mea_vector)
  // var wgs84Sphere = new ol.sphere(6378137); //定义一个球对象
  /**
   * 当前绘制的要素（Currently drawn feature.）
   * @type {ol.Feature}
   */
  var sketch
  /**
   * 帮助提示框对象（The help tooltip element.）
   * @type {Element}
   */
  var helpTooltipElement
  /**
   *帮助提示框显示的信息（Overlay to show the help messages.）
   * @type {ol.Overlay}
   */
  var helpTooltip
  /**
   * 测量工具提示框对象（The measure tooltip element. ）
   * @type {Element}
   */
  var measureTooltipElement
  /**
   *测量工具中显示的测量值（Overlay to show the measurement.）
   * @type {ol.Overlay}
   */
  var measureTooltip
  /**
   *  当用户正在绘制多边形时的提示信息文本
   * @type {string}
   */
  var continuePolygonMsg = 'Click to continue drawing the polygon'
  /**
   * 当用户正在绘制线时的提示信息文本
   * @type {string}
   */
  var continueLineMsg = 'Click to continue drawing the line'
  /**
   * 鼠标移动事件处理函数
   * @param {ol.MapBrowserEvent} evt
   */
  var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
      return
    }
    /** @type {string} */
    var helpMsg = 'Click to start drawing' //当前默认提示信息
    //判断绘制几何类型设置相应的帮助提示信息
    if (sketch) {
      var geom = sketch.getGeometry()
      if (geom instanceof ol.geom.Polygon) {
        helpMsg = continuePolygonMsg //绘制多边形时提示相应内容
      } else if (geom instanceof ol.geom.LineString) {
        helpMsg = continueLineMsg //绘制线时提示相应内容
      }
    }
    //  helpTooltipElement.innerHTML = helpMsg; //将提示信息设置到对话框中显示
    //  helpTooltip.setPosition(evt.coordinate);//设置帮助提示框的位置
    //  $(helpTooltipElement).removeClass('hidden');//移除帮助提示框的隐藏样式进行显示
  }
  map.on('pointermove', pointerMoveHandler) //地图容器绑定鼠标移动事件，动态显示帮助提示框内容
  //地图绑定鼠标移出事件，鼠标移出时为帮助提示框设置隐藏样式
  $(map.getViewport()).on('mouseout', function () {
    $(helpTooltipElement).addClass('hidden')
  })

  var geodesicCheckbox = document.getElementById('geodesic') //测地学方式对象
  var typeSelect = document.getElementById('type') //测量类型对象
  var draw // global so we can remove it later
  /**
   * 加载交互绘制控件函数
   */
  function addInteraction(value) {
    var type = value == 'area' ? 'Polygon' : 'LineString'
    draw = new ol.interaction.Draw({
      source: mea_source, //测量绘制层数据源
      type: /** @type {ol.geom.GeometryType} */ (type), //几何图形类型
      style: new ol.style.Style({
        //绘制几何图形的样式
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
    map.addInteraction(draw)

    createMeasureTooltip() //创建测量工具提示框
    createHelpTooltip() //创建帮助提示框

    var listener
    //绑定交互绘制工具开始绘制的事件
    draw.on(
      'drawstart',
      function (evt) {
        // set sketch
        sketch = evt.feature //绘制的要素

        /** @type {ol.Coordinate|undefined} */
        var tooltipCoord = evt.coordinate // 绘制的坐标
        //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
        listener = sketch.getGeometry().on('change', function (evt) {
          var geom = evt.target //绘制几何要素
          var output
          if (geom instanceof ol.geom.Polygon) {
            output = formatArea(/** @type {ol.geom.Polygon} */ (geom)) //面积值
            tooltipCoord = geom.getInteriorPoint().getCoordinates() //坐标
          } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(/** @type {ol.geom.LineString} */ (geom)) //长度值
            tooltipCoord = geom.getLastCoordinate() //坐标
          }
          measureTooltipElement.innerHTML = output //将测量值设置到测量工具提示框中显示
          measureTooltip.setPosition(tooltipCoord) //设置测量工具提示框的显示位置
        })
      },
      this
    )
    //绑定交互绘制工具结束绘制的事件
    draw.on(
      'drawend',
      function (evt) {
        measureTooltipElement.className = 'tooltip tooltip-static' //设置测量提示框的样式
        measureTooltip.setOffset([0, -7])
        // unset sketch
        sketch = null //置空当前绘制的要素对象
        // unset tooltip so that a new one can be created
        measureTooltipElement = null //置空测量工具提示框对象
        createMeasureTooltip() //重新创建一个测试工具提示框显示结果
        ol.Observable.unByKey(listener)
      },
      this
    )
  }

  /**
   *创建一个新的帮助提示框（tooltip）
   */
  function createHelpTooltip() {
    if (helpTooltipElement) {
      helpTooltipElement.parentNode.removeChild(helpTooltipElement)
    }
    helpTooltipElement = document.createElement('div')
    helpTooltipElement.className = 'tooltip hidden'
    helpTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left',
    })
    map.addOverlay(helpTooltip)
  }
  /**
   *创建一个新的测量工具提示框（tooltip）
   */
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement)
    }
    measureTooltipElement = document.createElement('div')
    measureTooltipElement.className = 'tooltip tooltip-measure'
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    })
    map.addOverlay(measureTooltip)
  }

  /**
   * 让用户切换选择测量类型（长度/面积）
   * @param {Event} e Change event.
   */
  document.getElementById('length').onclick = function () {
    var line = 'line'
    map.removeInteraction(draw) //移除绘制图形
    addInteraction(line) //添加绘图进行测量
  }
  document.getElementById('area').onclick = function () {
    var area = 'area'
    map.removeInteraction(draw) //移除绘制图形
    addInteraction(area) //添加绘图进行测量
  }
  document.getElementById('mea_quit').onclick = function () {
    map.removeInteraction(draw) //移除绘制图形
    clear_celiang()
  }
  //清除函数
  function clear_celiang() {
    mea_source = null
    mea_vector.setSource(mea_source)

    mea_source = new ol.source.Vector({
      wrapX: false,
    })
    mea_vector.setSource(mea_source)
  }

  // typeSelect.onchange = function (e) {
  //     map.removeInteraction(draw); //移除绘制图形
  //     addInteraction();//添加绘图进行测量
  // };

  /**
   * 测量长度输出
   * @param {ol.geom.LineString} line
   * @return {string}
   */
  var formatLength = function (line) {
    var length
    var sphere = new ol.Sphere()
    if (geodesicCheckbox.checked) {
      //若使用测地学方法测量
      var sourceProj = map.getView().getProjection() //地图数据源投影坐标系
      length = sphere.getLength(line, {
        projection: sourceProj,
        radius: 6378137,
      })
    } else {
      length = Math.round(line.getLength() * 100) / 100 //直接得到线的长度
    }
    var output
    if (length > 100) {
      output = Math.round((length / 1000) * 100) + ' ' + 'km' //换算成KM单位
    } else {
      output = Math.round(length * 100) + ' ' + 'km' //m为单位
    }
    return output //返回线的长度
  }
  /**
   * 测量面积输出
   * @param {ol.geom.Polygon} polygon
   * @return {string}
   */
  var formatArea = function (polygon) {
    var area
    var sphere = new ol.Sphere()
    if (geodesicCheckbox.checked) {
      //若使用测地学方法测量
      var sourceProj = map.getView().getProjection() //地图数据源投影坐标系
      var geom = /** @type {ol.geom.Polygon} */ (
        polygon.clone().transform(sourceProj, 'EPSG:4326')
      ) //将多边形要素坐标系投影为EPSG:4326
      area = Math.abs(
        sphere.getArea(geom, {
          projection: sourceProj,
          radius: 6378137,
        })
      ) //获取面积
    } else {
      area = polygon.getArea() //直接获取多边形的面积
    }
    var output
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) + ' ' + 'km<sup>2</sup>' //换算成KM单位
    } else {
      output = Math.round(area * 100) + ' ' + 'km<sup>2</sup>' //m为单位
    }
    return output //返回多边形的面积
  }

  //addInteraction(); //调用加载绘制交互控件方法，添加绘图进行测量

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

  // ********************************************默认隐藏影像图*******************************************************
  TiandiMap_img.setVisible(false)
  TiandiMap_cia.setVisible(false)
  // 地图切换点击事件
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

  // *************地图控件*****************
  // 放大缩小
  // const zoomSliderControl = new ol.control.ZoomSlider()
  // map.addControl(zoomSliderControl)
  // 视图跳转控件
  const zoomToExtentControl = new ol.control.ZoomToExtent({
    extent: [114.2953, 30.4446, 114.4555, 30.552], // 显示范围两对角坐标
  })
  map.addControl(zoomToExtentControl)
  // 鼠标实时位置
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
    var X = pos.x.toFixed(2)
    var Y = pos.y.toFixed(2)
    if (X > 0) {
      X = '经度: ' + X + '°E'
    } else if (X < 0) {
      X = '经度: ' + X * -1 + '°W'
    }
    if (Y > 0) {
      Y = '纬度: ' + Y + '°N'
    } else if (Y < 0) {
      Y = '纬度: ' + Y + '°S'
    }
    $('#lon').text(X)
    $('#lat').text(Y)
  })
  // 比例尺
  var scaleLineControl = new ol.control.ScaleLine({
    units: 'metric', // 单位
  })
  map.addControl(scaleLineControl)

  //

  // *****************日期时间***************
  // 实时更新
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
  // ************************************<-显示实时路况->*************************************
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
      if (flow <= 1000) {
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
      } else if (flow < 1500 && flow > 1000) {
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
      } else if (flow >= 1500) {
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

  // ************************************<-事件--搜索查询->*************************************
  // 创建事件标注层
  var eventsLabelSource = new ol.source.Vector({
    wrapX: false,
  })
  var eventsLabelLayer = new ol.layer.Vector({
    source: eventsLabelSource,
  })
  map.addLayer(eventsLabelLayer)

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
})

// *************事件上报框*********************
// $('#events').click(function () {
//   $('.box').show(200, function () {})
// })
// function msgbox(n) {
//   document.getElementById('inputbox').style.display = n
//     ? 'block'
//     : 'none'
// }
