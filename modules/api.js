'use strict'

module.exports.init = (app, authModule, dataModule, chatModule) => {
    const modules = {
        auth: authModule,
        data: dataModule,
        chat: chatModule
    }
    require("./apiRoutes/authRoutes").init(app, modules);
    require("./apiRoutes/userRoutes").init(app, modules);
    require("./apiRoutes/chatRoutes").init(app, modules);
    require("./apiRoutes/msgsRoutes").init(app, modules);
    require("./apiRoutes/fileRoutes").init(app, modules);
}