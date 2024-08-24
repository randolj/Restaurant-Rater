import { prisma } from "./prisma.server";
import { json } from "@remix-run/node";
import { RestaurantData } from "~/types/jobs";

export const getMyRestaurants = async (userID: string) => {
  const userWithRestaurants = await prisma.user.findUnique({
    where: { id: userID },
    include: { places: true },  // Make sure to include the 'places' relation
  });

  if (!userWithRestaurants) {
    throw new Error("User not found or user has no restaurants.");
  }

  return userWithRestaurants;
};

// Eventually will want to only grab most recent ones
export const getAllRestaurants = async () => {
  const allRestaurants = await prisma.restaurant.findMany({
    include: {
      postedBy: {
        select: {
          name: true,
        }
      } // prisma does not include related data by default, only want user's name, maybe username when that is a feature
    }
  });

  if (!allRestaurants) {
    throw new Error("Restaurants not found.");
  }

  return allRestaurants;
};

export const createRestaurant = async ({
  name,
  rating,
  postedBy,
  place_id,
}: RestaurantData & { place_id: string }) => {
  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      rating,
      place_id,
      postedBy,
    },
  });

  if (!restaurant) {
    return json({ error: 'Could not create the restaurant' });
  }

  return json({
    message: "Restaurant created successfully",
    success: "true",
    payload: restaurant,
  });
};

export const deleteRestaurant = async (place_id: string) => {
  // First, find the restaurant by place_id using findUnique
  const restaurant = await prisma.restaurant.findUnique({
    where: { place_id },
  });

  if (!restaurant) {
    return json({ error: "Restaurant not found" });
  }

  // Now, delete the restaurant by its MongoDB ObjectId (restaurant.id)
  const deletedRestaurant = await prisma.restaurant.delete({
    where: { id: restaurant.id },
  });

  if (!deletedRestaurant) {
    return json({ error: "Could not delete the restaurant" });
  }

  return json({
    message: "Restaurant deleted",
    success: "true",
    payload: deletedRestaurant.id,
  });
};
