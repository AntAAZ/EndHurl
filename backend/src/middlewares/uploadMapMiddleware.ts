import { v4 } from 'uuid'
import multer from 'multer'

const DIR = './public/maps/';

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, DIR);
    },
    filename: (req: any, file: any, cb: any) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, v4() + '-' + fileName)
    }
});

let mapUpload = multer({
    storage: storage,
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {

            // check for dimensions in the future
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
    // use limits option to limit large files uploads in the future, not needed for demo
});

export default mapUpload;