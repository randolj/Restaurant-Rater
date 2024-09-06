import { prisma, User } from "./prisma.server";
import { json } from "@remix-run/node";
import { RestaurantData } from "~/types/jobs";

export const getUserWithRatings = async (userID: string) => {
  const userWithRestaurants = await prisma.user.findUnique({
    where: { id: userID },
    select:
    {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      places: true,
    }, // not ideal
  });

  if (!userWithRestaurants) {
    throw new Error("User not found or user has no restaurants.");
  }

  return userWithRestaurants;
};

// Eventually will want to only grab most recent ones
export const getFollowingRatings = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      followingIDs: true,
    },
  });

  const allRestaurants = await prisma.restaurant.findMany({
    where: {
      OR: [ // this forces prisma to return everything that a user follows or the user posted themself
        { postedBy: { id: { in: user?.followingIDs } } },
        { postedBy: { id: userId } },
      ],
    },
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        }
      }
    }
  });

  if (!allRestaurants) {
    throw new Error("Restaurants not found.");
  }

  const allInOrder = allRestaurants.slice().reverse();

  return allInOrder;
};

export const getAllRatings = async () => {
  const allRestaurants = await prisma.restaurant.findMany({
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        }
      }
    } // prisma does not include related data by default, only want user's name, maybe username when that is a feature
  });

  if (!allRestaurants) {
    throw new Error("Restaurants not found.");
  }

  const allInOrder = allRestaurants.slice().reverse();

  return allInOrder;
};

export const createRating = async ({
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

export const deleteRating = async (place_id: string) => {
  // First, find the restaurant by place_id using findUnique
  const restaurant = await prisma.restaurant.findUnique({
    where: { place_id },
  });

  if (!restaurant) {
    return json({ error: "Restaurant not found" });
  }

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
