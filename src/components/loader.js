import { Box } from "@mui/material";
import { Logo } from "./logo";
import { keyframes } from "@emotion/react";

const bounce1 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 1px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const bounce3 = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 3px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

export const Loader = () => (
  <Box
    sx={{
      alignItems: "center",
      backgroundColor: "black",
      opacity: "0.4",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      justifyContent: "center",
      p: 3,
      width: "100vw",
      zIndex: 2000,
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}
  >
    <Logo
      sx={{
        height: 80,
        width: 80,
        "& path:nth-child(1)": {
          animation: `${bounce1} 1s ease-in-out infinite`,
        },
        "& path:nth-child(3)": {
          animation: `${bounce3} 1s ease-in-out infinite`,
        },
      }}
    />
  </Box>
);
