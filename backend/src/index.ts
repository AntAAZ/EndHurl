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
let neutralCitiesUnitState: any;

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
            const { color, acquiredCities, acquiredCountries, starterCountry } = userGame;

            let units = await Unit.find({ userGame })
                .populate({ path: 'city', select: '-__v' })
                .populate({ path: 'game', select: '-_id -__v' })
                .lean()
            if (!units) units = []

            //console.log(units)

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
const updatePlayerGameStates = async (userGamesParam: any) => {
    const userGames = await UserGame.find({ _id: { $in: userGamesParam } })
        .populate({ path: 'user', select: '-password -__v' })
        .populate({ path: 'game', select: '-_id -__v' })
        .populate({ path: 'game.map', select: '-_id -__v' })
        .populate({ path: 'game.creator', select: '-_id -__v' })
        .populate({ path: 'acquiredCities', select: '-_id -__v' })
        .populate({ path: 'acquiredCountries', select: '-_id -__v' })
        .populate({ path: 'starterCountry', select: '-_id -__v' })
        .lean();

    const userGameIds = userGames.map(userGame => userGame._id);
    const units = await Unit.find({ userGame: { $in: userGameIds } })
        .populate({ path: 'city', select: '-__v' })
        .populate({ path: 'game', select: '-_id -__v' })
        .populate({
            path: 'userGame',
            populate: {
                path: 'user',
                select: '-password -__v'
            }
        })
        .lean();

    const unitsByUserGame = units.reduce((acc, unit) => {
        if (!acc[unit.userGame._id]) {
            acc[unit.userGame._id] = [];
        }
        acc[unit.userGame._id].push(unit);
        return acc;
    }, {});

    userGames.forEach(userGame => {
        const { color, acquiredCities, acquiredCountries, starterCountry, user, game } = userGame;
        const userId = user._id;
        const gameLink = game.link;

        playerStates[gameLink][userId] = {
            ...playerStates[gameLink][userId],
            color,
            acquiredCities,
            acquiredCountries,
            starterCountry,
            units: unitsByUserGame[userGame._id] || []
        };
    });

};

const initNeutralCitiesState = async (link: any, countryName?: any) => {
    const game = await Game.findOne({ link }).select('_id').lean();
    if (!game) return
    const findObject: any = {
        userGame: null,
        game: game._id
    }
    const units = await Unit.find(findObject)
        .populate({ path: 'city', select: '-__v' })
        .populate({ path: 'game', select: '-__v' })
        .lean();

    const filteredUnitsByCountry = countryName
        ? units.filter((unit: any) => {
            return unit.city.countryName === countryName
        })
        : units;

    if (!neutralCitiesUnitState) {
        neutralCitiesUnitState = {}
        neutralCitiesUnitState[link] = {};
    }
    for (const unit of filteredUnitsByCountry) {

        neutralCitiesUnitState[link][unit.city.name] = unit
    }
};

const removeCitiesNeutralityInCountry = (link: any, countryName: any) => {
    const gameUnits = neutralCitiesUnitState[link];

    for (const cityName in gameUnits) {
        const unit = gameUnits[cityName];

        if (unit.city.countryName === countryName) {
            delete gameUnits[cityName];
        }
    }
}


const calculateDistance = (point1: any, point2: any) => {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

let subscribedGamesForUnits: any = {}

const initSubscribedGamesForUnits = async () => {
    const game = await Game.find().select('_id').lean();
    if (!game) return
    game.forEach((gameObj: any) => {
        if (gameObj.battlePhase) {
            subscribedGamesForUnits[gameObj.link] = true
        }
    })
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
    await initSubscribedGamesForUnits()
    console.log("all games in battle phase have been subbed for units");

    io.on('connection', async (socket: any) => {
        const session = socket.handshake.session;
        if (!(session && session.passport && session.passport.user)) {
            socket.disconnect(true);
            return
        }
        const userId = session.passport.user
        const user = await User.findById(userId).select('-password -__v')
        socket.on('joinGameRoom', async (data: any) => {
            const { link, manualJoin } = data;

            if (!link) return;
            let game = await Game.findOne({ link }).populate('creator').lean();
            if (!game) return;

            if (!playerStates[link]) playerStates[link] = {}

            if (!neutralCitiesUnitState) {
                await initNeutralCitiesState(link)
            }

            let userState = playerStates[link][userId];

            if (userState) {

                if (userState.spectator && !manualJoin) {
                    return socket.emit('infoMessage', `You are a spectator! Press SPACE to join if game not full`);
                } else {
                    userState.spectator = false;
                    socket.join(link);
                    socket.emit('updatePlayerStates', {
                        playerUserStates: playerStates[link],
                        neutralCityUnitStates: neutralCitiesUnitState[link]
                    });
                    socket.broadcast.to(link).emit('playerJoin', { userJoined: userState });
                    io.to(link).emit('importantMessage', `${userState.user.username} has connected`);

                    // Check conditions for all players picked country event
                    if (!game.battlePhase && checkAllPlayersPickedCountry(game)) {
                        io.to(link).emit('allPlayersPickedCountry', { creatorName: game.creator.username });
                    }
                    return;
                }
            }
            const randomColor = selectRandomColor()

            if (Object.keys(playerStates[link]).length >= game.maxPlayersCount) {
                // Game is full
                if (!game.started) {
                    playerStates[link][userId] = {
                        user,
                        spectator: true,
                        color: randomColor
                    };
                    socket.join(link);
                    socket.emit('updatePlayerStates', {
                        playerUserStates: playerStates[link],
                        neutralCityUnitStates: neutralCitiesUnitState[link]
                    });
                    socket.emit('infoMessage', `You are now a spectator! Press SPACE to join if game not full`);
                } else {
                    socket.emit('errorMessage', `You cannot join because the game is full and has started`);
                }
            } else {
                playerStates[link][userId] = {
                    user,
                    spectator: false,
                    color: randomColor // Assign a random color to player
                };
                socket.join(link);
                socket.emit('updatePlayerStates', {
                    playerUserStates: playerStates[link],
                    neutralCityUnitStates: neutralCitiesUnitState[link]
                });
                socket.broadcast.to(link).emit('playerJoin', { userJoined: playerStates[link][userId] });
                io.to(link).emit('importantMessage', `${user.username} has connected`);

                // Check conditions for all players picked country event
                if (!game.battlePhase && checkAllPlayersPickedCountry(game)) {
                    io.to(link).emit('allPlayersPickedCountry', { creatorName: game.creator.username });
                }
            }
        });

        socket.on('leaveGameRoom', async (data: any) => {
            const { link } = data;

            if (!link || !playerStates[link]) return
            if (!playerStates[link][userId]) return
            socket.leave(link);
            socket.broadcast.to(link).emit('playerLeave', { userLeft: playerStates[link][userId] });

            if (!playerStates[link][userId].spectator) {
                socket.broadcast.to(link).emit('errorMessage',
                    `${playerStates[link][userId].user.username} has disconnected`
                )
            }

            let game = await Game.findOne({ link }).populate('creator').lean()

            if (!game || game.battlePhase) return


            const deletedUserGame = await UserGame.findOneAndDelete({ user: userId, game: game._id })
            if (deletedUserGame) {
                await Unit.updateMany(
                    { userGame: deletedUserGame._id },
                    { $set: { userGame: null } }
                );
                if (playerStates[link][userId].starterCountry) {
                    await initNeutralCitiesState(link, playerStates[link][userId].starterCountry.name)
                }
                socket.broadcast.to(link).emit('neutralCityUnitStatesUpdate', {
                    neutralCityUnitStates: neutralCitiesUnitState[link]
                })
            }
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
            if (!link || !playerStates[link]) return;
            if (!playerStates[link][userId]) return;
            if (playerStates[link][userId].spectator) return;

            const gameObjectPromise = Game.findOne({ link })
                .populate('creator').populate('map').lean();

            const [gameObject] = await Promise.all([gameObjectPromise]);
            if (!gameObject || !gameObject.started) return;

            const countryPromise = Country.findOne({ name, mapName: gameObject.map.name }).lean();
            const userGameObjectPromise = UserGame.findOne({ user, game: gameObject }).lean();
            const [country, userGameObject] = await Promise.all([countryPromise, userGameObjectPromise]);
            if (!country) return;
            if (userGameObject) {
                socket.emit('errorMessage', `You already have a confirmed selected country`);
                return;
            }

            const cities = await City.find({ countryName: country.name, mapName: gameObject.map.name }).lean();
            if (!cities) return;

            const newUserGameObject = new UserGame({
                user,
                game: gameObject,
                color: playerStates[link][userId].color,
                acquiredCities: cities,
                acquiredCountries: [country],
                starterCountry: country,
                units: []
            });

            const savedGameObjectPromise = newUserGameObject.save();

            playerStates[link][userId].units = [];
            playerStates[link][userId].game = newUserGameObject;
            playerStates[link][userId].acquiredCities = cities;
            playerStates[link][userId].acquiredCountries = [country];
            playerStates[link][userId].starterCountry = country;

            const unitUpdates = cities.map(city => {
                const unitsUserGame = {
                    userGame: newUserGameObject,
                    range: 400
                };
                return Unit.findOneAndUpdate({ city, game: gameObject._id }, unitsUserGame)
                    .lean().exec().then(updatedUnit => {
                        playerStates[link][userId].units.push({
                            city,
                            userGame: newUserGameObject,
                            numberOfUnits: updatedUnit.numberOfUnits,
                            range: 400
                        });
                    });
            });

            await Promise.all([savedGameObjectPromise, ...unitUpdates]);

            removeCitiesNeutralityInCountry(link, country.name);

            io.to(link).emit('neutralCityUnitStatesUpdate', {
                neutralCityUnitStates: neutralCitiesUnitState[link]
            });
            io.to(link).emit('countryPicked', {
                id: userId,
                color: newUserGameObject.color,
                starterCountry: country.name,
                acquiredCities: playerStates[link][userId].acquiredCities,
                acquiredCountries: playerStates[link][userId].acquiredCountries,
                units: playerStates[link][userId].units
            });
            io.to(link).emit('infoMessage', `${user.username} has chosen ${country.name}`);

            if (!gameObject.battlePhase && checkAllPlayersPickedCountry(gameObject)) {
                io.to(link).emit('allPlayersPickedCountry', { creatorName: gameObject.creator.username });
            }
        });

        socket.on('beginBattlePhase', async (data: any) => {
            const { link } = data
            if (!link || !playerStates[link]) return

            let game = await Game.findOne({ link }).populate('creator')
            if (!game || game.battlePhase || !game.started) return
            if (game.creator.username != playerStates[link][userId].user.username) return

            game.battlePhase = true
            await game.save()

            subscribedGamesForUnits[link] = true
            io.to(link).emit('startBattlePhase')

        })


        socket.on('moveUnitsBetween', async (data: any) => {
            const { link, sourcePoint, destinationPoint, sourceCityName, destinationCityName, numberOfUnits } = data;

            if (!link || !playerStates[link]) return;

            if ((!sourcePoint && !sourceCityName) || (!destinationPoint && !destinationCityName)) return;
            if ((sourcePoint && sourceCityName) || (destinationPoint && destinationCityName)) return;

            let numberOfUnitsInt = parseInt(numberOfUnits, 10)
            if (numberOfUnitsInt <= 0 || isNaN(numberOfUnitsInt)) return;

            const game = await Game.findOne({ link })
                .populate('creator').populate('map').lean();
            if (!game) return;

            const unitQuery = { game: game._id };

            const sourceUnitsPromise = sourceCityName
                ? Unit.find(unitQuery).populate({
                    path: 'userGame',
                    populate: { path: 'user', select: '-password -__v' }
                }).populate({ path: 'city', match: { name: sourceCityName } })
                : Unit.findOne({ ...unitQuery, point: sourcePoint }).populate({
                    path: 'userGame',
                    populate: { path: 'user', select: '-password -__v' }
                }).populate({ path: 'city', match: { point: sourcePoint } });

            const destinationUnitsPromise = destinationCityName
                ? Unit.find(unitQuery).populate({
                    path: 'userGame',
                    populate: { path: 'user', select: '-password -__v' }
                }).populate({ path: 'city', match: { name: destinationCityName } })
                : Unit.findOne({ ...unitQuery, point: destinationPoint }).populate({
                    path: 'userGame',
                    populate: { path: 'user', select: '-password -__v' }
                }).populate({ path: 'city', match: { point: destinationPoint } });

            let [sourceUnits, destinationUnits] = await Promise.all([sourceUnitsPromise, destinationUnitsPromise]);

            if (sourceCityName) {
                sourceUnits = sourceUnits.filter((unit: any) => unit.city !== null && unit.city.name === sourceCityName)[0];
            }
            if (destinationCityName) {
                destinationUnits = destinationUnits.filter((unit: any) => unit.city !== null && unit.city.name === destinationCityName)[0];
            }

            if (!sourceUnits || sourceUnits.numberOfUnits < numberOfUnitsInt) return;

            const sourcePosition = sourceCityName ? sourceUnits.city.point : sourceUnits.point;
            const destinationPosition = destinationCityName ? destinationUnits.city.point : destinationPoint;
            const distance = calculateDistance(sourcePosition, destinationPosition);

            if (distance > sourceUnits.range + 1) return

            // Handle unit movement and attack
            if (destinationUnits) {
                if (destinationUnits.userGame) {
                    if (destinationUnits.userGame._id.equals(sourceUnits.userGame._id)) {
                        if (sourceUnits.city) {
                            if (destinationUnits.city && sourceUnits.city._id.equals(destinationUnits.city._id)) return

                            destinationUnits.numberOfUnits += numberOfUnitsInt;
                            sourceUnits.numberOfUnits -= numberOfUnitsInt;
                            if (sourceUnits.numberOfUnits <= 0) {
                                sourceUnits.numberOfUnits = 0;
                            }

                            const savePromises = [
                                sourceUnits.save(),
                                destinationUnits.save()
                            ];

                            await Promise.all(savePromises);
                        }
                        else {
                            if (!destinationUnits.city && sourceUnits.point === destinationUnits.point) return

                            destinationUnits.numberOfUnits += numberOfUnitsInt;
                            sourceUnits.numberOfUnits -= numberOfUnitsInt;
                            const saveOrDeletePromises = [];

                            if (sourceUnits.numberOfUnits <= 0) {
                                saveOrDeletePromises.push(Unit.deleteOne({ _id: sourceUnits._id }));
                            } else {
                                saveOrDeletePromises.push(sourceUnits.save());
                            }

                            saveOrDeletePromises.push(destinationUnits.save());

                            await Promise.all(saveOrDeletePromises);
                        }
                        await updatePlayerGameStates([sourceUnits.userGame._id])
                    } else {

                        if (destinationUnits.numberOfUnits < numberOfUnitsInt) {
                            const promises = [
                                UserGame.findById(sourceUnits.userGame._id).populate('acquiredCities'),
                                UserGame.findById(destinationUnits.userGame._id).populate('acquiredCities'),
                            ];

                            if (destinationUnits.city) {
                                promises.push(Country.findOne({ name: destinationUnits.city.countryName }).lean());
                            }

                            const [attackerUserGame, defenderUserGame, country] = await Promise.all(promises);

                            if (!attackerUserGame || !defenderUserGame) return
                            let saveSourceUnitsPromise;
                            let hasAttackerAcquiredCountryAlready = false;

                            if (destinationUnits.city && country) {
                                defenderUserGame.acquiredCities = defenderUserGame.acquiredCities.filter(
                                    (city: any) => !city._id.equals(destinationUnits.city._id)
                                );

                                attackerUserGame.acquiredCities.push(destinationUnits.city);

                                // Check if attacker has already acquired this country
                                hasAttackerAcquiredCountryAlready = attackerUserGame.acquiredCountries.some(
                                    (cId: any) => cId.equals(country._id)
                                );
                            }

                            const saveUserGamesPromise = Promise.all([
                                defenderUserGame.save(),
                                attackerUserGame.save()
                            ]);

                            const originalSourceUserGameId = sourceUnits.userGame._id;
                            const originalDestinationUserGameId = destinationUnits.userGame._id;

                            destinationUnits.numberOfUnits = numberOfUnitsInt - destinationUnits.numberOfUnits;
                            sourceUnits.numberOfUnits -= numberOfUnitsInt;

                            if (sourceUnits.numberOfUnits > 0) {
                                saveSourceUnitsPromise = sourceUnits.save();
                            } else {
                                if (sourceUnits.city) {
                                    saveSourceUnitsPromise = sourceUnits.save();
                                } else {
                                    saveSourceUnitsPromise = Unit.deleteOne({ _id: sourceUnits._id });
                                }
                            }

                            destinationUnits.userGame = attackerUserGame._id;
                            destinationUnits.range = 400;

                            const saveDestinationUnitsPromise = destinationUnits.save();

                            await Promise.all([
                                saveUserGamesPromise,
                                saveSourceUnitsPromise,
                                saveDestinationUnitsPromise
                            ]);

                            const uniqueUserGameIds = Array.from(new Set(
                                [originalSourceUserGameId, originalDestinationUserGameId]
                            ));

                            if (country && !hasAttackerAcquiredCountryAlready) {
                                let attackerHasCapturedCapAlready = false;
                                const attackerAcquiredCities = attackerUserGame.acquiredCities.filter(
                                    (city: any) => {
                                        if (city.countryName === country.name && city.type) {
                                            attackerHasCapturedCapAlready = true;
                                        }
                                        return city.countryName === country.name;
                                    }
                                );

                                const attackerAcquiredCityIds = attackerUserGame.acquiredCities.map(
                                    (city: any) => city._id.toString());

                                const notAttackerCities = await City.find({
                                    countryName: country.name,
                                    mapName: game.map.name,
                                    _id: { $nin: [...attackerAcquiredCityIds] }
                                });

                                const attackerPopulation = attackerAcquiredCities.reduce(
                                    (total: any, city: any) => total + city.pop_max, 0
                                );
                                const defenderPopulation = notAttackerCities.reduce(
                                    (total: any, city: any) => total + city.pop_max, 0
                                );

                                if (attackerPopulation > defenderPopulation && attackerHasCapturedCapAlready) {
                                    attackerUserGame.acquiredCountries.push(country._id);
                                    defenderUserGame.acquiredCountries = defenderUserGame.acquiredCountries.filter(
                                        (cId: any) => !cId.equals(country._id)
                                    );

                                    await Promise.all([
                                        attackerUserGame.save(),
                                        defenderUserGame.save()
                                    ]);
                                }
                            }

                            await updatePlayerGameStates(uniqueUserGameIds);

                        } else {
                            // Defender wins
                            destinationUnits.numberOfUnits -= numberOfUnitsInt;
                            sourceUnits.numberOfUnits -= numberOfUnitsInt;


                            const saveOrDeletePromises = [];

                            if (destinationUnits.numberOfUnits <= 0) {
                                destinationUnits.numberOfUnits = 0;
                                if (!destinationUnits.city) {
                                    saveOrDeletePromises.push(Unit.deleteOne({ _id: destinationUnits._id }));
                                } else {
                                    saveOrDeletePromises.push(destinationUnits.save());
                                }
                            } else {
                                saveOrDeletePromises.push(destinationUnits.save());
                            }

                            if (sourceUnits.numberOfUnits <= 0) {
                                sourceUnits.numberOfUnits = 0;
                                if (!sourceUnits.city) {
                                    saveOrDeletePromises.push(Unit.deleteOne({ _id: sourceUnits._id }));
                                } else {
                                    saveOrDeletePromises.push(sourceUnits.save());
                                }
                            } else {
                                saveOrDeletePromises.push(sourceUnits.save());
                            }

                            await Promise.all(saveOrDeletePromises);
                            await updatePlayerGameStates([sourceUnits.userGame._id, destinationUnits.userGame._id])
                        }
                    }
                } else {
                    // Neutral city
                    if (numberOfUnitsInt > destinationUnits.numberOfUnits) {
                        const attackerUserGamePromise = UserGame.findById(sourceUnits.userGame._id).populate('acquiredCities');

                        destinationUnits.numberOfUnits = numberOfUnitsInt - destinationUnits.numberOfUnits;
                        sourceUnits.numberOfUnits -= numberOfUnitsInt;

                        let saveSourceUnitsPromise;
                        if (sourceUnits.numberOfUnits > 0) {
                            saveSourceUnitsPromise = sourceUnits.save();
                        } else {
                            if (sourceUnits.city) {
                                saveSourceUnitsPromise = sourceUnits.save();
                            } else {
                                saveSourceUnitsPromise = Unit.deleteOne({ _id: sourceUnits._id });
                            }
                        }

                        const attackerUserGame = await attackerUserGamePromise;
                        attackerUserGame.acquiredCities.push(destinationUnits.city);

                        const saveAttackerUserGamePromise = attackerUserGame.save();

                        destinationUnits.userGame = attackerUserGame._id;
                        destinationUnits.range = 400;

                        const saveDestinationUnitsPromise = destinationUnits.save();

                        await Promise.all([
                            saveAttackerUserGamePromise,
                            saveSourceUnitsPromise,
                            saveDestinationUnitsPromise
                        ]);

                        const country = await Country.findOne({ name: destinationUnits.city.countryName }).lean();

                        const hasAttackerCapturedCountry = attackerUserGame.acquiredCountries.some(
                            (cId: any) => cId.equals(country._id)
                        );

                        if (country && !hasAttackerCapturedCountry) {
                            let attackerHasCapturedCapAlready = false

                            const attackerAcquiredCities = attackerUserGame.acquiredCities.filter(
                                (city: any) => {

                                    if (city.countryName === country.name && city.type) {
                                        attackerHasCapturedCapAlready = true;
                                    }
                                    return city.countryName === country.name
                                }
                            );

                            const attackerPopulation = attackerAcquiredCities.reduce(
                                (total: any, city: any) => total + city.pop_max, 0
                            );

                            const attackerAcquiredCityIds = attackerUserGame.acquiredCities.map(
                                (city: any) => city._id.toString());

                            const notAttackerCities = await City.find({
                                countryName: country.name,
                                mapName: game.map.name,
                                _id: { $nin: [...attackerAcquiredCityIds] }
                            });

                            const defenderPopulation = notAttackerCities.reduce(
                                (total: any, city: any) => total + city.pop_max, 0
                            );

                            if (attackerPopulation > defenderPopulation && attackerHasCapturedCapAlready) {
                                attackerUserGame.acquiredCountries.push(country._id);
                                await Promise.all([
                                    attackerUserGame.save()
                                ]);
                            }
                        }
                        delete neutralCitiesUnitState[link][destinationUnits.city.name];
                        await updatePlayerGameStates([attackerUserGame._id])

                    } else {
                        destinationUnits.numberOfUnits -= numberOfUnitsInt;
                        sourceUnits.numberOfUnits -= numberOfUnitsInt;

                        const saveOrDeletePromises = [];

                        if (sourceUnits.numberOfUnits <= 0) {
                            sourceUnits.numberOfUnits = 0;
                            if (!sourceUnits.city) {
                                saveOrDeletePromises.push(Unit.deleteOne({ _id: sourceUnits._id }));
                            } else {
                                saveOrDeletePromises.push(sourceUnits.save());
                            }
                        } else {
                            saveOrDeletePromises.push(sourceUnits.save());
                        }

                        if (destinationUnits.numberOfUnits <= 0) {
                            destinationUnits.numberOfUnits = 0;
                            if (!destinationUnits.city) {
                                saveOrDeletePromises.push(Unit.deleteOne({ _id: destinationUnits._id }));
                            } else {
                                saveOrDeletePromises.push(destinationUnits.save());
                            }
                        } else {
                            saveOrDeletePromises.push(destinationUnits.save());
                        }

                        await Promise.all(saveOrDeletePromises);
                        await updatePlayerGameStates([sourceUnits.userGame._id])
                    }
                }
            } else {
                // No units at destination, just move the units
                const newUnit = new Unit({
                    city: destinationCityName ? destinationUnits.city._id : null,
                    game: game,
                    numberOfUnits: numberOfUnitsInt,
                    userGame: sourceUnits.userGame._id,
                    point: destinationPoint || null,
                    range: sourceUnits.range
                });

                const saveNewUnitPromise = newUnit.save();

                sourceUnits.numberOfUnits -= numberOfUnitsInt;

                let saveSourceUnitsPromise;
                if (sourceUnits.numberOfUnits <= 0) {
                    sourceUnits.numberOfUnits = 0;
                    if (!sourceUnits.city) {
                        saveSourceUnitsPromise = Unit.deleteOne({ _id: sourceUnits._id });
                    } else {
                        saveSourceUnitsPromise = sourceUnits.save();
                    }
                } else {
                    saveSourceUnitsPromise = sourceUnits.save();
                }

                await Promise.all([
                    saveNewUnitPromise,
                    saveSourceUnitsPromise
                ]);
                await updatePlayerGameStates([sourceUnits.userGame._id])
            }

            io.to(link).emit('updatePlayerStates', {
                playerUserStates: playerStates[link],
                neutralCityUnitStates: neutralCitiesUnitState[link]
            });
        });
    });

    server.listen(env.SERVER_PORT, () => {
        return console.log(`server is listening on http://${env.SERVER_NAME}:${env.SERVER_PORT}`);
    })
})




