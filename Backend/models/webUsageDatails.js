const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const webUsageDetails = mongoose.Schema(
    {

        url: {
            type: String,
        },
        usageList :{
            type:Array
        }
      
        
    }
);

module.exports = mongoose.model("webUsageDetails", webUsageDetails);