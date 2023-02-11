// Example CO2 emissions data (replace with real data)
const co2_emission_storage = "co2_emission";
const domain_list_storage = "domain_list";

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
  return saveData
}

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

function calculateCO2(data) {
  let e = (data * ((0.81 * 1000) / (1024 * 1024))).toFixed(4)
  let carbon = (e * 0.442).toFixed(4);
  return carbon
}

let obj = get_co2_data()




// var emissionsData = [
//   { server: "Server 1", emissions: 1000 },
//   { server: "Server 2", emissions: 2000 },
//   { server: "Server 3", emissions: 1500 }
// ];
console.log(obj);
console.log() // Only Dev
var emissionsData = [];
let totalDailyData = 0;
for (let i = 0; i < obj.website_list.length; i++) {
  const element = obj.website_list[i];
  emissionsData.push({
    server: element.initiator,
    emissions: element.content_length
  })
  totalDailyData += element.content_length
}

// Loop through emissionsData and update the table
for (var i = 0; i < emissionsData.length; i++) {
  var server = emissionsData[i].server;
  var emissions = emissionsData[i].emissions * 0.85
  var emissions = calculateCO2(emissionsData[i].emissions / 1024)
  // document.getElementById("emissions-" + server.toLowerCase().replace(" ", "-")).innerHTML = emissions + " kg CO2e/year";
  var innerHTML = ` <tr>
  <td>`+ server + `</td>
  <td >`+ emissions + `</td>
</tr> `;
  document.getElementById("emissions-table").innerHTML = document.getElementById("emissions-table").innerHTML + innerHTML;
}

document.getElementById("totalDaily").innerHTML = calculateCO2(totalDailyData / 1024).toString()