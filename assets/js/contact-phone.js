(function () {
  "use strict";

  function cleanPhone(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 24);
  }

  function phoneIsValid(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return !digits || (digits.length >= 9 && digits.length <= 15);
  }

  function installPhoneField() {
    var form = document.getElementById("contact-form");
    var email = document.getElementById("c-email");
    if (!form || !email || document.getElementById("c-phone")) return;

    var group = document.createElement("div");
    group.className = "form-group";
    group.innerHTML =
      '<label for="c-phone">Telefón <span aria-hidden="true">(nepovinné)</span></label>' +
      '<input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" ' +
      'maxlength="24" pattern="[+0-9 \\(\\)\\-]{9,24}" title="Zadajte 9 až 15 číslic" ' +
      'placeholder="09XX XXX XXX alebo +421" aria-describedby="c-phone-help">' +
      '<small id="c-phone-help">Ak chcete, môžeme vám zavolať späť.</small>';
    email.closest(".form-group")?.after(group);
  }

  document.addEventListener("submit", function (event) {
    if (event.target?.id !== "contact-form") return;
    var phone = document.getElementById("c-phone");
    var message = document.getElementById("c-msg");
    var value = cleanPhone(phone?.value);
    if (!phoneIsValid(value)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      phone?.focus();
      phone?.setAttribute("aria-invalid", "true");
      if (typeof window.showToast === "function") window.showToast("⚠️ Skontrolujte telefónne číslo");
      return;
    }
    phone?.removeAttribute("aria-invalid");
    if (value && message && !/^Telefón:/m.test(message.value)) {
      message.value = "Telefón: " + value + "\n\n" + message.value.trim();
    }
  }, true);

  document.addEventListener("invalid", function (event) {
    if (event.target?.id !== "c-phone") return;
    event.target.setAttribute("aria-invalid", "true");
    if (typeof window.showToast === "function") window.showToast("⚠️ Skontrolujte telefónne číslo");
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installPhoneField, { once: true });
  } else {
    installPhoneField();
  }
})();
