import React from 'react';
import styled from '@emotion/styled';

const Outer = styled.div`
  margin-top: -5px;
  border-radius: 8px;
  background-color: white;
  box-shadow: -4px 5px 5px 0px rgba(34, 60, 80, 0.2);
  height: 40px;
  width: 100%;
`;

const Inner = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 8px;
  position: relative;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  height: 100%;
  padding-right: 0.5rem;
  padding-left: 1rem;

  &::before {
    content: "";
    position: absolute;
    top: 1px;
    left: 0px;
    right: 0px;
    bottom: -1px;
    box-shadow: inset -5px 4px 12px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    pointer-events: none;
  }
`;

const ShadowBox = ({ children, additionalStyles }) => {
  return (
    <Outer style={additionalStyles}>
      <Inner>
        {children}
      </Inner>
    </Outer>
  );
};

export default ShadowBox;
