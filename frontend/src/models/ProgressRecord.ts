// matches User_Progress

export interface ProgressRecord {
  id: number;
  lesson: {
    id: number;
    sign_name: string;
  };
  last_practiced_at: string; // API sends dates as strings
}
