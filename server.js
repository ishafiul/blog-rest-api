const express = require("express");
const app = new express();
app.use(express.json());
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))
const port =process.env.PORT || 3000;


const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use("/api/auth",authRoute);
app.use("/api/post",postRoute);
app.use(express.static('upload'));

app.listen(port, () => console.log(`Server is runing at http://localhost:${port}`));