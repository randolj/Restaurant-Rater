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
import { prisma } from "~/utils/prisma.server";

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

  const userInfo = await prisma.user.findUnique({
    where: { id: id || user.id },
    select: {
      username: true,
      name: true,
      followingIDs: true,
      followedByIDs: true,
    },
  });

  const ratingsInOrder = currUser.places.slice().reverse();

  if (!currUser || !currUser.places) {
    return json({ error: "Failed to load user restaurants" });
  }

  return { user, currUser, otherUser, ratingsInOrder, userInfo };
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
  const { user, currUser, error, otherUser, ratingsInOrder, userInfo } =
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
    <div className="flex bg-primary">
      <NavBar />
      <div className="flex-1 min-h-screen pl-20 pt-4 bg-primary mx-auto max-w-7xl">
        {user ? (
          <Form method="post" className="absolute top-5 right-5">
            <button
              type="submit"
              name="action"
              value="logout"
              className="text-primary hover:bg-gray-500 bg-white py-1 border px-3 text-sm rounded-md font-semibold transition-all duration-200 ease-linear"
            >
              Logout
            </button>
          </Form>
        ) : null}
        <span className="text-3xl text-white">{userInfo.username}</span>

        <div className="pt-2 pb-8 text-white text-lg">
          <div className="flex items-center space-x-4 pb-2">
            <span>
              <span className="font-bold">{ratingsInOrder.length}</span> ratings{" "}
            </span>
            <span>
              <span className="font-bold">{userInfo.followedByIDs.length}</span>{" "}
              followers{" "}
            </span>
            <span>
              <span className="font-bold">{userInfo.followingIDs.length}</span>{" "}
              following
            </span>
          </div>
          <span>{userInfo.name}</span>
        </div>
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
