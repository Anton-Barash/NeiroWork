import React from 'react';
import styled from '@emotion/styled';

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-bottom-left-radius: 2px;
  max-width: 120px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  background-color: #6c757d;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }
`;

const TypingText = styled.span`
  font-size: 12px;
  color: #6c757d;
  margin-left: 4px;
`;

const TypingIndicator = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <TypingContainer>
      <Dot /><Dot /><Dot />
      <TypingText>AI...</TypingText>
    </TypingContainer>
  );
};

export default TypingIndicator;

