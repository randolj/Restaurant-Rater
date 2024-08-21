import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import {
  createRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} from "~/utils/restaurants.server";

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

  // Fetch user restaurants
  const userRestaurants = await getMyRestaurants(user.id);

  if (!userRestaurants || !userRestaurants.places) {
    return json({ error: "Failed to load user restaurants" });
  }

  // Extract the relevant data
  const collectedRestaurants = userRestaurants.places.map((place) => ({
    place_id: place.place_id,
    main_text: place.name,
  }));

  return { user, collectedRestaurants };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }
    case "new": {
      const placeIds = form.getAll("place_ids") as string[];
      const mainTexts = form.getAll("main_texts") as string[];
      const user = await authenticator.isAuthenticated(request);

      if (!placeIds.length || !mainTexts.length) {
        return json({ error: "No restaurants selected" });
      }

      const createPromises = placeIds.map((place_id, index) =>
        createRestaurant({
          name: mainTexts[index],
          postedBy: {
            connect: {
              id: user.id,
            },
          },
          place_id,
        })
      );

      const results = await Promise.all(createPromises);
      return json(results);
    }
    case "delete": {
      const id = form.get("id");
      const deletedRestaurant = await deleteRestaurant(id?.toString() || "");
      return deletedRestaurant;
    }
    default:
      return null;
  }
};

export default function Index() {
  const { user, collectedRestaurants, error } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<{ predictions: SimplifiedPrediction[] }>();
  const [input, setInput] = useState("");
  const [selectedPredictions, setSelectedPredictions] = useState<
    SimplifiedPrediction[]
  >(
    collectedRestaurants || [] // Initialize with user's collected restaurants or an empty array
  );

  const submit = useSubmit();

  const handleSelect = (prediction: SimplifiedPrediction) => {
    setInput(""); // Clear input after selection
    setSelectedPredictions((prev) => [...prev, prediction]);
    submit(
      {
        action: "new",
        main_texts: prediction.main_text,
        place_ids: prediction.place_id,
      },
      { method: "post" }
    );
  };

  const undoSelect = (restaurantId: string) => {
    setSelectedPredictions((prev) =>
      prev.filter((prediction) => prediction.place_id !== restaurantId)
    );
    submit(
      {
        action: "delete",
        id: restaurantId, // Use MongoDB _id instead of place_id
      },
      { method: "post" }
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);

    if (value) {
      fetcher.load(`/autocomplete?input=${value}`);
    } else {
      fetcher.data = { predictions: [] };
    }
  };

  return (
    <div className="min-h-screen relative flex justify-center bg-sky-400 items-center flex-col gap-y-5">
      {error && <div className="text-red-500">{error}</div>}
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
        <Form method="post">
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
          {selectedPredictions.length > 0 && (
            <>
              {selectedPredictions.map((prediction) => (
                <div key={prediction.place_id}>
                  <input
                    type="hidden"
                    name="place_ids"
                    value={prediction.place_id}
                  />
                  <input
                    type="hidden"
                    name="main_texts"
                    value={prediction.main_text}
                  />
                  <div className="p-4 border rounded-xl flex justify-between items-center mt-2">
                    <span className="text-xs">{prediction.main_text}</span>
                    <button
                      className="p-1 border rounded-xl text-xs"
                      onClick={() => undoSelect(prediction.place_id)}
                    >
                      Undo
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </Form>
        {fetcher.data && fetcher.data.predictions && (
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
      </div>
    </div>
  );
}
