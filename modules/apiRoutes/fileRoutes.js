'use strict'

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dbModule = modules.db;
    const chatModule = modules.chatModule;

    const uploadImg = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 1048576 }, //1MB
        fileFilter(req, file, cb) {
            if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
    
    
    app.post("/api/change_avatar", uploadImg.single("filedata"), (request, response) => {
        const args = ["token", "user_id"];
        let req = util.getArgs(request, response, args);
        if (!request.file)
            response.status(200).send(JSON.stringify(ERR_FILE_NO_UPLOADED));
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dbModule.get_user(auth.userID)
            .then(res => {
                if (util.checkPerm(res.user, 1) || res.user.id === +req.user_id) {
                    const filename = `/avatars/${res.user.nickname}${path.extname(request.file.originalname)}`;
                    fs.writeFile(`./client${filename}`, request.file.buffer, (err) => {
                        if (err)
                            response.status(200).send(JSON.stringify({ success: false, err_code: -1, err_cause: err }));
                        else {
                            dbModule.change_avatar(req.user_id, filename).then(resp => {
                                response.status(200).send(JSON.stringify(resp));
                            });
                        }
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
                }
            });
    });
}