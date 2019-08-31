'use strict'

const fs = require("fs");
const process = require("process");
const minimist = require("minimist");

const VERSION = "v1.3.0";
const CONFIG_PATH = "./config.json";

const defaultConfig = {
    "http_port": 80,
    "https_port": 443,

    "local_param": "HOImvA9jBnyU36uuex2QNIhtRoOPnpr5Bv+S65Qb8CE=",

    "use_https": false,
    "ssl_cert": "./ssl/crt.pem",
    "ssl_key": "./ssl/key.pem",

    "mysql_host": "remotemysql.com",
    "mysql_user": "9SpT1uQOyM",
    "mysql_pass": "utp2019password",
    "mysql_database": "9SpT1uQOyM"
}

const clHelpPage =
    `
BMSTU-C
========================
See: https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/README.md
`

module.exports.getArgv = () => {
    const argv = minimist(process.argv.slice(2), {
        alias: {
            'h': 'help',
            'v': 'version',
            'p': 'port',
            'c': 'config',
        },
        default: { 'c': CONFIG_PATH },
        unknown: (arg) => {
            console.error('Unknown option: ', arg)
            process.exit(-1);
        }
    });
    if (argv.help) {
        console.log(clHelpPage);
        process.exit(0);
    }
    else if (argv.version) {
        console.log(VERSION);
        process.exit(0);
    }
    else {
        return argv;
    }
}

module.exports.loadConfig = (path) => {
    let config;
    try {
        if (fs.existsSync(path)) {
            config = JSON.parse(fs.readFileSync(path));
            for (let key in defaultConfig)
                if (config[key] === undefined)
                    config[key] = defaultConfig[key];
        }
        else {
            console.error(`File "${path}" does not exist`);
            return defaultConfig;
        }
    }
    catch (err) {
        console.error("Failed to load config: " + err);
        return defaultConfig;
    }
    return config;
}

module.exports.getHttpsCert = (config) => {
    if (config.use_https)
        return {
            key: fs.readFileSync(config.ssl_key),
            cert: fs.readFileSync(config.ssl_cert)
        }
    else
        return undefined;
}

module.exports.getPort = (argv, config) => {
    if (argv.port !== undefined)
        return argv.port;
    else if (config.use_https)
        return config.https_port;
    else
        return config.http_port;
}