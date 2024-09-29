export interface SimpleUser {
  firstName: string;
  lastName: string;
  username: string;
}

export interface User extends SimpleUser {
  role: Role;
}

export interface DetailUser extends User {
  isActive: boolean;
}

export interface PasswordUser extends User {
  password: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  COURSE_LEADER = 'COURSE_LEADER',
  DEGREE_PROGRAM_DIRECTOR = 'DEGREE_PROGRAM_DIRECTOR',
  TUTOR = 'TUTOR',
  UNDEFINED = 'UNDEFINED',
}
