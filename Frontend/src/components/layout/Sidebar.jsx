/**
 * Sidebar Component
 * Shows list of conversations and navigation with search
 */

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Search } from 'lucide-react';

const Sidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar - Mobile drawer, desktop fixed */}
      <div
        className={`
          fixed md:relative z-30 h-full w-72 sm:w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-br from-white to-blue-50/30">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold gradient-text truncate">
                  FinChatBot
                </h2>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl shadow-md font-semibold text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Clear search"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-gray-400 mt-8 sm:mt-12 px-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {searchQuery ? (
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                  ) : (
                    <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`
                      group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl cursor-pointer
                      ${currentConversationId === conv._id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 border-2 border-blue-200 shadow-md'
                        : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${currentConversationId === conv._id
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                      <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${currentConversationId === conv._id ? 'text-white' : 'text-gray-600'
                        }`} />
                    </div>
                    <div
                      onClick={() => onSelectChat(conv._id)}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-semibold truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {new Date(conv.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(conv._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center">
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                FinChatBot v2.0
              </p>
              <p className="text-xs text-gray-500 mt-1">Financial AI Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
