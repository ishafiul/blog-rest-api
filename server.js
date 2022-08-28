const express = require("express");
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server,{cors:{origin:'*'}});
app.use(express.json());
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))
const port = process.env.PORT || 3000;





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
const {removeUser, addUser, getUsers, getUser} = require("./localdb/socket_user");

app.get('/', (req, res) => {
    res.send('Hello World!')
})

///game
const gameList = []
const threexgame = io.of('/api/v1/games/3x')
threexgame.on('connection', function(client) {
    const clientId = client.id

    client.on('disconnect', (client) => {
        removeUser(client.id);
    })

    client.on('message', (data) =>{
        client.broadcast.emit('message',data)
    })

    client.on('join', ({name}) => {
        const { error, user } = addUser({ id: client.id, name });
        if (error) {
            client.emit('error', {message: error})
        }
        else {
            client.emit('userInfo', user);
        }

    })

    client.on('create' ,()=>{
        const userInfo = getUser(clientId);
        if (userInfo){
            const mainNumbers = [4, 9, 2, 3, 5, 7, 8, 1, 6]
            const mainResult = 15;

            const random = randomNumber()
            const newNumbers = []
            const newResult = Math.pow(random, mainResult);
            for (let number of mainNumbers) {
                const ne = Math.pow(random, number)
                newNumbers.push(ne)

            }

            const newGameData = {
                id: Math.floor(1000 + Math.random() * 9000),
                players: [
                    {
                        id: client.id,
                        userName: userInfo.name,
                        isTurn: true,
                        picketNumbers: []
                    }
                ],
                numbers: newNumbers,
                result: newResult,
                status: 'active',
                createdAt: new Date()
            }
            gameList.push(newGameData)
            sendAvailableGameToAll()
        }

    })
});


function randomNumber() {
    let range = {min: 2, max: 9}
    let delta = range.max - range.min

    return Math.round(range.min + Math.random() * delta)
}
async function sendAvailableGameToAll() {
    let availGames = []
    let playinRightNow = []
    for (let game of gameList) {
        if (game.status === 'active') {
            if (game.players.length === 1) {
            }
            availGames.push(game)
        }
        if (game.status === 'running') {
            for (let player of game.players) {
                playinRightNow.push(player.id)
            }
        }

    }
    threexgame.emit('gamesAvailResponse',availGames)
}




//////////////////////////////////////////////////////

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



server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));