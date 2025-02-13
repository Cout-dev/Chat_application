import React, { useState, useEffect, useRef } from "react";
import "./Chat.css"; // Import the CSS for styling

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080");

    websocket.onopen = () => {
      console.log("✅ WebSocket Connected");
    };

    websocket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data);
        console.log("📩 Received:", receivedData);

        // Extract message and timestamp correctly
        const messageText = receivedData.data?.message || receivedData.message || "No message";
        const messageTimestamp = receivedData.data?.Timestamp || receivedData.Timestamp || new Date().toISOString();

        if (!messageTimestamp || isNaN(new Date(messageTimestamp).getTime())) {
          console.error("❌ Invalid timestamp:", messageTimestamp);
        }

        setMessages((prev) => [
          ...prev,
          {
            message: messageText, // Store correct message
            Timestamp: messageTimestamp, // Store correct timestamp
          }
        ]);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => console.error("❌ WebSocket Error:", error);
    websocket.onclose = () => console.log("🔴 WebSocket Closed");

    setWs(websocket);

    return () => websocket.close();
  }, []);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (ws && input.trim()) {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must be logged in to send messages.");
        return;
      }

      const messageData = {
        message: input,
        timestamp: new Date().toISOString(), // Correct timestamp
        token,
      };

      ws.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Your Messages</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message`}>
            <strong>
              {msg.Timestamp && !isNaN(new Date(msg.Timestamp).getTime())
                ? new Date(msg.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : "Invalid Time"}
            </strong>
            : {msg.message || "No message"} {/* Ensure the message is displayed */}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="input-box"
          placeholder="Type a message..."
        />
        <button className="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
