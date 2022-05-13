import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useCatch } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Todo } from "~/models/todo/todo.server";
import { deleteTodo, getTodo } from "~/models/todo/todo.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  todo: Todo;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const todo = await getTodo({ userId, id: params.todoId });

  return json<LoaderData>({ todo });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.todoId, "todoId not found");

  await deleteTodo({ userId, id: params.todoId })
  return redirect(`/todos/${params.todoId}`);
};

export default function TodoListDelete() {
  useLoaderData() as LoaderData;
  return null;
}


export function ErrorBoundary({ error }: { error: Error }) {
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>TodoList not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
