# utp2019-8-chat #
Чат (капитан Михаил Соколовский)  
https://54.93.122.236.xip.io/index.html

## Запуск сервера ##

```sh
    node ./server.js [-p=PORT] [-c=CONFIG_PATH]
```

- PORT - порт, на котором будет запущен сервер. По умолчанию будет взято значение из файла конфигурации. (Для запуска сервера на некоторых портах (<1000) могут потребоватсья привелегии суперпользователя).
- CONFIG_PATH - путь к файлу конфигурации, по умолчанию равен `./config.json`

## Быстрый старт ##

```sh
    git clone https://github.com/bmstu-iu9/utp2019-8-chat.git
    cd ./utp2019-8-chat/
    cp ./default_config.json ./config.json
    node ./server.js -p 3000 -c ./config.json
    sensible-browser localhost:3000 # Выполнить в отдельном терминале либо открыть в браузере
    # Ctrl + C для сохранения данных и остановки сервера
```

## Файл конфигурации ##

| Параметр       | Тип    | Значение по умолчанию | Описание                                                                                   |
| -------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------ |
| http_port      | Число  | `80`                  | Порт для запуска сервера без использования https. Может быть изменен из коммандной строки. |
| https_port     | Число  | `443`                 | Порт для запуска сервера c использованием https. Может быть изменен из коммандной строки.  |
| local_param    | Строка | `HOImvA9jBnyU36u...`  | Локальный параметр для хэширования паролей (в readme указан не полностью)                  |
| use_https      | Флаг   | `false`               | Указывает, должен ли сервер использовать https                                             |
| ssl_cert       | Строка | `./ssl/crt.pem`       | Путь к сетификату                                                                          |
| ssl_key        | Строка | `./ssl/key.pem`       | Путь к сетификату                                                                          |
| mysql_host     | Строка | `54.93.122.236`       | Хост, на котором расположена база данных                                                   |
| mysql_user     | Строка | `utp2019public`       | Имя пользователя базы данных                                                               |
| mysql_pass     | Строка | `utp2019public`       | Пароль для базы данных                                                                     |
| mysql_database | Строка | `utp2019public`       | Название базы данных                                                                       |

## Настройка базы данных ##

**Крайне рекомендуется поднимать свою базу данных, так как дефолтная работает очень медленно**

Для подключения сервера к базе данных необходимо запустить сервер базы данных mysql, создать новую базу данных и 
импортировать в нее [данную структуру](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/database/9SpT1uQOyM.sql).
Для примера, рассмотрим настройку базы данных, запущенной локально, с использованием консольного клиента mysql через пользователя root.
Возможная последовательность действий (переключение в консоль mysql произойдет автоматически):

Bash:

```bash
    mysql -h localhost -u root -p # Далее ввести пароль
```

SQL:

```sql
    create database utp2019_8; -- Это название нужно указать в конфиге в поле `mysql_database`
    use utp2019_8;
    source ./database/9SpT1uQOyM.sql; -- При условии, что терминал запущен в корне проекта
    exit; -- Выход их консоли mysql
```

## Дополнительная информация ##

- [Методы API](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/WS_DESCRIPTION.md)
- [Структура сообщений WebSockets](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/WS_DESCRIPTION.md)
- [Структура базы данных](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/DATABASE_STRUCT.md)
- [Файл экспорта базы данных](https://github.com/bmstu-iu9/utp2019-8-chat/blob/master/database/9SpT1uQOyM.sql)

## Зависимости ##

- [express](https://www.npmjs.com/package/express)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [ws](https://www.npmjs.com/package/ws) - WebSockets
- [multer](https://www.npmjs.com/package/multer) - Загрузка файлов на сервер (аватары)
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
