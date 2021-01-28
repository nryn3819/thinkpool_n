////////////////////////////////
//////////페이지사용js//////////
////////////////////////////////

$(function () {

    //상단배너 가리기
    $('.top_close').on('click', function () {
        $('.top_w').slideUp();
    });


    //전체메뉴보기
    $('.allmenu').on('click', function () {
        $('#allmenu').modal('toggle');
    });

    //우측메뉴 높이값
    let sideTop = $('#content').offset();
    let headerH = $('#header_w').height();

    $('#c_side').css({
        top: sideTop.top - headerH  + 'px'
    });

    //우측메뉴 종목리스트 오버
    $("[data-toggle='popover']").popover({
        trigger: 'manual',
        html: true,
        placement: 'left'
    }).on('mouseenter', function () {
        var _this = this;

        $(this).popover('show');
        $('.popover').on('mouseleave', function () {
            $(_this).popover('hide');
        });
    }).on('mouseleave', function () {
        var _this = this;

        setTimeout(function () {
            if (!$('.popover:hover').length) {
                $(_this).popover('hide');
            }
        });
    });

    //우측메뉴 종목리스트 슬라이드
    var s_menuLenth = $('.s_m01 li').length;

    if (s_menuLenth > 8) {
        $('.s_menu_control').removeClass('disabled')

        var slider = $('.s_m01 .s_list').bxSlider({
            mode: 'vertical',
            control: false,
            pager: false,
            infiniteLoop: false,
            minSlides: 8,
            maxSlides: 8,
            moveSlides: 1,
            nextText: '',
            prevText: '',
            hideControlOnEnd: true
        });

        $('.s_menu_control .next').on('click', function(){
            slider.goToNextSlide();
            return false;
        });
        $('.s_menu_control .prev').on('click', function () {
            slider.goToPrevSlide();
            return false;
        });
    }

    //우측메뉴 탭스크립트
    $('#myTab a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    })

    //종목홈 top 관심종목 on/off
    $('.ins').on('click', function(){
        $(this).toggleClass('act');
    });

    //게시판 blind 링크 삭제
    let tblBlind = $('.board_tbl table tbody tr.blind td a');
    tblBlind.removeAttr("href");
    $('.board .latest_list li.active a').removeAttr('href');

    //게시판 검색 안내버튼
    $('.board_sch').find('.guide').on('click', function(){
        $('.layer_guide').fadeIn();

        $('button.close span').on('click', function () {
            $('.layer_guide').fadeOut();
        });
    });


    //게시판 댓글
    $('.recmmt').on('click', function(){
        $(this).parents('.cmmtBox').find('.re_cmmt_input').toggle();
    });

    //공유하기
    $('.btn-share').on('click', function(){
        $('.share_pop').fadeIn();
        $('.share_pop').find('.ly_close').children('button').on('click', function(){
            $('.share_pop').fadeOut();
        });
    });

    //운영배심원
    $('.btn-operjr').on('click', function () {
        $('.operjr_guide').fadeIn();
        $('.operjr_guide').find('.ly_close').children('button').on('click', function () {
            $('.operjr_guide').fadeOut();
        });
    });

    let opjrbtn = $('.operationjuror ul li a');

    $(opjrbtn).on('click', function(){
        $(this).toggleClass('active');
    });


    //글쓰기 파일업로드

    var fileTarget = $('.filebox .upload-hidden');

    fileTarget.on('change', function () {
        if (window.FileReader) {
            var filename = $(this)[0].files[0].name;
        } else {
            var filename = $(this).val().split('/').pop().split('\\').pop();
        }

        $(this).siblings('.upload-name').val(filename);
    });


    

});