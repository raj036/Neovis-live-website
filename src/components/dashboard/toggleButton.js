import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../../slices/sidebar";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
 
// Styled IconButton to match the design in the image
const StyledIconButton = styled(IconButton)(({ theme, open }) => ({
  backgroundColor: theme.palette.common.white,
  zIndex: 999,
  color: theme.palette.neutral[900],
  height: 25,
  width: 25,
  borderRadius: "50%",
  boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
  position: "fixed",
  left: open ? "265px" : "48px",
  top: "10px",
  transition: "left 0.1s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
  },
  "&:active": {},
  zIndex: 1000,
  padding: 10,
}));
 
const ToggleButton = ({ open }) => {
  const dispatch = useDispatch();
 
  return (
    <StyledIconButton onClick={() => dispatch(toggleSidebar())} open={open}>
      {open ? (
        <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 22 }} />
      ) : (
        <KeyboardDoubleArrowRightIcon sx={{ fontSize: 22 }}/>
      )}
    </StyledIconButton>
  );
};
 
export default ToggleButton