import type { User, TodoList, Todo } from "@prisma/client";

import { prisma } from "~/db.server";

export type { TodoList, Todo } from "@prisma/client";

export function getTodoList({
  id,
  userId,
}: Pick<TodoList, "id"> & {
  userId: User["id"];
}) {
  return prisma.todoList.findFirst({
    where: { id, userId },
  });
}

export function getTodoLists({ userId }: { userId: User["id"] }) {
  return prisma.todoList.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export function createTodoList({
  title,
  userId,
}: Pick<TodoList, "title"> & {
  userId: User["id"];
}) {
  return prisma.todoList.create({
    data: {
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function deleteTodoList({
  id,
  userId,
}: Pick<TodoList, "id"> & { userId: User["id"] }) {
  await prisma.todo.deleteMany({
    where: { todoListId: id },
  });

  return prisma.todoList.delete({
    where: { id },
  });
}
