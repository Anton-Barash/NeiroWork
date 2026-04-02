import React from 'react';
import axios from 'axios';
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

const PromptSettingsModal = ({
  isOpen,
  onClose,
  promptSettings,
  setPromptSettings,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  updateCustomPrompt,
  updatePromptSettings
}) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>Настройки промпта анализа</ModalTitle>
        {/* Global Prompt */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
            Общий промт (для всех чатов):
          </label>
          <ModalTextarea
            value={promptSettings.dialog_analysis_prompt || ''}
            onChange={e => setPromptSettings({ ...promptSettings, dialog_analysis_prompt: e.target.value })}
            placeholder="Введите общий промт для анализа диалогов..."
            rows={4}
          />
        </div>
        {/* Checkbox */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="useCustomPrompt"
            checked={useCustomPrompt}
            onChange={e => setUseCustomPrompt(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="useCustomPrompt" style={{ fontSize: '14px', color: '#495057', cursor: 'pointer' }}>
            Использовать индивидуальный промт для этого чата
          </label>
        </div>
        {/* Individual Prompt */}
        {useCustomPrompt && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#667eea' }}>
              Индивидуальный промт (для этого чата):
            </label>
            <ModalTextarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Введите индивидуальный промт для этого чата..."
              rows={4}
            />
          </div>
        )}
        <ModalButtons>
          <CancelButton onClick={onClose}>
            Отмена
          </CancelButton>
          <SaveButton onClick={() => {
            updateCustomPrompt();
            if (!useCustomPrompt && promptSettings.dialog_analysis_prompt) {
              // Update the global prompt in ai_prompts table
              axios.put('/api/prompts/global_prompt', {
                name: 'global_prompt',
                prompt_text: promptSettings.dialog_analysis_prompt
              }).catch(err => console.error('Error updating global prompt:', err));
            } else {
              // Update the chat-specific prompt in chat_prompts_settings table
              updatePromptSettings();
            }
          }}>
            Сохранить
          </SaveButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PromptSettingsModal;