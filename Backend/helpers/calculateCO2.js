// Annual Internet Energy: 1988 TWh
// Annual End User Traffic: 2444 EB
// Annual Internet Energy / Annual End User Traffic = 0.81 tWh/EB or 0.81 kWh/GB
// Carbon factor (global grid): 442 g/kWh
// Carbon factor (renewable energy source): 50 g/kWh

exports.calculateCO2=(data)=>{
    let e=(data*((0.81*1000)/(1024*1024))).toFixed(4)
    let carbon=(e*0.442).toFixed(4);
    return carbon
}

// exports {calculateCO2}