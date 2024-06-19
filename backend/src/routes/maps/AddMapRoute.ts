import User from '../../models/User';
import Map from '../../models/Map';
import { Router, Request, Response, NextFunction } from 'express';
import mapUpload from '../../middlewares/uploadMapMiddleware';

class AddMapRoute 
{
    private router: Router = Router();
    constructor() {
        this.router.post('/addMapByName', mapUpload.single('image'), this.handlePostReq);
    }
    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        if(!req.isAuthenticated())  return res.status(401).send({message: `You are not logged in`})
        const { name } = req.body
        
        if(!req.file)
        {
            return res.status(400).send({message: `Please select a file to upload`})
        }
        let username = req.user.username;
        try {
            let doc = await Map.findOne({ name });
            let user = await User.findOne({ username })
            if(!user)
            {
                return res.status(500).send({ message: "Couldn't fetch user from map upload request" });
            }
            if (doc) {
                if(doc.creator.username != req.user.username)
                {
                    return res.status(403).send({ message: "You are not the creator of this map" });
                }

                doc.image = `${req.protocol}://${req.get('host')}/public/maps/${req.file.filename}`;
                await doc.save();
                return res.send("success");
            }

            let map = new Map()
            map.name = name
            map.creator = user
            map.image = `${req.protocol}://${req.get('host')}/public/maps/${req.file.filename}`;
            
            await map.save();
            
            return res.send("success");
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "An error occurred with creating a map" });
        }
    
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new AddMapRoute().getRouter();
