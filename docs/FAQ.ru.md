# Часто задаваемые вопросы

## Зачем нужен этот роутер?

Express.js предоставляет базовый роутер, но его гибкость и отсутствие предопределённой структуры приложения часто приводят к несогласованным решениям в разных проектах.

Этот роутер является надстройкой над базовым роутером Express.js и:

- Задаёт чёткую структуру проекта
- Делает маршрутизацию интуитивно понятной
- Упрощает поддержку кода
- Способствует лучшей организации бизнес-логики

## Что общего с Ruby on Rails?

Роутер вдохновлён подходом Ruby on Rails к определению маршрутов:

```ts
// Rails-подобный синтаксис
root("pages/home");
get("/about", "pages/about");
resources("posts");
```

Поддерживаются все стандартные REST-действия:

- `index` - список ресурсов
- `show` - просмотр ресурса
- `new` - форма создания
- `create` - создание ресурса
- `edit` - форма редактирования
- `update` - обновление ресурса
- `destroy` - удаление ресурса

Метод `resources` автоматически создаёт все необходимые базовые маршруты:

```ts
resources("posts");

// Создаст маршруты:
// GET    /posts          -> posts/index
// GET    /posts/new      -> posts/new
// POST   /posts          -> posts/create
// GET    /posts/:id      -> posts/show
// GET    /posts/:id/edit -> posts/edit
// PUT    /posts/:id      -> posts/update
// PATCH  /posts/:id      -> posts/update
// DELETE /posts/:id      -> posts/destroy
```

## Что общего с Hanami?

Главное сходство с Hanami - это подход к организации действий (actions). В традиционных контроллерах часто накапливается много кода, что затрудняет их поддержку:

```ts
// Традиционный подход с контроллером
class PostsController {
  index() {
    /* ... */
  }
  show() {
    /* ... */
  }
  create() {
    /* ... */
  }
  // и т.д.
}
```

Как и в Hanami, этот роутер поощряет разделение действий на отдельные файлы:

```
src/
  actions/
    posts/
      indexAction.ts  // Только логика списка постов
      showAction.ts   // Только логика просмотра поста
      createAction.ts // Только логика создания поста
```

Каждое действие - это отдельный модуль с единственной ответственностью:

```ts
// src/actions/posts/showAction.ts
export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  // Логика только для просмотра поста
};
```

## Как работает роутер?

1. Определяем маршруты:

```ts
// routes/index.ts
import { root, get, resources } from "@the-teacher/the-router";

root("pages/home");
get("/about", "pages/about");
resources("posts");
```

2. Создаём действия:

```
src/
  actions/
    pages/
      homeAction.ts
      aboutAction.ts
    posts/
      indexAction.ts
      showAction.ts
      // ...
```

3. Маршрутизация запроса:

```
GET /posts/123 ->
  1. Находит маршрут posts/:id
  2. Определяет действие posts#show
  3. Выполняет src/actions/posts/showAction.ts
```

## Как начать использовать роутер?

1. Создайте структуру каталогов:

```
src/
  actions/    # Каталог для действий
  routes/     # Каталог для маршрутов
    index.ts  # Определения маршрутов
```

2. Определите маршруты:

```ts
// src/routes/index.ts
import { root, get, resources } from "@the-teacher/the-router";

root("pages/home");
resources("posts");
```

3. Создайте действия:

```ts
// src/actions/pages/homeAction.ts
export const perform = (req, res) => {
  res.render("home");
};
```

4. Подключите роутер:

```ts
// src/index.ts
import express from "express";
import { getRouter } from "@the-teacher/the-router";
import "./routes";

const app = express();
app.use(getRouter());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

## Дополнительные возможности

### Группировка маршрутов

Маршруты можно группировать с помощью `scope`:

```ts
scope("admin", () => {
  get("/dashboard", "admin/dashboard"); // /admin/dashboard

  resources("posts"); // /admin/posts
  resources("users"); // /admin/users
});
```

### Middleware

Middleware можно применять к отдельным маршрутам или группам:

```ts
get("/profile", [authenticate], "users/profile");

scope("admin", [authenticate, requireAdmin], () => {
  // Все маршруты требуют аутентификации и прав админа
  resources("users");
});
```

Если вы используете несколько middleware, рекомендуется заранее сформировать массив:

```ts
const permissionsMiddlewares = [authenticate, requireOwner, requireEditorRole];

get("/profile", permissionsMiddlewares, "users/profile");
```

### Регулярные выражения

Поддерживаются маршруты с регулярными выражениями:

```ts
get(/.*fly$/, "insects#list"); // Совпадёт с /butterfly, /dragonfly
```

### Порядок маршрутов

Порядок определения маршрутов важен:

```ts
// ✅ Правильно
get("/posts/featured", "posts#featured");
get("/posts/:id", "posts#show");

// ❌ Неправильно
get("/posts/:id", "posts#show"); // Перехватит /posts/featured
get("/posts/featured", "posts#featured"); // Никогда не сработает
```

### Можно ли использовать контроллеры?

Роутер специально спроектирован для работы с отдельными действиями. Действия располагаются в отдельных файлах в соответствующих директориях. Директории соответствуют контроллерам.

Контроллеры используются в логическом разделении кода, но не в физическом.

Это сделано для того, чтобы исключить чтение и понимание иногда сложной логики в файлах контроллеров, где из-за наличия множества действий их сложно читать и понимать.

Действие является отдельным модулем, который экспортирует функцию `perform`. Эта функция является обработчиком запроса пришедшего от `Express.js` и принимает те же параметры:

```ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  // req - объект запроса Express.js
  // - req.params - параметры маршрута (/users/:id)
  // - req.query - параметры запроса (?name=value)
  // - req.body - тело запроса (для POST/PUT/PATCH)
  // - req.headers - заголовки запроса
```

### Как организовать повторно используемую логику?

Создайте общие middleware или утилиты:

```ts
// middleware/auth.ts
export const authenticate = (req, res, next) => {
  // Общая логика аутентификации
};

// validations/postsValidations.ts
export const validatePost = (data) => {
  // Общая логика валидации
};
```

### Как тестировать действия?

Каждое действие - это отдельный модуль, что упрощает тестирование:

```ts
import { perform } from "../actions/posts/showAction";

test("show action", () => {
  const req = { params: { id: "123" } };
  const res = { json: jest.fn() };

  perform(req, res);
  expect(res.json).toHaveBeenCalledWith(/* ... */);
});
```

## Устройство действий (Actions)

Каждое действие - это модуль, экспортирующий функцию `perform`. Эта функция является стандартным обработчиком Express.js и принимает те же параметры:

```ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  // req - объект запроса Express.js
  // - req.params - параметры маршрута (/users/:id)
  // - req.query - параметры запроса (?name=value)
  // - req.body - тело запроса (для POST/PUT/PATCH)
  // - req.headers - заголовки запроса

  // res - объект ответа Express.js
  // - res.json() - отправить JSON
  // - res.send() - отправить ответ
  // - res.render() - отрендерить шаблон
  // - res.status() - установить статус

  // Пример простого действия
  res.json({ message: "Hello!" });
};
```

Примеры типичных действий:

Получение списка ресурсов:

```ts
// actions/posts/indexAction.ts
export const perform = async (req: Request, res: Response) => {
  const posts = await Post.findAll();
  res.json(posts);
};
```

Просмотр отдельного ресурса:

```ts
// actions/posts/showAction.ts
export const perform = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
};
```

Создание нового ресурса:

```ts
// actions/posts/createAction.ts
export const perform = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const post = await Post.create({ title, content });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### Middleware

Middleware (промежуточное ПО) - это функции, которые выполняются до обработки запроса действием. Они позволяют:

- Проверять аутентификацию и авторизацию
- Логировать запросы
- Обрабатывать ошибки
- Модифицировать объекты запроса/ответа
- Прерывать цепочку обработки запроса

Middleware можно применять:

- К отдельным маршрутам
- К группам маршрутов через `scope`
- Ко всем маршрутам ресурса

```ts
// Middleware для аутентификации
const authenticate = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = verifyToken(token);
    next(); // Продолжить обработку запроса
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Применение к отдельному маршруту
get("/profile", [authenticate], "users/profile");

// Применение к группе маршрутов
scope("admin", [authenticate], () => {
  resources("users");
});

// Применение ко всем маршрутам ресурса
resources("posts", [authenticate]);
```

### Регулярные выражения

Роутер поддерживает все возможности работы с регулярными выражениями, доступные в оригинальном роутере Express.js. Это позволяет создавать гибкие маршруты для сложных случаев:

:warning: **Внимание!** Данная возможность поддерживается только из-за того, что используется оригинальный роутер `Express.js`. Автор данного роутера не рекомендует использовать регулярные выражения для маршрутов из-за сложности их понимания и поддержки. В случае, если вам действительно нужно использовать регулярные выражения, рекомендуется тщательно тестировать их работу.

```ts
// Маршруты с регулярными выражениями
get(/.*fly$/, "insects#list"); // Совпадёт с /butterfly, /dragonfly
get(/^\/api\/v\d+\/.*$/, "api#handle"); // Совпадёт с /api/v1/users, /api/v2/posts

// Комбинация с middleware
get(/^\/secure\/.*$/, [authenticate], "secure#handle");

// Порядок важен и для регулярных выражений
get(/^\/api\/v1\/users$/, "users#list"); // Сначала конкретный маршрут
get(/^\/api\/v1\/.*$/, "api#handle"); // Затем общий
```

Использование регулярных выражений может быть полезно для:

- Версионирования API
- Обработки групп похожих URL
- Создания гибких правил маршрутизации
- Перехвата специфических паттернов URL

## Тестирование

Действия легко тестировать, так как каждое действие - это отдельный модуль с единственной функцией. Для тестирования используется Jest и SuperTest:

```ts
import request from "supertest";
import express from "express";
import { getRouter, setActionsPath } from "@the-teacher/the-router";
import path from "path";

describe("Posts actions", () => {
  let app;

  beforeEach(() => {
    // Создаём новое приложение для каждого теста
    app = express();

    // Указываем путь к тестовым действиям
    setActionsPath(path.join(__dirname, "./test_actions"));

    // Подключаем роутер
    app.use(getRouter());
  });

  describe("GET /posts/:id", () => {
    test("returns post by id", async () => {
      // Выполняем GET-запрос к /posts/123
      const response = await request(app).get("/posts/123").expect(200);

      // Проверяем ответ
      expect(response.body).toEqual({
        action: "show",
        id: "123",
      });
    });
  });

  describe("POST /posts", () => {
    test("creates new post", async () => {
      const postData = {
        title: "New Post",
        content: "Content",
      };

      // Выполняем POST-запрос с данными
      const response = await request(app)
        .post("/posts")
        .send(postData)
        .expect(200);

      // Проверяем ответ
      expect(response.body).toEqual({
        action: "create",
        data: postData,
      });
    });
  });
});
```

Тестовые действия могут быть простыми заглушками:

```ts
// test_actions/posts/showAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ action: "show", id });
};

// test_actions/posts/createAction.ts
import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  res.json({ action: "create", data: req.body });
};
```

Для тестирования middleware:

```ts
test("requires authentication", async () => {
  const authenticate = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === "Bearer valid-token") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Добавляем middleware к маршруту
  get("/profile", [authenticate], "users/profile");

  // Тест без токена
  await request(app).get("/profile").expect(401);

  // Тест с правильным токеном
  await request(app)
    .get("/profile")
    .set("Authorization", "Bearer valid-token")
    .expect(200);
});
```
