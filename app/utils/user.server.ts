import bcrypt from 'bcryptjs'
import type { RegisterForm } from './types.server'
import { prisma } from './prisma.server'
import { Prisma } from '@prisma/client';


export const createUser = async (user: RegisterForm) => {
  try {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: passwordHash,
        name: user.name,
      },
    });
    return { success: true, id: newUser.id, email: newUser.email, name: newUser.name };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return { success: false, message: 'Failed to create user account.' };
  }
}