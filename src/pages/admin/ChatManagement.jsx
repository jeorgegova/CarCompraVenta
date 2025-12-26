import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ChatManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Get all messages where sender or receiver is admin
      const { data, error } = await supabase
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
          sender:profiles!messages_sender_id_fkey(first_name, last_name, email, role),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name, email, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter messages where at least one party is admin
      const adminMessages = data.filter(message =>
        message.sender.role === 'admin' || message.receiver.role === 'admin'
      );

      // Group by conversation (vehicle + non-admin user)
      const conversationMap = new Map();

      adminMessages.forEach(message => {
        const isSenderAdmin = message.sender.role === 'admin';
        const userId = isSenderAdmin ? message.receiver_id : message.sender_id;
        const vehicleId = message.vehicle_id;
        const key = `${vehicleId}|${userId}`;

        if (!conversationMap.has(key)) {
          const user = isSenderAdmin ? message.receiver : message.sender;
          conversationMap.set(key, {
            id: key,
            vehicleId,
            userId,
            vehicle: message.vehicle,
            user: user,
            lastMessage: message,
            unreadCount: 0
          });
        }

        const conv = conversationMap.get(key);

        // Update unread count: messages sent by user to current admin that are unread
        if (message.sender_id === userId && message.receiver_id === user.id && !message.is_read) {
          conv.unreadCount += 1;
        }

        // Update last message if newer
        if (new Date(message.created_at) > new Date(conv.lastMessage.created_at)) {
          conv.lastMessage = message;
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

  const fetchMessages = async (conversationId) => {
    const [vehicleId, userId] = conversationId.split('|');

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, role),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name, role)
        `)
        .eq('vehicle_id', vehicleId)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter messages where the other party is admin
      const filteredMessages = data.filter(message =>
        (message.sender_id === userId && message.receiver.role === 'admin') ||
        (message.receiver_id === userId && message.sender.role === 'admin')
      );

      setMessages(filteredMessages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const [vehicleId, userId] = selectedConversation.id.split('|');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          vehicle_id: vehicleId,
          content: newMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedConversation.id);
      await fetchConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId) => {
    const [vehicleId, userId] = conversationId.split('|');

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('vehicle_id', vehicleId)
        .eq('is_read', false);

      if (error) throw error;

      fetchConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('es-ES');
      }
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;

    messages.forEach(message => {
      const messageDate = new Date(message.created_at).toDateString();
      if (messageDate !== currentDate) {
        grouped.push({ type: 'date', date: message.created_at });
        currentDate = messageDate;
      }
      grouped.push({ type: 'message', message });
    });

    return grouped;
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-900 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Gestión de Chats</h1>
            <p className="text-gray-300">Administra las conversaciones con los compradores</p>
          </div>

          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No hay conversaciones
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
                    {groupMessagesByDate(messages).map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={index} className="text-center">
                            <span className="inline-block bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(item.date)}
                            </span>
                          </div>
                        );
                      } else {
                        const message = item.message;
                        return (
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
                        );
                      }
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribe tu respuesta..."
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

export default ChatManagement;