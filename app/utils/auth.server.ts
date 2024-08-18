import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { prisma } from './prisma.server';
import bcrypt from "bcryptjs";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const authenticator = new Authenticator<any>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("Invalid email");
    return { success: false, message: "Invalid email." };
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!passwordsMatch) {
    console.log("Invalid password");
    return { success: false, message: "Invalid password." };
  }

  return { success: true, user };
});

authenticator.use(formStrategy, "form");

export { authenticator };