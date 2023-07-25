const LR_USER_IDENTIFIER = "lr_id";
const LR_EVENT_API = "https://api.leadresolution.io/api/analytics/events/";
const CALLSINE_EVENT_API = "https://api.callsine.com/v1/analytics/create/";

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

function sendToLREventAPI(data, callback) {
  var xhrPost = new XMLHttpRequest();
  xhrPost.open("POST", LR_EVENT_API, true);
  xhrPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  xhrPost.onreadystatechange = function () {
    if (xhrPost.readyState === 4) {
      if (xhrPost.status === 200) {
        console.log("Data sent successfully to LR_EVENT_API");
        callback(data);
      } else {
        console.error("Error sending data to LR_EVENT_API");
      }
    }
  };
  xhrPost.send(JSON.stringify(data));
}

function sendToCallsineEventAPI(data) {
  data.reference_id = "email_id";
  var xhrPost = new XMLHttpRequest();
  xhrPost.open("POST", CALLSINE_EVENT_API, true);
  xhrPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  xhrPost.onreadystatechange = function () {
    if (xhrPost.readyState === 4) {
      if (xhrPost.status === 200) {
        console.log("Data sent successfully to CALLSINE_EVENT_API");
      } else {
        console.error("Error sending data to CALLSINE_EVENT_API");
      }
    }
  };
  xhrPost.send(JSON.stringify(data));
}

function lr_sendEvent_V2(userId, sessionId) {
  // Send a GET request to retrieve IP details
  var xhrIP = new XMLHttpRequest();
  xhrIP.open("GET", "https://ipapi.co/json/", true);

  xhrIP.onreadystatechange = function () {
    if (xhrIP.readyState === 4 && xhrIP.status === 200) {
      var response = JSON.parse(xhrIP.responseText);

      var data = {
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        user_id: userId,
        event: "page_view",
        reference_id: "person_id",
        page: window.location.href,
        country_code: response.country_code,
        country_name: response.country_name,
        ip_v4: response.ip,
        user_agent: navigator.userAgent,
      };

      sendToLREventAPI(data, sendToCallsineEventAPI);
    } else if (xhrIP.readyState === 4) {
      console.error("Error fetching IP details");
    }
  };

  xhrIP.send();
}

document.addEventListener("DOMContentLoaded", function () {
  let sessionId = getCookie("lr_session_id");
  let userId = getCookie(LR_USER_IDENTIFIER);

  const urlParams = new URLSearchParams(window.location.search);
  const queryParamUserId = urlParams.get(LR_USER_IDENTIFIER);

  if (!sessionId) {
    sessionId = generateUniqueId();
    setCookie("lr_session_id", sessionId, 0.5); // 0.5 days expiration
  }

  if (!userId) {
    setCookie(LR_USER_IDENTIFIER, queryParamUserId, 30);
  }

  lr_sendEvent_V2(userId, sessionId);
});
