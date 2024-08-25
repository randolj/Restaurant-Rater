import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { useState, useRef } from "react";
import { json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import {
  deleteRestaurant,
  getMyRestaurants,
  getAllRestaurants,
} from "~/utils/restaurants.server";
import { Restaurant } from "~/types";
import { MyRatings } from "~/components/myRatings";
import { NavBar } from "~/components/navBar";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Fetch user's restaurants
  const userRestaurants = await getMyRestaurants(user.id);

  // TODO: Only grab recent ones (i.e. by date or like latest 10)
  // Will be displayed on a homepage
  const all = await getAllRestaurants();

  if (!userRestaurants || !userRestaurants.places) {
    return json({ error: "Failed to load user restaurants" });
  }

  const collectedRestaurants = userRestaurants.places.map((place) => ({
    place_id: place.place_id,
    main_text: place.name,
    rating: place.rating,
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
    case "delete": {
      const id = form.get("id");
      const deletedRestaurant = await deleteRestaurant(id?.toString() || "");
      return deletedRestaurant;
    }
  }
  return "";
};

export default function Profile() {
  const { user, collectedRestaurants, error } = useLoaderData<typeof loader>();
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>(
    collectedRestaurants || [] // Initialize with user's collected restaurants or an empty array
  );

  const submit = useSubmit();
  const undoSelect = (restaurantId: string) => {
    setSelectedRestaurants((prev) =>
      prev.filter((prediction) => prediction.place_id !== restaurantId)
    );
    submit(
      {
        action: "delete",
        id: restaurantId,
      },
      { method: "post" }
    );
  };
  return (
    <div className="flex">
      <NavBar />
      <div className="flex-1 min-h-screen flex justify-center bg-primary items-center flex-col">
        {user ? (
          <Form method="post" className="absolute top-5 right-5">
            <button
              type="submit"
              name="action"
              value="logout"
              className="text-primary bg-white py-1 border px-3 text-sm rounded-md font-semibold"
            >
              Logout
            </button>
          </Form>
        ) : null}
        <MyRatings
          selectedRestaurants={selectedRestaurants}
          undoSelect={undoSelect}
        />
      </div>
    </div>
  );
}
