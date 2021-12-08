import { v4 } from 'uuid'
import multer from 'multer'

const DIR = './public/';

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, DIR);
    },
    filename: (req: any, file: any, cb: any) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, v4() + '-' + fileName)
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

export default upload;