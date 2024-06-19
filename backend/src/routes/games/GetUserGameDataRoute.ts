
import { Router, Request, Response, NextFunction } from 'express';
import Game from '../../models/Game';
import User from '../../models/User';
import UserGame from '../../models/UserGame';

class GetUserGameDataRoute {

    private router: Router = Router();

    constructor() {
        this.router.get('/getUserGameData', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }

        const { username, link } = req.query;

        try {
            if (!username) {
                res.status(404).send({ message: 'Username not provided' });
                return;
            }
            if (!link) {
                res.status(404).send({ message: 'Game link not provided' });
                return;
            }
            const user = await User.findOne({ username }).lean();
            const game = await Game.findOne({ link }).lean();

            if (!user) {
                res.status(404).send({ message: 'User doesnt exist' });
                return;
            }
            if (!game) {
                res.status(404).send({ message: 'Game doesnt exist' });
                return;
            }
            const userGame = await UserGame.findOne({ user, game })
                .populate({ path: 'acquiredCities', select: '-_id -__v' })
                .populate({ path: 'acquiredCountries', select: '-_id -__v' })
                .populate({ path: 'starterCountry', select: '-_id -__v' }).lean()
                
            if (!userGame) {
                res.status(404).send({ message: 'User is not playing in the specified game' });
                return;
            }
            const { color, acquiredCities, acquiredCountries, starterCountry, units } = userGame
            return res.send({ color, acquiredCities, acquiredCountries, starterCountry, units });
        } catch (err) {
            console.error(`Error in user game get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new GetUserGameDataRoute().getRouter();