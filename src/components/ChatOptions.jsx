import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
const socket = io('wss://snippet-share-backend.vercel.app'); // Using wss:// for secure WebSocket connection


export default function ChatOptions() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(''); // State for room ID
  const [joinedRoom, setJoinedRoom] = useState(false); // Track if the user has joined a room
  const [socketId, setSocketId] = useState(''); // Store the socket ID

  useEffect(() => {
     // Get the socket ID when the component mounts
     socket.on('connect', () => {
      setSocketId(socket.id); // Store the socket ID
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('receiveMessage');
      socket.off('connect'); // Clean up the connect listener
    };
  }, []);


  const handleJoinRoom = () => {
    if (roomId && !joinedRoom) {
      socket.emit('joinRoom', roomId);
      setJoinedRoom(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '' && joinedRoom) {
      const messageData = { message, sender: socketId, roomId };
      socket.emit('sendMessage', messageData); 
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
    }
  };

  
  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        <div className="chat-header">
          <div className="header-left">
            <div className="profile-pic">JD</div>
            <div className="profile-info">
              <h2>SnippetShare</h2>
              <p>Online</p>
            </div>
          </div>
          <button className="options-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="options-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a 1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        
        {/* <input
          type="text"
          placeholder="Enter Room ID..."
          className="room-input"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '5px' }} // Basic styles for room input
        />
        <button onClick={handleJoinRoom} className="join-button" style={{ marginBottom: '10px', padding: '10px 20px', borderRadius: '5px' }}>
          Join Room
        </button> */}

        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender === socketId ? 'right' : ''}`}>
              <div className={`message-${msg.sender === socketId ? 'right' : 'left'}`}>
                  <span>{msg.message}</span>
                </div>
                <img src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg" alt="My profile" className="profile-image" />
              </div>
            ))}
          </div>
          <div className="chat-footer">
            <form onSubmit={handleSubmit} className="message-form">
              <input
                type="text"
                placeholder="Type your message..."
                className="message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="send-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="send-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
