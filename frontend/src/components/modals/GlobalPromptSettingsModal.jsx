// d:\neiroQC\NeiroWork\frontend\src\components\modals\GlobalPromptSettingsModal.jsx
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

const Section = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #495057;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

function GlobalPromptSettingsModal({ isOpen, onClose }) {
    const { globalPrompts, fetchGlobalPrompts, updateGlobalPrompt } = useChatContext();
    const [localPrompts, setLocalPrompts] = React.useState({
        dialog_analysis: globalPrompts.dialog_analysis || '',
        global_prompt: globalPrompts.global_prompt || '',
        neiro_work: globalPrompts.system_settings || ''
    });

    React.useEffect(() => {
        if (isOpen) {
            fetchGlobalPrompts();
        }
    }, [isOpen, fetchGlobalPrompts]);

    React.useEffect(() => {
        if (isOpen) {
            setLocalPrompts({
                dialog_analysis: globalPrompts.dialog_analysis || '',
                global_prompt: globalPrompts.global_prompt || '',
                neiro_work: globalPrompts.system_settings || ''
            });
        }
    }, [isOpen, globalPrompts]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            // Update all global prompts
            await Promise.all([
                updateGlobalPrompt('dialog_analysis', localPrompts.dialog_analysis),
                updateGlobalPrompt('global_prompt', localPrompts.global_prompt),
                updateGlobalPrompt('neiro_work', localPrompts.neiro_work)
            ]);
            onClose();
        } catch (error) {
            console.error('Error saving global prompts:', error);
        }
    };

    const handleChange = (name, value) => {
        setLocalPrompts(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Global Prompt Settings</ModalTitle>

                <Section>
                    <SectionTitle>Global Prompt (default)</SectionTitle>
                    <ModalTextarea
                        value={localPrompts.global_prompt}
                        onChange={(e) => handleChange('global_prompt', e.target.value)}
                        placeholder="Enter global prompt..."
                    />
                </Section>

                <Section>
                    <SectionTitle>Dialog Analysis Prompt (default)</SectionTitle>
                    <ModalTextarea
                        value={localPrompts.dialog_analysis}
                        onChange={(e) => handleChange('dialog_analysis', e.target.value)}
                        placeholder="Enter default dialog analysis prompt..."
                    />
                </Section>

                <Section>
                    <SectionTitle>NeiroWork Prompt (default)</SectionTitle>
                    <ModalTextarea
                        value={localPrompts.neiro_work}
                        onChange={(e) => handleChange('neiro_work', e.target.value)}
                        placeholder="Enter default NeiroWork prompt..."
                    />
                </Section>

                <ModalButtons>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                    <SaveButton onClick={handleSave}>Save</SaveButton>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
}

export default GlobalPromptSettingsModal;