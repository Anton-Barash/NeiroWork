import React from 'react';
import * as S from '../App.styles';
import UserMenu from './UserMenu.jsx';

const Sidebar = ({ 
  chats, 
  currentChat, 
  company, 
  showModal, 
  setShowModal, 
  showCompanySelector, 
  setShowCompanySelector, 
  showSidebarMenu, 
  setShowSidebarMenu, 
  showGlobalPromptSettings, 
  setShowGlobalPromptSettings, 
  showNeiroWorkWindow, 
  setShowNeiroWorkWindow,
  fetchAllAnalyses,
  setCurrentChat,
  setShowAnalysis,
  setShowNeiroWork
}) => {
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
      </S.SidebarHeader>
      <S.ChatList>
        {
          chats.map((chat) => (
            <S.ChatItem
              key={chat.id}
              active={currentChat?.id === chat.id}
              onClick={() => {
                setCurrentChat(chat);
                setShowAnalysis(false);
                setShowNeiroWork(false);
              }}
            >
              <h3>{chat.topic}</h3>
              <p>
                {chats.filter((m) => m.id === chat.id).length} messages
              </p>
              <small>{new Date(chat.created_at).toLocaleDateString()}</small>
            </S.ChatItem>
          ))
        }
      </S.ChatList>

      {/* User Menu */}
      <UserMenu />
    </S.Sidebar>
  );
};

export default Sidebar;
