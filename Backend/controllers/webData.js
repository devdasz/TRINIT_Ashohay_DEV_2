const { calculateCO2 } = require("../helpers/calculateCO2.js");
const webUsageDatails = require("../models/webUsageDatails.js");


exports.getAllwebData = async (req, res) => {
    try {
        const webData = await webUsageDatails.find();
        res.status(200).send({ code: 200, data: webData, msg: " all url fetched successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.postWebData = async (req, res) => {
    console.log("A")
    try {
        const r = req.body;
        console.log(r)
        if(r.website_list)
        for(let i=0;i<r.website_list.length;i++){
            let web_details=r.website_list[i];
            console.log("ok1")
            const check = await webUsageDatails.findOne({ url: web_details.initiator});
            //if url already exist
            if (check) {
                console.log("ok2")
                await webUsageDatails.updateMany(
                    { url :  web_details.initiator},
                    { $push: { usageList : {
                        userId:req.body.user_id,
                        requestCount:web_details.request_count,
                        dataUsage:web_details.content_length,
                        co2Emission:calculateCO2(web_details.content_length/1024)
                    }}
                    }
                )
            }
            else{
                // creating a url for first time
                let tempobj={
                    userId:req.body.user_id,
                    requestCount:web_details.request_count,
                    dataUsage:web_details.content_length,
                    co2Emission:calculateCO2(web_details.content_length/1024)
                }
                let tempArray=[]
                tempArray.push(tempobj);
                const webData= await new webUsageDatails({
                    url:web_details.initiator,
                    usageList:tempArray
                }).save();
            }
            
        }
       
       return res.status(200).send({code:200,data:{},msg:"Successfully inserted"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
