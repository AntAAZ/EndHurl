
import { Router, Request, Response, NextFunction } from 'express';
import Game from '../../models/Game';

class GetGameByLinkRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getGameByLink', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }
        
        const { link } = req.query;
    
        try {
            if (!link) {
                res.status(404).send({ message: 'Game link not provided' });
                return;
            }
            const game = await Game.findOne({ link })
                .populate('creator', 'username') 
                .populate('map', 'name image') 
            .lean();

            if (!game) {
                return res.status(404).send({ message: "Game with that link doesnt exist" });
            }
            return res.send({
                name: game.name,
                link: game.link,
                maxPlayersCount: game.maxPlayersCount,
                nameOfCreator: game.creator.username,
                mapName: game.map.name,
                mapImage: game.map.image,
                started: game.started
            });
        } catch (err) {
            console.error(`Error in map get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new GetGameByLinkRoute().getRouter();