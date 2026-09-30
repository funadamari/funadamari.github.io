const VIEWER_PATH = "/viewer/";

const LAUNCH_REQUEST =
    "funadamariServiceWorkerRequest";


/*
=========================================================
 Service Worker install
=========================================================
*/

self.addEventListener(
    "install",
    function (event) {

        self.skipWaiting();

    }
);


/*
=========================================================
 Service Worker activate
=========================================================
*/

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(
            self.clients.claim()
        );

    }
);


/*
=========================================================
 launcherからの要求
=========================================================
*/

self.addEventListener(
    "message",
    function (event) {

        const data =
            event.data;


        if (!data) {

            return;

        }


        if (
            data.type !==
            LAUNCH_REQUEST
        ) {

            return;

        }


        event.waitUntil(
            handleViewerRequest(data)
        );

    }
);


/*
=========================================================
 viewer検索・focus・画像変更
=========================================================
*/

async function handleViewerRequest(data) {

    const clientList =
        await self.clients.matchAll({

            type: "window",

            includeUncontrolled: true

        });


    /*
       viewerを探す
    */

    let viewerClient = null;


    for (
        const client
        of clientList
    ) {

        try {

            const url =
                new URL(
                    client.url
                );


            if (
                url.pathname ===
                VIEWER_PATH
            ) {

                viewerClient =
                    client;

                break;

            }

        }
        catch (error) {

            // ignore

        }

    }


    /*
       viewerが存在する場合
    */

    if (
        viewerClient &&
        "focus" in viewerClient
    ) {

        try {

            /*
               まずviewerを前面にする
            */

            await viewerClient.focus();

        }
        catch (error) {

            console.warn(
                "viewer focus failed:",
                error
            );

        }


        /*
           viewerへ画像変更要求を送る
        */

        try {

            viewerClient.postMessage({

                type:
                    "funadamariSetImage",

                image:
                    data.image,

                title:
                    data.title,

                timestamp:
                    Date.now()

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


    /*
       viewerが存在しない場合
    */

    if (
        self.clients.openWindow
    ) {

        try {

            const params =
                new URLSearchParams();


            if (data.image) {

                params.set(
                    "image",
                    data.image
                );

            }


            if (data.title) {

                params.set(
                    "title",
                    data.title
                );

            }


            const url =
                VIEWER_PATH +
                "?" +
                params.toString();


            const newClient =
                await self.clients.openWindow(
                    url
                );


            if (
                newClient &&
                "focus" in newClient
            ) {

                try {

                    await newClient.focus();

                }
                catch (error) {

                    console.warn(
                        "new viewer focus failed:",
                        error
                    );

                }

            }

        }
        catch (error) {

            console.warn(
                "viewer open failed:",
                error
            );

        }

    }

}
