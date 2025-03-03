"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatInterface from "@/components/chat/chat-interface";
import { Message, FirebaseMessage } from "@/type/chat.type";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, off } from "firebase/database";
import axios from "axios";

export default function ChatPage() {
  const { orderId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/user", { withCredentials: true });
        console.log("User data:", response.data.user);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);

      }
    };
    
    fetchUserData();
  }, );
  
  useEffect(() => {
    if (!orderId) return;

    // Create a reference to the messages for this order
    const chatRef = ref(db, `chats/${orderId}/messages`);
    
    // Listen for changes to the messages
    onValue(chatRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messageList: Message[] = [];
        Object.entries(messagesData).forEach(([key, value]) => {
          const fbMessage = value as FirebaseMessage;
          // Ensure all fields have valid data
          messageList.push({
            id: key,
            content: fbMessage.message || '',
            sender: fbMessage.sender || 'unknown',
            timestamp: fbMessage.timestamp ? new Date(fbMessage.timestamp).toISOString() : new Date().toISOString(),
            orderId: orderId as string
          });
        });
        
        // Sort messages by timestamp
        messageList.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(messageList);
      } else {
        // If no messages exist yet, set empty array
        setMessages([]);
      }
      setLoading(false);
    });
    
    // Clean up the listener when component unmounts
    return () => {
      off(chatRef);
    };
  }, [orderId]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !orderId || !user) return;
    
    // Create a reference to the specific chat
    const chatRef = ref(db, `chats/${orderId}/messages`);
    
    // Create the message object with the real user ID
    const newMessage: FirebaseMessage = {
      sender: user._id,  // Use actual user ID from API
      message: content,
      timestamp: Date.now()
    };
    
    try {
      // Push the new message to Firebase
      const newMessageRef = push(chatRef);
      await set(newMessageRef, newMessage);
    } catch (error) {
      console.error("Error sending message:", error);

    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/my-products">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-xl font-bold">
            Chat for Order: {orderId}
          </h1>
        </div>
        
        {loading || !user ? (
          <div className="flex justify-center items-center h-72">
            <p>Loading chat...</p>
          </div>
        ) : (
          <ChatInterface 
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user._id}
          />
        )}
      </div>
    </div>
  );
}
