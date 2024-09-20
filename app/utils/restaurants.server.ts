import { prisma, User } from "./prisma.server";
import { json } from "@remix-run/node";
import { RestaurantData } from "~/types/jobs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

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
      followedByIDs: true,
      following: true,
    },
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


export const uploadToS3 = async (fileStream: NodeJS.ReadableStream, originalFilename: string) => {
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: process.env.S3_REGION,
  });

  const upload = new Upload({
    client,
    params: {
      Bucket: process.env.S3_BUCKET as string, // Use your S3 bucket name here
      Key: `${Date.now().toString()}-${originalFilename}`, // Unique file name
      Body: fileStream,
    },
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 5MB chunks
    leavePartsOnError: false,
  });

  try {
    const data = await upload.done();
    return data;
  } catch (err) {
    console.log("No image");
  }
};

export const createRating = async ({
  name,
  rating,
  postedBy,
  place_id,
  fileStream,
  originalFilename,
}: RestaurantData & { place_id: string }) => {
  console.log("here", place_id);

  let uploadResult = null;
  const filePath = `./uploads/${originalFilename}`; // Define the local file path

  if (fileStream && originalFilename) {
    uploadResult = await uploadToS3(fileStream, originalFilename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the local file
      }
    } catch (err) {
      console.error(`Failed to delete file: ${err}`);
    }
  }

  const imageUrl = uploadResult?.Location || ""; // Ensure it's a string

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      rating,
      place_id,
      postedBy,
      imageUrl, // Store the S3 URL in your DB
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

export const deleteRating = async (ratingId: string) => {
  // First, find the restaurant by place_id using findUnique
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: ratingId },
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
