import mongoose from 'mongoose'
import User from './models/User'
import Game from './models/Game'
import { serverInstance, ioInstance } from './expressApp'
import UserGame from './models/UserGame'
import Country from './models/Country'
import Unit from './models/Unit'
import City from './models/City'

const io = ioInstance
const server = serverInstance
const env: NodeJS.ProcessEnv = process.env;
let playerStates: any = {}

const selectRandomColor = () => {
    const vals = [[32, 223], [32, 223], [32, 223]]
    const r = Math.floor(Math.random() * (vals[0][1] - vals[0][0]) + vals[0][0])
    const g = Math.floor(Math.random() * (vals[1][1] - vals[1][0]) + vals[1][0])
    const b = Math.floor(Math.random() * (vals[2][1] - vals[2][0]) + vals[2][0])
    return `rgba(${r}, ${g}, ${b}, 0.25)`;
}

const checkAllPlayersPickedCountry = (game: any) => {
    if (!game || !game.started) return false
    if (game.battlePhase) return true
    for (const userId of Object.keys(playerStates[game.link])) {
        if (playerStates[game.link][userId].spectator) continue

        if (!playerStates[game.link][userId].starterCountry) return false
    }
    return true
}

const initAllPlayerGameStates = async () => {

    const userGames = await UserGame.find().distinct('user').lean();

    const users = await User.find({ _id: { $in: userGames } }).lean();

    for (const user of users) {
        const userGames = await UserGame.find({ user: user._id })
            .populate({ path: 'user', select: '-__v' })
            .populate({ path: 'game', select: '-_id -__v' })
            .populate({ path: 'game.map', select: '-_id -__v' })
            .populate({ path: 'game.creator', select: '-_id -__v' })
            .populate({ path: 'acquiredCities', select: '-_id -__v' })
            .populate({ path: 'acquiredCountries', select: '-_id -__v' })
            .populate({ path: 'starterCountry', select: '-_id -__v' })
            .lean();

        for (const userGame of userGames) {
            const { color, acquiredCities, acquiredCountries, starterCountry, units } = userGame;

            if (!playerStates[userGame.game.link]) {
                playerStates[userGame.game.link] = {};
            }

            playerStates[userGame.game.link][user._id] = {
                user,
                color,
                acquiredCities,
                acquiredCountries,
                starterCountry,
                units,
            };
        }
    }
}


mongoose.connect(
    //`mongodb+srv://${env.DB_USER}:${env.DB_PASS}@cluster0.yymov.mongodb.net/${env.DB_NAME}?retryWrites=true&w=majority`,
    `mongodb://127.0.0.1:27017/${env.DB_NAME}?retryWrites=true&w=majority`,
    {},
    (err: Error) => {
        if (err) {
            throw err;
        }
    }
);

mongoose.connection.once('open', async () => {
    console.log("connection to MongoDB has been established");
    await initAllPlayerGameStates()
    console.log("all player game states have been loaded");

    io.on('connection', async (socket: any) => {
        const session = socket.handshake.session;
        if (!(session && session.passport && session.passport.user)) {
            socket.disconnect(true);
            return
        }

        const userId = session.passport.user
        const user = await User.findById(userId)

        socket.on('joinGameRoom', async (data: any) => {
            const { link, manualJoin } = data;

            if (!link) return;
            let game = await Game.findOne({ link }).populate('creator').lean();
            if (!game) return;

            if(!playerStates[link]) playerStates[link] = {}

            // Check if the user is already in the playerStates
            let userState = playerStates[link][userId];

            if (userState) {
                // If user is already in playerStates, handle accordingly
                if (userState.spectator && !manualJoin) {
                    // User is a spectator and not allowed to join unless manual join is true
                    return socket.emit('infoMessage', `You are a spectator! Press SPACE to join if game not full`);
                } else {
                    // User is already part of the game room, update state and emit events
                    userState.spectator = false; // Ensure user is not marked as a spectator
                    socket.join(link);
                    socket.emit('updatePlayerStates', { playerUserStates: playerStates[link] });
                    socket.broadcast.to(link).emit('playerJoin', { userJoined: userState });
                    io.to(link).emit('importantMessage', `${userState.user.username} has connected`);

                    // Check conditions for all players picked country event
                    if (!game.battlePhase && checkAllPlayersPickedCountry(game)) {
                        io.emit('allPlayersPickedCountry', { creatorName: game.creator.username });
                    }
                    return;
                }
            }
            const randomColor = selectRandomColor()
            // If user is not in playerStates, handle joining logic
            if (Object.keys(playerStates[link]).length >= game.maxPlayersCount) {
                // Game is full
                if (!game.started) {
                    // Game not started, user becomes spectator
                    playerStates[link][userId] = {
                        user,
                        spectator: true,
                        color: randomColor // Assign a random color to spectator
                    };
                    socket.join(link);
                    socket.emit('updatePlayerStates', { playerUserStates: playerStates[link] });
                    socket.emit('infoMessage', `You are now a spectator! Press SPACE to join if game not full`);
                } else {
                    // Game started, cannot join
                    socket.emit('errorMessage', `You cannot join because the game is full and has started`);
                }
            } else {
                // Game is not full, user can join as a player
                playerStates[link][userId] = {
                    user,
                    spectator: false,
                    color: randomColor // Assign a random color to player
                };
                socket.join(link);
                socket.emit('updatePlayerStates', { playerUserStates: playerStates[link] });
                socket.broadcast.to(link).emit('playerJoin', { userJoined: playerStates[link][userId] });
                io.to(link).emit('importantMessage', `${user.username} has connected`);

                // Check conditions for all players picked country event
                if (!game.battlePhase && checkAllPlayersPickedCountry(game)) {
                    io.emit('allPlayersPickedCountry', { creatorName: game.creator.username });
                }
            }
        });

        socket.on('leaveGameRoom', async (data: any) => {
            const { link } = data;

            if (!link || !playerStates[link]) return
            if(!playerStates[link][userId]) return
            socket.leave(link);
            socket.broadcast.to(link).emit('playerLeave', { userLeft: playerStates[link][userId] });

            if (!playerStates[link][userId].spectator) {
                socket.broadcast.to(link).emit('errorMessage',
                    `${playerStates[link][userId].user.username} has disconnected`
                )
            }

            let game = await Game.findOne({ link }).populate('creator').lean()

            if (!game || game.battlePhase) return

            await UserGame.findOneAndDelete({ user, game })
            delete (playerStates[link][userId])

            if (checkAllPlayersPickedCountry(game)) {
                socket.broadcast.to(link).emit('allPlayersPickedCountry', { creatorName: game.creator.username })
            }
        });

        socket.on('changeSettings', async (data: any) => {
            const { link, name, maxPlayersCount, starting } = data;

            if (!link || !playerStates[link]) return
            let gameObject = await Game.findOne({ link }).populate('creator');

            if (gameObject.creator.username != playerStates[link][userId].user.username) {
                io.to(link).emit('errorMessage',
                    `${playerStates[link][userId].user.username} trying to change settings when not the creator`)
                return
            }

            io.to(link).emit('settingsChanged', { name, maxPlayersCount });

            if (starting) return
            io.to(link).emit('infoMessage', `${gameObject.creator.username} has changed the settings!`)
        });

        socket.on('hostStartingGame', async (data: any) => {
            const { link } = data;
            if (!link || !playerStates[link]) return

            let gameObject = await Game.findOne({ link }).populate('creator');
            if (!gameObject) return

            if (Object.keys(playerStates[link]).length > gameObject.maxPlayersCount) {
                io.to(link).emit('errorMessage',
                    `Max players count is exceeded. Can't start game`)
                return
            }
            if (gameObject.creator.username != playerStates[link][userId].user.username) {
                io.to(link).emit('errorMessage',
                    `${playerStates[link][userId].user.username} trying to start game when not the creator`)
                return
            }
            gameObject.started = true
            await gameObject.save()

            io.to(link).emit('gameStarted');
            io.to(link).emit('importantMessage', `${gameObject.creator.username} has started the game!`)

        })

        socket.on('playerPickingCountry', async (data: any) => {

            const { link, name } = data;
            if (!link || !playerStates[link]) return
            if (!playerStates[link][userId]) return
            if (playerStates[link][userId].spectator) return

            let gameObject = await Game.findOne({ link })
                .populate('creator').populate('map').lean();
            if (!gameObject || !gameObject.started) return

            let country = await Country.findOne({ name, mapName: gameObject.map.name }).lean()
            if (!country) return

            let userGameObject = await UserGame.findOne({ user, game: gameObject }).lean()
            if (userGameObject) {
                socket.emit('errorMessage', `You already have a confirmed selected country`)
                return
            }

            let cities = await City.find({ countryName: country.name, mapName: gameObject.map.name }).lean()
            if (!cities) return

            userGameObject = new UserGame({
                user,
                game: gameObject,
                color: playerStates[link][userId].color,
                acquiredCities: cities,
                acquiredCountries: [country],
                starterCountry: country,
                units: []
            })

            playerStates[link][userId].units = []

            const popForUnit = 450000, maxUnits = 10 /// to add to Map model

            cities.forEach((city: any) => {
                const unitsInCity = {
                    city,
                    userGame: userGameObject,
                    numberOfUnits: Math.ceil((city.pop_max / popForUnit)) < maxUnits ?
                        Math.ceil((city.pop_max / popForUnit)) : maxUnits
                }
                playerStates[link][userId].units.push(unitsInCity)
                new Unit(unitsInCity).save()
            })

            playerStates[link][userId].game = gameObject
            playerStates[link][userId].acquiredCities = cities
            playerStates[link][userId].acquiredCountries = [country]
            playerStates[link][userId].starterCountry = country

            await userGameObject.save()

            io.to(link).emit('countryPicked', {
                id: userId,
                color: userGameObject.color,
                starterCountry: country.name,
                acquiredCities: playerStates[link][userId].acquiredCities,
                acquiredCountries: playerStates[link][userId].acquiredCountries,
                units: playerStates[link][userId].units
            })
            io.to(link).emit('infoMessage', `${user.username} has chosen ${country.name}`)

            if (!gameObject.battlePhase && checkAllPlayersPickedCountry(gameObject)) {
                io.to(link).emit('allPlayersPickedCountry', { creatorName: gameObject.creator.username })
            }
        })

        socket.on('beginBattlePhase', async (data: any) => {
            const { link } = data
            if (!link || !playerStates[link]) return

            let game = await Game.findOne({ link }).populate('creator')
            if (!game || game.battlePhase || !game.started) return
            if (game.creator.username != playerStates[link][userId].user.username) return

            game.battlePhase = true
            await game.save()

            io.to(link).emit('startBattlePhase')

        })

    })

    server.listen(env.SERVER_PORT, () => {
        return console.log(`server is listening on http://${env.SERVER_NAME}:${env.SERVER_PORT}`);
    })
})




