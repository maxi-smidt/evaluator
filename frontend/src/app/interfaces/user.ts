export interface User {
  firstName: string,
  lastName: string,
  id: string,
  role: string
}

export interface RegisteredUser extends User {
  isActive: boolean
}

export interface NewUser {
  first_name: '',
  last_name: '',
  username: '',
  password: '',
  role: ''
}
