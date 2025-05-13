"use strict";

// next-pwa will detect this file automatically,
// and bundle the file into dest as worker-*.js using webpack.
// It's also automatically injected into sw.js generated.

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");

  const data = JSON.parse(event.data.text());
  event.waitUntil(
    registration.showNotification(data.title, {
      //actions: [{ action: "Ouvrir", title: "Ouvrir" }],
      data: data.url,
      body: data.message,
      icon: "/icons/maskable-192-192.png"
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log(
    "[Service Worker] Notification click Received.",
    event.notification.data
  );

  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow(event.notification.data);
      })
  );
});

// self.addEventListener('pushsubscriptionchange', function(event) {
//   event.waitUntil(
//       Promise.all([
//           Promise.resolve(event.oldSubscription ? deleteSubscription(event.oldSubscription) : true),
//           Promise.resolve(event.newSubscription ? event.newSubscription : subscribePush(registration))
//               .then(function(sub) { return saveSubscription(sub) })
//       ])
//   )
// })
