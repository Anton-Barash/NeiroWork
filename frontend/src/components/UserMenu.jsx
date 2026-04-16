import React, { memo } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';

const UserMenuContainer = styled.div`
  margin-top: auto;
  padding: 10px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  overflow: visible;
`;

const UserMenuButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
  }

  /* Custom tooltip */
  &::after {
    content: attr(data-title);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.1s ease, visibility 0.1s ease;
    z-index: 99999;
    margin-top: 8px;
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.1s ease, visibility 0.1s ease;
    z-index: 99999;
    margin-top: -4px;
    pointer-events: none;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
`;

const CompanySelectorButton = styled(UserMenuButton)`
  font-size: 11px;
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const UserMenu = memo(({ setShowCompanySelector, company }) => {
  const { user, logout } = useAuth();

  return (
    <UserMenuContainer>
      <UserInfo>
        <UserDetails>
          <UserName>{user?.username || 'User'}</UserName>
          <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
        </UserDetails>
        <ButtonGroup>
          <CompanySelectorButton onClick={() => setShowCompanySelector && setShowCompanySelector(true)} data-title="Select Company">
            {company?.name || 'Company'}
          </CompanySelectorButton>
          <UserMenuButton onClick={logout} data-title="Logout">
            Logout
          </UserMenuButton>
        </ButtonGroup>
      </UserInfo>
    </UserMenuContainer>
  );
});

export default UserMenu;