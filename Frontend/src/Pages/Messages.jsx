import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Messages.css';

const Messages = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuthContext();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/message/user', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setUsers(response.data);

            
                const sellerId = searchParams.get('sellerId');
                if (sellerId) {
                    const seller = response.data.find(u => u._id === sellerId);
                    if (seller) {
                        setSelectedUser(seller);
                    }
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (user) {
            getUsers();
        }
    }, [user, searchParams]);

    useEffect(() => {
        const getMessages = async () => {
            if (!selectedUser) return;
            
            try {
                const response = await axios.get(`http://localhost:3000/message/${selectedUser._id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        getMessages();
    }, [selectedUser, user]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const response = await axios.post(
                `http://localhost:3000/message/${selectedUser._id}`,
                { message: newMessage },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="messages-container">
            <div className="users-sidebar">
                <h2>Chats</h2>
                <div className="users-list">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="user-avatar">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <h3>{user.username}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-container">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h2>{selectedUser.username}</h2>
                        </div>
                        <div className="messages-list">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`message ${
                                        message.senderId === user._id ? 'sent' : 'received'
                                    }`}
                                >
                                    <div className="message-content">
                                        {message.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <h2>Select a user to start chatting</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages; 