// [툴팁 공통 적용 영역] 버튼 클릭 토글 및 aria-expanded 연동 (이 부분 작업하시면 됩니다.)
// 시세 기준 안내 툴팁 (.issue-help) 클릭 토글 - jQuery 미사용
(function () {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".issue-help__btn");
    if (!btn) return;
    var help = btn.closest(".issue-help");
    var isOpen = help.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
})();
