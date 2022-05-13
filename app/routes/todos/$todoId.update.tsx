import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";


import { updateTodo } from "~/models/todo/todo.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.todoId, "todoId not found");

  await updateTodo({ userId, id: params.todoId, isComplete: params.isComplete });

  return redirect(`/todos/${params.todoId}`);
};

export default function TodoListDelete() {
  return null;
}
