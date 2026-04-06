import { css } from '@emotion/react';
import styled from '@emotion/styled';

// Основные стилизованные компоненты
export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`;

export const Sidebar = styled.div`
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
`;

export const SidebarHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
`;

export const SidebarTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MoreButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  color: #495057;
  border-radius: 4px;

  &:hover {
    background: #e9ecef;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #343a40;

  &:hover {
    background: #f8f9fa;
  }
`;

export const NewChatButton = styled.button`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background-color: #cadae9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }
`;

export const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

export const ChatItem = styled.div`
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  ${props => props.active && css`
    background-color: #e3f2fd;
  `}
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
`;

export const ChatHeader = styled.div`
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const ChatTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
`;

export const AnalyzeButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #218838;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

export const AppTitleButton = styled.button`
  background-color: #f0eee7;
  color: #212529;
  border: 2px solid #ffffff;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 6px 12px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background-color: #e0a800;
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.25),
      0 8px 16px rgba(0, 0, 0, 0.2),
      0 10px 20px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: #d39e00;
    cursor: not-allowed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const DeleteChatButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

export const SettingsButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  margin-right: 5px;

  &:hover {
    background-color: #5a6268;
  }
`;

export const AdvancedSettingsButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  margin-right: 5px;

  &:hover {
    background-color: #218838;
  }
`;

export const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const MessageContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-direction: ${props => props.role === 'user' ? 'row-reverse' : 'row'};
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.role === 'user' ? '#007bff' : '#6c757d'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

export const MessageInfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 80%;
`;

export const SenderName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #888;
  text-align: ${props => props.role === 'user' ? 'right' : 'left'};
`;

export const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.role === 'user' ? '#007bff' : '#fff'};
  color: ${props => props.role === 'user' ? 'white' : '#333'};
  border: ${props => props.role === 'user' ? 'none' : '1px solid #e0e0e0'};
  border-bottom-${props => props.role === 'user' ? 'right' : 'left'}-radius: 2px;
`;

export const MessageContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

export const MessageTime = styled.div`
  font-size: 11px;
  color: #888;
  text-align: ${props => props.role === 'user' ? 'right' : 'left'};
  margin-top: 2px;
`;

export const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 14px;
  color: #666;

  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
  font-style: italic;

  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const AnalysisContainer = styled.div`
  margin: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

export const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

export const AnalysisTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

export const AnalysisContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  
  /* Markdown styles */
  h1, h2, h3, h4, h5, h6 {
    margin: 20px 0 10px 0;
    font-weight: 600;
  }
  
  h1 { font-size: 1.6em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.2em; }
  
  p {
    margin: 10px 0;
  }
  
  ul, ol {
    margin: 12px 0;
    padding-left: 25px;
  }
  
  /* Nested lists */
  ul ul, ul ol, ol ul, ol ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 6px 0;
    line-height: 1.5;
  }
  
  strong {
    font-weight: 600;
  }
  
  code {
    background-color: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 10px 0;
  }
  
  pre code {
    background: none;
    padding: 0;
  }
  
  blockquote {
    border-left: 4px solid #007bff;
    padding-left: 15px;
    margin: 15px 0;
    color: #666;
    font-style: italic;
  }
  
  /* Table styles */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    text-align: left;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: #e9ecef;
  }
`;

export const NeiroWorkContainer = styled.div`
  margin: 20px;
  padding: 20px;
  background-color: #fff3cd;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
`;

export const NeiroWorkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ffeaa7;
`;

export const NeiroWorkContainerTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #856404;
`;

export const NeiroWorkContainerContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #856404;
  
  /* Markdown styles */
  h1, h2, h3, h4, h5, h6 {
    margin: 20px 0 10px 0;
    font-weight: 600;
  }
  
  h1 { font-size: 1.6em; }
  h2 { font-size: 1.4em; }
  h3 { font-size: 1.2em; }
  
  p {
    margin: 10px 0;
  }
  
  ul, ol {
    margin: 12px 0;
    padding-left: 25px;
  }
  
  /* Nested lists */
  ul ul, ul ol, ol ul, ol ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 6px 0;
    line-height: 1.5;
  }
  
  strong {
    font-weight: 600;
  }
  
  code {
    background-color: rgba(255, 255, 255, 0.7);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: rgba(255, 255, 255, 0.7);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 10px 0;
  }
  
  pre code {
    background: none;
    padding: 0;
  }
  
  blockquote {
    border-left: 4px solid #ffc107;
    padding-left: 15px;
    margin: 15px 0;
    color: #666;
    font-style: italic;
  }
`;

export const Section = styled.div`
  margin-bottom: 15px;
`;

export const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #856404;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SectionContent = styled.div`
  margin-bottom: 10px;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li`
  margin-bottom: 5px;
  line-height: 1.4;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const FilesListContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

export const FilesTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
`;

export const FileName = styled.span`
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
`;

export const FileSize = styled.span`
  color: #666;
  font-size: 11px;
`;

export const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  margin-left: 8px;

  &:hover {
    color: #c82333;
  }
`;

export const InputArea = styled.div`
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FileUploadArea = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

export const MessageInput = styled.textarea`
  flex: 1;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  resize: none;
  font-size: 14px;
  min-height: 48px;
  max-height: 120px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

export const SendButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #0069d9;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
`;

export const EmptyTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

export const EmptyText = styled.p`
  font-size: 14px;
  margin-bottom: 20px;
`;

export const CreateChatModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
// добавим полупрозрачный фон с эффектом тени阴影 и размытия
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(3px);

  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

export const ModalInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

export const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #5a6268;
  }
`;

export const ConfirmButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;

export const NeiroWorkWindow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const NeiroWorkWindowContent = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const NeiroWorkWindowTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

export const ChatAnalysisCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
`;

export const ChatAnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const ChatAnalysisTitle = styled.h4`
  margin: 0;
  font-size: 16px;
`;

export const ChatAnalysisContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  color: #555;
  white-space: pre-wrap;
  margin: 10px 0;
`;

export const ChatAnalysisFooter = styled.div`
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
`;