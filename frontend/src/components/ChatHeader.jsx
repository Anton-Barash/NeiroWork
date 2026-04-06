import React from 'react';
import * as S from '../App.styles';

const ChatHeader = ({ 
  currentChat, 
  analysisLoading, 
  analyzeChat, 
  showChatMenu, 
  setShowChatMenu, 
  setShowCustomPromptSettings, 
  deleteChat 
}) => {
  return (
    <S.ChatHeader>
      <S.ChatTitle>{currentChat.topic}</S.ChatTitle>
      <div style={{ position: 'relative' }}>
        <S.HeaderButtonsContainer>
          <S.AnalyzeButton onClick={analyzeChat} disabled={analysisLoading}>
            {analysisLoading ? 'Analyzing...' : 'Analyze Dialog'}
          </S.AnalyzeButton>
          <S.MoreButton className="chat-menu" onClick={() => setShowChatMenu(!showChatMenu)}>
            ...
          </S.MoreButton>
        </S.HeaderButtonsContainer>
        {showChatMenu && (
          <S.DropdownMenu className="chat-menu" style={{ right: 0, left: 'auto' }}>
            <S.DropdownItem onClick={() => { setShowCustomPromptSettings(true); setShowChatMenu(false); }}>
              Настройки промпта чата
            </S.DropdownItem>
            <S.DropdownItem onClick={() => { deleteChat(); setShowChatMenu(false); }} style={{ color: '#dc3545' }}>
              Delete
            </S.DropdownItem>
          </S.DropdownMenu>
        )}
      </div>
    </S.ChatHeader>
  );
};

export default ChatHeader;
