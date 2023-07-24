const LR_USER_IDENTIFIER = "lr_id";
const LR_EVENT_API = "https://api.callsine.com/v1/analytics/create/";

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function lr_init() {
  const urlParams = new URLSearchParams(window.location.search);
  const user_id = urlParams.get(LR_USER_IDENTIFIER);
  if (user_id) {
    setCookie(LR_USER_IDENTIFIER, user_id);
  }
}

function lr_sendEvent() {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", LR_EVENT_API);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    }
  };

  let user_id = getCookie(LR_USER_IDENTIFIER); // Can be a unique id representing a lead
  let data = `{
  "timestamp": "${new Date().toISOString()}",
  "user_id": "${user_id}",
  "event": "page_view",
  "page": "${window.location.href}"
}`;

  xhr.send(data);
}

lr_init();
lr_sendEvent();
