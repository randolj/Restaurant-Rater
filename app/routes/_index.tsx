import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { authenticator } from "~/utils/auth.server";
import { createTask, deleteTask, getMyTasks } from "~/utils/tasks.server";

type SimplifiedPrediction = {
  place_id: string;
  main_text: string;
};

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
  const { user } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<{ predictions: SimplifiedPrediction[] }>();
  const [input, setInput] = useState("");
  const [selectedPrediction, setSelectedPrediction] =
    useState<SimplifiedPrediction | null>(null);

  const [showSelected, setShowSelected] = useState(false);

  const handleSelect = (prediction: SimplifiedPrediction) => {
    setInput(prediction.main_text);
    setSelectedPrediction(prediction);
    setShowSelected(true);
  };

  const undoSelect = () => {
    setSelectedPrediction(null);
    setShowSelected(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);
    setSelectedPrediction(null);

    if (value) {
      fetcher.load(`/autocomplete?input=${value}`);
    } else {
      fetcher.data = { predictions: [] };
    }
  };

  return (
    <div className="min-h-screen relative flex justify-center bg-sky-400 items-center flex-col gap-y-5">
      {user ? (
        <Form method="post" className="absolute top-5 right-5">
          <button
            type="submit"
            name="action"
            value="logout"
            className="text-sky-400 bg-white py-1 border px-3 text-sm rounded-md font-semibold"
          >
            Logout
          </button>
        </Form>
      ) : null}
      <div className="rounded-lg bg-white p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-normal text-gray-500">
            Welcome {user.name}!
          </h2>
        </div>
        <h1 className="text-3xl font-bold mb-5">Restaurant Rating App</h1>
        {!showSelected && (
          <Form method="get" action="/restaurants">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Restaurant Name:
              </label>
              <input
                type="text"
                name="restaurant"
                value={input}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </Form>
        )}
        {fetcher.data && fetcher.data.predictions && !selectedPrediction && (
          <ul
            style={{
              border: "1px solid #ccc",
              marginTop: "10px",
              listStyle: "none",
              padding: 0,
            }}
          >
            {fetcher.data.predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                style={{ padding: "10px", cursor: "pointer" }}
              >
                {prediction.main_text}
              </li>
            ))}
          </ul>
        )}
        {showSelected && (
          <div className="p-4 border rounded-xl flex justify-between items-center">
            <span className="text-xs">{selectedPrediction?.main_text}</span>
            <button
              className="p-1 border rounded-xl text-xs"
              onClick={() => undoSelect()}
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
