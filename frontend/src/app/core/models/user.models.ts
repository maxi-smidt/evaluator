export interface SimpleUser {
  firstName: string,
  lastName: string,
  username: string,
}

export interface User extends SimpleUser {
  role: string
}

export interface RegisteredUser extends User {
  isActive: boolean
}

export interface NewUser {
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  role: string
}
