//module

$(function(){

    $('.modulebox .left').each(function (index, item){
        var moduleLeftHeight = $(item).next('.right').height();

        $(item).height(moduleLeftHeight + 'px');
    })

    $('.mod .left').each(function (index, item){
        var moduleLeftHeight = $(item).next('.right').height();

        $(item).height(moduleLeftHeight + 'px');
    })
    
})