# Описание методов API #
Все запросы выполняются POST запросом по указанному адресу. 
В ответ приходит строка с JSON объектом. 
В случае, если нужно отправить объект, следует записать его в JSON и отправить строкой.  
Выделеные *курсивом* параметры необязательны.
## Методы авторизации ##
### Регистрация ###
**/api/register**

Регистрирует нового пользователя

Параметры:

| Имя | Тип | Описание |
| - | - | - |
| login | string | Логин |
| password | string | Пароль |

Ответ:

| Имя | Тип | Описание |
| - | - | - |
| success | bool | Результат |
| *err_cause* | *string* | *Причина ошибки* |

Примеры:  
> <&nbsp;&nbsp;register("admin", "azerty123")  
> \>&nbsp;&nbsp;{ "success": true }  
> \>&nbsp;&nbsp;{ "success": false, "err_cause": "User with the same nickname already exist" }
---
### Авторизация ###
**/api/auth**

Авторизация

Параметры:

| Имя | Тип | Описание |
| - | - | - |
| login | string | Логин |
| password | string | Пароль |

Ответ:

| Имя | Тип | Описание |
| - | - | - |
| success | bool | Результат |
| *token* | *string* | *Ключ сессии * |
| *err_cause* | *string* | *Причина ошибки* |

Примеры:  
> <&nbsp;&nbsp;auth("admin", "azerty123")  
> \>&nbsp;&nbsp;{ "success": true, "token": "aS31L42n21hD" }  
> \>&nbsp;&nbsp;{ "success": false, "err_cause": "Password is incorrect" }
