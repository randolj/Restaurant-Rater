export type RegisterForm = {
  username: string
  email: string
  password: string
  name: string
}

export type LoginForm = {
  emailOrUsername: string
  password: string
}

export type FollowForm = {
  followerId: string
  followeeId: string
}