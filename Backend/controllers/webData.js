const { calculateCO2 } = require("../helpers/calculateCO2.js");
const webUsageDatails = require("../models/webUsageDatails.js");


exports.getAllwebData = async (req, res) => {
    try {
        const r = await webUsageDatails.find();
        let allWebData=[];
        // console.log(r)

        // for all website
        for(let i=0;i<r.length;i++){
            let webData=r[i];
            console.log("webData--------",webData)
            let avgData=0;
            let noOfuser=webData.usageList.length;
           
            // for all user in the website
            for(let j=0;j<noOfuser;j++){
                let userinfo=webData.usageList[j]
                // console.log("userinfo......",userinfo)
                if(userinfo.requestCount)
                  avgData+=(userinfo.dataUsage/userinfo.requestCount);
                 else{
                    avgData+=0;
                 } 
            }

            // calculating average
            avgData=(avgData/noOfuser).toFixed(4);
            console.log(avgData)
            let type=null

            // type of website based on carbon emission
            if(calculateCO2(avgData/1024)<1.7){
              type="Green"
            }
            if(calculateCO2(avgData/1024)>1.7 && calculateCO2(avgData/1024)<2.7){
                type="Semi-Green"
              }
              if(calculateCO2(avgData/1024)>2.7){
                type="Non-Green"
              }

              // push the object to the array for response
            allWebData.push({
               url:webData.url,
               avgData:avgData?(avgData/1024).toFixed(4):0,
               noOfuser:noOfuser,
               co2:avgData?calculateCO2(avgData/1024):0,
               type:type
            })

        }
        res.status(200).send({ code: 200, data: allWebData, msg: " all url fetched successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.postWebData = async (req, res) => {
    console.log("A")
    try {
        const r = req.body;
        // console.log(r)
        if(r.website_list)
        for(let i=0;i<r.website_list.length;i++){
            let web_details=r.website_list[i];
            // console.log("ok1")
            
            const check = await webUsageDatails.findOne({ url: web_details.initiator});
            console.log("----------check--------"+i+"---"+check)
            //if url already exist
            if (check) {
                console.log("ok"+1)
                // checking user is present or not
                let result = check.usageList.find(({ userId }) => userId ===r.user_id );
                // console.log("result-------",result)
                // console.log("result-------",result.requestCount)
            
                if(result)
                {
                    // if user second time acessing website
                    await webUsageDatails.updateMany(
                        { url :  web_details.initiator,"usageList.userId":r.user_id},
                        { $set: { "usageList.$.requestCount":web_details.request_count+result.requestCount,
                        "usageList.$.dataUsage":web_details.content_length+result.dataUsage,
                        "usageList.$.co2Emission":calculateCO2((web_details.content_length+result.dataUsage)/1024)
                    }
                        }
                    )
                }else{
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
                
            }
            else{
                console.log("----"+i)
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
