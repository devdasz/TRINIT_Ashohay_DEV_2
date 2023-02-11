chrome.webRequest.onCompleted.addListener
    (
        TrackRequest,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]
    );


function TrackRequest(info) {
    console.log(info);
}


//  ############ test ############ \\ 
function OnClickShare(info, tab) {
    console.log('clicked on page: ', info, tab);   // Only Dev
}


chrome.contextMenus.create({
    "title": "share",
    "contexts": ["page"],
    "onclick": OnClickShare,
})