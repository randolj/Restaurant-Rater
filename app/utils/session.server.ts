import { createCookieSessionStorage } from "@remix-run/node"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || ""],
    secure: process.env.NODE_ENV === "production", //bool
    maxAge: 60 * 60, // TODO: Expires after 1 hour, figure out good amount of time
  },
})

export { sessionStorage }