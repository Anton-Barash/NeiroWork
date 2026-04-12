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
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
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

const UserMenuButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
  }
`;

const UserMenu = memo(() => {
  const { user, logout } = useAuth();

  return (
    <UserMenuContainer>
      <UserInfo>
        <UserName>{user?.username || 'User'}</UserName>
        <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
      </UserInfo>
      <UserMenuButton onClick={logout}>
        Logout
      </UserMenuButton>
    </UserMenuContainer>
  );
});

export default UserMenu;