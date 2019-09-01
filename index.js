const express 	= require('express');
const db 		= require('./utils/db');
const app 		= express();
const s3 		= require('./utils/s3');
const config 	= require('./config');

/////////////////FILE UPLOAD///////////////////
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) { //24 karakter demek
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
/////////////////uploaded info///////////////////
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static('public'));

app.use(express.json());

app.get('/getImages', (req, res) => {
    db.getImages()
        .then( (data) => {
            res.json(data.rows);
        }).catch((err) => {
            console.log('Error with getImages(): ', err);
        });

});

app.get('/getImagesFromId/:id', (req, res) => {
    console.log('/getImagesFromId/:id Foto ID: ', req.params.id);
    var id = req.params.id;
    console.log(id);
    db.getImagesFromId(id)
        .then( results => {
            res.json(results.rows);
            console.log('getPicturesFromId(id): ', results.rows);
        }).catch((err) => {
            console.log('Error with getPicturesFromId(): ', err);
        });

});

// app.post('/upload', uploader.single('file'), (req, res) => {
app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    //req.file - the file that was just uploaded
    //req.body - refers to the values we type in the input fileds
    console.log("/upload, req.body:", req.body);
    let { title, username, description } = req.body;
    let { filename } = req.file;
    let url = config.s3Url + filename;
    // let url ='/uploads' + filename;
    if(req.file){
        db.uploadImage(url, username, title, description)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.log('uploadImage Error: ', err);
            });
        // res.json({
        //     success: true
        // });
    } else {
        res.json({
            success: false
        });
    }
});

app.post("/add-comment", (req, res) => {
    console.log("/add-comment req.bod: ", req.body);
    db.uploadComments(req.body)
        .then(data => {
            // console.log("/add-comment data: ", data);
            res.json(data);
        })
        .catch(err => console.log("/add-comment post error: ", err));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Port ${PORT} is listening carefully...`));
