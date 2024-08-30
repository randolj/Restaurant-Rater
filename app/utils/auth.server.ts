import { Authenticator, AuthorizationError } from "remix-auth"
import { sessionStorage } from "./session.server"
import { FormStrategy } from "remix-auth-form"
import { prisma } from './prisma.server'
import bcrypt from "bcryptjs"

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const authenticator = new Authenticator<any>(sessionStorage)

const formStrategy = new FormStrategy(async ({ form }) => {
  const emailOrUsername = form.get("emailOrUsername") as string;
  const password = form.get("password") as string;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

  const user = await prisma.user.findUnique({
    where: isEmail ? { email: emailOrUsername } : { username: emailOrUsername },
  });

  if (!user) {
    throw new AuthorizationError()
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string,
  )

  if (!passwordsMatch) {
    throw new AuthorizationError()
  }

  return user
})

authenticator.use(formStrategy, "form")

export { authenticator }