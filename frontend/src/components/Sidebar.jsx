import React, { useState } from 'react';
import * as S from '../App.styles';
import UserMenu from './UserMenu';

const Sidebar = React.memo(({
  chats,
  currentChat,
  company,
  showModal,
  setShowModal,
  setShowCompanySelector,
  showSidebarMenu,
  setShowSidebarMenu,
  setShowGlobalPromptSettings,
  showNeiroWorkWindow,
  setShowNeiroWorkWindow,
  fetchAllAnalyses,
  setCurrentChat,
  setShowAnalysis,
  setShowNeiroWork,
  setShowCustomPromptSettings,
  deleteChat,
  drafts
}) => {
  const [activeChatMenu, setActiveChatMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close chat menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chat-item-menu')) {
        setActiveChatMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <S.Sidebar>
      <S.SidebarHeader>
        <S.SidebarTopRow>
          <S.AppTitleButton onClick={() => {
            setShowNeiroWorkWindow(true);
            fetchAllAnalyses();
          }}>
            NeiroWork
          </S.AppTitleButton>
          <S.CompanySelectorButton onClick={() => setShowCompanySelector(true)}>
            {company?.name || 'Select Company'}
          </S.CompanySelectorButton>
          <S.MoreButton className="sidebar-menu" onClick={() => setShowSidebarMenu(!showSidebarMenu)}>
            ...
          </S.MoreButton>
          {showSidebarMenu && (
            <S.DropdownMenu className="sidebar-menu">
              <S.DropdownItem onClick={() => {
                setShowGlobalPromptSettings(true);
                setShowSidebarMenu(false);
              }}>
                Neiro Work Prompt Settings
              </S.DropdownItem>
            </S.DropdownMenu>
          )}
        </S.SidebarTopRow>
        <S.NewChatButton onClick={() => setShowModal(true)}>
          + New Chat
        </S.NewChatButton>
        <S.SearchInput
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </S.SidebarHeader>
      <S.ChatList>
        {
          filteredChats.map((chat) => (
            <S.ChatItemWithMenu
              key={chat.id}
              active={currentChat?.id === chat.id}
            >
              <div onClick={() => {
                setCurrentChat(chat);
                setShowAnalysis(false);
                setShowNeiroWork(false);
              }} style={{ flex: 1, position: 'relative', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '14px', margin: 0 }}>{chat.topic}</h3>
                  {drafts[chat.id] && (
                    <span style={{
                      fontSize: '9px',
                      color: '#6c757d',
                      fontStyle: 'italic',
                      backgroundColor: '#f8f9fa',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      draft
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                  {chat.message_count || 0} messages
                </p>
                <small style={{ fontSize: '10px' }}>{new Date(chat.created_at).toLocaleDateString()}</small>
              </div>
              <div style={{ position: 'relative' }}>
                <S.ChatItemMenuButton
                  className="chat-item-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChatMenu(activeChatMenu === chat.id ? null : chat.id);
                  }}
                >
                  ...
                </S.ChatItemMenuButton>
                {activeChatMenu === chat.id && (
                  <S.DropdownMenu style={{ right: 0, top: '100%', minWidth: '180px' }}>
                    <S.DropdownItem onClick={() => {
                      setCurrentChat(chat);
                      setShowCustomPromptSettings(true);
                      setActiveChatMenu(null);
                    }}>
                      Настройки промпта чата
                    </S.DropdownItem>
                    <S.DropdownItem
                      onClick={() => {
                        setCurrentChat(chat);
                        deleteChat();
                        setActiveChatMenu(null);
                      }}
                      style={{ color: '#dc3545' }}
                    >
                      Delete
                    </S.DropdownItem>
                  </S.DropdownMenu>
                )}
              </div>
            </S.ChatItemWithMenu>
          ))
        }
      </S.ChatList>

      {/* User Menu */}
      <UserMenu />
    </S.Sidebar>
  );
});

export default Sidebar;
