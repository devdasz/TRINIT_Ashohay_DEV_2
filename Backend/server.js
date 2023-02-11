const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const corsOptions = require('./config/corsOptions');

const { readdirSync } = require("fs");

dotenv.config();

const app = express();
app.use(express.json());

// app.use(cors(corsOptions));
// app.use(express.static('build'))
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// routes
readdirSync("./routes").map((r) => {
    console.log(r)
    app.use("/", require("./routes/" + r))
}
);
// console.log()


// database
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    })
    .then(() => console.log("database connected successfully"))
    .catch((err) => console.log("error connecting to mongodb", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}..`);
});
