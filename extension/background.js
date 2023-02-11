const co2_emission_storage = "co2_emission";
const domain_list_storage = "domain_list";


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

    // set domain list
    let domain_list = getLocal(domain_list_storage) == "" ? [] : JSON.parse(getLocal(domain_list_storage))

    console.log(domain_list);   // Only Dev
    // find payload.initiator
    let isMatch = false
    domain_list.map((e) => {
        if (e == payload.initiator)
            isMatch = true
    })

    // if new then add
    if (!isMatch)
        domain_list.push(payload.initiator)

    console.log(domain_list);   // Only Dev

    setLocal(domain_list_storage, JSON.stringify(domain_list))


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
    // console.log("tab close", tabid, removed);   // Only Dev
    console.log("tab close");   // Only Dev

    let saveData = getLocal(co2_emission_storage) == "" ? {} : JSON.parse(getLocal(co2_emission_storage))
    let domain_list = getLocal(domain_list_storage) == "" ? [] : JSON.parse(getLocal(domain_list_storage))


    //incase user not set
    saveData.user_id = saveData.user_id ?? (new Date()).getTime() + (Math.random() + 1).toString(36).substring(7)
    saveData.website_list = saveData.website_list ?? []

    let website_list = [];
    for (let i = 0; i < domain_list.length; i++) {
        const domain_name = domain_list[i];
        // get temp domain object
        let temp_domain_obj = getLocal(domain_name) == "" ? {} : JSON.parse(getLocal(domain_name))

        // if not set skip
        if (temp_domain_obj.initiator == undefined)
            continue

        // add to api request list
        website_list.push({
            initiator: temp_domain_obj.initiator,
            request_count: temp_domain_obj.request_count,
            content_length: temp_domain_obj.content_length
        })
        // add to storage list
        let website_obj_index = -1
        for (let j = 0; j < saveData.website_list.length; j++) {
            if (temp_domain_obj.initiator === saveData.website_list[j].initiator) {
                website_obj_index = j
                break
            }

        }

        //incase new
        if (website_obj_index < 0) {
            saveData.website_list.push({
                initiator: temp_domain_obj.initiator,
                request_count: temp_domain_obj.request_count,
                content_length: temp_domain_obj.content_length
            })
            continue
        }

        // replace with updated data
        let website_obj = saveData.website_list[website_obj_index];
        console.log("OLD ", website_obj.initiator);   // Only Dev
        console.log(temp_domain_obj);   // Only Dev
        website_obj.request_count = (website_obj.request_count ?? 0) + temp_domain_obj.request_count
        website_obj.content_length = (website_obj.content_length ?? 0) + temp_domain_obj.content_length

        console.log(website_obj);   // Only Dev
        saveData.website_list[website_obj_index] = website_obj

        // remove collection
        removeLocal(domain_name)
    }
    removeLocal(domain_list_storage)

    let payload = {
        user_id: saveData.user_id,
        website_list: website_list
    }

    setLocal(co2_emission_storage, JSON.stringify(saveData))
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

function removeLocal(key) {
    localStorage.removeItem(key)
}