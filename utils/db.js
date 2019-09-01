const spicedPg 			= require('spiced-pg');

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbuser, dbpass } = require('./secret');
    // db = spicedPg(`postgres:postgres:postgres@localhost:5432/signers`);
    db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/imageboard`); // more secure option to login
}


exports.getImages = function (){
    return db
        .query(
            `SELECT * FROM images ORDER BY created_at DESC`
        );
    // .then(({rows}) => {
    //     return rows;
    // });
};

exports.getImagesFromId  = function (id){
    return db
        .query(
            `SELECT images.id, images.url, images.username, images.title, images.description, comments.comment_id, comments.image_id, comments.comment_username, comments.comment, comments.created_at from images
            FULL OUTER JOIN comments
            ON images.id = comments.image_id
            WHERE images.id = $1
            ORDER BY comments.created_at DESC`,
            [id]
        );
};

exports.uploadImage = (url, username, title, description) => {
    console.log('db.uploadImage running!!!');
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [url, username, title, description]
    );
};

exports.uploadComments = data => {
    console.log(data);
    return db.query(
        `
        INSERT INTO comments (image_id, comment_username, comment)
        VALUES ($1, $2, $3)
        RETURNING comment_id`,
        [data.id, data.username, data.comment]
    );
};
