import React from 'react';
import styled from '@emotion/styled';
import { useChatContext } from '../context/ChatContext';
import MessageInput from './MessageInput';
import AnalysisPanel from './AnalysisPanel';
import NeiroWorkPanel from './NeiroWorkPanel';

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const AnalyzeButton = styled.button`
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #138496;
  }
`;

const SettingsButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }
`;

const AdvancedSettingsButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
`;

const UserMessage = styled(MessageBubble)`
  align-self: flex-end;
  background-color: #e3f2fd;
  color: #0d47a1;
`;

const AssistantMessage = styled(MessageBubble)`
  align-self: flex-start;
  background-color: #f1f0f0;
  color: #333;
`;

const MessageContent = styled.div`
  margin-bottom: 4px;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #666;
  text-align: right;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #495057;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 16px;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
`;

function ChatWindow() {
    const {
        currentChat,
        messages,
        analyzeChat,
        analysis,
        showAnalysis,
        setShowAnalysis,
        analysisLoading,
        showCustomPromptSettings,
        setShowCustomPromptSettings,
        showAdvancedPromptSettings,
        setShowAdvancedPromptSettings,
        messagesEndRef
    } = useChatContext();

    if (!currentChat) {
        return (
            <ChatWindowContainer>
                <EmptyState>
                    <EmptyTitle>Welcome to NeiroWork</EmptyTitle>
                    <EmptyText>Create a new chat to get started</EmptyText>
                </EmptyState>
            </ChatWindowContainer>
        );
    }

    return (
        <ChatWindowContainer>
            <ChatHeader>
                <ChatTitle>{currentChat.topic}</ChatTitle>
                <HeaderButtons>
                    <AnalyzeButton onClick={analyzeChat} disabled={analysisLoading}>
                        {analysisLoading ? 'Analyzing...' : 'Analyze Dialog'}
                    </AnalyzeButton>
                    <SettingsButton onClick={() => setShowCustomPromptSettings(true)}>
                        ⚙️
                    </SettingsButton>
                    <AdvancedSettingsButton onClick={() => setShowAdvancedPromptSettings(true)}>
                        🔧
                    </AdvancedSettingsButton>
                </HeaderButtons>
            </ChatHeader>

            <MessagesContainer>
                {messages.map(message => (
                    <MessageBubble
                        key={message.id}
                        as={message.role === 'user' ? UserMessage : AssistantMessage}
                    >
                        <MessageContent>{message.content}</MessageContent>
                        <MessageTime>
                            {new Date(message.created_at).toLocaleString()}
                        </MessageTime>
                    </MessageBubble>
                ))}
                <div ref={messagesEndRef} />
            </MessagesContainer>

            <MessageInput />

            {showAnalysis && analysis && (
                <AnalysisPanel />
            )}

            <NeiroWorkPanel />
        </ChatWindowContainer>
    );
}

export default ChatWindow;