(function () {
  "use strict";

  function syncMarketingControls(form) {
    var sms = form.querySelector('input[name="agreeMarketingSms"]');
    var marketingCheckbox = form.querySelector(
      'input[type="checkbox"][name="agreeMarketing"]'
    );
    var marketingRadios = Array.prototype.slice.call(
      form.querySelectorAll('input[type="radio"][name="agreeMarketing"]')
    );

    if (!sms || (!marketingCheckbox && marketingRadios.length === 0)) {
      return;
    }

    function isMarketingAgreed() {
      if (marketingCheckbox) {
        return marketingCheckbox.checked;
      }

      var selected = marketingRadios.find(function (radio) {
        return radio.checked;
      });

      return Boolean(selected && selected.value === "yes");
    }

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

    sms.addEventListener("change", function () {
      if (!isMarketingAgreed()) {
        sms.checked = false;
        sms.setAttribute("aria-checked", "false");
      }
    });

    applyMarketingState();
  }

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

  function bindPasswordConfirmation() {
    document
      .querySelectorAll('input[name="passwordConfirm"], input[name="newPasswordConfirm"]')
      .forEach(function (confirmation) {
        var sourceName =
          confirmation.name === "newPasswordConfirm" ? "newPassword" : "password";
        var source = confirmation.form
          ? confirmation.form.querySelector('input[name="' + sourceName + '"]')
          : null;

        if (!source) {
          return;
        }

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

  function bindPhoneVerification() {
    document.querySelectorAll(".verification-fieldset").forEach(function (fieldset) {
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

      if (!phone || !verificationCode || !sendButton || !confirmButton) {
        return;
      }

      var codeSent = false;
      var verified = false;
      var verificationExpired = false;
      var timerId = null;
      var timerExpiresAt = 0;

      function formatTimer(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds % 60;

        return (
          String(minutes).padStart(2, "0") +
          ":" +
          String(remainingSeconds).padStart(2, "0")
        );
      }

      function renderTimer(seconds) {
        if (timer) {
          timer.textContent = formatTimer(seconds);
        }
      }

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

      function startTimer() {
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

          if (remainingSeconds === 0) {
            stopTimer(false);
            verificationExpired = true;
            fieldset.setAttribute("data-verification-expired", "true");
            updateButtonStates();
          }
        }, 1000);
      }

      function hasValidPhone() {
        return /^\d{10,11}$/.test(phone.value.trim());
      }

      function hasValidVerificationCode() {
        return /^\d{4,6}$/.test(verificationCode.value.trim());
      }

      function updateButtonStates() {
        verificationCode.disabled = verified || !codeSent;
        sendButton.disabled = verified || !hasValidPhone();
        confirmButton.disabled = verificationExpired
          ? false
          : verified || !codeSent || !hasValidVerificationCode();

        if (timer) {
          timer.hidden = verified || !codeSent;
        }
      }

      phone.addEventListener("input", function () {
        codeSent = false;
        verified = false;
        verificationExpired = false;
        verificationCode.value = "";
        fieldset.removeAttribute("data-verification-status");
        fieldset.removeAttribute("data-verification-expired");
        stopTimer(true);
        updateButtonStates();
      });

      verificationCode.addEventListener("input", function () {
        if (verified) {
          verified = false;
          fieldset.removeAttribute("data-verification-status");
        }

        updateButtonStates();
      });

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
        sendButton.textContent = "재발송";

        if (!verificationCode.disabled) {
          verificationCode.focus();
        }
      });

      confirmButton.addEventListener("click", function () {
        if (verificationExpired) {
          window.alert("입력시간이 초과 되었습니다.");
          return;
        }

        if (confirmButton.disabled) {
          return;
        }

        verified = true;
        stopTimer(true);
        fieldset.setAttribute("data-verification-status", "verified");
        updateButtonStates();
      });

      stopTimer(true);
      updateButtonStates();
    });
  }

  function bindProfileChangeControls() {
    document
      .querySelectorAll("[data-profile-change-target]")
      .forEach(function (button) {
        var inputId = button.getAttribute("data-profile-change-target");
        var input = inputId ? document.getElementById(inputId) : null;

        if (!input) {
          return;
        }

        var savedValue = input.value;

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

          savedValue = input.value;
          input.defaultValue = input.value;
          updateButtonState();
        });

        updateButtonState();
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".member-form").forEach(syncMarketingControls);
    bindBackButtons();
    bindPasswordConfirmation();
    bindPhoneVerification();
    bindProfileChangeControls();
  });
})();
