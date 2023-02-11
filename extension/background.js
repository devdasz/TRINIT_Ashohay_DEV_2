const co2_emission_storage = "co2_emission";
const domain_list_storage = "domain_list";


chrome.webRequest.onCompleted.addListener
    (
        TrackRequest,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]
    );

var lastMainUrl = "";
function TrackRequest(info) {
    // console.log(info);

    // get content lenght
    let contentLength = 0
    info.responseHeaders.map((e) => {
        if (e.name === 'content-length')
            contentLength = parseInt(e.value)
    })

    // get initiator 
    let url = new URL(info.url)
    let request_count = 0
    let domain = url.protocol + "//" + url.hostname

    if (info.type != 'main_frame' && lastMainUrl === "") {
        //    a request sent by browser, user did not initate
        return
    }

    if (info.type == 'main_frame') {
        //either user's 1st initiate or url bar changed
        // need to change lastMain url as this is new visit
        lastMainUrl = domain
        request_count = 1
    }

    // if (info.type != 'main_frame') {
    //     // url bar is not chaged, this request is a part of previous main frame scrip,
    //     // do not increase request count only add data
    //     url = new URL()
    // }
    // prepare domain
    // let domain = url.protocol + "//" + url.hostname
    // console.log(domain);   // Only Dev
    let payload = {
        initiator: domain,
        content_length: contentLength,
    }
    // console.log(payload);   // Only Dev

    // get object by domain
    let object_by_domain = getLocal(payload.initiator) == "" ? {} : JSON.parse(getLocal(payload.initiator))

    object_by_domain.initiator = payload.initiator
    object_by_domain.request_count = (object_by_domain.request_count ?? 0) + request_count
    object_by_domain.content_length = (object_by_domain.content_length ?? 0) + payload.content_length

    // console.log(object_by_domain);   // Only Dev

    // set domain object 
    setLocal(payload.initiator, JSON.stringify(object_by_domain))

    // set domain list
    let domain_list = getLocal(domain_list_storage) == "" ? [] : JSON.parse(getLocal(domain_list_storage))

    // console.log(domain_list);   // Only Dev
    // find payload.initiator
    let isMatch = false
    domain_list.map((e) => {
        if (e == payload.initiator)
            isMatch = true
    })

    // if new then add
    if (!isMatch)
        domain_list.push(payload.initiator)

    // console.log(domain_list);   // Only Dev

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
    "onclick": get_co2_data,
})

chrome.windows.onRemoved.addListener(function (windowid) {
    alert("window closed")
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

        // 
        // {
        //     "initiator": "https://www.youtube.com",
        //     "daily_request_count": 19,
        //     "daily_content_length": 310023,
        //     "request_count": (new Date()).getDate(),
        //     "content_length": 310023,
        //     "last_update":11022023
        // }
        let current_date = (new Date()).getDate() + 1;
        //incase new
        if (website_obj_index < 0) {
            saveData.website_list.push({
                initiator: temp_domain_obj.initiator,
                last_update: current_date,
                // total
                request_count: temp_domain_obj.request_count,
                content_length: temp_domain_obj.content_length,
                // daily
                daily_request_count: temp_domain_obj.request_count,
                daily_content_length: temp_domain_obj.content_length,
            })
            continue
        }

        // replace with updated data
        let website_obj = saveData.website_list[website_obj_index];
        // console.log("OLD ", website_obj.initiator);   // Only Dev
        console.log(current_date);   // Only Dev
        console.log(website_obj);   // Only Dev
        // total
        website_obj.request_count = (website_obj.request_count ?? 0) + temp_domain_obj.request_count
        website_obj.content_length = (website_obj.content_length ?? 0) + temp_domain_obj.content_length

        // daily
        if (website_obj.last_update != current_date) {
            website_obj.daily_request_count = (website_obj.daily_request_count ?? 0) + temp_domain_obj.request_count
            website_obj.daily_content_length = (website_obj.daily_content_length ?? 0) + temp_domain_obj.content_length
            website_obj.last_update = current_date
        }


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
    send_website_data(payload.user_id, payload.website_list)
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

function send_website_data(user_id, website_list) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        user_id: user_id,
        website_list: website_list
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://ec2-3-110-167-11.ap-south-1.compute.amazonaws.com:5005/web-data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function get_co2_data() {

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
        website_obj.request_count = (website_obj.request_count ?? 0) + temp_domain_obj.request_count
        website_obj.content_length = (website_obj.content_length ?? 0) + temp_domain_obj.content_length

        saveData.website_list[website_obj_index] = website_obj

    }
    console.log(saveData);   // Only Dev
}