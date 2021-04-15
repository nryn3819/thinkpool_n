//어드바이저

$(function(){
    $('.p_num_submit').on('click', function(){
        $('.a_num_input').show();
    });
    //인증번호
    

    $('.pNumCheck').on('click', function(){
        var thisBtn = $(this),
            thisModal = '#' + $(this).parents('.modal').attr('id');

        $(thisModal).modal('hide');
        $(thisModal).on('hidden.bs.modal', function(e){
            var nextModal = $(thisBtn).attr('data-target');
            $(nextModal).modal({
                show : true,
                keyboard: false,
                backdrop: 'static'
            });
            $(this).off('hidden.bs.modal');
        });
    });
    // 팝업내 팝업




});