
import { Router, Request, Response, NextFunction } from 'express';
import Game from '../../models/Game';
import Map from '../../models/Map';
import User from '../../models/User';
import { v4 as uuidv4 } from 'uuid';

class EditGameByPropsRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.post('/editGameByProps', this.handlePostReq);
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }

        const { name, maxPlayersCount, link } = req.body;
        const started: any = req.body.started ? req.body.started : false
        try {
            if (!name) {
                res.status(404).send({ message: 'Name of game not provided' });
                return;
            }
            if (!maxPlayersCount) {
                res.status(404).send({ message: 'Max players count of game not set' });
                return;
            }
            if(!link) {
                res.status(404).send({ message: 'Game doesnt have a link' });
                return;
            }

            const gameObject = await Game.findOne({ link }).populate('creator')
            if(!gameObject) {
                res.status(404).send({ message: 'Game not found' });
                return
            }
            
            if(req.user.username != gameObject.creator.username)
            {
                res.status(403).send({ message: 'You are not the creator of this game' });
                return
            }
            gameObject.name = name
            gameObject.maxPlayersCount = maxPlayersCount
            gameObject.started = started
            await gameObject.save()
            return res.send(gameObject);
            
        } catch (err) {
            console.error(`Error in 'edit game by props' route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new EditGameByPropsRoute().getRouter();