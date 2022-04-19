//추천종목
$(function(){
    var rmdItemList2 = $('.left_item li').length;

    if(rmdItemList2 < 8){
        for(var i = 0; i < (8 - rmdItemList2); i++){
            $('.left_item').append("<li class='disabled'><a></a></li>");
        }
    }

    var rmdItemList = $('.left_item li').length;

    if (rmdItemList >= 7) {

        var slider2 = $('.left_item').bxSlider({
            mode: 'vertical',
            pager: false,
            infiniteLoop: false,
            minSlides: 8,
            maxSlides: 8,
            moveSlides: 1,
            hideControlOnEnd: true,
            touchEnabled: false,
            nextText: '<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>',
            prevText: '<span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>'
        });
        slider2.reloadSlider();
    }
})