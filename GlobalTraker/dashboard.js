
// var requestOptions = {
//     method: 'GET',
//     redirect: 'follow'
//   };
  
//   fetch("http://ec2-3-110-167-11.ap-south-1.compute.amazonaws.com:5001/web-data", requestOptions)
//     .then(response => response.json)
//     .then(result => showData(result))
//     .catch(error => console.log('error', error));

    async function getData() {
        let url = 'http://ec2-3-110-167-11.ap-south-1.compute.amazonaws.com:5001/web-data';
        try {
            let res = await fetch(url);
            return await res.json();
        } catch (error) {
            console.log(error);
        }
    }
    async function renderUsers() {
        let data = await getData();
        let html;
        console.log(data.data);
        servers = data.data;
        servers.forEach(serverInfo => {
            let htmlSegment = `    <div class="data">
            <div class="dataCommon dataCol1">${serverInfo.url}</div>
            <div class="dataCommon dataCol2">${serverInfo.noOfuser} Users visited</div>
            <div class="dataCommon dataCol3"> ${serverInfo.avgData}KB/ visit</div>
            <div class="dataCommon dataCol4"> ${serverInfo.co2}g CO2</div>
            <div class="dataCommon dataCol5"> ${serverInfo.type}</div>
        </div>`
        html += htmlSegment;
            
        });
         let container = document.getElementById("domaindata");
        container.innerHTML =html;
        // users.forEach(user => {
        //     let htmlSegment = `<div class="user">
        //                         <img src="${user.profileURL}" >
        //                         <h2>${user.firstName} ${user.lastName}</h2>
        //                         <div class="email"><a href="email:${user.email}">${user.email}</a></div>
        //                     </div>`;
    
        //     html += htmlSegment;
        // });
    
        // let container = document.querySelector('.container');
        // container.innerHTML = html;
    }
    renderUsers();