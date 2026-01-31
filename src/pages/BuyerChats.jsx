import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'

const BuyerChats = () => {
  const { user, runQuery } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      const [vehicleId, receiverId] = selectedConversation.id.split('|');
      fetchMessages(vehicleId, receiverId);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Get all conversations where the buyer is involved
      const { data, error } = await runQuery((s) =>
        s
          .from('messages')
          .select(`
            id,
            vehicle_id,
            sender_id,
            receiver_id,
            content,
            created_at,
            is_read,
            vehicle:vehicles(brand, model, year),
            sender:profiles!messages_sender_id_fkey(first_name, last_name),
            receiver:profiles!messages_receiver_id_fkey(first_name, last_name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;

      // Group by conversation (vehicle + admin pair)
      const conversationMap = new Map();

      data.forEach(message => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const vehicleId = message.vehicle_id;
        const key = `${vehicleId}|${otherUserId}`;

        if (!conversationMap.has(key)) {
          const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
          conversationMap.set(key, {
            id: key,
            vehicleId,
            userId: otherUserId,
            vehicle: message.vehicle,
            user: otherUser,
            lastMessage: message,
            unreadCount: message.sender_id !== user.id && !message.is_read ? 1 : 0
          });
        } else {
          // Update unread count
          const conv = conversationMap.get(key);
          if (message.sender_id !== user.id && !message.is_read) {
            conv.unreadCount += 1;
          }
          // Update last message if newer
          if (new Date(message.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = message;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (vehicleId, receiverId) => {
    try {
      const { data, error } = await runQuery((s) =>
        s
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(first_name, last_name),
            receiver:profiles!messages_receiver_id_fkey(first_name, last_name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: true })
      );

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const [vehicleId, receiverId] = selectedConversation.id.split('|');

    try {
      const { error } = await runQuery((s) => s
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          vehicle_id: vehicleId,
          content: newMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        }));

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(vehicleId, receiverId);
      await fetchConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id);
    }
  };

  const markAsRead = async (conversationId) => {
    const [vehicleId, senderId] = conversationId.split('|');

    try {
      const { error } = await runQuery((s) => s
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('vehicle_id', vehicleId)
        .eq('is_read', false));

      if (error) throw error;

      fetchConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50 flex justify-center items-center">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={window.location.origin + window.location.pathname} />
        </Helmet>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-900 text-white px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-bold">Mis Chats</h1>
            <p className="text-gray-300">Conversaciones sobre vehículos de interés</p>
          </div>

          <div className="flex flex-col sm:flex-row h-[400px] sm:h-[600px]">
            {/* Conversations List */}
            <div className="w-full sm:w-1/3 border-r border-gray-200 sm:border-r overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No tienes conversaciones activas
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.user.first_name} {conversation.user.last_name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.vehicle.brand} {conversation.vehicle.model} {conversation.vehicle.year}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.created_at).toLocaleDateString('es-ES')}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1 min-w-[20px]">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.user.first_name} {selectedConversation.user.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.vehicle.brand} {selectedConversation.vehicle.model} {selectedConversation.vehicle.year}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_id === user.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user.id ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Selecciona una conversación</h3>
                    <p className="mt-1 text-sm text-gray-500">Elige una conversación para ver los mensajes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerChats;
