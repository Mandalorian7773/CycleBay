import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import '../styles/Messages.css';
import NavBar from './../Components/NavBar';

const Messages = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user, loading: authLoading } = useAuthContext();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [receiverName, setReceiverName] = useState('');

    useEffect(() => {
        console.log('Selected user:', selectedUser);
        console.log('Users list:', users);
        
        if (selectedUser && selectedUser._id) {
            const receiver = users.find(u => u._id === selectedUser._id);
            console.log('Found receiver:', receiver);
            
            if (receiver) {
                setReceiverName(receiver.username || receiver.name || 'User');
            } else {
                console.log('Receiver not found in users list');
                fetchUserName(selectedUser._id).then(name => {
                    setReceiverName(name);
                });
            }
        } else {
            setReceiverName('');
        }
    }, [selectedUser, users]);

    useEffect(() => {
        if (authLoading) return;

        console.log('Auth Loading:', authLoading);
        console.log('User:', user);

        if (!user?.token) {
            setError('Please login to access messages');
            setLoading(false);
            return;
        }

        const sellerId = searchParams.get('sellerId');
        console.log('Seller ID from URL:', sellerId);

        getUsers();
        
        if (sellerId) {
            setSelectedUser({ _id: sellerId });
        }
    }, [authLoading, user?.token, searchParams]);

    const getUsers = async () => {
        try {
            setLoading(true);
            console.log('Fetching users...');
            
            // First check if we have a token
            if (!user?.token) {
                console.error('No authentication token available');
                setError('Please login to access messages');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:3000/message/user', {
                headers: {
                    'x-access-token': user.token
                }
            });

            // Log the full response
            console.log('Users API Response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            if (response.status !== 200) {
                console.error('Unexpected response status:', response.status);
                setError('Failed to fetch users');
                setLoading(false);
                return;
            }

            if (response.data && Array.isArray(response.data)) {
                const usersWithNames = response.data.map(user => ({
                    ...user,
                    name: user.name || user.username || 'User'
                }));
                
                console.log('Users with names:', usersWithNames);
                setUsers(usersWithNames);
            } else {
                console.error('Invalid response data format');
                setError('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            setLoading(true);
            console.log(`Fetching messages with user ${userId}`);
            
            if (!user?.token) {
                console.error('No authentication token available');
                setError('Please login to access messages');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:3000/message/${userId}`, {
                headers: {
                    'x-access-token': user.token
                }
            });

            console.log('Messages API Response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            if (response.status !== 200) {
                console.error('Unexpected response status:', response.status);
                setError('Failed to fetch messages');
                setLoading(false);
                return;
            }

            if (response.data && Array.isArray(response.data)) {
                console.log('Messages:', response.data);
                setMessages(response.data);
            } else {
                console.error('Invalid messages response format');
                setError('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to fetch messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserName = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3000/user/${userId}`, {
                headers: {
                    'x-access-token': user.token
                }
            });

            if (response.status === 200 && response.data) {
                return response.data.name || response.data.username || 'User';
            }
            return 'User';
        } catch (error) {
            console.error('Error fetching user name:', error);
            return 'User';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            console.log('Sending message...', {
                message: newMessage,
                to: selectedUser._id
            });

            if (!user?.token) {
                setError('Please login to send messages');
                return;
            }

            const decodedToken = jwtDecode(user.token);
            console.log('Decoded token:', decodedToken);

            if (decodedToken.exp < Math.floor(Date.now() / 1000)) {
                setError('Your session has expired. Please log in again.');
                return;
            }

            const response = await axios.post(
                `http://localhost:3000/message/send/${selectedUser._id}`,
                { message: newMessage },
                {
                    headers: {
                        'x-access-token': user.token
                    }
                }
            );

            console.log('Message sent:', response.data);

            setMessages([...messages, {
                ...response.data,
                senderId: user._id,
                receiverId: selectedUser._id,
                createdAt: new Date()
            }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.response?.data?.message || 'Failed to send message. Please try again.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

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
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <p>{user.email || 'No email available'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-container">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h2>{receiverName || 'Select a user to chat'}</h2>
                        </div>
                        <div className="messages-list">
                            {messages.map((message, index) => (
                                <div key={message._id || index}>
                                    <div className={`message ${message.senderId === user._id ? 'sent' : 'received'}`}>
                                        <div className="message-content">
                                            {message.message}
                                        </div>
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