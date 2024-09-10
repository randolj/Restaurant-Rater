import bcrypt from 'bcryptjs'
import type { FollowForm, LoginForm, RegisterForm } from './types.server'
import { prisma } from './prisma.server'
import { Prisma } from '@prisma/client';


export const createUser = async (user: RegisterForm) => {
  try {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const newUser = await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: passwordHash,
        name: user.name,
      },
    });
    return { success: true, username: newUser.username, id: newUser.id, email: newUser.email, name: newUser.name };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta && (error.meta.target as string[])) || [];
      if (target.includes('email')) {
        return { success: false, message: 'An account with this email already exists.' };
      } else if (target.includes('username')) {
        return { success: false, message: 'An account with this username already exists.' };
      }
    }
    return { success: false, message: 'Failed to create user account.' };
  }
}

// export const updateUsername = async (user: RegisterForm) => {
//   const email = user.email as string
//   const temp = prisma.user.findUnique({
//     where: { email }
//   })
// }

export const authUser = async (user: LoginForm) => {
  const emailOrUsername = user.emailOrUsername as string
  const password = user.password as string

  // check if username or email
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

  const potentialUser = await prisma.user.findUnique({
    where: isEmail ? { email: emailOrUsername } : { username: emailOrUsername },
  });

  if (!potentialUser) {
    if (isEmail)
      return { success: false, message: "Could not find an account with this email." }
    else if (!isEmail)
      return { success: false, message: "Could not find an account with this username." }
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    potentialUser?.password as string,
  )

  if (!passwordsMatch) {
    return { success: false, message: "Incorrect password entered." }
  }

  return { success: true, message: "" };
}

export const followUser = async (user: FollowForm) => {

  // Find the follower (curr user)
  const follower = await prisma.user.findUnique({
    where: { id: user.followerId },
    select: { followingIDs: true }
  });

  // Find the user to be followed (followee)
  const followee = await prisma.user.findUnique({
    where: { id: user.followeeId },
    select: { followedByIDs: true }
  });

  if (!follower || !followee) {
    return { success: false, message: "User not found" }
  }

  // Update the follower's following list
  await prisma.user.update({
    where: { id: user.followerId },
    data: {
      followingIDs: {
        push: user.followeeId
      }
    }
  });

  // Update the followed user's followers list
  await prisma.user.update({
    where: { id: user.followeeId },
    data: {
      followedByIDs: {
        push: user.followerId
      }
    }
  });

  return { success: true, message: "" };
}

export const unfollowUser = async (user: FollowForm) => {

  // Find the follower (curr user)
  const follower = await prisma.user.findUnique({
    where: { id: user.followerId },
    select: { followingIDs: true }
  });

  // Find the user to be followed (followee)
  const followee = await prisma.user.findUnique({
    where: { id: user.followeeId },
    select: { followedByIDs: true }
  });

  if (!follower || !followee) {
    return { success: false, message: "User not found" }
  }

  // Remove followeeId from the follower's following list
  const updatedFollowingIDs = follower.followingIDs.filter(
    (id) => id !== user.followeeId
  );

  // Remove followerId from the followee's followers list
  const updatedFollowedByIDs = followee.followedByIDs.filter(
    (id) => id !== user.followerId
  );

  // Update the follower's following list
  await prisma.user.update({
    where: { id: user.followerId },
    data: {
      followingIDs: { set: updatedFollowingIDs },
    },
  });

  // Update the followee's followers list
  await prisma.user.update({
    where: { id: user.followeeId },
    data: {
      followedByIDs: { set: updatedFollowedByIDs },
    },
  });

  return { success: true, message: "Unfollow successful" };
} 