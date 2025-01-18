# `The Router`

Простое и мощное решение для маршрутизации в приложениях на `Express.js`, которое предоставляет чистый и интуитивно понятный способ организации маршрутов и действий.

## Возможности

- Простой синтаксис определения маршрутов (похож на фреймворк Rails)
- Подход, основанный на действиях (похож на фреймворк Hanami)
- Каждое действие в отдельном файле для лучшей поддерживаемости
- Группировка маршрутов для улучшенной организации
- Автоматическая загрузка действий

## Документация

- Development: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Разработка (RU): [docs/DEVELOPMENT.ru.md](docs/DEVELOPMENT.ru.md)
- Скелет приложения: [docs/demo/README.md](docs/demo/README.md)

## Установка

```bash
npm install @the-teacher/the-router
```

```bash
yarn add @the-teacher/the-router
```

```bash
pnpm add @the-teacher/the-router
```

## Использование

### Базовые маршруты

`routes/index.ts`

```ts
import {
  root,
  get,
  post,
  getRouter,
  routeScope as scope,
} from "@the-teacher/the-router";

// Определение корневого маршрута
root("index/index"); // Использует src/actions/index/indexAction.ts

// Определение GET и POST маршрутов
get("/users", "users/show"); // Использует src/actions/users/showAction.ts
post("/users", "users/create"); // Использует src/actions/users/createAction.ts

// Определение сгруппированных маршрутов
scope("admin", () => {
  get("/users", "admin/users/create"); // Использует src/actions/admin/users/createAction.ts
  post("/users", "admin/users/update"); // Использует src/actions/admin/users/updateAction.ts
});
```

### Структура файлов действий

Каждое действие определяется в своём собственном файле и **должно экспортировать функцию `perform`**:

```bash
src/
  actions/
    index/
      indexAction.ts    # обработчик для root("index/index")
    users/
      showAction.ts     # обработчик для get("/users", "users/show")
      createAction.ts   # обработчик для post("/users", "users/create")
    admin/
      users/
        listAction.ts   # обработчик для get("/users", "admin/users/list") в scope admin
```

Пример файла действия:

```typescript
// src/actions/users/showAction.ts
import { Request, Response } from "express";

// perform - обязательный метод для каждого действия
export const perform = (req: Request, res: Response) => {
  res.json({ message: "Список пользователей" });
};
```

### Группировка маршрутов

Группируйте связанные маршруты под общим префиксом:

```ts
scope("admin", () => {
  get("/users", "admin/users/list"); // Использует src/actions/admin/users/listAction.ts
  post("/users", "admin/users/create"); // Использует src/actions/admin/users/createAction.ts
});
```

### Маршруты с Middleware

Вы можете добавлять middleware к любому маршруту:

```ts
import { authenticate } from "./middlewares/auth";
import { validateUser } from "./middlewares/validation";

// Один middleware
get("/users/:id", [authenticate], "users/show");

// Несколько middleware в порядке выполнения
post("/users", [authenticate, validateUser], "users/create");

// Корневой маршрут с middleware
root([authenticate], "index/index");

// Простые маршруты без middleware
get("/about", "pages/about");
post("/contact", "pages/contact");

// Middleware в сгруппированных маршрутах
scope("admin", [authenticate], () => {
  // Эти маршруты наследуют аутентификацию из scope
  get("/users", "users/show");
  post("/users", "users/create");

  // Дополнительный middleware для конкретного маршрута
  post("/users/:id", [validateUser], "users/update");
});
```

### Группировка маршрутов с Middleware

Вы можете добавлять middleware как к отдельным маршрутам, так и ко всей группе маршрутов:

```ts
import { authenticate } from "./middlewares/auth";
import { validateUser } from "./middlewares/validation";
import { logRequest } from "./middlewares/logging";

// Применить middleware ко всем маршрутам в группе
scope("admin", [authenticate], () => {
  // Эти маршруты будут требовать аутентификации
  get("/users", "users/index");
  post("/users", "users/create");

  // Этот маршрут будет требовать и аутентификации, и валидации
  post("/users/:id", [validateUser], "users/update");
});

// Комбинирование нескольких middleware для группы
scope("api", [authenticate, logRequest], () => {
  get("/stats", "stats/index");
  get("/health", "health/check");
});

// Простая группа без middleware
scope("public", () => {
  get("/about", "pages/about");
  get("/contact", "pages/contact");
});
```

Middleware, указанные вторым параметром, будут применяться ко всем маршрутам внутри этой группы.

При этом вы можете добавлять дополнительные middleware к конкретным маршрутам, которые будут выполняться после middleware группы.

### Структура файлов приложения:

```bash
src/
  index.ts
  routes/
    index.ts
  actions/
    index/
      indexAction.ts
    users/
      showAction.ts
      createAction.ts
      updateAction.ts
    posts/
      showAction.ts
      createAction.ts
    admin/
      users/
        listAction.ts
        createAction.ts
      posts/
        listAction.ts
        updateAction.ts
```

Пример маршрутов, соответствующих этой структуре:

```ts
import { root, get, post, routeScope as scope } from "@the-teacher/the-router";

// Корневой и базовые маршруты
root("index/index"); // -> src/actions/index/indexAction.ts
get("/users", "users/show"); // -> src/actions/users/showAction.ts
post("/users", "users/create"); // -> src/actions/users/createAction.ts
get("/posts", "posts/show"); // -> src/actions/posts/showAction.ts
post("/posts", "posts/create"); // -> src/actions/posts/createAction.ts

// Административная часть
scope("admin", () => {
  get("/users", "users/list"); // -> src/actions/admin/users/listAction.ts
  post("/users", "users/create"); // -> src/actions/admin/users/createAction.ts
  get("/posts", "posts/list"); // -> src/actions/admin/posts/listAction.ts
  post("/posts", "posts/update"); // -> src/actions/admin/posts/updateAction.ts
});
```

Это создаст маршруты:

- GET `/` -> `src/actions/index/indexAction.ts`
- GET `/users` -> `src/actions/users/showAction.ts`
- POST `/users` -> `src/actions/users/createAction.ts`
- GET `/posts` -> `src/actions/posts/showAction.ts`
- POST `/posts` -> `src/actions/posts/createAction.ts`
- GET `/admin/users` -> `src/actions/admin/users/listAction.ts`
- POST `/admin/users` -> `src/actions/admin/users/createAction.ts`
- GET `/admin/posts` -> `src/actions/admin/posts/listAction.ts`
- POST `/admin/posts` -> `src/actions/admin/posts/updateAction.ts`

### Группировка маршрутов

Группируйте связанные маршруты под общим префиксом:

```ts
scope("admin", () => {
  get("/users", "users/list"); // -> src/actions/admin/users/listAction.ts
  post("/users", "users/create"); // -> src/actions/admin/users/createAction.ts
});
```

### Маршруты с параметрами

Маршруты могут включать динамические параметры:

```ts
// Базовые маршруты с параметрами
get("/users/:id", "users/show"); // -> /users/123
get("/posts/:id/comments", "posts#comments"); // -> /posts/456/comments

// Параметры с middleware
get("/users/:id", [authenticate], "users/show");

// Несколько параметров
get("/posts/:postId/comments/:commentId", "comments#show");
```

### Порядок маршрутов

Порядок определения маршрутов имеет значение. Более специфичные маршруты должны быть определены перед более общими:

```ts
// ✅ Правильный порядок
get("/posts/featured", "posts/featured"); // Сначала специфичный маршрут
get("/posts/:id", "posts/show"); // Затем общий маршрут

// ❌ Неправильный порядок - "/posts/featured" никогда не будет достигнут
get("/posts/:id", "posts/show"); // Общий маршрут перехватывает все
get("/posts/featured", "posts/featured"); // Никогда не сработает
```

### Организация Middleware

При использовании нескольких middleware рекомендуется группировать их в переменные для лучшей поддерживаемости:

```ts
// Группировка связанных middleware
const authMiddlewares = [authenticate, checkRole];
const validationMiddlewares = [validateUser, sanitizeInput];

// Использование групп middleware в маршрутах
get("/users", authMiddlewares, "users/index");
post("/users", [...authMiddlewares, ...validationMiddlewares], "users/create");

// В сгруппированных маршрутах
const adminMiddlewares = [authenticate, requireAdmin, logAccess];
scope("admin", adminMiddlewares, () => {
  get("/users", "users/list");

  // Дополнительные middleware для конкретных маршрутов
  const userUpdateMiddlewares = [validateUser];
  post("/users/:id", userUpdateMiddlewares, "users/update");
});
```

### API Reference

Базовое использование:

- `root(scopeAction)`: Определяет корневой маршрут (`/`)
- `get(path, scopeAction)`: Определяет GET маршрут
- `post(path, scopeAction)`: Определяет POST маршрут
- `put(path, scopeAction)`: Определяет PUT маршрут
- `patch(path, scopeAction)`: Определяет PATCH маршрут
- `destroy(path, scopeAction)`: Определяет DELETE маршрут
- `options(path, scopeAction)`: Определяет OPTIONS маршрут
- `head(path, scopeAction)`: Определяет HEAD маршрут
- `all(path, scopeAction)`: Определяет маршрут для всех HTTP методов
- `scope(prefix, callback)`: Группирует маршруты под общим префиксом

С middleware:

- `root(middlewares[], scopeAction)`: Определяет корневой маршрут с middleware
- `get(path, middlewares[], scopeAction)`: Определяет GET маршрут с middleware
- `post(path, middlewares[], scopeAction)`: Определяет POST маршрут с middleware
- `put(path, middlewares[], scopeAction)`: Определяет PUT маршрут с middleware
- `patch(path, middlewares[], scopeAction)`: Определяет PATCH маршрут с middleware
- `destroy(path, middlewares[], scopeAction)`: Определяет DELETE маршрут с middleware
- `options(path, middlewares[], scopeAction)`: Определяет OPTIONS маршрут с middleware
- `head(path, middlewares[], scopeAction)`: Определяет HEAD маршрут с middleware
- `all(path, middlewares[], scopeAction)`: Определяет маршрут для всех HTTP методов с middleware
- `scope(prefix, middlewares[], callback)`: Группирует маршруты с middleware

Примеры:

```ts
// Базовое использование
root("index#index");
get("/users", "users#show");
post("/users", "users#create");
put("/users/:id", "users#update");
patch("/users/:id", "users#patch");
destroy("/users/:id", "users#delete");
options("/users", "users#options");
head("/users", "users#head");
all("/api", "api#handle");
scope("admin", () => {
  /* маршруты */
});

// С middleware
const authMiddlewares = [authenticate, logRequest];
root([authenticate], "index#index");
get("/users", authMiddlewares, "users#show");
put("/users/:id", authMiddlewares, "users#update");
scope("admin", authMiddlewares, () => {
  /* маршруты */
});
```

### Маршруты с регулярными выражениями

Вы можете использовать регулярные выражения для путей маршрутов:

```ts
// Сопоставление путей, заканчивающихся на 'fly'
get(/.*fly$/, "insects#list"); // Совпадает с: /butterfly, /dragonfly
get(/^\/api\/v\d+\/.*$/, "api#handle"); // Совпадает с: /api/v1/users, /api/v2/posts

// Маршруты с регулярными выражениями и middleware
get(/^\/secure\/.*$/, [authenticate], "secure#handle");

// Порядок важен и для маршрутов с регулярными выражениями
get(/^\/api\/v1\/users$/, "users/list"); // Сначала специфичный маршрут
get(/^\/api\/v1\/.*$/, "api/handle"); // Затем общий маршрут
```

Примечание: При использовании регулярных выражений путь передается в `Express.js` как есть, без какой-либо нормализации.

### Ресурсные маршруты

Подобно Ruby on Rails, вы можете определить набор RESTful маршрутов для ресурса:

```ts
resources("posts");
```

Это создаст следующие маршруты:

- `GET /posts` -> `src/actions/posts/indexAction.ts`
- `GET /posts/new` -> `src/actions/posts/newAction.ts`
- `POST /posts` -> `src/actions/posts/createAction.ts`
- `GET /posts/:id` -> `src/actions/posts/showAction.ts`
- `GET /posts/:id/edit` -> `src/actions/posts/editAction.ts`
- `PUT /posts/:id` -> `src/actions/posts/updateAction.ts`
- `PATCH /posts/:id` -> `src/actions/posts/updateAction.ts`
- `DELETE /posts/:id` -> `src/actions/posts/destroyAction.ts`

Вы можете добавить middleware для всех маршрутов ресурса:

```ts
const postMiddlewares = [authenticate, logRequest];
resources("posts", postMiddlewares);
```

Ресурсы также можно группировать:

```ts
scope("admin", [authenticate], () => {
  resources("posts"); // Маршруты будут начинаться с /admin
  resources("users"); // Маршруты будут начинаться с /admin
});
```

Это создаст маршруты вида `/admin/posts`, `/admin/posts/:id` и т.д.

### License

MIT.

### Author

Ilya N. Zykin | [the-teacher](https://github.com/the-teacher)
