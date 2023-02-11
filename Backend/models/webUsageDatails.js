const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const webUsageDetails = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is Required"],
            trim: true,
            text: true,
        },
        url: {
            type: String,
            required: [true, "role is Required"],
            trim: true,
            text: true,
            unique:true,
        },
        uploadData: {
            type: Number,
            required: [true, "upload data required"],
            trim: true,
        },
        downloadData: {
            type: Number,
            required: [true, "download data required"],
            trim: true,
        },
        totalData: {
            type: Number,
            required: [true, "download data required"],
            trim: true,
        },
        
        

    }
);

module.exports = mongoose.model("webUsageDetails", webUsageDetails);