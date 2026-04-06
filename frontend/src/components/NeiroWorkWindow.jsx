import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as S from '../App.styles';

const NeiroWorkWindow = ({ 
  isOpen, 
  onClose, 
  allAnalyses, 
  analysesLoading, 
  fetchAllAnalyses, 
  setCurrentChat,
  setShowNeiroWorkWindow,
  setShowGlobalPromptSettings
}) => {
  if (!isOpen) return null;

  return (
    <S.CreateChatModal onClick={onClose}>
      <S.ModalContent
        style={{
          width: '80%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <S.NeiroWorkWindowTitle>NeiroWork Overview</S.NeiroWorkWindowTitle>
          <S.MoreButton className="neirowork-menu" onClick={() => setShowGlobalPromptSettings(true)}>
            ...
          </S.MoreButton>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Analysis of all chat dialogs</p>
          <S.AnalyzeButton
            onClick={fetchAllAnalyses}
            disabled={analysesLoading}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            {analysesLoading ? 'Loading...' : 'Refresh Analyses'}
          </S.AnalyzeButton>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {analysesLoading ? (
            <S.LoadingText>Loading analyses...</S.LoadingText>
          ) : allAnalyses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No chats found. Create a chat to start analysis.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {allAnalyses.map((item) => (
                <div key={item.chat.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: item.hasNewMessages ? '#fff3cd' : '#f8f9fa',
                  margin: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{item.chat.topic}</h4>
                    <S.AnalyzeButton
                      onClick={() => {
                        setCurrentChat(item.chat);
                        setShowNeiroWorkWindow(false);
                      }}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      View Chat
                    </S.AnalyzeButton>
                  </div>
                  <S.AnalysisContent>
                    {item.analysis ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.analysis}</ReactMarkdown>
                    ) : (
                      'No analysis available. Click "Analyze Dialog" in the chat to generate.'
                    )}
                  </S.AnalysisContent>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Created: {new Date(item.chat.created_at).toLocaleString()}</span>
                    {item.hasNewMessages && (
                      <span style={{ color: '#ffc107', fontWeight: '500' }}>New messages</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <S.ModalButtons style={{ marginTop: '20px', paddingTop: '15px', margin: '15px' }}>
          <S.CancelButton
            onClick={onClose}
          >
            Close
          </S.CancelButton>
        </S.ModalButtons>
      </S.ModalContent>
    </S.CreateChatModal>
  );
};

export default NeiroWorkWindow;
