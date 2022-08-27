const express = require("express");

const app = express()
app.use(express.json());
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))
const port = process.env.PORT || 3000;

const server = require('http').createServer(app)
const socketIo = require('socket.io')
const Server = socketIo.Server

const io = new Server(server, { cors:{origin:"*"},path: '/api/v1/ws/game1'});


app.use(express.static('uploads'));

const cors = require("cors");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix+ext)
    }
})
const upload = multer({
    storage: storage
})

app.use(
    cors({
        origin: "*"
    })
)


const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const nodemailer = require("nodemailer");
const path = require("path");

app.get('/', (req, res) => {
    res.send('Hello World!')
})

io.on("connection", (socket) => {
    socket.on('message', (data) =>{
        socket.broadcast.emit('message',data)
    })
});



app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.post('/api/editorjsimage', upload.single('image'),(req,res)=>{
    res.status(201).json({
        "success" : 1,
        "file": {
            "url" : "http://localhost:3000/"+req.file.filename,
        }
    });
})

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



app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));