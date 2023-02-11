chrome.webRequest.onCompleted.addListener
    (
        TrackRequest,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]
    );


function TrackRequest(info) {
    console.log(info);

    // get content lenght
    let contentLength = 0
    info.responseHeaders.map((e) => {
        if (e.name === 'content-length')
            contentLength = parseInt(e.value)
    })

    // get initiator 
    let url = new URL(info.url)
    if (info.type != 'main_frame') {
        url = new URL(info.initiator)
    }
    // prepare domain
    let domain = url.protocol + "//" + url.hostname
    // console.log(domain);   // Only Dev
    let payload = {
        initiator: domain,
        content_length: contentLength,
    }
    // console.log(payload);   // Only Dev

    // get object by domain
    let object_by_domain = getLocal(payload.initiator) == "" ? {} : JSON.parse(getLocal(payload.initiator))

    object_by_domain.initiator = payload.initiator
    object_by_domain.request_count = (object_by_domain.request_count ?? 0) + 1
    object_by_domain.content_length = (object_by_domain.content_length ?? 0) + payload.content_length

    console.log(object_by_domain);   // Only Dev

    // set domain object 
    setLocal(payload.initiator, JSON.stringify(object_by_domain))


    // setLocal("iiii", "me")
}


//  ############ test ############ \\ 
function OnClickShare(info, tab) {
    let user_id = getLocal("user_id") ?? (new Date()).getTime() + (Math.random() + 1).toString(36).substring(7)

    console.log('clicked on page: ', info, tab);   // Only Dev
    console.log({ user_id: user_id });   // Only Dev
}


chrome.contextMenus.create({
    "title": "share",
    "contexts": ["page"],
    "onclick": OnClickShare,
})


chrome.tabs.onRemoved.addListener(function (tabid, removed) {
    console.log("tab close", tabid, removed);   // Only Dev
})


function setLocal(key, value) {
    // let payload = {}
    // payload[key] = value
    // // chrome.storage.local.set(payload)
    // chrome.storage.sync.set({ key: value }).then(() => {
    //     console.log("Value is set to " + value);
    // });
    localStorage.setItem(key, value)

}

function getLocal(key) {
    let value = ""
    value = localStorage.getItem(key) ?? ""
    // value = await chrome.storage.local.get([key]) ?? ""
    return value
}