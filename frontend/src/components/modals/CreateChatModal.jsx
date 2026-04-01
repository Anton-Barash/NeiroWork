import React from 'react';
import styled from '@emotion/styled';
import { useChatContext } from '../../context/ChatContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #343a40;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;

  &:hover {
    background: #e9ecef;
  }
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function CreateChatModal({ isOpen, onClose }) {
    const { createChat } = useChatContext();
    const [topic, setTopic] = React.useState('');

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!topic.trim()) return;
        await createChat(topic.trim());
        setTopic('');
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && topic.trim()) {
            handleCreate();
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Создать новый чат</ModalTitle>
                <ModalInput
                    type="text"
                    placeholder="Введите тему чата"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                <ModalButtons>
                    <CancelButton onClick={onClose}>Отмена</CancelButton>
                    <CreateButton
                        onClick={handleCreate}
                        disabled={!topic.trim()}
                    >
                        Создать
                    </CreateButton>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
}

export default CreateChatModal;