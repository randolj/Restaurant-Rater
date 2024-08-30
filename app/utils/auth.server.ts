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

async function findUser(emailOrUsername: string, isEmail: boolean) {
  return await prisma.user.findUnique({
    where: isEmail ? { email: emailOrUsername } : { username: emailOrUsername },
  });
}

async function checkPassword(password: string, userPassword: string) {
  const passwordsMatch = await bcrypt.compare(password, userPassword);
  if (!passwordsMatch) {
    throw new AuthorizationError();
  }
}

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const emailOrUsername = form.get("emailOrUsername") as string;

  const isEmail = email ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);
  const identifier = email || emailOrUsername;

  if (!identifier || !password) {
    throw new AuthorizationError();
  }

  const user = await findUser(identifier, isEmail);
  if (!user) {
    throw new AuthorizationError();
  }

  await checkPassword(password, user.password as string);

  return user;
});

authenticator.use(formStrategy, "form")

export { authenticator }