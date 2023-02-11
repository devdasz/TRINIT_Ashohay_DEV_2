// Example CO2 emissions data (replace with real data)
var emissionsData = [
    { server: "Server 1", emissions: 1000 },
    { server: "Server 2", emissions: 2000 },
    { server: "Server 3", emissions: 1500 }
  ];

  // Loop through emissionsData and update the table
  for (var i = 0; i < emissionsData.length; i++) {
    var server = emissionsData[i].server;
    var emissions = emissionsData[i].emissions;
    // document.getElementById("emissions-" + server.toLowerCase().replace(" ", "-")).innerHTML = emissions + " kg CO2e/year";
    var innerHTML  =  ` <tr>
    <td>`+ server + `</td>
    <td >checking</td>
  </tr> `;
    document.getElementById("emissions-table").innerHTML =document.getElementById("emissions-table").innerHTML + innerHTML ;
  }