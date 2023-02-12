
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

    fetch(server_end_point + "/web-data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function cleanup_database() {
    console.log("+++++++++++++++++++++++++++");   // Only Dev
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

        let current_date = (new Date()).getDate();
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
        // total
        website_obj.request_count = (website_obj.request_count ?? 0) + temp_domain_obj.request_count
        website_obj.content_length = (website_obj.content_length ?? 0) + temp_domain_obj.content_length

        // daily
        if (website_obj.last_update != current_date) {
            website_obj.daily_request_count = (website_obj.daily_request_count ?? 0) + temp_domain_obj.request_count
            website_obj.daily_content_length = (website_obj.daily_content_length ?? 0) + temp_domain_obj.content_length
            website_obj.last_update = current_date
        }


        saveData.website_list[website_obj_index] = website_obj

        // remove collection
        setLocal(domain_name, "")
    }
    setLocal(domain_list_storage, "")

    let payload = {
        user_id: saveData.user_id,
        website_list: website_list
    }

    setLocal(co2_emission_storage, JSON.stringify(saveData))
    send_website_data(payload.user_id, payload.website_list)
}

console.log("++++++++++++++++====");   // Only Dev

cleanup_database()
let obj = get_co2_data();

let dailyDataConbined = 0;
let totalDataConbined = 0;
for (let i = 0; i < obj.website_list.length; i++) {
    const element = obj.website_list[i];

    dailyDataConbined += element.daily_content_length ?? 0;
    totalDataConbined += element.content_length ?? 0;
}
let temp = dailyDataConbined / (1024 * 1024)
let dailyDataCO2Conbined = ((temp * 0.81) / 1024);
console.log(dailyDataCO2Conbined);   // Only Dev

document.getElementById("daily-data-combined").innerHTML = (dailyDataConbined / (1024 * 1024)).toFixed(3).toString()
document.getElementById("daily-co2-combined").innerHTML = dailyDataCO2Conbined
document.getElementById("total-data-combined").innerHTML = (totalDataConbined / (1024 * 1024 * 1024)).toFixed(3).toString()



document.getElementById("open-dashboard-page").addEventListener("click", function () {
    window.open("dashboard.html");
});