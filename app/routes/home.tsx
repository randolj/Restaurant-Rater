import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { NavBar } from "~/components/navBar";
import { Restaurant } from "~/types";
import { getAllRestaurants } from "~/utils/restaurants.server";
import { authenticator } from "~/utils/auth.server";
import { formatPostedDate } from "~/utils/formatDate";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // TODO: Only grab recent ones (i.e. by date or like latest 10)
  // Will be displayed on a homepage
  const all = await getAllRestaurants();

  return { user, all };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }
  }
  return "";
};

export default function Home() {
  const { user, all } = useLoaderData<typeof loader>();

  const reversedRestaurants = all.slice().reverse(); // Using slice() to avoid mutating the original array

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
        {reversedRestaurants.length > 0 &&
          reversedRestaurants.map((restaurant: Restaurant) => (
            <div
              key={restaurant.place_id}
              className="px-4 pt-2 w-96 bg-white border rounded-xl flex justify-between items-center mt-2"
            >
              <div className="flex flex-col flex-grow text-base">
                <span className="text-lg text-primary">
                  {restaurant.postedBy.name}
                </span>
                <span>{restaurant.name}</span>
                <span>Rating: {restaurant.rating}</span>
                <span className="text-xs text-gray-400 mt-1 pb-2">
                  {formatPostedDate(new Date(restaurant.createdAt))}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
