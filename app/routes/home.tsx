import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { NavBar } from "~/components/navBar";
import { Restaurant } from "~/types";
import { getAllRatings, getFollowingRatings } from "~/utils/restaurants.server";
import { authenticator } from "~/utils/auth.server";
import { formatPostedDate } from "~/utils/formatDate";
import { useSubmit } from "@remix-run/react";
import { followUser, unfollowUser } from "~/utils/user.server";
import { useEffect, useState } from "react";
import { prisma } from "~/utils/prisma.server";

type ActionData = {
  id: string;
  username: string;
  followingIDs: string[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "Restaurant Rater Home" },
    { name: "description", content: "Welcome to Restaurant Rater!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      username: true,
      followingIDs: true,
    },
  });

  // TODO: Only grab recent ones (i.e. by date or like latest 10)
  const allRatings = await getAllRatings();

  // This returns ratings of those only the user follows
  // Will want to make an explore page for all, and a following page (following can just be home tbh)
  // let allRatings;
  // if (user) {
  //   allRatings = await getFollowingRatings(user.id);
  // }

  return { user, allRatings };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, { redirectTo: "/login" });
    }
    case "user": {
      const id = form.get("id");

      return redirect(`/profile?id=${id}`);
    }
    case "follow": {
      const followeeId = form.get("followingId") as string;
      const followerId = form.get("userId") as string;

      if (followerId && followeeId) {
        const result = await followUser({ followerId, followeeId });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: followerId },
        select: {
          id: true,
          username: true,
          followingIDs: true,
        },
      });
      return updatedUser;
    }
    case "unfollow": {
      const followeeId = form.get("followingId") as string;
      const followerId = form.get("userId") as string;

      if (followerId && followeeId) {
        const result = await unfollowUser({ followerId, followeeId });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: followerId },
        select: {
          id: true,
          username: true,
          followingIDs: true,
        },
      });

      return updatedUser;
    }
  }
  return "";
};

export default function Home() {
  const { user, allRatings } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [following, setFollowing] = useState(user.followingIDs || []);

  useEffect(() => {
    if (actionData && actionData.followingIDs) {
      setFollowing(actionData.followingIDs);
    }
  }, [actionData]);

  const submit = useSubmit();
  const handleUserClick = (userId: string) => {
    submit(
      {
        action: "user",
        id: userId,
      },
      { method: "post" }
    );
  };
  const handleFollow = (followingId: string) => {
    submit(
      {
        action: "follow",
        followingId: followingId,
        userId: user.id,
      },
      { method: "post" }
    );
    setFollowing((prev: string[]) => prev.filter((id) => id !== followingId));
  };

  const handleUnfollow = (followingId: string) => {
    submit(
      {
        action: "unfollow",
        followingId: followingId,
        userId: user.id,
      },
      { method: "post" }
    );

    setFollowing((prev: string[]) => prev.filter((id) => id !== followingId)); // Optimistically update state
  };

  return (
    <div className="flex">
      <NavBar />
      <div className="flex-1 min-h-screen flex justify-center bg-primary items-center flex-col pl-96 px-80">
        {user ? (
          <Form method="post" className="absolute top-5 right-5 ">
            <button
              type="submit"
              name="action"
              value="logout"
              className="text-primary hover:bg-gray-500 hover:text-white bg-white focus:bg-sky-800 border px-3 py-1 text-sm rounded-md font-semibold transition-all duration-200 ease-linear"
            >
              Logout
            </button>
          </Form>
        ) : null}
        {allRatings.length > 0 &&
          allRatings.map((restaurant: Restaurant) => (
            <div
              key={restaurant.place_id}
              className="w-[40rem] border-t-2 flex justify-between items-center mt-2 rounded-xl border-tertiary bg-tertiary"
            >
              <div className="flex flex-col flex-grow text-base">
                <div className="pl-2 flex flex-col pb-1">
                  <div className="flex items-center justify-between">
                    <span
                      onClick={() => handleUserClick(restaurant.postedBy.id)}
                      className="pt-2 text-lg text-white cursor-pointer hover:underline transition-all duration-100 ease-linear"
                    >
                      {restaurant.postedBy.username}
                    </span>
                    {user.id !== restaurant.postedBy.id &&
                      (following.includes(restaurant.postedBy.id) ? (
                        <button
                          onClick={() => handleUnfollow(restaurant.postedBy.id)}
                          className="ml-2 text-sm text-sky-500 hover:underline pr-4 pt-1"
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(restaurant.postedBy.id)}
                          className="ml-2 text-sm text-sky-500 hover:underline pr-4 pt-1"
                        >
                          + Follow
                        </button>
                      ))}
                  </div>
                  <span className="text-white font-bold">
                    {restaurant.name}
                  </span>
                  <span className="text-gray-200">
                    Rating:{" "}
                    <span className="font-bold">{restaurant.rating}</span>
                  </span>
                </div>
                <img
                  className="w-full flex-shrink-0 object-cover"
                  src={restaurant.imageUrl}
                ></img>
                <span className="text-xs text-gray-400 mt-1 py-2 pl-2">
                  {formatPostedDate(new Date(restaurant.createdAt))}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
