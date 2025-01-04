# Роутер для Express.JS приложений

**[the-router](https://www.npmjs.com/package/the-router)** — Минималистичный, но мощный роутер для Express.JS приложений, вдохновленный фреймворками Ruby on Rails и Hanami.

![Архитектура роутера](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p5t1zaooq2323t3sxf37.png)

## Ключевые возможности

- Синтаксис маршрутизации в стиле Rails
- Подход на основе действий (вдохновлен Hanami)
- Автоматическая загрузка действий
- Поддержка middleware на разных уровнях
- Ресурсная маршрутизация
- Группировка маршрутов
- Поддержка регулярных выражений
- Поддержка TypeScript
- Комплексный набор тестов

## Базовое использование

```ts
// routes/index.ts
import { root, get, post, scope, resources } from "the-router";

// Корневой маршрут
root("index#home");

// Базовые маршруты
get("/about", "pages#about");
post("/contact", "pages#contact");

// Ресурсные маршруты
resources("posts");

// Сгруппированные маршруты с middleware
scope("admin", [authenticate], () => {
  resources("users");
  resources("posts");
});
```

## Структура проекта

```bash
src/
  actions/           # Файлы действий
    index/
      homeAction.ts  # Обработчик корневого маршрута
    pages/
      aboutAction.ts # Обработчик GET /about
    posts/          # Действия для ресурса
      indexAction.ts
      showAction.ts
      createAction.ts
      # ...
  routes/
    index.ts        # Определения маршрутов
```

## Файлы действий

Каждый маршрут соответствует отдельному файлу действия:

```ts
// src/actions/posts/showAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  // Логика отображения поста
  res.json({ post: { id, title: "Пример поста" } });
};
```

## Продвинутые возможности

### Ресурсная маршрутизация

```ts
resources("posts", [authenticate], {
  only: ["index", "show", "create"]
});
```

Создает:
- GET /posts
- GET /posts/:id
- POST /posts

### Поддержка Middleware

```ts
// Глобальный middleware для группы
scope("admin", [authenticate, logRequest], () => {
  // Middleware для конкретного маршрута
  get("/stats", [validateAccess], "admin#stats");
  resources("users");
});
```

### Маршруты с регулярными выражениями

```ts
// Версионирование API
get(/^\/api\/v\d+\/users$/, "api#users");

// Гибкие паттерны
get(/.*fly$/, "insects#list"); // Совпадает с: butterfly, dragonfly
```

## Тестирование

Роутер включает комплексный набор тестов:

```ts
describe("Ресурсные маршруты", () => {
  beforeEach(() => {
    resetRouter();
    setActionsPath("./test_actions");
    resources("posts");
  });

  test("должен обрабатывать индексный маршрут", async () => {
    const app = express();
    app.use(getRouter());

    const response = await request(app)
      .get("/posts")
      .expect(200);
      
    expect(response.body.action).toBe("index");
  });
});
```

## Преимущества

1. **Чистая организация кода**
   - Каждое действие в отдельном файле
   - Четкое разделение ответственности
   - Легко поддерживать и тестировать

2. **Гибкая маршрутизация**
   - Поддержка всех HTTP методов
   - Паттерны регулярных выражений
   - Ресурсная маршрутизация
   - Вложенные группы

3. **Интеграция Middleware**
   - Несколько уровней middleware
   - Middleware для групп
   - Middleware для отдельных маршрутов
   - Middleware для ресурсов

4. **Поддержка TypeScript**
   - Полные определения типов
   - Улучшенная поддержка IDE
   - Лучшее обнаружение ошибок

## Заключение

The Router предоставляет надежное решение для маршрутизации в Express.js приложениях, вдохновленное Rails, сохраняя при этом простоту и гибкость. Особенно хорошо подходит для:

- REST API
- Полноценных приложений
- Микросервисов
- Корпоративных приложений

Сочетание чистой организации кода, мощных возможностей и комплексного тестирования делает его надежным выбором для маршрутизации в Express.js.

## Ссылки

- [NPM пакет](https://www.npmjs.com/package/the-router)
- [GitHub репозиторий](https://github.com/the-teacher/the-router)
- [Документация](https://github.com/the-teacher/the-router#readme)

## Автор

Ilya N. Zykin | [the-teacher](https://github.com/the-teacher)
