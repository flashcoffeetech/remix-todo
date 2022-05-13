import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getTodoLists } from "~/models/todo/todolist.server";

type LoaderData = {
  todoListItems: Awaited<ReturnType<typeof getTodoLists>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const todoListItems = await getTodoLists({ userId });
  return json<LoaderData>({ todoListItems });
};

export default function TodosPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-blue-500 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Todo</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new-todolist" className="block p-4 text-xl text-blue-500">
            + New Todo
          </Link>

          <hr />

          {data.todoListItems.length === 0 ? (
            <p className="p-4">No todos yet</p>
          ) : (
            <ol>
              {data.todoListItems.map((todo: any) => {
                return (
                  <li key={todo.id}>
                    <NavLink
                      className={({ isActive }) => `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`}
                      to={todo.id}
                    >
                      {todo.title}
                    </NavLink>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
