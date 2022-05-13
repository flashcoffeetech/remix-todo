import type { User, Todo } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Todo } from "@prisma/client";

export function getTodo({
  id,
  userId,
}: Pick<Todo, "id"> & {
  userId: User["id"];
}) {
  return prisma.todo.findFirst({
    where: { id, userId },
  });
}

export function getTodos({ todoListId, userId, isComplete }: Pick<Todo, "todoListId"> & { userId: User["id"] }) {
  return prisma.todo.findMany({
    where: { userId, todoListId, isComplete },
    orderBy: { updatedAt: "desc" },
  });
}

export function createTodo({
  title,
  userId,
  todoListId,
}: Pick<TodoList, "title"> & {
  userId: User["id"];
}) {
  return prisma.todo.create({
    data: {
      title,
      todoListId,
      isComplete: false,
      userId,
    },
  });
}

export async function deleteTodo({
  id,
  userId,
}: Pick<Todo, "id"> & { userId: User["id"] }) {
  try {
    const data = await prisma.todo.delete({
      where: { id },
    });
    return data;
  } catch (error) {
    throw new Error(error); 
  }
}


export async function updateTodo({
  id,
  userId,
  isComplete,
}: Pick<Todo, "id"> & { userId: User["id"] }) {
  try {
    const data = await prisma.todo.findFirst({
      where: { id, userId },
    });
  
    if(data){
      return prisma.todo.update({
        data: {
          isComplete: (isComplete === 'true'),
          user: {
            connect: {
              id: userId,
            },
          },
        },
        where: {
          id,
        },
      });
    }
  } catch (error) {
    throw new Error(error);
  }
}
