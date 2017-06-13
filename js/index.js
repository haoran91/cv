$(function () {
  var $imgA = $('#banner_con a');//图片集合
  var imgCount = $('#banner_con a').length;//图片数量
  var conIdx = 0;//默认索引
  var locked = false;//状态锁
  var $btns = $('#banner_bar span');//指示点集合
console.log($btns);
  $imgA.eq(0).show();//第一张图片显示

  //前后图片点击事件
  $('#bar_r').click(function () {
    play((conIdx + 1) % imgCount);
  })
  $('#bar_l').click(function () {
    play((imgCount + conIdx - 1) % imgCount);
  })
  //指示点点击事件
  $btns.on('click', function () {
    var myIndex = parseInt($(this).attr('index'));
    play(myIndex);
  })
  //图片切换函数
  function play(idx) {
    //判断是否正在执行动画
    if(locked == true){
      return;
    }
    locked = true;
    //图片淡入淡出
    $imgA.eq(conIdx).fadeOut(400);
    $imgA.eq(idx).fadeIn(400, function () {
      locked = false;
    })

    conIdx = idx;//更新索引
    setButton();
  }
  //指示点样式切换函数
  function setButton() {
    $btns.removeClass().eq(conIdx).addClass('on');
  }
  //自动播放
  function autoPlay() {
    auto = setInterval(function () {
      // play((conIdx + 1) % imgLength);
      $('#bar_r').trigger('click');
    }, 2000);
  }
  //滑入停止自动播放，滑出开始自动播放
  $('#banner_box').hover(function () {
    clearInterval(auto);
  },function () {
    auto = setInterval(function () {
      // play((conIdx + 1) % imgLength);
      $('#bar_r').trigger('click');
    }, 2000);
  })
  //调用自动播放
  autoPlay();
})
