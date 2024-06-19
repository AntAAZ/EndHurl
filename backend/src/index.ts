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

const updatePlayerUserState = async (userId: any, link?: any) => {
    const user = await User.findById(userId)
    if (!user) return
    playerStates[userId] = {
        ...playerStates[userId],
        user: {
            _id: userId,
            username: user.username,
            loc: user.loc,
            bio: user.bio,
            avatar: user.avatar
        }
    }
}
const selectRandomColor = () => {
    const vals = [[32, 96], [64, 192], [128, 192]]
    const r = Math.floor(Math.random() * (vals[0][1] - vals[0][0]) + vals[0][0])
    const g = Math.floor(Math.random() * (vals[1][1] - vals[1][0]) + vals[1][0])
    const b = Math.floor(Math.random() * (vals[2][1] - vals[2][0]) + vals[2][0])
    return `rgba(${r}, ${g}, ${b}, 0.25)`;
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

mongoose.connection.once('open', () => {
    console.log("connection to MongoDB has been established");

    io.on('connection', (socket: any) => {
        const session = socket.handshake.session;
        if (session && session.passport && session.passport.user) {
            const userId = session.passport.user
            if (!userId) {
                socket.disconnect(true)
            }
            if (!playerStates[userId]) {
                updatePlayerUserState(userId)
            }

        } else {
            socket.disconnect(true);
        }

        socket.on('checkGameStarted', async (data: any) => {
            const { link } = data;
            const userId: any = session.passport.user
            await updatePlayerUserState(userId)

            const game = await Game.findOne({ link }).lean()
            playerStates[userId].acquiredCities = []
            playerStates[userId].acquiredCountries = []
            if (!game || !game.started) return

            const user = await User.findById(userId)
            let userGame = await UserGame.findOne({ user, game }).lean()
            if (userGame) return

            socket.join(link)
            playerStates[userId].spectator = true

            socket.emit('updatePlayerStates', { playerUserStates: playerStates })
            socket.emit('infoMessage', `You are now spectator! Press SPACE to join if game not full`)
        })

        socket.on('joinGameRoom', async (data: any) => {
            const { link } = data;
            let userId: any = session.passport.user

            await updatePlayerUserState(userId)

            if (playerStates[userId].spectator) return

            let user = await User.findById(userId)
            let game = await Game.findOne({ link }).lean()
            let userGame = await UserGame.findOne({ user, game })
                .populate({ path: 'acquiredCities', select: '-_id -__v' })
                .populate({ path: 'acquiredCountries', select: '-_id -__v' }) 
                .populate({ path: 'starterCountry', select: '-_id -__v' }).lean()

            playerStates[userId].color = selectRandomColor()
            if (userGame) {
                playerStates[userId] = {
                    ...playerStates[userId],
                    color: userGame.color,
                    acquiredCities: userGame.acquiredCities,
                    acquiredCountries: userGame.acquiredCountries,
                    starterCountry: userGame.starterCountry,
                    units: userGame.units
                };
            }
            socket.join(link);
            playerStates[userId].spectator = false
            socket.emit('updatePlayerStates', { playerUserStates: playerStates })
            socket.broadcast.to(link).emit('playerJoin', { userJoined: playerStates[userId] });

            io.to(link).emit('importantMessage', `${playerStates[userId].user.username} has connected`)
        });

        socket.on('leaveGameRoom', async (data: any) => {
            const { link } = data;
            let userId: any = session.passport.user
            socket.leave(link);
            socket.broadcast.to(link).emit('playerLeave', { userLeft: playerStates[userId] });
            if (!playerStates[userId].spectator) {
                socket.broadcast.to(link).emit('errorMessage',
                    `${playerStates[userId].user.username} has disconnected`
                )
            }
            delete (playerStates[userId])
        });

        socket.on('changeSettings', async (data: any) => {
            const { link, name, maxPlayersCount } = data;
            let userId: any = session.passport.user
            await updatePlayerUserState(userId)

            let gameObject = await Game.findOne({ link }).populate('creator');

            if (gameObject.creator.username != playerStates[userId].user.username) {
                io.to(link).emit('errorMessage',
                    `${playerStates[userId].user.username} trying to change settings when not the creator`)
                return
            }

            io.to(link).emit('settingsChanged', {
                name, maxPlayersCount
            });
            io.to(link).emit('infoMessage', `${gameObject.creator.username} has changed the settings!`)
        });

        socket.on('hostStartingGame', async (data: any) => {
            const { link } = data;
            let userId: any = session.passport.user
            await updatePlayerUserState(userId)

            let gameObject = await Game.findOne({ link }).populate('creator');

            if (gameObject.creator.username != playerStates[userId].user.username) {
                io.to(link).emit('errorMessage',
                    `${playerStates[userId].user.username} trying to start game when not the creator`)
                return
            }
            gameObject.started = true
            await gameObject.save()

            io.to(link).emit('gameStarted');
            io.to(link).emit('importantMessage', `${gameObject.creator.username} has started the game!`)

        })

        socket.on('playerPickingCountry', async (data: any) => {

            const { link, name } = data;
            console.log(data)
            let userId: any = session.passport.user
            await updatePlayerUserState(userId)

            let gameObject = await Game.findOne({ link }).populate('map').lean();
            if (!gameObject || !gameObject.started) return

            let country = await Country.findOne({ name, mapName: gameObject.map.name }).lean()
            if (!country) return


            const user = await User.findById(userId)
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
                color: playerStates[userId].color,
                acquiredCities: [...playerStates[userId].acquiredCities, ...cities],
                acquiredCountries: [...playerStates[userId].acquiredCountries, country],
                starterCountry: country,
                units: []
            })
            playerStates[userId].units = []
            const popForUnit = 450000, maxUnits = 10 /// to add to Map model
            cities.forEach((city: any) => {
                let unitsInCity = {
                    city,
                    userGame: userGameObject,
                    numberOfUnits: Math.ceil((city.pop_max / popForUnit)) < maxUnits ?
                        Math.ceil((city.pop_max / popForUnit)) : maxUnits
                }
                playerStates[userId].units.push(unitsInCity)
                new Unit(unitsInCity).save()
            })

            playerStates[userId].game = gameObject
            playerStates[userId].acquiredCities = [ ...playerStates[userId].acquiredCities, cities ]
            playerStates[userId].acquiredCountries = [
                ...playerStates[userId].acquiredCountries, country
            ]
            playerStates[userId].starterCountry = country

            await userGameObject.save()

            io.to(link).emit('countryPicked', {
                id: userId,
                color: userGameObject.color,
                starterCountry: country.name,
                acquiredCities: playerStates[userId].acquiredCities,
                acquiredCountries: playerStates[userId].acquiredCountries,
                units: playerStates[userId].units
            })
            io.to(link).emit('infoMessage', `${user.username} has chosen ${country.name}`)
        })
    })
    server.listen(env.SERVER_PORT, () => {
        return console.log(`server is listening on http://${env.SERVER_NAME}:${env.SERVER_PORT}`);
    })
})




