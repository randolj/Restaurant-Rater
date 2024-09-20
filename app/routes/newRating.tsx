import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { NavBar } from "~/components/navBar";
import { RatingCreate } from "~/components/ratingCreate";
import { Restaurant } from "~/types";
import { authenticator } from "~/utils/auth.server";
import { createRating, getUserWithRatings } from "~/utils/restaurants.server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const meta: MetaFunction = () => {
  return [{ title: "Add a rating" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const myRatingsWithUser = await getUserWithRatings(user.id);
  const myRatings = myRatingsWithUser.places;

  return { user, myRatings };
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

      // Handle file upload
      const file = form.get("file") as File | null;
      if (!file) {
        console.log("No image");
      }

      let fileStream;
      if (file) {
        // Convert file to a buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Define the file path and save the file
        const filePath = path.join(__dirname, `../../uploads/${file.name}`);
        await writeFile(filePath, buffer);
        fileStream = fs.createReadStream(filePath);
      }

      await createRating({
        name: mainText,
        rating: ratingNum ?? 0,
        postedBy: {
          connect: {
            id: user.id,
          },
        },
        place_id: placeId,
        fileStream: fileStream,
        originalFilename: file?.name,
      });

      return redirect("/");
    }
  }
  return "";
};

export default function NewRating() {
  const { user, myRatings } = useLoaderData<typeof loader>();

  const [tempRestaurant, setTempRestaurant] = useState<Restaurant | undefined>(
    undefined
  );
  const [tempRating, setTempRating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [input, setInput] = useState("");

  const handleSelect = (prediction: Restaurant) => {
    setInput("");
    setTempRestaurant(prediction);
    setErrorMessage("");
    setShowPredictions(false);
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
              className="text-primary hover:bg-gray-500 bg-white py-1 border px-3 text-sm rounded-md font-semibold"
            >
              Logout
            </button>
          </Form>
        ) : null}
        <div className="rounded-lg bg-white p-6 w-[40rem]">
          <RatingCreate
            tempRestaurant={tempRestaurant}
            setTempRestaurant={setTempRestaurant}
            tempRating={tempRating}
            setTempRating={setTempRating}
            setErrorMessage={setErrorMessage}
            myRatings={myRatings}
            showPredictions={showPredictions}
            setShowPredictions={setShowPredictions}
            handleSelect={handleSelect}
            input={input}
            setInput={setInput}
          />
          {errorMessage && (
            <div className="text-red-500 mt-2 ml-1">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
