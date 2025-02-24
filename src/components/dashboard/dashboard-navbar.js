import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Bell as BellIcon } from "../../icons/bell";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { AccountPopover } from "./account-popover";
import { NotificationsPopover } from "./notifications-popover";
import { getUser } from "../../utils/helper";
import { Logo } from "../logo";
import useAxios from "../../services/useAxios";
import { useQuery } from "react-query";

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  ...(theme.palette.mode === "light"
    ? {
        boxShadow: theme.shadows[3],
      }
    : {
        backgroundColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.divider,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        boxShadow: "none",
      }),
}));

const NotificationsButton = ({ userNotifications }) => {
  const anchorRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const [openPopover, setOpenPopover] = useState(false);
  // Unread notifications should come from a context and be shared with both this component and
  // notifications popover. To simplify the demo, we get it from the popover

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  const handleUpdateUnread = (value) => {
    setUnread(value);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton ref={anchorRef} sx={{ ml: 1 }} onClick={handleOpenPopover}>
          <Badge
            color="error"
            badgeContent={userNotifications ? userNotifications.length : 0}
          >
            <BellIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationsPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        onUpdateUnread={handleUpdateUnread}
        open={openPopover}
        userNotifications={userNotifications}
      />
    </>
  );
};

const AccountButton = () => {
  const anchorRef = useRef(null);
  const [openPopover, setOpenPopover] = useState(false);
  // To get the user from the authContext, you can use
  // `const { user } = useAuth();`
  const user = getUser();

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpenPopover}
        ref={anchorRef}
        sx={{
          alignItems: "center",
          display: "flex",
          ml: 2,
        }}
      >
        <Avatar
          sx={{
            height: 40,
            width: 40,
          }}
          src={user?.profile_image_url}
        >
          <UserCircleIcon fontSize="small" />
        </Avatar>
      </Box>
      <AccountPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

export const DashboardNavbar = (props) => {
  const { onOpenSidebar, isSidebarOpen, isManager, ...other } = props;

  const user = getUser();
  const [userNotifications, setuserNotifications] = useState([]);

  const customInstance = useAxios();

  const { data, refetch, isLoading, isFetching } = useQuery(
    "allnotificationList",
    () => customInstance.get(`push-notifications/user/${user.id}`),
    { enabled: user !== undefined, refetchInterval: 10000 }
  );

  useEffect(() => {
    if (data !== undefined) {
      // console.log("notification res", data);
      setuserNotifications(data?.data);
    }
  }, [data]);

  // console.log("userNotifications", userNotifications);

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: isSidebarOpen ? 280 : 60,
          width: isSidebarOpen ? "calc(100% - 280px)" : "calc(100% - 60px)",
        }}
        {...other}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}
        >
          {!isManager && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <a>
                <Logo
                  sx={{
                    height: 42,
                    width: 42,
                  }}
                />
              </a>
              <Typography
                style={{ width: "100%", marginLeft: "20px" }}
                color="#5048e5"
                variant="h5"
              >
                {user?.organization?.org_name}
              </Typography>
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {/* <LanguageButton />
          <ContentSearchButton />
          <ContactsButton /> */}
          <NotificationsButton userNotifications={userNotifications} />
          <AccountButton />
        </Toolbar>
      </DashboardNavbarRoot>
    </>
  );
};

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};
