// matches the user's model in Django
export interface UserInformation {
  id: number;
  email: String;
  username: String;
  total_points: number;
  current_streak: number;
  left_handed: boolean;
}
