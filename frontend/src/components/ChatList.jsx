import React from 'react';
import styled from '@emotion/styled';
import { useChatContext } from '../context/ChatContext';

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #f8f9fa;
  }

  &.active {
    background-color: #e3f2fd;
  }
`;

const ChatTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ChatMeta = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;

  &:hover {
    color: #c82333;
  }
`;

const NewChatButton = styled.button`
  background-color: #343a40;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  margin: 16px;
  transition: background-color 0.2s;
  width: calc(100% - 32px);

  &:hover {
    background-color: #23272b;
  }
`;

const AppTitleButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  margin: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: calc(100% - 32px);

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

function ChatList() {
    const { chats, currentChat, selectChat, deleteChat, createChat } = useChatContext();

    const handleCreateChat = async () => {
        const topic = prompt('Enter chat topic:');
        if (topic && topic.trim()) {
            await createChat(topic.trim());
        }
    };

    return (
        <ChatListContainer>
            <AppTitleButton>NeiroWork</AppTitleButton>
            <NewChatButton onClick={handleCreateChat}>+ New Chat</NewChatButton>
            {chats.map(chat => (
                <ChatItem
                    key={chat.id}
                    className={currentChat?.id === chat.id ? 'active' : ''}
                    onClick={() => selectChat(chat)}
                >
                    <div>
                        <ChatTitle>{chat.topic}</ChatTitle>
                        <ChatMeta>
                            Created: {new Date(chat.created_at).toLocaleString()}
                        </ChatMeta>
                    </div>
                    <DeleteButton onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this chat?')) {
                            deleteChat(chat.id);
                        }
                    }}>
                        ×
                    </DeleteButton>
                </ChatItem>
            ))}
        </ChatListContainer>
    );
}

export default ChatList;