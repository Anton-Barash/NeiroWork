import React, { useRef, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as S from '../App.styles';
import TypingIndicator from './TypingIndicator';

const MessagesList = memo(({ messages, user, isLoading, formatTime }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <S.MessagesContainer>
      {
        messages.map((message) => {
          let content;

          try {
            // Try to parse JSON content (for messages with images)
            const parsedContent = JSON.parse(message.content);
            if (Array.isArray(parsedContent)) {
              content = (
                <div>
                  {parsedContent.map((item, index) => {
                    if (item.type === 'text' && item.text) {
                      return <p key={index}>{item.text}</p>;
                    } else if (item.type === 'image_url' && item.image_url) {
                      return (
                        <img
                          key={index}
                          src={item.image_url.url}
                          alt="Message image"
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              );
            } else {
              content = message.content;
            }
          } catch {
            // If not JSON, use as string
            content = message.content;
          }

          const senderName = message.username || (message.role === 'user' ? (user?.username || 'User') : 'AI Assistant');
          const avatarInitial = senderName.charAt(0).toUpperCase();

          const isCurrentUser = message.user_id === user?.id;
          return (
            <S.MessageContainer key={message.id} role={isCurrentUser ? 'user' : 'other'}>
              <S.Avatar role={isCurrentUser ? 'user' : 'other'}>{avatarInitial}</S.Avatar>
              <S.MessageInfoColumn>
                <S.SenderName role={isCurrentUser ? 'user' : 'other'}>{senderName}</S.SenderName>
                <S.MessageBubble role={isCurrentUser ? 'user' : 'other'}>
                  <S.MessageContent>{content}</S.MessageContent>
                </S.MessageBubble>
                <S.MessageTime role={isCurrentUser ? 'user' : 'other'}>{formatTime(message.created_at)}</S.MessageTime>
              </S.MessageInfoColumn>
            </S.MessageContainer>
          );
        })
      }
      {
        isLoading && (
          <TypingIndicator visible={isLoading} />
        )
      }
      <div ref={messagesEndRef} />
    </S.MessagesContainer>
  );
});

export default MessagesList;
