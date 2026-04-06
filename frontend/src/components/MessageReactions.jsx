import React, { useState } from 'react';
import styled from '@emotion/styled';

const ReactionsContainer = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const ReactionButton = styled.button`
  background: ${props => props.active ? '#e3f2fd' : '#f8f9fa'};
  border: 1px solid ${props => props.active ? '#2196f3' : '#dee2e6'};
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #e3f2fd; border-color: #2196f3; transform: scale(1.1); }
`;

const AVAILABLE_REACTIONS = [
    { emoji: '👍', name: 'like' },
    { emoji: '👎', name: 'dislike' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😂', name: 'laugh' },
];

const MessageReactions = ({ messageId, reactions = {}, onReact }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleReactionClick = (emoji) => {
        onReact?.(messageId, emoji);
        setShowPicker(false);
    };

    const hasReactions = Object.keys(reactions).length > 0;

    return (
        <ReactionsContainer onMouseEnter={() => setShowPicker(true)} onMouseLeave={() => setShowPicker(false)}>
            {hasReactions && !showPicker && (
                <div style={{ display: 'flex', gap: '2px' }}>
                    {Object.entries(reactions).map(([emoji, count]) => (
                        <ReactionButton key={emoji} onClick={() => handleReactionClick(emoji)}>
                            {emoji}
                        </ReactionButton>
                    ))}
                </div>
            )}
            {showPicker && (
                <div style={{ display: 'flex', gap: '2px' }}>
                    {AVAILABLE_REACTIONS.map(({ emoji, name }) => (
                        <ReactionButton key={name} onClick={() => handleReactionClick(emoji)} active={reactions[emoji]}>
                            {emoji}
                        </ReactionButton>
                    ))}
                </div>
            )}
        </ReactionsContainer>
    );
};

export default MessageReactions;
export { AVAILABLE_REACTIONS };