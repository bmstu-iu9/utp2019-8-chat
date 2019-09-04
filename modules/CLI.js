'use strict'

const fs = require("fs");
const process = require("process");

const VERSION = "v1.4.0";
const CONFIG_PATH = "./config.json";

const defaultConfig = {
    "http_port": 80,
    "https_port": 443,

    "local_param": "HOImvA9jBnyU36uuex2QNIhtRoOPnpr5Bv+S65Qb8CE=",

    "use_https": false,
    "ssl_cert": "./ssl/crt.pem",
    "ssl_key": "./ssl/key.pem",

    "mysql_host": "54.93.122.236",
    "mysql_user": "utp2019public",
    "mysql_pass": "utp2019public",
    "mysql_database": "utp2019public"
}

const clHelpPage =
    `
 ██████╗ ███╗   ███╗███████╗████████╗██╗   ██╗       ██████╗
 ██╔══██╗████╗ ████║██╔════╝╚══██╔══╝██║   ██║      ██╔════╝
 ██████╔╝██╔████╔██║███████╗   ██║   ██║   ██║█████╗██║     
 ██╔══██╗██║╚██╔╝██║╚════██║   ██║   ██║   ██║╚════╝██║     
 ██████╔╝██║ ╚═╝ ██║███████║   ██║   ╚██████╔╝      ╚██████╗
 ╚═════╝ ╚═╝     ╚═╝╚══════╝   ╚═╝    ╚═════╝        ╚═════╝
                                                           
## Запуск сервера ##
    node ./server.js [-p=PORT] [-c=CONFIG_PATH]

- PORT - порт, на котором будет запущен сервер. По умолчанию будет взято значение из файла конфигурации. (Для запуска сервера на некоторых портах (<1000) могут потребоватсья привелегии суперпользователя).
- CONFIG_PATH - путь к файлу конфигурации, по умолчанию равен './config.json'

## Файл конфигурации ##
| Параметр       | Тип    | Описание                                                                                   |
| -------------- | ------ | ------------------------------------------------------------------------------------------ |
| http_port      | Число  | Порт для запуска сервера без использования https. Может быть изменен из коммандной строки. |
| https_port     | Число  | Порт для запуска сервера c использованием https. Может быть изменен из коммандной строки.  |
| local_param    | Строка | Локальный параметр для хэширования паролей (в readme указан не полностью)                  |
| use_https      | Флаг   | Указывает, должен ли сервер использовать https                                             |
| ssl_cert       | Строка | Путь к сетификату                                                                          |
| ssl_key        | Строка | Путь к сетификату                                                                          |
| mysql_host     | Строка | Хост, на котором расположена база данных                                                   |
| mysql_user     | Строка | Имя пользователя базы данных                                                               |
| mysql_pass     | Строка | Пароль для базы данных                                                                     |
| mysql_database | Строка | Название базы данных                                                                       |

## Ссылка на GitHub ##
    https://github.com/bmstu-iu9/utp2019-8-chat
`

const my_contains = (arr, key) => {
    for (var i = 0; i < key.length; i++){
        if (arr[i] != key[i])
            return 0;
    }
    if (i == key.length)
        return i;
}

const parseArgv = (arr) => {
    let argv = {
        config: CONFIG_PATH
    }
    var k = 0, t = 0;
    for (let i = 0; i < arr.length; i++){
        if (my_contains(arr[i], "-h") || my_contains(arr[i], "--help")){
            argv.help = 1;
            break;
        } else if (my_contains(arr[i], "-v") || my_contains(arr[i], "--version")){
            argv.version = 1;
            break;
        } else if (my_contains(arr[i], "-p")){
            if (arr[i].length > 2){
                k += (arr[i][2] == '=') ? 1 : 0;
                argv.port = arr[i].substring(my_contains(arr[i], "-p") + k, arr[i].length);
            } else if (arr[i + 1] == '='){
                i += 2;
                argv.port = arr[i];
            } else
                argv.port = arr[++i];
        } else if (my_contains(arr[i], "-c")){
            if (arr[i].length > 2){
                t += (arr[i][2] == '=') ? 1 : 0;
                argv.config = arr[i].substring(my_contains(arr[i], "-c") + t, arr[i].length);
            } else if (arr[i + 1] == '='){
                i += 2;
                argv.config = arr[i];
            } else
                argv.config = arr[++i];
        } else if (my_contains(arr[i], "--c") && arr[i][3] == '='){
            argv.config = arr[i].substring(my_contains(arr[i], "--c") + 1, arr[i].length);
        } else if (my_contains(arr[i], "--p") && arr[i][3] == '='){
            argv.port = arr[i].substring(my_contains(arr[i], "--p") + 1, arr[i].length);
        } else if (my_contains(arr[i], "--config") && arr[i][8] == '='){
            argv.config = arr[i].substring(my_contains(arr[i], "--config") + 1, arr[i].length);
        } else if (my_contains(arr[i], "--port") && arr[i][6] == '='){
            argv.port = arr[i].substring(my_contains(arr[i], "--port") + 1, arr[i].length);
        } else if ((my_contains(arr[i], "--c") || my_contains(arr[i], "--config")) && arr[i + 1] == '='){
            i += 2;
            argv.config = arr[i];
        } else if ((my_contains(arr[i], "--p") || my_contains(arr[i], "--port")) && arr[i + 1] == '='){
            i += 2;
            argv.port = arr[i];
        } else if (my_contains(arr[i], "--port") && arr[i].length == 6){
            argv.port = arr[++i];
        } else if (my_contains(arr[i], "--config") && arr[i].length == 8){
            argv.config = arr[++i];
        }
    }
    return argv;
}

module.exports.getArgv = () => {
    const argv = parseArgv(process.argv.slice(2));
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
            process.exit(0);
        }
    }
    catch (err) {
        console.error("Failed to load config: " + err);
        process.exit(0);
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
