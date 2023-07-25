const LR_USER_IDENTIFIER = "lr_id";
const LR_SESSION_IDENTIFIER = "lr_session_id";
const LR_EVENT_API = "https://api.leadresolution.io/api/analytics/events/";
const CALLSINE_EVENT_API = "https://api.callsine.com/v1/analytics/create/";

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
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

function generateUniqueId() {
  // Generate a unique session ID (could be a simple timestamp + random number combo or UUID)
  return Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

document.addEventListener("DOMContentLoaded", function () {
  let sessionId = getCookie(LR_SESSION_IDENTIFIER);
  let userId = getCookie(LR_USER_IDENTIFIER);

  const urlParams = new URLSearchParams(window.location.search);
  const queryParamUserId = urlParams.get(LR_USER_IDENTIFIER);

  if (!sessionId) {
    sessionId = generateUniqueId();
    setCookie(LR_SESSION_IDENTIFIER, sessionId, 0.5); // 0.5 days expiration
  }

  if (!userId && queryParamUserId) {
    setCookie(LR_USER_IDENTIFIER, queryParamUserId, 30);
  }

  lr_sendEvent_V2(userId, sessionId);
});
