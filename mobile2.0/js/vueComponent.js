new Vue({
    el: '#app',
    data: {
        'itemName' : 'kospi',
        'itemPrice' : '2,500',
        'itemPercent' : '30'
    },
    methods : {
        onClickRedirect: function () {
            window.open("https://google.com", "_blank");
        }
    },
    components: {
        //헤더
        'real-header' : {//header
            props: [],
            template: `
            <header id="header" class="clearfix"> 
                <slot name="top"></slot>
                <slot name="allnav"></slot>
            </header>
            `
        },
        'header-top': { //top
            props : [],
            template : `
                <div id="top" class="float-start">
                    <slot name="logo"></slot>
                    <slot name="topsch"></slot>
                    <slot name="sidemenu"></slot>
                </div>
            `
        },
        'header-logo': { //logo
            props: [],
            template : `
                <div class="logo">
                    <h3 class="visually-hidden">로고</h3>
                    <a href="main.html" class="float-start"><img src="./img/logo.png" alt="씽크풀로고" class="img-fluid"></a>
                </div>
                `
        },
        'header-topsch': { //상단검색
            props: [],
            template : `
            <div class="topSch">
                <h3 class="visually-hidden">종목검색영역</h3>
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="종목을 입력해 주세요." aria-label="종목을 입력해 주세요." aria-describedby="button-addon">
                    <button class="btn-img schButton" type="button" id="button-addon">검색하기</button>
                </div>
            </div>
            `
        },
        'sidemenu' : { // 사이드메뉴
            props: [],
            template : `
            <div id="sideMenu">
                <h3 class="visually-hidden">사이드메뉴열기</h3>
                <button type="button" data-bs-toggle="offcanvas" data-bs-target="#sideContent" aria-controls="사이드메뉴" class="btn-img sideMenuBtn">사이드메뉴</button>

                <slot name="sidecontent"></slot>
            </div>
            <!-- //sideMenu -->
            `
        },
        'sidecontent' : { // 사이드 컨텐츠
            props : [],
            template : `
            <aside id="sideContent" class="offcanvas offcanvas-end" tabindex="-1" aria-labelledby="사이드컨텐츠">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                  </div>
                  <div class="offcanvas-body">
                    <div>
                      Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
                    </div>
                    <div class="dropdown mt-3">
                      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
                        Dropdown button
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li><a class="dropdown-item" href="#">Action</a></li>
                        <li><a class="dropdown-item" href="#">Another action</a></li>
                        <li><a class="dropdown-item" href="#">Something else here</a></li>
                      </ul>
                    </div>
                  </div>
            </aside>
            `
        },
        'global-nav' : {// 전체 네비
            props: [],
            template : `
            <div class="allNav">
                <menu class="globalNavigation float-start">
                    <h3 class="visually-hidden">네비게이션</h3>
                    <a href="#" class="active">AI분석</a>
                    <a href="#">AI추천</a>
                    <a href="#">라씨매매신호</a>
                    <a href="#">AI속보</a>
                    <a href="#">토론실</a>
                </menu>
                <!-- //gloabal navi -->
            </div>
            `
        },
        
        //푸터
        'real-footer' : {//footer
            props : [],
            template: `
            <footer id="footer" class="clearfix">
                <slot name="fmenu" />
                <slot name="fmenu2" />
                <slot name="copyright" />
            </footer>
            `
        },
        'footer-menu' : {// 하단메뉴1
            props : [],
            template : `
            <menu id="fmenu">
                <figure class="figure" @:click="onClickRedirect()">
                    <img src="./img/flogin.png" class="figure-img img-fluid" alt="로그인">
                    <figcaption class="figure-caption text-center rmt-7">로그인</figcaption>
                </figure>
                <figure class="figure" @:click="onClickRedirect()">
                    <img src="./img/fpc.png" class="figure-img img-fluid" alt="PC버전">
                    <figcaption class="figure-caption text-center rmt-7">PC버전</figcaption>
                </figure>
                <figure class="figure" @:click="onClickRedirect()">
                    <img src="./img/fdw.png" class="figure-img img-fluid" alt="씽크풀앱 다운로드">
                    <figcaption class="figure-caption text-center">씽크풀앱<br>다운로드</figcaption>
                </figure>
            </menu>
            `
        },
        'footer-menu2' : { //하단메뉴2
            props : [],
            template : `
            <menu id="fmenu2">
                <a href="#">고객센터</a>
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
            </menu>
            `
        },
        'footer-copyright' : { //카피라이트
            props : [],
            template : `
            <div class="copyright">
                <span class="d-block">@Thinkpool</span>
                <span class="d-block">
                    본사이트에서 게재되는 정보는 오류 및 지연이 있을 수 있으며 <br>
                    그 이용에 따르는 책임은 이용자 본인에게 있습니다. 
                </span>
            </div>
            `
        },
        
        //섹선

        //메인 - 마이종목
        'my-item' : {
            template : `
            <div id="myItem">
                <div class="myItemList">
                    <slot name="my-item-title"></slot>
                    <slot name="myitembox-sm"></slot>
                    <slot name="myitembox-lg"></slot>
                </div>
            </div>
            `
        },
        'myitembox-title' : {
            template : `
            <div class="myItemBox title shadow-sm" @:click="onClickRedirect()">
                <div>
                    <strong>MY</strong>
                    <span>종목</span>
                </div>
            </div>
            `
        },
        'myitembox-sm': {
            props: [],
            template : `
            <div class="myItemBox item shadow-sm" @:click="onClickRedirect()">
                <span class="name text-truncate">KOSDAQ</span>
                <!-- //종목명 -->

                <span class="price">920.2</span>
                <!-- //가격 -->

                <span class="per">
                    <em class="up">+3.2%</em>
                </span>
                <!-- //퍼센트 -->
            </div>
            <!-- //item -->
            `
        },
        'myitembox-lg' : {
            props: [],
            template : `
            <div class="myItemBox item item-lg shadow-sm" @:click="onClickRedirect()">
                <span class="name text-truncate">KOSDAQ</span>
                <!-- //종목명 -->

                <span class="price">920.2</span>
                <!-- //가격 -->

                <span class="per">
                    <em class="up">+3.2%</em>
                </span>
                <!-- //퍼센트 -->

                <span class="fav">
                    <em></em>
                </span>
                <!-- //좋아요 -->
            </div>
            `
        },

        //메인 - 이슈 탭
        'mainissue-tab' : {
            template : `
            <nav>
                <div class="nav nav-tabs justify-content-center" id="nav-tab" role="tablist">
                    <button class="nav-link active" id="issue01">AI이슈포착</button>
                    <button class="nav-link" id="issue02">기관이슈</button>
                    <button class="nav-link" id="issue03">외국인이슈</button>
                </div>
            </nav>
            `
        },
        'mainissue-content' : {
            template: `
            <div class="tab-content" id="nav-tabContent">
                <div class="tab-pane show active">
                    <img src="./img/demoBublle.png" alt="" class="img-fluid" data-bs-toggle="modal" data-bs-target="#issueModal">
                </div>
            </div>
            `
        },

        //메인-라씨매매신호
        'mainrassi-result' : {
            template : `
            <div class="s_result">
                <span class="sig">매수</span>
                <span class="amount">21종목</span>
            </div>
            `
        },

        //자세히보기 , 더보기
        'shortcut-button' : {
            template : `
            <div class="shorcutBtn d-grid gap-2 rmt-20">
                <button class="btn-outline-detail" @:click="onClickRedirect()">자세히보기&nbsp;&nbsp;〉</button>
            </div>
            <!-- //바로가기 -->
            `
        }
    }
})
