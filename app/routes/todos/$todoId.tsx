import * as React from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData, useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { TodoList } from "~/models/todo/todolist.server";
import { deleteTodoList, getTodoList } from "~/models/todo/todolist.server";

import type { Todo } from "~/models/todo/todo.server";
import { getTodos, deleteTodo, updateTodo, createTodo  } from "~/models/todo/todo.server";

import { requireUserId } from "~/session.server";

type LoaderData = {
  todoList: TodoList;
  thingsTodo: Todo;
  thingsDone: Todo;
};

type ActionData = {
  errors?: {
    title?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.todoId, "todoId not found");

  const todoList = await getTodoList({ userId, id: params.todoId });
  const thingsTodo = await getTodos({ userId, todoListId: params.todoId, isComplete: false });
  const thingsDone = await getTodos({ userId, todoListId: params.todoId, isComplete: true });

  if (!todoList || !thingsTodo) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ todoList, thingsTodo, thingsDone });
};

// Todo : useSubmit and useTransition or useFetcher
export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const type = formData.get("type");
  const todoListId = formData.get("todoListId");

  invariant(params.todoId, "todoId not found");

  if(type === 'createTodo'){
    const title = formData.get("title");

    if (typeof title !== "string" || title.length === 0) {
      return json<ActionData>(
        { errors: { title: "Title is required" } },
        { status: 400 }
      );
    }
    await createTodo({ title, userId, todoListId: params.todoId  });
    
    return redirect(`/todos/${params.todoId}`);

  } else if(type === 'deleteTodoList'){

    await deleteTodoList({ userId, id: params.todoId });
    return redirect(`/todos`);

  } else if (type === 'deleteTodo'){

    await deleteTodo({ userId, id: todoListId });
    return redirect(`/todos/${params.todoId}`);

  } else if (type === 'updateTodo'){
    
    const isComplete = formData.get("isComplete");
    await updateTodo({ userId, id: todoListId, isComplete  });
    return redirect(`/todos/${params.todoId}`);

  }
};

export default function TodoListDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-bold">{data.todoList.title}</h3>
          </div>
          <div>
            <Form method="post">
              <input type="hidden" name="type" value="deleteTodoList" />
              <button
                type="submit"
                className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
              >
                Delete
              </button>
            </Form>
          </div>
        </div>
        
        <h3 className="mt-3 mb-3 text-xl font-bold">Add to do </h3>
        <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "50%",
          }}
        >
          <input type="hidden" name="type" value="createTodo" />
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Title: </span>
              <input
                ref={titleRef}
                name="title"
                className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.title ? "title-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.title && (
              <div className="pt-1 text-red-700" id="title-error">
                {actionData.errors.title}
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Save
            </button>
          </div>
        </Form>
      </div>

      <div className="mt-4">
        <hr className="my-4" />
        <h3 className="text-2xl font-bold">Things to do ({data.thingsTodo.length}) </h3>
        <div className="m-2 w-1/2">
          {data.thingsTodo.length === 0 ? (
          <p>Come on! Don't you have anything to do?</p>
          ) : (
            <div>
              {data.thingsTodo.map((todo: any, key: number) => (
                <>
                  <div className="flex justify-between m-2" key={todo.id}>
                    <div>
                      <p className="text-md">{key+1}. {todo.title}</p>
                    </div>
                    <div>
                      <Form method="post">
                        <input type="hidden" name="type" value="updateTodo" />
                        <input type="hidden" name="todoListId" value={todo.id} />
                        <input type="hidden" name="isComplete" value="true" />
                        <button className="rounded m-2 bg-green-500 py-2 px-2 text-white text-sm hover:bg-green-600 focus:bg-green-400">
                          Mark as done
                        </button>
                      </Form>
                      <Form method="post">
                        <input type="hidden" name="type" value="deleteTodo" />
                        <input type="hidden" name="todoListId" value={todo.id} />
                        <button type="submit" className="rounded m-2 bg-red-500 py-2 px-2 text-white text-sm hover:bg-red-600 focus:bg-red-400">
                          {/* <Link to={`/todos/${todo.id}/delete`}>Delete</Link> */}
                          Delete
                        </button>
                      </Form>
                    </div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>

        <hr className="my-4" />
        <h3 className="text-2xl font-bold">Things done ({data.thingsDone.length}) </h3>
        <div className="m-2 w-1/2">
          {data.thingsDone.length === 0 ? (
          <p>Come on! Don't you have anything to do?</p>
          ) : (
            <div>
              {data.thingsDone.map((todo: any, key: number) => (
                <>
                  <div className="flex justify-between m-2" key={todo.id}>
                    <div>
                      <p className="text-md">{key+1}. {todo.title}</p>
                    </div>
                    <div>
                      <Form method="post">
                        <input type="hidden" name="type" value="updateTodo" />
                        <input type="hidden" name="todoListId" value={todo.id} />
                        <input type="hidden" name="isComplete" value="false" />
                        <button className="rounded bg-gray-500 py-2 px-2 text-white text-sm hover:bg-gray-600 focus:bg-gray-400">
                          Move To do
                        </button>
                      </Form>
                    </div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>TodoList not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
