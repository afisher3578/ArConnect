import styled, { css, keyframes } from "styled-components";
import { ButtonV2 } from "@arconnect/components";

export const IconButton = styled(ButtonV2)`
  padding: 1.2rem;
  transition: all 0.23s ease-in-out;
  height: 52px;
  width: 100px;
`;

export const RefreshButton = styled(IconButton)<{ refreshing: boolean }>`
  svg {
    animation: ${(props) => (props.refreshing ? rotation : "none")};
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const rotation = css`
  ${rotate} 0.5s linear infinite
`;
