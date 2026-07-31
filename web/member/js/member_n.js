(function () {
  "use strict";

  /*
   * 회원 페이지 공통 스크립트
   *
   * 전역 변수 충돌을 방지하기 위해 즉시 실행 함수(IIFE) 안에서 동작합니다.
   * 각 기능은 대상 요소가 존재하는 페이지에서만 실행되므로 동일한 파일을
   * 로그인, 회원가입, 회원정보 변경 페이지에서 공통으로 사용할 수 있습니다.
   */

  /**
   * 마케팅 광고 동의와 휴대폰 문자 동의 상태를 연결합니다.
   *
   * 페이지에 따라 마케팅 동의 UI가 체크박스 또는 라디오 버튼으로 구성되므로
   * 두 형식을 모두 탐색합니다. 마케팅 동의값이 바뀌면 휴대폰 문자 항목도
   * 동일한 상태로 맞추고, 접근성 상태인 aria-checked도 함께 갱신합니다.
   */
  function syncMarketingControls(form) {
    // 하위 휴대폰 문자 동의 항목
    var sms = form.querySelector('input[name="agreeMarketingSms"]');

    // 회원가입 페이지에서 사용하는 체크박스형 마케팅 동의
    var marketingCheckbox = form.querySelector(
      'input[type="checkbox"][name="agreeMarketing"]'
    );

    // 회원정보 페이지에서 사용하는 동의/미동의 라디오 버튼
    var marketingRadios = Array.prototype.slice.call(
      form.querySelectorAll('input[type="radio"][name="agreeMarketing"]')
    );

    // 현재 폼에 마케팅 동의 UI가 없으면 아무 작업도 하지 않습니다.
    if (!sms || (!marketingCheckbox && marketingRadios.length === 0)) {
      return;
    }

    // 체크박스와 라디오 버튼 형식을 하나의 Boolean 값으로 변환합니다.
    function isMarketingAgreed() {
      if (marketingCheckbox) {
        return marketingCheckbox.checked;
      }

      var selected = marketingRadios.find(function (radio) {
        return radio.checked;
      });

      return Boolean(selected && selected.value === "yes");
    }

    // 상위 마케팅 동의 상태를 휴대폰 문자 체크 상태에 반영합니다.
    function applyMarketingState() {
      var agreed = isMarketingAgreed();
      sms.checked = agreed;
      sms.setAttribute("aria-checked", String(agreed));
    }

    if (marketingCheckbox) {
      marketingCheckbox.addEventListener("change", applyMarketingState);
    }

    marketingRadios.forEach(function (radio) {
      radio.addEventListener("change", applyMarketingState);
    });

    /*
     * 마케팅에 동의하지 않은 상태에서 휴대폰 문자만 단독으로 선택할 수 없도록
     * 사용자가 문자 항목을 직접 조작한 경우에도 상태를 한 번 더 확인합니다.
     */
    sms.addEventListener("change", function () {
      if (!isMarketingAgreed()) {
        sms.checked = false;
        sms.setAttribute("aria-checked", "false");
      }
    });

    // 초기 HTML의 checked 상태도 동일한 규칙으로 정리합니다.
    applyMarketingState();
  }

  /**
   * 헤더의 뒤로가기 버튼을 기존 브라우저 탐색 방식으로 연결합니다.
   * 이전 방문 기록이 없으면 사용자가 빈 화면에 머물지 않도록 로그인 페이지로 이동합니다.
   */
  function bindBackButtons() {
    document.querySelectorAll(".member-header__back").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        window.location.href = "./로그인_N.html";
      });
    });
  }

  /**
   * 비밀번호와 비밀번호 확인 입력값이 일치하는지 검사합니다.
   *
   * setCustomValidity를 사용하므로 별도의 제출 이벤트를 만들지 않아도
   * 브라우저의 기본 폼 검증과 reportValidity에서 동일한 오류를 사용할 수 있습니다.
   */
  function bindPasswordConfirmation() {
    document
      .querySelectorAll('input[name="passwordConfirm"], input[name="newPasswordConfirm"]')
      .forEach(function (confirmation) {
        // 신규 비밀번호 변경 화면과 일반 회원가입 화면의 필드명을 구분합니다.
        var sourceName =
          confirmation.name === "newPasswordConfirm" ? "newPassword" : "password";
        var source = confirmation.form
          ? confirmation.form.querySelector('input[name="' + sourceName + '"]')
          : null;

        if (!source) {
          return;
        }

        // 빈 확인값은 required/minlength 검증에 맡기고, 값이 있을 때만 일치 여부를 검사합니다.
        function validateMatch() {
          confirmation.setCustomValidity(
            confirmation.value && confirmation.value !== source.value
              ? "비밀번호가 일치하지 않습니다."
              : ""
          );
        }

        source.addEventListener("input", validateMatch);
        confirmation.addEventListener("input", validateMatch);
      });
  }

  /**
   * 휴대폰 인증번호 발송, 입력 활성화, 3분 타이머와 인증 완료 상태를 관리합니다.
   *
   * 이 함수는 .verification-fieldset 단위로 독립 실행되므로 한 페이지에 인증 영역이
   * 여러 개 있어도 상태와 타이머가 서로 섞이지 않습니다.
   */
  function bindPhoneVerification() {
    document.querySelectorAll(".verification-fieldset").forEach(function (fieldset) {
      // 인증 흐름에서 사용하는 입력 필드와 버튼을 현재 fieldset 안에서만 찾습니다.
      var phone = fieldset.querySelector('input[name="phone"]');
      var verificationCode = fieldset.querySelector(
        'input[name="verificationCode"]'
      );
      var sendButton = fieldset.querySelector(
        '[data-verification-action="send"]'
      );
      var confirmButton = fieldset.querySelector(
        '[data-verification-action="confirm"]'
      );
      var timer = fieldset.querySelector(".verification-code-timer");

      // 필수 요소가 하나라도 없는 영역은 잘못된 이벤트 연결을 방지하기 위해 건너뜁니다.
      if (!phone || !verificationCode || !sendButton || !confirmButton) {
        return;
      }

      /*
       * codeSent: 인증번호가 한 번 이상 발송되어 입력창을 사용할 수 있는 상태
       * verified: 확인 버튼을 눌러 프론트 화면에서 인증 완료 처리된 상태
       * verificationExpired: 발송 후 3분이 지나 확인 시 시간초과 알림이 필요한 상태
       */
      var codeSent = false;
      var verified = false;
      var verificationExpired = false;

      // 실행 중인 interval ID와 실제 만료 시각을 인증 영역별로 보관합니다.
      var timerId = null;
      var timerExpiresAt = 0;

      // 휴대폰 번호 변경 후에도 "재발송" 문구를 유지하므로
      // 최초 버튼 문구를 저장하는 초기화 로직은 사용하지 않습니다.
      // var sendButtonLabel = sendButton.textContent.trim();

      // 초 단위 숫자를 화면 표시용 MM:SS 형식으로 변환합니다.
      function formatTimer(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds % 60;

        return (
          String(minutes).padStart(2, "0") +
          ":" +
          String(remainingSeconds).padStart(2, "0")
        );
      }

      // 타이머 요소가 있는 페이지에서만 남은 시간을 갱신합니다.
      function renderTimer(seconds) {
        if (timer) {
          timer.textContent = formatTimer(seconds);
        }
      }

      /*
       * 실행 중인 타이머를 안전하게 중지합니다.
       * resetDisplay가 true이면 다음 발송을 준비할 수 있도록 표시값도 03:00으로 되돌립니다.
       * hidden 여부는 updateButtonStates에서 인증 상태에 맞춰 별도로 처리합니다.
       */
      function stopTimer(resetDisplay) {
        if (timerId !== null) {
          window.clearInterval(timerId);
          timerId = null;
        }

        timerExpiresAt = 0;

        if (resetDisplay) {
          renderTimer(180);
        }
      }

      /*
       * 3분 타이머를 시작합니다.
       * 단순히 180에서 1씩 빼지 않고 실제 만료 시각(Date.now)을 기준으로 계산하여
       * 모바일 브라우저가 백그라운드에서 interval 실행을 늦추더라도 시간 오차를 줄입니다.
       */
      function startTimer() {
        // 재발송 시 기존 interval이 중복 실행되지 않도록 먼저 정리합니다.
        stopTimer(false);
        verificationExpired = false;
        fieldset.removeAttribute("data-verification-expired");
        timerExpiresAt = Date.now() + 180000;
        renderTimer(180);

        timerId = window.setInterval(function () {
          var remainingSeconds = Math.max(
            0,
            Math.ceil((timerExpiresAt - Date.now()) / 1000)
          );

          renderTimer(remainingSeconds);

          // 00:00이 되면 만료 상태를 표시하고 버튼 상태를 다시 계산합니다.
          if (remainingSeconds === 0) {
            stopTimer(false);
            verificationExpired = true;
            fieldset.setAttribute("data-verification-expired", "true");
            updateButtonStates();
          }
        }, 1000);
      }

      // 휴대폰 번호는 하이픈 없이 숫자 10~11자리만 유효하게 처리합니다.
      function hasValidPhone() {
        return /^\d{10,11}$/.test(phone.value.trim());
      }

      // 예제 화면의 인증번호는 숫자 4~6자리 입력을 유효값으로 봅니다.
      function hasValidVerificationCode() {
        return /^\d{4,6}$/.test(verificationCode.value.trim());
      }

      /**
       * 현재 인증 상태에 맞춰 입력창과 버튼의 활성/비활성 상태를 한 곳에서 갱신합니다.
       *
       * 시간 만료 후에는 확인 버튼을 disabled로 만들지 않습니다. 사용자가 확인 버튼을
       * 눌렀을 때 "입력시간이 초과 되었습니다." 알림을 보여주기 위해 클릭 가능해야 합니다.
       */
      function updateButtonStates() {
        verificationCode.disabled = verified || !codeSent;
        sendButton.disabled = verified || !hasValidPhone();
        confirmButton.disabled = verificationExpired
          ? false
          : verified || !codeSent || !hasValidVerificationCode();

        // 발송 전이나 인증 완료 후에는 입력창 위의 시간 표시를 숨깁니다.
        if (timer) {
          timer.hidden = verified || !codeSent;
        }
      }

      /*
       * 휴대폰 번호가 변경되면 이전 번호로 받은 인증번호와 타이머는 더 이상 유효하지 않으므로
       * 인증 상태와 인증번호 입력값을 초기화합니다. 단, 버튼 문구 "재발송"은 유지합니다.
       */
      phone.addEventListener("input", function () {
        codeSent = false;
        verified = false;
        verificationExpired = false;
        verificationCode.value = "";
        fieldset.removeAttribute("data-verification-status");
        fieldset.removeAttribute("data-verification-expired");

        // 버튼 문구를 "인증번호받기"로 초기화하지 않습니다.
        // sendButton.textContent = sendButtonLabel;

        stopTimer(true);
        updateButtonStates();
      });

      // 인증번호 입력 길이가 유효해지는 즉시 확인 버튼 상태를 갱신합니다.
      verificationCode.addEventListener("input", function () {
        if (verified) {
          verified = false;
          fieldset.removeAttribute("data-verification-status");
        }

        updateButtonStates();
      });

      /*
       * 인증번호 발송/재발송 처리
       * 1) 기존 입력값과 만료 상태를 정리
       * 2) 입력창을 활성화하고 03:00 타이머 시작
       * 3) 발송 안내 알림을 닫은 후 버튼 문구를 "재발송"으로 변경
       * 4) 바로 인증번호를 입력할 수 있도록 입력창에 포커스
       */
      sendButton.addEventListener("click", function () {
        if (sendButton.disabled) {
          return;
        }

        codeSent = true;
        verified = false;
        verificationExpired = false;
        verificationCode.value = "";
        startTimer();
        updateButtonStates();
        window.alert("인증번호를 보냈습니다.");

        // 최초 발송 알림을 닫은 직후부터 버튼 문구를 "재발송"으로 유지합니다.
        sendButton.textContent = "재발송";

        if (!verificationCode.disabled) {
          verificationCode.focus();
        }
      });

      // 인증번호 확인 버튼의 만료/정상 처리 흐름을 구분합니다.
      confirmButton.addEventListener("click", function () {
        if (verificationExpired) {
          // 3분이 지난 상태에서는 인증 처리 대신 시간초과 알림을 표시합니다.
          window.alert("입력시간이 초과 되었습니다.");
          return;
        }

        // 입력 길이가 부족하거나 아직 발송 전인 경우에는 아무 작업도 하지 않습니다.
        if (confirmButton.disabled) {
          return;
        }

        // 실제 서버 검증 연결 전의 프론트 예제이므로 현재 입력값을 인증 완료 상태로 처리합니다.
        verified = true;
        stopTimer(true);
        fieldset.setAttribute("data-verification-status", "verified");
        updateButtonStates();
      });

      // 페이지 최초 진입 시 타이머 표시값과 모든 컨트롤 상태를 초기 상태로 맞춥니다.
      stopTimer(true);
      updateButtonStates();
    });
  }

  /**
   * 회원정보 변경 페이지의 개별 변경 버튼을 입력값 변경 여부에 따라 활성화합니다.
   * 최초 값과 같거나 빈 값이면 비활성화하고, 실제 변경값이 있을 때만 클릭할 수 있습니다.
   */
  function bindProfileChangeControls() {
    document
      .querySelectorAll("[data-profile-change-target]")
      .forEach(function (button) {
        // 버튼의 data-profile-change-target 값으로 연결할 입력 필드 ID를 찾습니다.
        var inputId = button.getAttribute("data-profile-change-target");
        var input = inputId ? document.getElementById(inputId) : null;

        if (!input) {
          return;
        }

        // 마지막으로 저장된 값을 기준값으로 보관합니다.
        var savedValue = input.value;

        // 공백이 아닌 값이 기준값과 달라졌을 때만 변경 버튼을 활성화합니다.
        function updateButtonState() {
          var hasChanged =
            input.value.trim() !== "" && input.value !== savedValue;
          button.disabled = !hasChanged;
        }

        input.addEventListener("input", updateButtonState);

        button.addEventListener("click", function () {
          if (button.disabled) {
            return;
          }

          // 변경 버튼 클릭 후 현재 값을 새로운 기준값으로 저장합니다.
          savedValue = input.value;
          input.defaultValue = input.value;
          updateButtonState();
        });

        updateButtonState();
      });
  }

  /**
   * 회원가입 통합 페이지의 1/2단계 패널을 같은 URL 안에서 전환합니다.
   *
   * 두 단계는 하나의 form 안에 있으므로 1단계 패널이 숨겨진 뒤에도 입력값은 유지되며,
   * 최종 제출 시 1단계와 2단계 값이 함께 전송됩니다. 헤더 뒤로가기는 이 함수에서
   * 가로채지 않고 bindBackButtons의 기존 브라우저 뒤로가기 동작을 그대로 사용합니다.
   */
  function bindIntegratedSignup() {
    document
      .querySelectorAll("[data-signup-integrated]")
      .forEach(function (form) {
        // data-signup-step="1", "2"로 지정된 두 패널과 다음 버튼을 수집합니다.
        var panels = Array.prototype.slice.call(
          form.querySelectorAll("[data-signup-step]")
        );
        var nextButton = form.querySelector("[data-signup-next]");

        // 통합 페이지에 필요한 구조가 완성되지 않은 경우 기능 연결을 중단합니다.
        if (panels.length !== 2 || !nextButton) {
          return;
        }

        // 선택한 단계만 표시하고 나머지 패널은 hidden과 aria-hidden으로 함께 숨깁니다.
        function showStep(step, shouldScroll) {
          panels.forEach(function (panel) {
            var isActive = panel.getAttribute("data-signup-step") === step;
            panel.hidden = !isActive;
            panel.setAttribute("aria-hidden", String(!isActive));
          });

          form.setAttribute("data-current-step", step);

          // 다음 단계 전환 시 스크롤이 아래에 남지 않도록 페이지 상단으로 이동합니다.
          if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }

        /*
         * 브라우저 기본 폼 검증 API로 현재 단계의 입력 요소만 검사합니다.
         * 숨겨진 2단계 required 필드가 1단계의 다음 버튼을 막지 않도록 panel 범위로 제한합니다.
         */
        function validateStep(panel) {
          var controls = Array.prototype.slice.call(
            panel.querySelectorAll("input, select, textarea")
          );
          var invalidControl = controls.find(function (control) {
            return !control.disabled && !control.checkValidity();
          });

          if (!invalidControl) {
            return true;
          }

          // 첫 번째 오류 필드에 브라우저 기본 안내를 표시하고 포커스를 이동합니다.
          invalidControl.reportValidity();
          invalidControl.focus();
          return false;
        }

        // 1단계가 유효할 때만 페이지 이동 없이 2단계 패널을 표시합니다.
        nextButton.addEventListener("click", function () {
          var firstPanel = form.querySelector('[data-signup-step="1"]');

          if (firstPanel && validateStep(firstPanel)) {
            showStep("2", true);
          }
        });

        // HTML의 data-current-step 값을 기준으로 최초 표시 단계를 결정합니다.
        showStep(form.getAttribute("data-current-step") || "1", false);
      });
  }

  /*
   * DOM 구성이 끝난 뒤 페이지별 공통 기능을 연결합니다.
   * 각 함수 내부에서 대상 요소 존재 여부를 확인하므로 사용하지 않는 기능은 자동으로 건너뜁니다.
   */
  document.addEventListener("DOMContentLoaded", function () {
    // 폼 단위 기능
    document.querySelectorAll(".member-form").forEach(syncMarketingControls);

    // 페이지/컴포넌트 단위 기능
    bindIntegratedSignup();
    bindBackButtons();
    bindPasswordConfirmation();
    bindPhoneVerification();
    bindProfileChangeControls();
  });
})();
