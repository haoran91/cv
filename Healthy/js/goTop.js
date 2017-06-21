$(function () {
  var timer;
  var isTop = true;
  var clientHeight = $(window).height();

  $(window).scroll(function () {
    var osTop = $(document).scrollTop();
    var goTop = $('.rightBox .imgBox img').eq(1);

    if(osTop >= clientHeight){
      goTop.css({'display':'block'});
    }else{
      goTop.css({'display':'none'});
    }

    if(!isTop){
      clearInterval(timer);
    }
    isTop = false;
    console.log(isTop);
  });

  $('.btn5').on('click', function () {
    timer = setInterval(function () {
      var osTop = $(document).scrollTop();
      var ispeep = Math.floor(- osTop / 6);
      isTop = true;
      
      $(document).scrollTop(osTop + ispeep);
      if(osTop == 0){
        clearInterval(timer);
      }
    },30);
  });

})
