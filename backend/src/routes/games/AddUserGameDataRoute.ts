
import { Router, Request, Response, NextFunction } from 'express';
import Game from '../../models/Game';
import User from '../../models/User';
import UserGame from '../../models/UserGame';

class AddUserGameDataRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.post('/addUserGameData', this.handlePostReq);
    }

    private async handlePostReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }

        const gameUser: any = req.body.user
        const { color, acquiredCities, acquiredCountries, starterCountry, units, link } = req.body;

        try {
            if (!gameUser || !gameUser.username) {
                res.status(404).send({ message: 'Game user not provided' });
                return;
            }
            if (!link) {
                res.status(404).send({ message: 'Game link not provided' });
                return;
            }
            if (!color) {
                res.status(404).send({ message: 'Game color not provided' });
                return;
            }
            const user = await User.findOne({ username: gameUser.username }).lean();
            const game = await Game.findOne({ link }).lean();

            if (!user) {
                res.status(404).send({ message: 'User doesnt exist' });
                return;
            }
            if (!game) {
                res.status(404).send({ message: 'Game doesnt exist' });
                return;
            }
            const userGame = await UserGame.findOne( { user: user._id, game: game._id }).lean()
            if(userGame)
            {
                res.status(404).send({ message: 'User is already playing in the specified game' });
                return;
            }

            await new UserGame({
                user, game, color, acquiredCities, acquiredCountries, starterCountry, units
            }).save()

            return res.send('success');
        } catch (err) {
            console.error(`Error in user game get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new AddUserGameDataRoute().getRouter();