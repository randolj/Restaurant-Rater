import { Restaurant, User } from "~/types";
import { formatPostedDate } from "~/utils/formatDate";
import { Link, useNavigate } from "@remix-run/react";

export function UserRatings({
  currUser,
  otherUser,
  restaurants,
  deleteRating,
}: {
  currUser: User;
  otherUser: boolean;
  restaurants: Restaurant[];
  deleteRating: (value: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div>
      {otherUser && (
        <label className="block text-white text-lg font-bold mb-2">
          {currUser.name}'s ratings:
        </label>
      )}
      {!otherUser && (
        <label className="block text-white text-xl font-bold mb-2">
          Your ratings:
        </label>
      )}
      {restaurants && restaurants.length > 0 && (
        <>
          {restaurants.map((restaurant: Restaurant) => (
            <div key={restaurant.place_id}>
              <div className="p-4 w-96 h-20 bg-white border rounded-xl flex justify-between items-center mt-2 ">
                <div className="flex flex-col flex-grow">
                  <span className="text-xs">{restaurant.name}</span>
                  <span className="text-xs">Rating: {restaurant.rating}</span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {formatPostedDate(new Date(restaurant.createdAt))}
                  </span>
                </div>
                {/* TODO: Create some sort of confirm delete */}
                {!otherUser && (
                  <button
                    className="p-1 border rounded-xl text-xs self-center"
                    onClick={() => deleteRating(restaurant.place_id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}
      {(!restaurants || restaurants.length <= 0) && (
        <div>
          <span className="text-white" onClick={() => navigate("/newRating")}>
            No ratings yet!{" "}
            <Link to="/signup">
              <span className="text-white px-2 underline">
                Create a rating to get started
              </span>
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
