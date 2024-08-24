import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { NavBar } from "~/components/navBar";
import { Restaurant } from "~/types";
import { getAllRestaurants } from "~/utils/restaurants.server";

export const loader: LoaderFunction = async ({ request }) => {
  const all = await getAllRestaurants();

  return all;
};

export const action: ActionFunction = async ({ request }) => {
  return "";
};

export default function Home() {
  const all = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <NavBar />
      <div className="flex-1 min-h-screen flex justify-center bg-primary items-center flex-col">
        {all.length > 0 &&
          all.map((restaurant: Restaurant) => (
            <div
              key={restaurant.place_id}
              className="p-4 w-96 h-20 bg-white border rounded-xl flex justify-between items-center mt-2"
            >
              <div className="flex flex-col flex-grow text-xs">
                <span className="text-base text-primary">
                  {restaurant.postedBy.name}
                </span>
                <span>{restaurant.name}</span>
                <span>Rating: {restaurant.rating}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
