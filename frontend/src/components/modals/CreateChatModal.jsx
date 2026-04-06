import React from 'react';
import * as S from '../../App.styles';

const CreateChatModal = ({ 
  isOpen, 
  onClose, 
  newChatTopic, 
  setNewChatTopic, 
  createChat 
}) => {
  if (!isOpen) return null;

  return (
    <S.CreateChatModal onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalTitle>Create New Chat</S.ModalTitle>
        <S.ModalInput
          type="text"
          placeholder="Enter chat topic"
          value={newChatTopic}
          onChange={(e) => setNewChatTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createChat()}
        />
        <S.ModalButtons>
          <S.CancelButton
            onClick={onClose}
          >
            Cancel
          </S.CancelButton>
          <S.ConfirmButton
            onClick={createChat}
          >
            Create
          </S.ConfirmButton>
        </S.ModalButtons>
      </S.ModalContent>
    </S.CreateChatModal>
  );
};

export default CreateChatModal;
