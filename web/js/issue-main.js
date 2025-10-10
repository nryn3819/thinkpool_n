$(function(){
  //이슈홈 슬라이더
  var issueNavList = $(".issue-nav-list .list-w .list").length;
  var issueListIndex = $(".issue-nav-list .list-w .active").index();

  $(".issue-nav-list .list-w .list").on("click", function () {
    $(".issue-nav-list .list-w .list").removeClass("active");
    $(this).addClass("active");
  });

  if (issueNavList > 6) {
    $(".issue-nav-list .list-w").bxSlider({
      mode: "horizontal",
      pager: false,
      minSlides: 1,
      maxSlides: 6,
      moveSlides: 6,
      slideMargin: 0,
      slideWidth: 958 / 6,
      startSlide: issueListIndex,
      infiniteLoop: false,
      nextText: ">",
      prevText: "<",
      preventDefaultSwipeX: false,
      touchEnabled: false,
      hideControlOnEnd: true
    });
  }

  // ⭐️ 다음/이전 버튼 클릭 이벤트 처리
  if (issueNavList > 6) {
    // issueListIndex가 0보다 클 경우, 시작 슬라이드에 맞춰 현재 active 인덱스를 설정합니다.
    // bxSlider의 startSlide는 실제 li 인덱스가 아닌 슬라이드(묶음) 인덱스입니다.
    // moveSlides: 6 이므로, 0, 6, 12...가 묶음의 시작 인덱스가 됩니다.
    let currentActiveIndex = issueListIndex - (issueListIndex % 6);
    const $listItems = $(".issue-nav-list .list-w .list");
    const itemsPerSlide = 6;
    const totalItems = $listItems.length;

    // '다음' 버튼 클릭 이벤트
    $(".bx-next").on("click", function () {
      // 다음 묶음의 첫 번째 요소 인덱스 계산
      const nextIndex = currentActiveIndex + itemsPerSlide;

      // 슬라이더의 마지막 묶음을 넘어가지 않는지 확인 (hideControlOnEnd: true 사용 시)
      if (nextIndex < totalItems) {
        // 1. 기존 active 제거
        $listItems.removeClass("active");

        // 2. 새로운 묶음의 첫 번째 li에 active 추가
        $listItems.eq(nextIndex).addClass("active");

        // 3. 인덱스 업데이트
        currentActiveIndex = nextIndex;
      }
    });

    // '이전' 버튼 클릭 이벤트
    $(".bx-prev").on("click", function () {
      // 이전 묶음의 첫 번째 요소 인덱스 계산
      const prevIndex = currentActiveIndex - itemsPerSlide;

      // 슬라이더의 첫 번째 묶음보다 작아지지 않는지 확인 (hideControlOnEnd: true 사용 시)
      if (prevIndex >= 0) {
        // 1. 기존 active 제거
        $listItems.removeClass("active");

        // 2. 새로운 묶음의 첫 번째 li에 active 추가
        $listItems.eq(prevIndex).addClass("active");

        // 3. 인덱스 업데이트
        currentActiveIndex = prevIndex;
      }
    });
  }
});