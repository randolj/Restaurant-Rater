import { Restaurant } from "~/types";

export function MyRatings({
  selectedRestaurants,
  undoSelect,
}: {
  selectedRestaurants: Restaurant[];
  undoSelect: (value: string) => void;
}) {
  return (
    <div>
      {selectedRestaurants.length > 0 && (
        <>
          {selectedRestaurants.map((restaurant) => (
            <div key={restaurant.place_id}>
              <div className="p-4 w-96 h-20 bg-white border rounded-xl flex justify-between items-center mt-2">
                <div className="flex flex-col flex-grow">
                  <span className="text-xs">{restaurant.main_text}</span>
                  <span className="text-xs">Rating: {restaurant.rating}</span>
                </div>
                <button
                  className="p-1 border rounded-xl text-xs self-center"
                  onClick={() => undoSelect(restaurant.place_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
