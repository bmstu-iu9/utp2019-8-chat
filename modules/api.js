'use strict'

module.exports.init = (app, authModule, dbModule, chatModule) => {
    const modules = {
        auth: authModule,
        db: dbModule,
        chat: chatModule
    }
    require("./apiRoutes/authRoutes").init(app, modules);
    require("./apiRoutes/userRoutes").init(app, modules);
    require("./apiRoutes/chatRoutes").init(app, modules);
    require("./apiRoutes/msgsRoutes").init(app, modules);
    require("./apiRoutes/fileRoutes").init(app, modules);
}