# utp2019-8-chat #
Чат (капитан Михаил Соколовский)

## Запуск сервера ##

```sh
    ./server.js [-p=PORT] [-c=CONFIG_PATH]
```

- PORT - порт, на котором будет запущен сервер. По умолчанию будет взято значение из файла конфигурации.
- CONFIG_PATH - путь к файлу конфигурации, по умолчанию равен `./config.json`

## Быстрый старт ##

```sh
    git clone https://github.com/bmstu-iu9/utp2019-8-chat.git
    cd ./utp2019-8-chat/
    git checkout --track origin/dev #До тех пор, пока код не будет залит в мастер
    cp ./default_config.json ./config.json
    node ./server.js -p 3000 -c ./config.json
    sensible-browser localhost:3000 #Выполнить в отдельном терминале либо открыть в браузере
    #Ctrl + C для сохранения данных и остановки сервера
```

## Файл конфигурации ##

| Параметр        | Тип    | Значение по умолчанию | Описание                                                                                             |
| --------------- | ------ | --------------------- | ---------------------------------------------------------------------------------------------------- |
| default_port    | Число  | `3000`                | Порт для запуска сервера. Может быть изменен из коммандной строки.                                   |
| saving_interval | Число  | `60`                  | Время в секундах между операциями автосохранения. Для отключения автосохранения следует указать `-1` |
| mysql_host      | Строка | `remotemysql.com`     | Хост, на котором расположена база данных                                                             |
| mysql_user      | Строка | `9SpT1uQOyM`          | Имя пользователя базы данных                                                                         |
| mysql_pass      | Строка | -                     | Пароль для базы данных                                                                               |
| mysql_database  | Строка | `9SpT1uQOyM`          | Название базы данных                                                                                 |

## Дополнительная информация ##

- **[Методы API](https://github.com/bmstu-iu9/utp2019-8-chat/blob/dev/API_DESCRIPTION.md)**
- **Структура базы данных**


TODO: ссылки ведут в dev ветку. Сменить на master.

## Участники ##

1. Васянович Дмитрий - [Ga1ath](https://github.com/Ga1ath)
2. Волков Михаил - [sleepymare](https://github.com/sleepymare)
3. Горовец Максим - [atommaks](https://github.com/atommaks)
4. Литовченко Павел - [573pn01v01k](https://github.com/573pn01v01k)
5. Максимов Михаил - [Mikle54](https://github.com/Mikle54)
6. Несон Сергей - [blissdeathour](https://github.com/blissdeathour)
7. Соколовский Михаил - [Sokolmish](https://github.com/Sokolmish)
8. Хрипач Георгий - [NotThatWay](https://github.com/NotThatWay)