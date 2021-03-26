// 나의 AI매매신호 

const allCheck = $('#allcheck');
const varCheck = $('input.tblCheckItem');

$(allCheck).on('click', function(){
    if($(allCheck).prop('checked')){
        $('input.tblCheckItem').prop('checked', true);
    }else{
        $('input.tblCheckItem').prop('checked', false);
    }
});

$(varCheck).on('click', function(){
    if($(varCheck).prop('checked') == false){
        $(allCheck).prop('checked', false);
    }
});