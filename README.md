# Remix To do

This is a pretty simple todo app, but it's a good example of how you can build a full stack app with Prisma and Remix. The main functionality is creating users, logging in and out, and creating and deleting todos.

- Install Depedencies:

  ```sh
  yarn install
  ```

- Initial setup:

  ```sh
  yarn run setup
  ```

- Run the first build:

  ```sh
  yarn run build
  ```

- Start dev server:

  ```sh
  yarn run dev
  ```

- Testing:

  ```sh
  yarn test:e2e:dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `dev@test.com`
- Password: `test12345678`

### Relevant code:

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting todos [./app/models/todo/todolist.server.ts](./app/models/todo/todolist.server.ts)

