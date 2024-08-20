export interface SimpleUser {
  firstName: string,
  lastName: string,
  username: string,
}

export interface User extends SimpleUser {
  role: string
}

export interface DetailUser extends User {
  isActive: boolean
}

export interface PasswordUser extends User {
  password: string,
}
