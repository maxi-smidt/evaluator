export interface BaseExercise {
  id: number,
  name: string,
  dueTo: Date,
  state: string,
  maxParticipants: number,
  correctedParticipants: number
}
