# utp2019-8-chat #
Чат (капитан Михаил Соколовский)  
https://54.93.122.236.xip.io/index.html

## Запуск сервера ##

```sh
    node ./server.js [--init] [--reinit] [-p=PORT] [-c=CONFIG_PATH]
```

- PORT - порт, на котором будет запущен сервер. По умолчанию будет взято значение из файла конфигурации. (Для запуска сервера на некоторых портах (<1000) могут потребоватсья привелегии суперпользователя).
- CONFIG_PATH - путь к файлу конфигурации, по умолчанию равен `./config.json`
- init - подготовить новую папку с данными.
- reinit - очистить сохраненные данные

## Быстрый старт ##

```sh
    git clone https://github.com/bmstu-iu9/utp2019-8-chat.git
    cd ./utp2019-8-chat/
    cp ./default_config.json ./config.json
    node ./server.js --init
    node ./server.js -p 3000 -c ./config.json
    sensible-browser localhost:3000 #Выполнить в отдельном терминале либо открыть в браузере
    #Ctrl + C для сохранения данных и остановки сервера
```

## Файл конфигурации ##

| Параметр        | Тип    | Значение по умолчанию | Описание                                                                                       |
| --------------- | ------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| http_port       | Число  | `80`                  | Порт для запуска сервера без использования https. Может быть изменен из коммандной строки.     |
| https_port      | Число  | `443`                 | Порт для запуска сервера c использованием https. Может быть изменен из коммандной строки.      |
| saving_interval | Число  | `60`                  | Время в секундах между сохранениями данных. Для отключения автосохранения следует указать `-1` |
| local_param     | Строка | `azerty`              | Локальный параметр для хэширования паролей                                                     |
| use_https       | Флаг   | `false`               | Указывает, должен ли сервер использовать https                                                 |
| ssl_cert        | Строка | `./ssl/crt.pem`       | Путь к сетификату                                                                              |
| ssl_key         | Строка | `./ssl/key.pem`       | Путь к сетификату                                                                              |
| mysql_host      | Строка | `remotemysql.com`     | Хост, на котором расположена база данных                                                       |
| mysql_user      | Строка | `9SpT1uQOyM`          | Имя пользователя базы данных                                                                   |
| mysql_pass      | Строка | `utp2019password`     | Пароль для базы данных                                                                         |
| mysql_database  | Строка | `9SpT1uQOyM`          | Название базы данных                                                                           |

## Дополнительная информация ##

- [Методы API](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/WS_DESCRIPTION.md)
- [Структура сообщений WebSockets](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/WS_DESCRIPTION.md)
- [Структура базы данных](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/database/9SpT1uQOyM.sql)

## Зависимости ##

- [express](https://www.npmjs.com/package/express)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [ws](https://www.npmjs.com/package/ws) - WebSockets
- [mysql](https://www.npmjs.com/package/mysql)
- [minimist](https://www.npmjs.com/package/minimist) - Парсинг аргументов коммандной строки


## Участники ##

1. Васянович Дмитрий - [Ga1ath](https://github.com/Ga1ath)
2. Волков Михаил - [sleepymare](https://github.com/sleepymare)
3. Горовец Максим - [atommaks](https://github.com/atommaks)
4. Литовченко Павел - [573pn01v01k](https://github.com/573pn01v01k)
5. Максимов Михаил - [Mikle54](https://github.com/Mikle54)
6. Несон Сергей - [blissdeathour](https://github.com/blissdeathour)
7. Соколовский Михаил - [Sokolmish](https://github.com/Sokolmish)
8. Хрипач Георгий - [NotThatWay](https://github.com/NotThatWay)
