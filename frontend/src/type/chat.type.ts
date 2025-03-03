export interface FirebaseMessage {
  sender: string;  // userId
  message: string;
  timestamp: number;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  orderId: string;
}
