/**
 * Chat Page Component
 * Main page with premium FinTech SaaS design
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import SidebarNew from '../components/layout/SidebarNew';
import ChatWindow from '../components/chat/ChatWindow';
import CustomCursor from '../components/layout/CustomCursor';
import { conversationAPI, documentAPI, aiAPI } from '../utils/api';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

const ChatPageNew = () => {
  // Check if desktop on mount
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024; // Open by default on desktop (lg breakpoint)
  });
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [featureMode, setFeatureMode] = useState('General');

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation._id);
      loadDocuments(currentConversation._id);
    }
  }, [currentConversation]);

  // Poll for document status while any doc is still processing
  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'processing' || d.status === 'uploading');
    if (!hasProcessing || !currentConversation) return;

    const interval = setInterval(async () => {
      try {
        const response = await documentAPI.getByConversation(currentConversation._id);
        const fresh = response.data.data || [];
        setDocuments(fresh);
        const stillProcessing = fresh.some(d => d.status === 'processing' || d.status === 'uploading');
        if (!stillProcessing) clearInterval(interval);
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, currentConversation]);

  const loadConversations = async () => {
    try {
      const response = await conversationAPI.getAll();
      setConversations(response.data.data || []);

      // Select first conversation if exists
      if (response.data.data && response.data.data.length > 0) {
        setCurrentConversation(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await conversationAPI.getById(conversationId);
      const conv = response.data.data;

      // Transform messages to include enhanced data
      const transformedMessages = (conv.messages || []).map(msg => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        // Enhanced fields from Python backend
        chart_data: msg.chart_data,
        citations: msg.citations,
        tool_calls: msg.tool_calls
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const loadDocuments = async (conversationId) => {
    try {
      const response = await documentAPI.getByConversation(conversationId);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await conversationAPI.create({
        title: 'New Analysis'
      });
      const newConv = response.data.data;

      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
      setInput('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId) => {
    const conv = conversations.find(c => c._id === conversationId);
    if (conv) {
      setCurrentConversation(conv);
      // Close sidebar only on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation) return;

    const userText = input;
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Refresh documents to get latest status (catches newly processed docs)
      let freshDocs = documents;
      try {
        const docsResponse = await documentAPI.getByConversation(currentConversation._id);
        freshDocs = docsResponse.data.data || [];
        setDocuments(freshDocs);
      } catch (_) { /* use cached docs on error */ }

      // Get vector namespaces from processed documents only
      const vectorNamespaces = freshDocs
        .filter(doc => doc.status === 'processed')
        .map(doc => doc.vectorNamespace)
        .filter(Boolean);

      // Build clean chat history — only user/assistant messages (no system noise)
      const chatHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(-6)
        .map(msg => ({ role: msg.role, content: msg.content }));

      // 1. Save user message to DB (fire-and-forget, no need to await)
      conversationAPI.sendMessage(currentConversation._id, userText, 'user').catch(() => { });

      // 2. Query Python AI backend directly
      const aiResponse = await aiAPI.query(
        userText,
        chatHistory,
        vectorNamespaces,
        featureMode
      );

      // 3. Create AI message with enhanced data
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse.answer,
        timestamp: new Date().toISOString(),
        chart_data: aiResponse.chart_data,
        citations: aiResponse.citations,
        tool_calls: aiResponse.tool_calls,
        suggestions: aiResponse.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // 4. Save AI response to DB with correct role
      conversationAPI.sendMessage(currentConversation._id, aiResponse.answer, 'assistant').catch(() => { });

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.xlsx,.xls,.csv';

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0 || !currentConversation) return;

      try {
        await documentAPI.upload(currentConversation._id, files);
        await loadDocuments(currentConversation._id);

        // Show success message
        const successMessage = {
          id: Date.now(),
          role: 'assistant',
          content: `Successfully uploaded ${files.length} document(s). You can now ask questions about them!`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, successMessage]);
      } catch (error) {
        console.error('Failed to upload documents:', error);
      }
    };

    input.click();
  };

  const handleDeleteConversation = async (id) => {
    try {
      await conversationAPI.delete(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (currentConversation?._id === id) {
        setCurrentConversation(conversations.find(c => c._id !== id) || null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleArchiveConversation = async (id, isArchived) => {
    try {
      await conversationAPI.update(id, { isArchived });
      setConversations(prev => prev.map(c =>
        c._id === id ? { ...c, isArchived } : c
      ));
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleRenameConversation = async (id, title) => {
    try {
      await conversationAPI.update(id, { title });
      setConversations(prev => prev.map(c =>
        c._id === id ? { ...c, title } : c
      ));
      if (currentConversation?._id === id) {
        setCurrentConversation(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleMessageFeedback = (messageId, feedback) => {
    // Update message feedback in state
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, feedback }
        : msg
    ));

    // Optional: Send feedback to backend for analytics
    console.log('Message feedback:', { messageId, feedback });

    // You can add API call here to save feedback
    // Example:
    // conversationAPI.sendFeedback(currentConversation._id, messageId, feedback);
  };

  return (
    <SettingsProvider>
      <ThemeProvider>
        <ChatPageContent
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          conversations={conversations}
          currentConversation={currentConversation}
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleNewConversation={handleNewConversation}
          handleSelectConversation={handleSelectConversation}
          handleSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          handleDeleteConversation={handleDeleteConversation}
          handleArchiveConversation={handleArchiveConversation}
          handleRenameConversation={handleRenameConversation}
          handleMessageFeedback={handleMessageFeedback}
          featureMode={featureMode}
          setFeatureMode={setFeatureMode}
          documents={documents}
        />
      </ThemeProvider>
    </SettingsProvider>
  );
};

const ChatPageContent = ({
  isSidebarOpen,
  setIsSidebarOpen,
  conversations,
  currentConversation,
  messages,
  input,
  setInput,
  isLoading,
  handleNewConversation,
  handleSelectConversation,
  handleSendMessage,
  handleFileUpload,
  handleDeleteConversation,
  handleArchiveConversation,
  handleRenameConversation,
  handleMessageFeedback,
  featureMode,
  setFeatureMode,
  documents,
}) => {
  const { customCursor } = useSettings();

  return (
    <div
      className="h-screen flex flex-col bg-gray-50 dark:bg-dark-950"
    >
      {/* Conditionally render custom cursor based on settings */}
      {customCursor && <CustomCursor />}

      {/* Navbar */}
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <SidebarNew
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onUploadDocument={handleFileUpload}
          onDeleteConversation={handleDeleteConversation}
          onArchiveConversation={handleArchiveConversation}
          onRenameConversation={handleRenameConversation}
        />

        {/* Chat Window - adjusts margin when sidebar open on desktop */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          {currentConversation ? (
            <ChatWindow
              messages={messages}
              input={input}
              setInput={setInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onFileUpload={handleFileUpload}
              onMessageFeedback={handleMessageFeedback}
              conversationTitle={currentConversation?.title}
              featureMode={featureMode}
              onFeatureModeChange={setFeatureMode}
              documents={documents}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Conversation Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create a new conversation to get started
                </p>
                <button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                >
                  Start New Analysis
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPageNew;
