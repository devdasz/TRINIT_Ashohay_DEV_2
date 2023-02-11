const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const webUsageDetails = mongoose.Schema(
    {

        url: {
            type: String,
            // required: [true, "url is Required"],
            // trim: true,
            // text: true,
            // unique:true,
        },
        usageList :{
            type:Array
        }
        // uploadData: {
        //     type: Number,
        //     required: [true, "upload data required"],
        //     trim: true,
        // },
        // downloadData: {
        //     type: Number,
        //     required: [true, "download data required"],
        //     trim: true,
        // },
        // dataConsumed: {
        //     type: Number,
        //     required: [true, "download data required"],
        //     trim: true,
        // },
        // noOfUser:{
        //     type: Number,
        //     required: [true, "no of user required"],
        //     trim: true,
        // }
        
        

    }
);

module.exports = mongoose.model("webUsageDetails", webUsageDetails);