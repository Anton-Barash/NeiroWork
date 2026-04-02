// d:\neiroQC\NeiroWork\frontend\src\components\modals\NeiroWorkPromptSettingsModal.jsx
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
  max-width: 700px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #343a40;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
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
  margin-top: 20px;
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

const SaveButton = styled.button`
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
`;

function NeiroWorkPromptSettingsModal({ isOpen, onClose }) {
  const { globalPrompts, fetchGlobalPrompts, updateGlobalPrompt } = useChatContext();
  const [localPrompt, setLocalPrompt] = React.useState(globalPrompts.system_settings || '');

  React.useEffect(() => {
    if (isOpen) {
      fetchGlobalPrompts();
    }
  }, [isOpen, fetchGlobalPrompts]);

  React.useEffect(() => {
    if (isOpen) {
      setLocalPrompt(globalPrompts.system_settings || '');
    }
  }, [isOpen, globalPrompts]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      // Update NeiroWork global prompt
      await updateGlobalPrompt('neiro_work', localPrompt);
      onClose();
    } catch (error) {
      console.error('Error saving NeiroWork prompt:', error);
      // Fallback: still close the modal to prevent app breaking
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>NeiroWork Prompt Settings</ModalTitle>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
            NeiroWork Prompt (default):
          </label>
          <ModalTextarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="Enter default NeiroWork prompt..."
            rows={6}
          />
        </div>

        <ModalButtons>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave}>Save</SaveButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
}

export default NeiroWorkPromptSettingsModal;