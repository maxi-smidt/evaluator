import {SimpleUser} from "../../../core/models/user.models";

export interface DegreeProgram {
  name: string,
  abbreviation: string
}

export interface AdminDegreeProgram extends DegreeProgram {
  dpDirector: SimpleUser
}
