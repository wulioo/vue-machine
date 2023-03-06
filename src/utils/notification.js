var instanceNotification = Notification || window.Notification;
if (instanceNotification) {
  var permissionNow = instanceNotification.permission;
  if (permissionNow === 'granted') {//允许通知
    // creatNotification();
  } else if (permissionNow === 'default') {
    setPermission();
  } else if (permissionNow === 'denied') {
    console.log('用户拒绝了你!!!');
  } else {
    setPermission();
  }
}

function setPermission() {
  //请求获取通知权限
  instanceNotification.requestPermission(function (PERMISSION) {
    if (PERMISSION === 'granted') {
      // creatNotification();
    } else {
      console.log('用户拒绝了你!!!');
    }
  });
}

export default function creatNotification(title, body) {
  if (!window.Notification) {
    alert("浏览器不支持通知！");
    return false;
  }
  if (window.Notification.permission != 'granted') {
    alert('用户未开启通知权限!!!');
    return false;
  }
  var instanceNotification = new Notification(title, {
    "icon": "/public/avatar.png",
    "tag": "test",
    "noscreen":true,
    'renotify': true,
    "body": body,
    "requireInteraction": true

  });
  // instanceNotification.onshow = function () {
  //   console.log("显示通知");
  //   //3s后自动关闭通知
  //   setTimeout(function () {
  //     instanceNotification.close()
  //   }, 3 * 10000);
  // };
  instanceNotification.onclick = function () {
    // alert("打开页面");
    // window.open("/note");
    instanceNotification.close();
  };
  instanceNotification.onclose = function () {
    console.log("通知关闭");
  };
  instanceNotification.onerror = function () {
    console.log('错误');
  };
}
