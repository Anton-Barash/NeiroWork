import React, { useState, useRef } from 'react';
import * as S from '../App.styles';

const ChatHeader = React.memo(({ currentChat, analysisLoading, analyzeChat, showChatMenu, setShowChatMenu, setShowCustomPromptSettings, deleteChat, updateChat }) => {
  const [isEditing, setIsEditing] = useState(false);
  const titleRef = useRef(null);

  const handleEditStart = () => {
    setIsEditing(true);
    // Set focus and move cursor to end after component updates
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
        // Move cursor to end
        const selection = window.getSelection();
        const range = document.createRange();
        const textNode = titleRef.current.firstChild;
        if (textNode) {
          range.setStart(textNode, textNode.length);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  };

  const handleEditSave = () => {
    if (titleRef.current && currentChat && updateChat) {
      const newTitle = titleRef.current.textContent.trim();
      if (newTitle) {
        updateChat(currentChat.id, newTitle);
      }
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    if (titleRef.current && currentChat) {
      titleRef.current.textContent = currentChat.topic;
    }
    setIsEditing(false);
  };

  return (
    <S.ChatHeader>
      {isEditing ? (
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning={true}
          onBlur={handleEditSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleEditSave();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleEditCancel();
            }
          }}
          dangerouslySetInnerHTML={{ __html: currentChat?.topic || '' }}
          style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 16px 0 0',
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            alignSelf: 'flex-start',
            minWidth: '100px',
            maxWidth: 'calc(100% - 200px)',
            outline: 'none',
            cursor: 'text',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'visible'
          }}
        />
      ) : (
        <S.ChatTitle onClick={handleEditStart}>
          {currentChat?.topic}
        </S.ChatTitle>
      )}
      <div style={{ position: 'relative', minWidth: '200px', height: 'stretch' }}>
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
});

export default ChatHeader;
