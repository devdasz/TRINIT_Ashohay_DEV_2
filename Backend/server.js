const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { postWebData, getAllwebData } = require("./controllers/webData");


dotenv.config();
const app = express();
app.use(express.json());

// database
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    })
    .then(() => console.log("database connected successfully"))
    .catch((err) => console.log("error connecting to mongodb", err));


app.get('/', (req, res) => res.send('Hello World!'))
app.post('/', (req, res) => res.send(req.body))
app.post('/web-data',postWebData)
app.get('/web-data',getAllwebData)



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}..`);
});
