import { Restaurant, User } from "~/types";
import { formatPostedDate } from "~/utils/formatDate";
import { Link, useNavigate } from "@remix-run/react";
import { FaTrash } from "react-icons/fa";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {restaurants.map((restaurant: Restaurant) => (
              <div key={restaurant.place_id}>
                <div className="p-4 w-full h-28 bg-white border rounded-md flex justify-between items-center relative">
                  <div className="flex flex-col flex-grow">
                    <span className="text-s font-bold">{restaurant.name}</span>
                    <span className="text-xs">
                      Rating:{" "}
                      <span className="font-bold text-sm">
                        {restaurant.rating}
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {formatPostedDate(new Date(restaurant.createdAt))}
                    </span>
                  </div>
                  {/* TODO: Create some sort of confirm delete */}
                  {!otherUser && (
                    <button
                      className="absolute top-0 right-0 p-2 rounded-xl text-xs mr-2 mt-1"
                      onClick={() => deleteRating(restaurant.place_id)}
                    >
                      <FaTrash className="text-gray-500 text-sm hover:text-gray-600 hover:text-lg transition-all duration-200 ease-linear" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
