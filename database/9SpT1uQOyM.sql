-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Авг 31 2019 г., 12:08
-- Версия сервера: 8.0.13-4
-- Версия PHP: 7.2.19-0ubuntu0.18.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `9SpT1uQOyM`
--

-- --------------------------------------------------------

--
-- Структура таблицы `chat`
--

CREATE TABLE `chat` (
  `chat_id` bigint(20) NOT NULL COMMENT 'id канала',
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'имя канала',
  `user_id` int(11) NOT NULL COMMENT 'id пользователя, создавшего этот канал',
  `meta` json DEFAULT NULL COMMENT 'информация о чате'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `chat`
--

INSERT INTO `chat` (`chat_id`, `name`, `user_id`, `meta`) VALUES
(1, 'test1', 1, NULL),
(2, 'test2', 5, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `message_id` bigint(20) NOT NULL COMMENT 'id сообщения',
  `chat_id` bigint(20) NOT NULL COMMENT 'id канала',
  `user_id` int(11) NOT NULL COMMENT 'id пользователя, отправившего это сообщение',
  `content` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'содержание сообщения',
  `date_create` datetime NOT NULL COMMENT 'дата отправки сообщения'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `messages`
--

INSERT INTO `messages` (`message_id`, `chat_id`, `user_id`, `content`, `date_create`) VALUES
(1, 1, 1, 'Message 1', '2019-08-31 10:55:23'),
(2, 1, 1, 'Message 2', '2019-08-31 10:56:15'),
(3, 1, 2, 'Message 3', '2019-08-31 10:56:15'),
(4, 1, 2, 'Message 5', '2019-08-31 10:56:56'),
(5, 1, 2, 'Message 6', '2019-08-31 10:56:56'),
(6, 1, 1, 'Message 7', '2019-08-31 10:57:29'),
(7, 1, 1, 'SOSAT', '2019-08-31 01:41:34'),
(8, 1, 2, 'Message 8', '2019-08-31 10:57:29'),
(9, 1, 1, 'Message 9', '2019-08-31 00:00:00'),
(10, 1, 1, 'Message 10', '2019-08-31 10:58:19'),
(11, 1, 1, 'Message 11', '2019-08-31 10:59:01'),
(12, 1, 1, 'Message 12', '2019-08-31 10:59:01'),
(13, 1, 1, 'Message 13', '2019-08-31 10:59:27'),
(14, 1, 2, 'Message 14', '2019-08-31 10:59:27'),
(15, 1, 2, 'Message 15', '2019-08-31 10:59:52'),
(16, 1, 1, 'Message 16', '2019-08-31 10:59:52'),
(17, 1, 2, 'Message 17', '2019-08-31 11:00:24'),
(18, 1, 2, 'Message 18', '2019-08-31 11:00:24'),
(19, 1, 2, 'Message 19', '2019-08-31 11:00:51'),
(20, 1, 1, 'FINAL', '2019-08-31 11:00:51');

-- --------------------------------------------------------

--
-- Структура таблицы `party`
--

CREATE TABLE `party` (
  `chat_id` bigint(20) NOT NULL COMMENT 'id канала',
  `user_id` int(11) NOT NULL COMMENT 'id участника этого канала'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `party`
--

INSERT INTO `party` (`chat_id`, `user_id`) VALUES
(1, 1),
(1, 2),
(1, 33),
(2, 5),
(2, 33);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL COMMENT 'id пользователя',
  `login` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'логин пользователя',
  `hash` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'хэш-пароль пользователя',
  `salt` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'соль'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `hash`, `salt`) VALUES
(1, 'admin', 'U8KucL4QJA0Gy/RN/GqjV9l1rSdocrrZqTKYKGUYd3mwINQ3H9ki05o6vmJMR5nWArpfZuDptIsiNFzjCsoXkg==', 'aW3xPSJcSg5XkymbJBsHLNBAMq1+B19AWEtBmQ92xy8='),
(2, 'kek', '567', '567'),
(5, 'lol', '123', '123'),
(32, 'maxiklk', 'UQJgmd5ZouOevGOIAHJ0Al+L6xaUV/09Kw0ad0M+yXdfe/Pl0ieCEEhrc+4etvNYiPQvtzeij9RF0I2OEkFHvw==', 'RGBmb30dLqRTbosbinhh9RGrqSluSpsh09GQQ6jOPv0='),
(33, 'Sokolmish', '6I2pzdINqnsiQ0/J82nZwztOPlwvWegwQ55Gnds7BEpc7O0YXXwqtVh6AtCbTkf0OYHUThM6+o6VC0DlBKdvmw==', 'X1Uj9rknO+hgvPL/ib7ARcHinRT5wjTWXSIuyJYNFGU=');

-- --------------------------------------------------------

--
-- Структура таблицы `users_data`
--

CREATE TABLE `users_data` (
  `id` int(11) NOT NULL COMMENT 'id пользователя',
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'ник пользователя',
  `permissions` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'привелегии польщователя',
  `avatar` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'avatars/default.png' COMMENT 'путь к аватару пользователя',
  `meta` json DEFAULT NULL COMMENT 'информация о пользователе'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `users_data`
--

INSERT INTO `users_data` (`id`, `nickname`, `permissions`, `avatar`, `meta`) VALUES
(1, 'admin', 1, 'avatars/default.png', NULL),
(2, 'kek', 0, 'avatars/default.png', NULL),
(5, 'lol', 0, 'avatars/default.png', NULL),
(32, 'maxiklk', 0, 'avatars/default.png', NULL),
(33, 'Sokolmish', 0, 'avatars/default.png', NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `chat_id` (`chat_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `party`
--
ALTER TABLE `party`
  ADD KEY `chat_id` (`chat_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users_data`
--
ALTER TABLE `users_data`
  ADD PRIMARY KEY (`nickname`),
  ADD KEY `id` (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `chat`
--
ALTER TABLE `chat`
  MODIFY `chat_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id канала', AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id сообщения', AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id пользователя', AUTO_INCREMENT=34;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `chat`
--
ALTER TABLE `chat`
  ADD CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`chat_id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `party`
--
ALTER TABLE `party`
  ADD CONSTRAINT `party_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`chat_id`),
  ADD CONSTRAINT `party_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `users_data`
--
ALTER TABLE `users_data`
  ADD CONSTRAINT `users_data_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
