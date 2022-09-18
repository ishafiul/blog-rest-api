const express = require("express");
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(express.json());

app.set('view engine', 'ejs');


require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))
const port = process.env.PORT || 3000;


app.use(express.static('uploads'));
app.use(express.static('views'));

const cors = require("cors");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    }, filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})
const upload = multer({
    storage: storage
})

app.use(cors({
    origin: "*"
}))


const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const path = require("path");
const { removeUser, addUser, getUsers, getUser } = require("./localdb/socket_user");
const {
    removeTimeoutGames, getAvaoilableGames, createNewGame, changeGameStatus, findGameByPlayerId,
    removeUserDisconnectedGame, joinGame, updatePickedNumbers, getPlayersIdFromGame, findGameByPlayerIdIsRunning
} = require("./localdb/3xGame");

app.get('/', (req, res) => {
    res.send('Hello World!')
})
let macIds = []
app.get('/meetmedisable', (req, res) => {
    let mac = req.query.mac;
    let clear = req.query.clear
    if(clear){
        macIds = [] 
        res.status(200).json({
            "status": true,
            macIds
        });
    }
    if(!clear){
        if (mac && macIds.length <= 1) {
            if(!macIds.includes(mac)){
                macIds.push(mac.toString())
            }
            res.status(200).json({
                "status": true,
                macIds
            });
        }
        if(macIds.length == 1){
            res.status(400).json({
                "status": false,
                macIds
            });
        }
    }
    res.status(200).json({
        macIds
    });
    
})
///game
const threexgame = io.of('/api/v1/games/3x')
app.get('/games/3x', (req, res) => {
    res.render('index')
})
threexgame.on('connection', function (client) {
    client.on('disconnect', (client) => {
        setTimeout(() => {
            removeUser(client.id);
            const { opponentId, isGameFound } = removeUserDisconnectedGame(client.id);
            if (isGameFound) {
                sendAvailableGamesToAll();
                if (opponentId !== '') {
                    console.log(opponentId)
                    threexgame.to(opponentId).emit('error', { message: "opponent disconnected!" })
                }
            }
        }, 300)

    })

    setInterval(() => {
        if (removeTimeoutGames()) {
            sendAvailableGamesToAll();
        }
    }, 300)


    client.on('message', (data) => {
        client.broadcast.emit('message', data)
    })

    client.on('join', ({ name }) => {
        const { error, user } = addUser({ id: client.id, name });
        if (error) {
            client.emit('error', { message: error })
        } else {
            client.emit('userInfo', user);
            setTimeout(() => {
                sendAvailableGamesToClient(client.id);
            }, 300)
        }

    })

    client.on('create', () => {
        const userInfo = getUser(client.id);
        if (userInfo) {
            if (!findGameByPlayerIdIsRunning(client.id)) {
                if (createNewGame({ clientId: client.id, playerName: userInfo.name })) {
                    setTimeout(() => {
                        sendPlayingRightNowGame({ clientId: client.id })
                    }, 300)

                    sendAvailableGamesToAll();
                } else {
                    client.emit('error', { message: 'Something wrong! cant create new game.' })
                }
            } else {
                client.emit('error', { message: 'you are already in a game!' })
            }
        } else {
            client.emit('error', { message: 'you are not logged in!' })
        }
    })

    client.on('joinGame', ({ gameId }) => {
        const userInfo = getUser(client.id);
        const { error, game } = joinGame({ userInfo: userInfo, gameId })
        if (error != null) {
            client.emit('error', { message: error })
        } else {
            sendPlayingRightNowGame({ clientId: client.id })
            sendAvailableGamesToAll()
        }

    })

    client.on('picked', ({ pickedNumber }) => {
        updatePickedNumbers({ playerId: client.id, pickedNumber })
        sendPlayingRightNowGame({ clientId: client.id })
    })

    client.on('gameFinished', ({ gameId, name }) => {
        changeGameStatus({ gameId: gameId, gameStatus: "finished" })
        const players = getPlayersIdFromGame(gameId)
        let winState
        if (name === 'Draw!') {
            winState = "Draw"
        }
        else {
            winState = `${name} Win The Game`
        }
        if (players[0] !== client.id) {
            threexgame.to(players[0]).emit('gamesFinish', { winState })
            sendAvailableGamesToAll()
        }
        else {
            threexgame.to(players[1]).emit('gamesFinish', { winState })
            sendAvailableGamesToAll()
        }

    })
});


function sendAvailableGamesToAll() {
    threexgame.emit('gamesAvailable', getAvaoilableGames())
}

function sendAvailableGamesToClient(id) {
    threexgame.to(id).emit('gamesAvailable', getAvaoilableGames())
}

function sendPlayingRightNowGame({ clientId }) {
    const game = findGameByPlayerId(clientId)
    if (game) {
        if (game.players.length > 1) {
            game.players.forEach((player) => {
                threexgame.to(player.id).emit('playingRightNowMe', game)
            })
        }
        else {
            threexgame.to(clientId).emit('playingRightNowMe', game)
        }
    }

}


//////////////////////////////////////////////////////

app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.post('/api/editorjsimage', upload.single('image'), (req, res) => {
    res.status(201).json({
        "success": 1, "file": {
            "url": "http://localhost:3000/" + req.file.filename,
        }
    });
})

app.post('/api/mail', (req, res) => {
    const nodemailer = require("nodemailer");
    try {
        async function main() {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com", port: 587, secure: false, auth: {
                    user: '17182103210@cse.bubt.edu.bd', pass: process.env.MAIL_PASS
                },
            });

            await transporter.sendMail({
                from: req.body.sender,
                to: "shafiulislam20@gmail.com",
                subject: "Portfolio - " + req.body.name + ' - ' + req.body.subject,
                text: req.body.message + ' ' + req.body.sender,
                html: req.body.message + ' ' + req.body.sender,
            });
        }

        main().catch(console.error);
        const respons = {
            message: 'Message Send!'
        }
        res.status(200).json(respons);
    } catch (e) {
        res.status(500).json(e);
    }

})


server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));