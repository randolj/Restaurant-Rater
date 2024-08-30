import bcrypt from 'bcryptjs'
import type { LoginForm, RegisterForm } from './types.server'
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
      return { success: false, message: 'An account with this email already exists.' };
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