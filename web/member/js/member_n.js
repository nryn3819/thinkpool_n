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
   * 휴대폰 인증번호 발송, 입력 활성화와 인증 완료 상태를 관리합니다.
   *
   * 이 함수는 .verification-fieldset 단위로 독립 실행되므로 한 페이지에 인증 영역이
   * 여러 개 있어도 각 영역의 발송/확인 상태가 서로 섞이지 않습니다.
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
      var sentMessage = fieldset.querySelector(
        '[data-verification-message="sent"]'
      );
      var verifiedMessage = fieldset.querySelector(
        '[data-verification-message="verified"]'
      );
      // 필수 요소가 하나라도 없는 영역은 잘못된 이벤트 연결을 방지하기 위해 건너뜁니다.
      if (!phone || !verificationCode || !sendButton || !confirmButton) {
        return;
      }

      /*
       * codeSent: 인증번호가 한 번 이상 발송되어 입력창을 사용할 수 있는 상태
       * verified: 확인 버튼을 눌러 프론트 화면에서 인증 완료 처리된 상태
       */
      var codeSent = false;
      var verified = false;

      // 휴대폰 번호 변경 후에도 "재발송" 문구를 유지하므로
      // 최초 버튼 문구를 저장하는 초기화 로직은 사용하지 않습니다.
      // var sendButtonLabel = sendButton.textContent.trim();

      // 화면에 하이픈이 포함된 기존 번호가 표시될 수 있으므로 숫자만 추출해 검사합니다.
      function hasValidPhone() {
        var phoneDigits = phone.value.replace(/\D/g, "");
        return /^\d{10,11}$/.test(phoneDigits);
      }

      // 예제 화면의 인증번호는 숫자 4~6자리 입력을 유효값으로 봅니다.
      function hasValidVerificationCode() {
        return /^\d{4,6}$/.test(verificationCode.value.trim());
      }

      // 현재 발송/인증 상태에 맞춰 입력창과 두 버튼의 활성 상태를 갱신합니다.
      function updateButtonStates() {
        verificationCode.disabled = verified || !codeSent;
        sendButton.disabled = verified || !hasValidPhone();
        confirmButton.disabled =
          verified || !codeSent || !hasValidVerificationCode();
      }

      // PPT description에 정의된 발송/인증 완료 문구 중 현재 상태에 맞는 문구만 표시합니다.
      function updateVerificationMessage(state) {
        if (sentMessage) {
          sentMessage.hidden = state !== "sent";
        }

        if (verifiedMessage) {
          verifiedMessage.hidden = state !== "verified";
        }
      }

      /*
       * 휴대폰 번호가 변경되면 이전 번호로 받은 인증번호는 더 이상 유효하지 않으므로
       * 인증 상태와 인증번호 입력값을 초기화합니다. 단, 버튼 문구 "재발송"은 유지합니다.
       */
      phone.addEventListener("input", function () {
        codeSent = false;
        verified = false;
        verificationCode.value = "";
        verificationCode.classList.remove("is-completed");
        fieldset.removeAttribute("data-verification-status");
        updateVerificationMessage("");

        // 버튼 문구를 "인증번호받기"로 초기화하지 않습니다.
        // sendButton.textContent = sendButtonLabel;

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
       * 1) 기존 인증번호 입력값을 정리
       * 2) 인증번호 입력창을 활성화
       * 3) 입력 영역 아래에 발송 완료 문구를 표시하고 버튼 문구를 "재발송"으로 변경
       * 4) 바로 인증번호를 입력할 수 있도록 입력창에 포커스
       */
      sendButton.addEventListener("click", function () {
        if (sendButton.disabled) {
          return;
        }

        codeSent = true;
        verified = false;
        verificationCode.value = "";
        verificationCode.classList.remove("is-completed");
        updateButtonStates();
        updateVerificationMessage("sent");

        // 최초 발송 직후부터 버튼 문구를 "재발송"으로 유지합니다.
        sendButton.textContent = "재발송";

        if (!verificationCode.disabled) {
          verificationCode.focus();
        }
      });

      // 인증번호 형식이 유효한 경우 프론트 예제의 인증 완료 상태로 처리합니다.
      confirmButton.addEventListener("click", function () {
        // 입력 길이가 부족하거나 아직 발송 전인 경우에는 아무 작업도 하지 않습니다.
        if (confirmButton.disabled) {
          return;
        }

        // 실제 서버 검증 연결 전의 프론트 예제이므로 현재 입력값을 인증 완료 상태로 처리합니다.
        verified = true;
        fieldset.setAttribute("data-verification-status", "verified");
        updateButtonStates();
        updateVerificationMessage("verified");

        /*
         * 회원정보 변경 페이지처럼 인증 완료 후 별도의 편집 UI를 닫아야 하는 화면에서
         * 공통 인증 로직을 다시 작성하지 않고 완료 시점만 전달할 수 있도록 이벤트를 보냅니다.
         */
        fieldset.dispatchEvent(
          new CustomEvent("member:verification-complete", { bubbles: true })
        );
      });

      // 페이지 최초 진입 시 모든 인증 컨트롤을 초기 상태로 맞춥니다.
      updateButtonStates();
      updateVerificationMessage("");
    });
  }

  /**
   * 입력이 완료된 필드의 포커스 아웃 디자인을 적용합니다.
   *
   * 값이 있는 입력창에서 포커스가 빠지면 is-completed 클래스를 추가합니다.
   * CSS에서는 이 클래스가 있고 포커스가 없는 경우에만 흰 배경과 회색 테두리를
   * 표시하므로, 다시 입력창을 선택하면 기존 파란색 포커스 디자인이 우선됩니다.
   */
  function bindCompletedInputStyles() {
    document.querySelectorAll(".form-field__input").forEach(function (input) {
      // 현재 값을 기준으로 완료 클래스를 추가하거나 제거합니다.
      function updateCompletedState() {
        if (input.value.trim() !== "") {
          input.classList.add("is-completed");
          return;
        }

        input.classList.remove("is-completed");
      }

      // 사용자가 입력을 마치고 다른 요소로 이동한 시점에 완료 디자인을 적용합니다.
      input.addEventListener("blur", updateCompletedState);

      // 완료된 필드의 값을 모두 삭제하면 포커스 아웃 전이라도 완료 상태를 해제합니다.
      input.addEventListener("input", function () {
        if (input.value.trim() === "") {
          input.classList.remove("is-completed");
        }
      });

      // 서버에서 미리 채운 값이나 브라우저 자동완성 값도 완료 디자인으로 시작합니다.
      updateCompletedState();
    });
  }

  /**
   * 회원정보 변경 페이지의 필명/휴대폰 번호 편집 상태를 관리합니다.
   *
   * 기본 상태에서는 두 입력창을 disabled로 두고 회색 "변경" 버튼만 노출합니다.
   * 필명은 변경 버튼을 누르면 입력창과 "변경하기" 버튼을 활성화하고, 변경된 값을
   * 다시 확정하면 비활성 기본 상태로 돌아갑니다. 휴대폰 번호는 편집을 시작할 때
   * 인증번호 발송 버튼과 인증번호 입력 행을 표시하며, 공통 인증 완료 이벤트를 받은
   * 뒤 현재 번호를 저장하고 기본 상태로 돌아갑니다.
   */
  function bindProfileChangeControls() {
    var editorGroups = document.querySelectorAll("[data-profile-editor]");

    editorGroups.forEach(function (group) {
      var editorType = group.getAttribute("data-profile-editor");
      var input = group.querySelector("[data-profile-edit-input]");
      var editButton = group.querySelector("[data-profile-edit-action]");

      if (!input || !editButton) {
        return;
      }

      // 마지막으로 사용자가 확정한 값을 편집 전후 비교 기준으로 보관합니다.
      var savedValue = input.value;

      // 필명 편집 상태와 버튼의 문구/활성 상태/경고 문구를 함께 갱신합니다.
      if (editorType === "nickname") {
        var warning = group.querySelector("[data-profile-edit-warning]");
        var adminWarning = group.querySelector("[data-profile-admin-warning]");

        // 서버 템플릿에서 role 값을 admin으로 지정하면 관리자 전용 안내를 사용합니다.
        function isAdminNickname() {
          return group.getAttribute("data-profile-nickname-role") === "admin";
        }

        function updateNicknameButton() {
          var hasChanged =
            input.value.trim() !== "" && input.value !== savedValue;
          editButton.disabled = !hasChanged;
        }

        function setNicknameEditing(isEditing) {
          if (isEditing) {
            group.setAttribute("data-profile-editing", "true");
          } else {
            group.removeAttribute("data-profile-editing");
          }

          input.disabled = !isEditing;
          editButton.textContent = isEditing ? "변경하기" : "변경";
          editButton.setAttribute("aria-expanded", String(isEditing));

          // 일반회원 편집 상태에는 기존 필명 중복 경고만 표시합니다.
          if (warning) {
            warning.hidden = !isEditing || isAdminNickname();
          }

          // 관리자 전용 안내는 관리자 편집 제한 상태에서만 표시합니다.
          if (adminWarning) {
            adminWarning.hidden = !isEditing || !isAdminNickname();
          }

          if (isEditing) {
            updateNicknameButton();
            input.focus();
            input.select();
            return;
          }

          // 기본 상태의 변경 버튼은 회색이지만 다음 편집을 위해 클릭 가능해야 합니다.
          editButton.disabled = false;
        }

        input.addEventListener("input", updateNicknameButton);

        editButton.addEventListener("click", function () {
          var isEditing =
            group.getAttribute("data-profile-editing") === "true";

          if (!isEditing) {
            /*
             * 관리자는 필명을 편집할 수 없으므로 입력창을 활성화하지 않고
             * Figma에 정의된 관리자/변경 제한 안내만 표시합니다.
             */
            if (isAdminNickname()) {
              if (warning) {
                warning.hidden = true;
              }

              if (adminWarning) {
                adminWarning.hidden = false;
              }

              editButton.setAttribute("aria-expanded", "true");
              return;
            }

            setNicknameEditing(true);
            return;
          }

          if (editButton.disabled) {
            return;
          }

          // 변경하기를 누른 현재 값을 새 기준값으로 저장하고 필드를 다시 잠급니다.
          savedValue = input.value;
          input.defaultValue = input.value;
          setNicknameEditing(false);
        });

        setNicknameEditing(false);
        return;
      }

      // 휴대폰 편집 상태에서는 변경 버튼 대신 발송 버튼과 인증번호 행을 표시합니다.
      if (editorType === "phone") {
        var sendButton = group.querySelector(
          '[data-verification-action="send"]'
        );
        var verificationRow = group.querySelector(
          "[data-profile-verification-row]"
        );
        var phoneMessages = group.querySelector(
          "[data-profile-phone-messages]"
        );

        if (!sendButton || !verificationRow) {
          return;
        }

        function setPhoneEditing(isEditing) {
          if (isEditing) {
            group.setAttribute("data-profile-editing", "true");
          } else {
            group.removeAttribute("data-profile-editing");
          }

          input.disabled = !isEditing;
          editButton.hidden = isEditing;
          sendButton.hidden = !isEditing;
          verificationRow.hidden = !isEditing;
          if (phoneMessages) {
            phoneMessages.hidden = !isEditing;
          }
          editButton.setAttribute("aria-expanded", String(isEditing));

          if (isEditing) {
            /*
             * 공통 인증 로직에 현재 번호를 다시 전달해 인증번호받기 버튼 상태를 계산하고,
             * 사용자가 기존 번호를 바로 덮어쓸 수 있도록 전체 값을 선택합니다.
             */
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.focus();
            input.select();
          }
        }

        editButton.addEventListener("click", function () {
          setPhoneEditing(true);
        });

        group.addEventListener("member:verification-complete", function () {
          // 인증에 성공한 번호를 다음 편집의 기준값으로 저장합니다.
          savedValue = input.value;
          input.defaultValue = input.value;
          setPhoneEditing(false);
        });

        setPhoneEditing(false);
      }
    });

    /*
     * disabled 입력은 기본 폼 전송값에서 제외되므로 제출 직전에만 잠금을 해제합니다.
     * 화면 전환이 일어나는 제출 시점이므로 사용자에게 편집 가능한 상태로 노출되지는 않습니다.
     */
    document
      .querySelectorAll(".member-page--profile-edit .member-form--profile")
      .forEach(function (form) {
        form.addEventListener("submit", function () {
          form
            .querySelectorAll("[data-profile-edit-input]:disabled")
            .forEach(function (input) {
              input.disabled = false;
            });
        });
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
    bindCompletedInputStyles();
    bindProfileChangeControls();
  });
})();
