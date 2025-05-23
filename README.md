# DressLine App

Электронная книга с поддержкой PWA и оффлайн-функциональностью.

## Особенности

- Редактор текста с форматированием (TipTap)
- Поддержка загрузки и экспорта PDF
- Адаптивный дизайн для мобильных устройств
- Поддержка светлой и темной темы
- PWA с оффлайн-функциональностью

## Деплой на Vercel

### Автоматический деплой

1. Создайте репозиторий на GitHub и загрузите код
2. Подключите репозиторий к Vercel
3. Настройте параметры деплоя:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Ручной деплой

1. Установите Vercel CLI: `npm install -g vercel`
2. Войдите в аккаунт Vercel: `vercel login`
3. Выполните деплой: `vercel`

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

## Структура проекта

- `/src` - Исходный код приложения
- `/public` - Статические файлы
- `/dist` - Собранное приложение (создается при сборке)

## Оптимизация производительности

- Разделение кода на чанки для ускорения загрузки
- Кэширование статических ресурсов
- Минификация и оптимизация JavaScript и CSS
- Предзагрузка критических ресурсов

## Адаптация для светлого и темного режимов

В приложении реализована поддержка светлой и темной тем с учетом предпочтений пользователя:

- CSS-переменные для адаптации цветов
- Полупрозрачные фоны с размытием для улучшения контраста
- Оптимизированные тени и рамки для лучшего визуального разделения
- Автоматическое переключение между темами с помощью медиа-запросов
