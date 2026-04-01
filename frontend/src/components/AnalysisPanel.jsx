import React from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../context/ChatContext';

const AnalysisContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  margin: 16px;
  overflow: hidden;
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
`;

const AnalysisTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #343a40;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #dee2e6;
    color: #343a40;
  }
`;

const AnalysisContent = styled.div`
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #495057;

  h1, h2, h3, h4 {
    margin-top: 16px;
    margin-bottom: 8px;
    color: #212529;
  }

  ul, ol {
    padding-left: 20px;
    margin: 8px 0;
  }

  code {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }

  pre {
    background: #212529;
    color: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
  }
`;

function AnalysisPanel() {
  const { analysis, showAnalysis, setShowAnalysis } = useChatContext();

  if (!showAnalysis || !analysis) {
    return null;
  }

  return (
    <AnalysisContainer>
      <AnalysisHeader>
        <AnalysisTitle>Анализ диалога</AnalysisTitle>
        <CloseButton onClick={() => setShowAnalysis(false)}>×</CloseButton>
      </AnalysisHeader>
      <AnalysisContent>
        <ReactMarkdown>{analysis}</ReactMarkdown>
      </AnalysisContent>
    </AnalysisContainer>
  );
}

export default AnalysisPanel;