import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Taskform } from "~/components/taskform";
import { Tasklist, TaskListProps } from "~/components/tasklist";
import { Layout } from "~/root";

import { authenticator } from "~/utils/auth.server";
import { createTask, deleteTask, getMyTasks } from "~/utils/tasks.server";

// TODO: Improve README instructions and description
// TODO: TS unit tests

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userTask = await getMyTasks(user.id);
  return { user, userTask };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }
    case "new": {
      const Category = form.get("category");
      const Message = form.get("message");
      const user = await authenticator.isAuthenticated(request);
      // TODO: Validate message for not being empty
      const newTask = await createTask({
        category: Category,
        message: Message,
        postedBy: {
          connect: {
            id: user.id,
          },
        },
      });
      return newTask;
    }
    case "delete": {
      const id = form.get("id");
      const deletedTask = await deleteTask(id);
      return deletedTask;
    }
    default:
      return null;
  }
};

export default function Index() {
  const { user, userTask } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen flex justify-center bg-sky-400 items-center flex-col gap-y-5">
      <div className="rounded-lg bg-white p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-normal text-gray-500">
            Welcome {user.name}!
          </h2>
          {user ? (
            <Form method="post" className="ml-auto">
              <button
                type="submit"
                name="action"
                value="logout"
                className="text-sky-400 py-1 border px-3 text-sm rounded-md font-semibold"
              >
                Logout
              </button>
            </Form>
          ) : null}
        </div>
        <h1 className="text-3xl font-bold mb-5">Task tracking app</h1>
        <Taskform />
        <br />
        <div className="grid gap-5">
          {userTask.task.length ? (
            <>
              {" "}
              {userTask.task.map((task: TaskListProps) => {
                return (
                  <Tasklist
                    key={task.id}
                    id={task.id}
                    message={task.message}
                    category={task.category}
                  />
                );
              })}
            </>
          ) : (
            <div className="flex justify-center">😳 No task</div>
          )}
        </div>
      </div>
    </div>
  );
}
