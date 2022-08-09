const express = require("express");

const app = express()
app.use(express.json());
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))
const port = process.env.PORT || 3000;

const server = require('http').createServer(app)
const WebSocket = require('ws');
const ws = new WebSocket.Server({server: server, path: "api/ws/game1"})


const cors = require("cors");

app.use(
    cors({
        origin: "*"
    })
)


const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const nodemailer = require("nodemailer");

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.post('/api/mail', (req, res) => {
        const nodemailer = require("nodemailer");
        try{
            async function main() {
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: '17182103210@cse.bubt.edu.bd',
                        pass:  process.env.MAIL_PASS
                    },
                });

                await transporter.sendMail({
                    from: req.body.sender,
                    to: "shafiulislam20@gmail.com",
                    subject: "Portfolio - "+req.body.name+' - ' + req.body.subject,
                    text: req.body.message + ' ' + req.body.sender ,
                    html: req.body.message + ' ' + req.body.sender,
                });
            }

            main().catch(console.error);
            const respons = {
                message: 'Message Send!'
            }
            res.status(200).json(respons);
        }
        catch (e){
            res.status(500).json(e);
        }

    }
)

app.use(express.static('upload'));

app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));