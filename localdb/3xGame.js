const gameList = []

const removeTimeoutGames = () => {
    if (gameList.length >= 1) {
        const expGame = gameList.findIndex((game) => {
            if (new Date() > new Date(game.createdAt.getTime() + 10 * 60000)) {
                return game;
            }
        });
        if (expGame !== -1) {
            gameList.splice(gameList.indexOf(expGame), 1);
            return true;
        }
    }
    return false;
}

const createNewGame = ({clientId, playerName}) => {
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
                id: clientId,
                userName: playerName,
                isTurn: true,
                picketNumbers: []
            }
        ],
        numbers: newNumbers,
        result: newResult,
        status: 'active',
        createdAt: new Date()
    }
    return !!gameList.push(newGameData);
}

const findGameById = (id) => {
    const game = gameList.findIndex((data) => {
        if (data.id === parseInt(id)) {
            return data;
        }
    });
    if (game !== -1) {
        return gameList[game];
    }
}

const findGameByPlayerId = (id) => {
    let game;
    gameList.findIndex((data) => {
        data.players.findIndex((player) => {
            if (player.id === id) {
                game = data;
            }
        })
    });
    return game;
}

const getAvailableGames = () => {
    let availGames = []
    for (let game of gameList) {
        if (game.status === 'active') {
            if (game.players.length === 1) {
            }
            availGames.push(game)
        }
    }
    return availGames;
}

function removeGameById(id) {
    const index = gameList.findIndex((game) => {
        if (game.id === id){
            return game;
        }
    });
    if(index !== -1) {
        return gameList.splice(index,1)[0];
    }
}

const removeUserDisconnectedGame = (playerId) => {
    const game = findGameByPlayerId(playerId)
    let isGameFound = false
    let opponentId = ''
    if (game) {
        isGameFound = true
        let playersId = [];

        game.players.forEach((player)=>{
            playersId.push(player.id)
        })

        playersId.forEach((id)=>{
            if (id !== playerId){
                opponentId = id
            }
        })
        removeGameById(game.id);
    }
    return {opponentId,isGameFound}
}

const changeGameStatus = ({gameId, gameStatus}) => {
    const gameIndex = gameList.indexOf(findGameById(gameId));
    gameList[gameIndex].status = gameStatus
}

const joinGame = ({userInfo,gameId}) => {
    const gameIndex = gameList.indexOf(findGameById(gameId));
    let error = null
    let game
    if (gameIndex !== -1){

        if (gameList[gameIndex].players.length >= 2){
            error = "game lobby full! you cant join this game."
            return {error}
        }
        else {
            gameList[gameIndex].players.push(
                {
                    id: userInfo.id,
                    userName: userInfo.name,
                    isTurn: false,
                    picketNumbers: []
                }
            )
            gameList[gameIndex].status = 'running'
            game = gameList[gameIndex]

        }
    }
    return {game,error}
}

const getPlayersIdFromGame = (gameId) =>{
    const game = findGameById(gameId);

    let playersId =[]

    game.players.forEach((player)=>{
        playersId.push(player.id)
    })
    return playersId;
}

const findGameByPlayerIdIsRunning = (playerId) =>{
    const game = findGameByPlayerId(playerId)
    if (game && game.status !== 'finished'){
        return game;
    }
}

const updatePickedNumbers = ({playerId, pickedNumber}) =>{
    const number = parseInt(pickedNumber)
    const gameIndex = gameList.indexOf(findGameByPlayerId(playerId));
    const playerIndex = gameList[gameIndex].players.findIndex((player)=>{
        return player.id === playerId
    });
    let playersId = []

    gameList[gameIndex].players[playerIndex].picketNumbers.push(number)
    gameList[gameIndex].numbers[gameList[gameIndex].numbers.indexOf(number)] = 0
    gameList[gameIndex].players[0].isTurn = !gameList[gameIndex].players[0].isTurn
    gameList[gameIndex].players[1].isTurn = !gameList[gameIndex].players[1].isTurn

    return {game: gameList[gameIndex], playersId};

}

function randomNumber() {
    let range = {min: 2, max: 9}
    let delta = range.max - range.min

    return Math.round(range.min + Math.random() * delta)
}

module.exports = {
    removeTimeoutGames,
    getAvaoilableGames: getAvailableGames,
    createNewGame,
    findGameById,
    changeGameStatus,
    findGameByPlayerId,
    removeUserDisconnectedGame,
    joinGame,
    updatePickedNumbers,
    getPlayersIdFromGame,
    findGameByPlayerIdIsRunning
};