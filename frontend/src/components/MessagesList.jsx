import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as S from '../App.styles';
import TypingIndicator from './TypingIndicator';

const MessagesList = ({ messages, user, isLoading, formatTime }) => {
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

          const senderName = message.role === 'user' ? (user?.username || 'User') : 'AI Assistant';
          const avatarInitial = senderName.charAt(0).toUpperCase();

          return (
            <S.MessageContainer key={message.id} role={message.role}>
              <S.Avatar role={message.role}>{avatarInitial}</S.Avatar>
              <S.MessageInfoColumn>
                <S.SenderName role={message.role}>{senderName}</S.SenderName>
                <S.MessageBubble role={message.role}>
                  <S.MessageContent>{content}</S.MessageContent>
                </S.MessageBubble>
                <S.MessageTime role={message.role}>{formatTime(message.created_at)}</S.MessageTime>
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
};

export default MessagesList;
