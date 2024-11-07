export interface INotifications {
  created_at: string;
  id: number;
  status: number;
  title: string;
  notification_url: string;
}

export interface Message {
  username: string;
  msg_type: string;
  message: string;
  unread_count: string;
}
