import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import { deleteRating, getUserWithRatings } from "~/utils/restaurants.server";
import { Restaurant } from "~/types";
import { UserRatings } from "~/components/userRatings";
import { NavBar } from "~/components/navBar";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  let otherUser;
  if (id && id !== user.id) {
    otherUser = true;
  }

  // Fetch user's restaurants or another user's data based on the id
  const currUser = await getUserWithRatings(id || user.id);

  const ratingsInOrder = currUser.places.slice().reverse();

  if (!currUser || !currUser.places) {
    return json({ error: "Failed to load user restaurants" });
  }

  return { user, currUser, otherUser, ratingsInOrder };
};

export const meta: MetaFunction = () => {
  return [{ title: "Profile" }];
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
      const deletedRestaurant = await deleteRating(id?.toString() || "");
      return deletedRestaurant;
    }
  }
  return "";
};

export default function Profile() {
  const { user, currUser, error, otherUser, ratingsInOrder } =
    useLoaderData<typeof loader>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    ratingsInOrder || undefined // Initialize with user's collected restaurants or an empty array
  );

  useEffect(() => {
    setRestaurants(ratingsInOrder);
  }, [ratingsInOrder]);

  const submit = useSubmit();
  const deleteRating = (restaurantId: string) => {
    setRestaurants((prev) =>
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
        <UserRatings
          currUser={currUser}
          otherUser={otherUser}
          restaurants={restaurants}
          deleteRating={deleteRating}
        />
      </div>
    </div>
  );
}
