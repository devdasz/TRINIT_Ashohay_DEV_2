const webUsageDatails = require("../models/webUsageDatails.js");
// const webDetails = require("../models/webUsageDetails.js");

exports.getAllwebData = async (req, res) => {
    try {
        const webData = await webUsageDatails.find().sort({totalData:1});
        res.status(200).send({ code: 200, data: webData, msg: " all center fetched successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.postWebData = async (req, res) => {
    try {
        const {
            name,
            url,
            uploadData,
            downloadData
        } = req.body;
        console.log()
        const check = await webUsageDatails.findOne({ url: url });
        if (check) {
            return res.status(400).json({
                message:
                    "The url already exist.",
            });
        }

        // creating acentre
        const webData= await new webUsageDatails({
            name:name,
            url:url,
            uploadData:uploadData,
            downloadData:downloadData,
            totalData:uploadData+downloadData
        }).save();

       return res.status(200).send({code:200,data:{webData:webData},msg:"Successfully inserted"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.putWebData = async (req, res) => {
    try {
        const {
            name,
            url,
            uploadData,
            downloadData
        } = req.body;
        console.log()

        // updataing webdata
        const check = await webUsageDatails.updateOne({ url: url },{
            
                name:name,
                url:url,
                uploadData:uploadData,
                downloadData:downloadData,
                totalData:uploadData+downloadData
            
        });
        
        console.log(check)
       return res.status(200).send({code:200,data:{},msg:"Successfully updated"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}