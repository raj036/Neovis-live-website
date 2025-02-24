import { useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Box, CircularProgress } from "@mui/material";
import { Loader } from "../loader";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar  } from "../../slices/sidebar";
import { managerLogin } from "../../utils/helper";

const DashboardLayoutRoot = styled("div")(({ theme, isSidebarOpen }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  paddingLeft: isSidebarOpen ? 280 : 60,
  // [theme.breakpoints.up("lg")]: {
  //   paddingLeft: 280,
  // },
}));

export const DashboardLayout = (props) => {
  const { children, isLoading } = props;
  const dispatch = useDispatch();
  const isManager = managerLogin();

  let isSidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);

  if (!isManager) {
    isSidebarOpen = false;
  }

  return (
    <>
      <DashboardLayoutRoot isSidebarOpen={isSidebarOpen}>
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {isLoading && <Loader />}
          {children}
        </Box>
      </DashboardLayoutRoot>
      <DashboardNavbar
        onOpenSidebar={() => dispatch(toggleSidebar())}
        isSidebarOpen={isSidebarOpen}
        isManager={isManager}
      />
      {isManager && (
        <DashboardSidebar
          onClose={() => dispatch(toggleSidebar())}
          open={isSidebarOpen}
        />
      )}
    </>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
