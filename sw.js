/* =========================================================
   富岡並木ふなだまり公園愛護会
   Image Viewer Service Worker
   ========================================================= */

const VIEWER_PATH = "/viewer/";

const LAUNCH_REQUEST =
  "funadamariServiceWorkerRequest";

/* =========================================================
   Install
   ========================================================= */

self.addEventListener("install", function (event) {

  self.skipWaiting();

});


/* =========================================================
   Activate
   ========================================================= */

self.addEventListener("activate", function (event) {

  event.waitUntil(
    self.clients.claim()
  );

});


/* =========================================================
   launcherからの要求
   ========================================================= */

self.addEventListener("message", function (event) {

  const data = event.data;

  if (!data) {
    return;
  }

  if (data.type !== LAUNCH_REQUEST) {
    return;
  }

  event.waitUntil(
    handleViewerRequest(data)
  );

});


/* =========================================================
   既存viewerを探して
   ・前面にする
   ・画像を変更する
   ========================================================= */

async function handleViewerRequest(data) {

  const clientList =
    await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });


  let viewerClient = null;


  /* -------------------------------------------------------
     viewerを探す
     ------------------------------------------------------- */

  for (const client of clientList) {

    try {

      const url =
        new URL(client.url);

      if (url.pathname === VIEWER_PATH) {

        viewerClient = client;

        break;

      }

    }
    catch (error) {

      // URL解析エラーは無視

    }

  }


if (viewerClient) {

    try {

        const focusedClient =
            await viewerClient.focus();

        console.log(
            "viewerClient.focus() succeeded:",
            focusedClient
        );

    }
    catch (error) {

        console.warn(
            "viewerClient.focus() failed:",
            error
        );

    }

    try {

        viewerClient.postMessage({
            type: "funadamariSetImage",
            image: data.image,
            title: data.title || "",
            timestamp: Date.now()
        });

    }
    catch (error) {

        console.warn(
            "viewer message failed:",
            error
        );

    }

    return;
}
   /* -------------------------------------------------------
     viewerが存在しない場合

     ここでは絶対に openWindow() しない。

     初回viewerは launcher のボタンから
     window.open() で開く。
     ------------------------------------------------------- */

  console.log(
    "No existing viewer was found."
  );

}
