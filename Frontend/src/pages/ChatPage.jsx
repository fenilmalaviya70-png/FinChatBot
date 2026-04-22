/**
 * Chat Page
 * Main chat interface with conversations and messages
 */

import { useState, useEffect, useRef } from 'react';
import { Menu, Download, Share2, Bot } from 'lucide-react';
import { conversationAPI, documentAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import FeatureSelector from '../components/FeatureSelector';
import { VoiceButton } from '../components/VoiceInput';
import ExportReports from '../components/ExportReports';
import SmartSuggestions from '../components/SmartSuggestions';

const ChatPage = () => {
  // State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedFeature, setSelectedFeature] = useState('Smart_Chat');
  
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
    }
  }, [currentConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Fetch all conversations
  */
  const fetchConversations = async () => {
    try {
      const response = await conversationAPI.getAll();
      const convos = response.data.data;
      setConversations(convos);

      // Select first conversation or create new one
      if (convos.length > 0) {
        setCurrentConversationId(convos[0]._id);
      } else {
        await handleNewChat();
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  /**
   * Fetch messages for current conversation
   */
  const fetchMessages = async () => {
    if (!currentConversationId) return;

    try {
      setIsLoading(true);
      const response = await conversationAPI.getById(currentConversationId);
      setMessages(response.data.data.messages);
      setCurrentConversation(response.data.data.conversation);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([
        {
          _id: 'error',
          role: 'system',
          content: 'Failed to load messages.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create new conversation
   */
  const handleNewChat = async () => {
    try {
      const response = await conversationAPI.create({ 
        title: 'New Chat',
        featureUsed: selectedFeature 
      });
      const newConvo = response.data.data;
      setConversations((prev) => [newConvo, ...prev]);
      setCurrentConversationId(newConvo._id);
      setMessages([]);
      setSelectedFeature(newConvo.featureUsed || 'Smart_Chat');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  /**
   * Select conversation
   */
  const handleSelectChat = async (id) => {
    setCurrentConversationId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile
    
    // Load the conversation's feature mode
    const conv = conversations.find(c => c._id === id);
    if (conv) {
      setSelectedFeature(conv.featureUsed || 'Smart_Chat');
    }
  };

  /**
   * Delete conversation
   */
  const handleDeleteChat = async (id) => {
    if (!window.confirm('Delete this conversation?')) return;

    try {
      await conversationAPI.delete(id);
      const updated = conversations.filter((c) => c._id !== id);
      setConversations(updated);

      // Select another conversation or create new one
      if (currentConversationId === id) {
        if (updated.length > 0) {
          setCurrentConversationId(updated[0]._id);
        } else {
          await handleNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  /**
   * Send message
   */
  const handleSend = async () => {
    if (!input.trim() || !currentConversationId || isLoading) return;

    // Add temporary user message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, tempMessage]);

    const messageContent = input;
    const isFirstMessage = messages.length === 0;
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend
      await conversationAPI.sendMessage(currentConversationId, messageContent);
      
      // Auto-generate title from first message
      if (isFirstMessage) {
        const title = messageContent.length > 50 
          ? messageContent.substring(0, 47) + '...'
          : messageContent;
        
        try {
          await conversationAPI.update(currentConversationId, { title });
          // Update local state
          setConversations(prev => 
            prev.map(c => c._id === currentConversationId ? { ...c, title } : c)
          );
        } catch (err) {
          console.error('Failed to update title:', err);
        }
      }
      
      // Refetch messages to get AI response
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempMessage._id),
        {
          _id: 'error',
          role: 'system',
          content: 'Failed to get response. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Upload files
   */
  const handleFileUpload = async (files) => {
    if (!currentConversationId || files.length === 0) return;

    const fileNames = files.map((f) => f.name).join(', ');
    const systemMessage = {
      _id: `upload-${Date.now()}`,
      role: 'system',
      content: `Uploading ${fileNames}...`,
    };
    setMessages((prev) => [...prev, systemMessage]);

    try {
      await documentAPI.upload(currentConversationId, files);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === systemMessage._id
            ? { ...m, content: `${fileNames} uploaded successfully. Processing...` }
            : m
        )
      );
    } catch (error) {
      console.error('File upload failed:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === systemMessage._id
            ? { ...m, content: `Failed to upload ${fileNames}` }
            : m
        )
      );
    }
  };

  /**
   * Export conversation
   */
  const handleExport = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${currentConversationId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Share conversation
   */
  const handleShare = () => {
    const text = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(text).then(
      () => alert('Conversation copied to clipboard!'),
      () => alert('Failed to copy conversation')
    );
  };

  /**
   * Change feature mode
   */
  const handleFeatureChange = async (feature) => {
    if (!currentConversationId || isLoading) return;
    
    setSelectedFeature(feature);
    
    // Update conversation feature mode in backend
    try {
      await conversationAPI.update(currentConversationId, { featureUsed: feature });
      // Update local state
      setConversations(prev => 
        prev.map(c => c._id === currentConversationId ? { ...c, featureUsed: feature } : c)
      );
    } catch (error) {
      console.error('Failed to update feature mode:', error);
    }
  };

  /**
   * Handle voice transcript
   */
  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    // Auto-send after a brief delay
    setTimeout(() => {
      if (suggestion) {
        setInput(suggestion);
        // Trigger send
        const event = new Event('submit');
        handleSend();
      }
    }, 100);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile First */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm gap-3 sm:gap-4">
          {/* Top Row: Logo and Actions */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base md:text-lg font-bold gradient-text truncate">
                    Financial AI Assistant
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Powered by Groq AI</p>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 sm:hidden flex-shrink-0">
              {messages.length > 0 && (
                <ExportReports 
                  messages={messages} 
                  conversationTitle={currentConversation?.title || 'Chat'}
                />
              )}
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Share"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Feature Selector and Desktop Actions */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
            {/* Feature Selector - Scrollable on mobile */}
            <div className="flex-1 sm:flex-initial overflow-x-auto scrollbar-thin">
              <FeatureSelector
                selectedFeature={selectedFeature}
                onFeatureChange={handleFeatureChange}
                disabled={isLoading}
              />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-4 flex-shrink-0">
              {messages.length > 0 && (
                <ExportReports 
                  messages={messages} 
                  conversationTitle={currentConversation?.title || 'Chat'}
                />
              )}
              <button
                onClick={handleShare}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                title="Share conversation"
              >
                <Share2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages - Mobile First */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="text-center mt-8 sm:mt-12 md:mt-16 lg:mt-24 px-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-xl">
                  <Bot className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome to FinChatBot</h2>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Your intelligent financial assistant. Upload documents or ask questions to get started.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                      <span className="text-xl sm:text-2xl">📄</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">Upload Documents</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">PDF, Excel, CSV files</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                      <span className="text-xl sm:text-2xl">💬</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">Ask Questions</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Get instant answers</p>
                  </div>
                  <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                      <span className="text-xl sm:text-2xl">📊</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">Analyze Data</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Financial insights</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <Message key={msg._id} message={msg} />
            ))}

            {/* Smart Suggestions after last assistant message */}
            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isLoading && (
              <SmartSuggestions
                lastMessage={messages[messages.length - 1]}
                documents={currentConversation?.documents || []}
                onSuggestionClick={handleSuggestionClick}
                disabled={isLoading}
              />
            )}

            {isLoading && messages.length > 0 && (
              <div className="flex gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 animate-fadeIn">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white rounded-2xl sm:rounded-3xl rounded-tl-md shadow-md border border-gray-100">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce-dot"></span>
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 rounded-full animate-bounce-dot"></span>
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-700 rounded-full animate-bounce-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input - Fixed at bottom, mobile optimized */}
        <footer className="p-3 sm:p-4 md:p-6 lg:p-8 border-t border-gray-200/50 bg-white/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            {/* Chat Input with integrated voice button */}
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSend}
              isLoading={isLoading}
              onFileUpload={handleFileUpload}
              onVoiceTranscript={handleVoiceTranscript}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;
