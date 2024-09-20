import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { useState, useRef } from "react";
import { json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import { createRating, deleteRating } from "~/utils/restaurants.server";
import { Restaurant } from "~/types";
import { RatingCreate } from "~/components/ratingCreate";
import { UserRatings } from "~/components/userRatings";
import { NavBar } from "~/components/navBar";
import { User } from "@prisma/client";
import fs from "fs";
import path from "path";

// TODO: Improve theme and styling
// Some organization
// TODO: User following and followers
// This includes a page to only see following's ratings
// TODO: Usernames & search by name/username

export const meta: MetaFunction = () => {
  return [
    { title: "" },
    { name: "description", content: "Welcome to Restaurant Rater!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = (await authenticator.isAuthenticated(request, {
    successRedirect: "/home",
    failureRedirect: "/login",
  })) as User | null;

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // // Fetch user's restaurants
  // const myRatingsWithUser = await getUserWithRatings(user.id);
  // const myRatings = myRatingsWithUser.places;

  // // Will be displayed on a homepage
  // const all = await getAllRatings();

  // if (!myRatingsWithUser || !myRatings) {
  //   return json({ error: "Failed to load user restaurants" });
  // }

  // const collectedRestaurants = myRatings.map((place) => ({
  //   place_id: place.id,
  //   main_text: place.name,
  //   rating: place.rating,
  // }));

  return { user };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }
    case "new": {
      const placeId = form.get("place_id") as string;
      const mainText = form.get("main_text") as string;
      const rating = form.get("rating");
      const ratingNum = rating ? Number(rating) : null;
      const user = await authenticator.isAuthenticated(request);

      if (!placeId || !mainText || !ratingNum) {
        return json({ error: "No restaurant data entered" });
      }

      const filePath = path.join(__dirname, "../../public/favicon.ico");

      // Create a readable stream from the file
      const fileStream = fs.createReadStream(filePath);

      const newRestaurant = await createRating({
        name: mainText,
        rating: ratingNum ?? 0,
        postedBy: {
          connect: {
            id: user.id,
          },
        },
        place_id: placeId,
        fileStream: fileStream,
        originalFilename: "image.jpg",
      });

      return json(newRestaurant);
    }
    case "delete": {
      const id = form.get("id");
      const deletedRestaurant = await deleteRating(id?.toString() || "");
      return deletedRestaurant;
    }
    default:
      return null;
  }
};

export default function Index() {
  const { user, collectedRestaurants, error } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<{ predictions: Restaurant[] }>();
  const [input, setInput] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>(
    collectedRestaurants || [] // Initialize with user's collected restaurants or an empty array
  );
  const [showPredictions, setShowPredictions] = useState(false); // New state to control visibility of predictions

  const [tempRestaurant, setTempRestaurant] = useState<Restaurant | undefined>(
    undefined
  );
  const [errorMessage, setErrorMessage] = useState("");

  const submit = useSubmit();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (prediction: Restaurant) => {
    setInput("");
    setTempRestaurant(prediction);
    setShowPredictions(false);
  };

  const deleteRating = (restaurantId: string) => {
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

  const [tempRating, setTempRating] = useState<number | null>(null);

  return (
    <div className="flex">
      <NavBar />
      <div className="flex-1 min-h-screen flex justify-center bg-primary items-center flex-col gap-y-5">
        {user ? (
          <Form method="post" className="absolute top-5 right-5">
            <button
              type="submit"
              name="action"
              value="logout"
              className="text-primary hover:bg-gray-500 bg-white py-1 border px-3 text-sm rounded-md font-semibold"
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
          <RatingCreate
            showPredictions={showPredictions}
            setShowPredictions={setShowPredictions}
            handleSelect={handleSelect}
            input={input}
            setInput={setInput}
            myRatings={collectedRestaurants}
            tempRestaurant={tempRestaurant}
            setTempRestaurant={setTempRestaurant}
            tempRating={tempRating}
            setTempRating={setTempRating}
            setErrorMessage={setErrorMessage}
            setSelectedRestaurants={setSelectedRestaurants}
          />
          {(error || errorMessage) && (
            <div className="text-red-500 mt-2 ml-1">
              {error}
              {errorMessage}
            </div>
          )}
        </div>
        <UserRatings
          currUser={user}
          otherUser={false}
          restaurants={selectedRestaurants}
          deleteRating={deleteRating}
        />
      </div>
    </div>
  );
}
