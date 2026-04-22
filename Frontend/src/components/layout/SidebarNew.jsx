/**
 * Sidebar Component
 * Collapsible sidebar with conversations and documents
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  FileText,
  Upload,
  Trash2,
  X,
  ChevronRight,
  TrendingUp,
  Calculator,
  BarChart3
} from 'lucide-react';

const SidebarNew = ({
  isOpen,
  onClose,
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onUploadDocument,
  onDeleteConversation,
  onArchiveConversation,
  onRenameConversation
}) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');

  const handleStartEdit = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setTempTitle(conv.title || 'New Conversation');
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (tempTitle.trim()) {
      onRenameConversation(id, tempTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      onDeleteConversation(id);
    }
  };

  const handleArchive = (e, id, isArchived) => {
    e.stopPropagation();
    onArchiveConversation(id, !isArchived);
  };

  const features = [
    { icon: TrendingUp, label: 'Smart Chat', color: 'text-blue-500' },
    { icon: Calculator, label: 'Calculations', color: 'text-green-500' },
    { icon: BarChart3, label: 'Analytics', color: 'text-purple-500' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar - always fixed, lg margin on main content pushes chat area */}
      <aside
        className={`
          fixed top-0 lg:top-16 left-0
          h-screen lg:h-[calc(100vh-4rem)]
          w-72 bg-white dark:bg-dark-900
          border-r border-gray-200 dark:border-dark-700
          z-50 flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workspace
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Analysis
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-700">
          {['chats', 'archived', 'features'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-2 py-3 text-xs sm:text-sm font-medium relative ${activeTab === tab
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab === 'chats' ? 'Active' : tab === 'archived' ? 'Archived' : 'Features'}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {(activeTab === 'chats' || activeTab === 'archived') ? (
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations
                  .filter(c => activeTab === 'chats' ? !c.isArchived : c.isArchived)
                  .map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => onSelectConversation(conv._id)}
                      className={`group relative p-3 rounded-xl cursor-pointer transition-colors ${currentConversation?._id === conv._id
                        ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 shadow-md'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-800'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${currentConversation?._id === conv._id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                          }`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingId === conv._id ? (
                            <div className="flex items-center gap-1">
                              <input
                                autoFocus
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(e, conv._id);
                                  if (e.key === 'Escape') handleCancelEdit(e);
                                }}
                                className="w-full text-sm py-0.5 px-1 bg-white dark:bg-dark-700 border border-primary-500 rounded outline-none text-gray-900 dark:text-white"
                              />
                              <button onClick={(e) => handleSaveEdit(e, conv._id)} className="text-green-500 p-0.5">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-16">
                                {conv.title || 'New Conversation'}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(conv.createdAt).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Action Buttons - Visible on Hover */}
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 ${editingId === conv._id ? 'hidden' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                          <button
                            onClick={(e) => handleStartEdit(e, conv)}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Edit Title"
                          >
                            <Plus className="w-3.5 h-3.5 rotate-45" />
                          </button>
                          <button
                            onClick={(e) => handleArchive(e, conv._id, conv.isArchived)}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-gray-400 hover:text-amber-500 transition-colors"
                            title={conv.isArchived ? "Unarchive" : "Archive"}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, conv._id)}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {editingId !== conv._id && (
                          <ChevronRight className={`w-4 h-4 ${currentConversation?._id === conv._id ? 'text-primary-500' : 'text-gray-400 group-hover:opacity-0'
                            }`} />
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-700 border border-gray-200 dark:border-dark-600 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-dark-900 ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {feature.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        AI-powered analysis
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={onUploadDocument}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Documents
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarNew;
