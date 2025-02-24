import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as dayjs from "dayjs";
import NextLink from "next/link";
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { MailOpen as MailOpenIcon } from "../../icons/mail-open";
import { Mail as MailIcon } from "../../icons/mail";
import { X as XIcon } from "../../icons/x";
import { Scrollbar } from "../scrollbar";
import { getState, setState } from "../../contexts/zustand-store";
import { VideocamOutlined } from "@mui/icons-material";
import { getUser } from "../../utils/helper";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from "../../services/useAxios";

const getNotificationContent = (notification, router) => {
  return (
    <ListItem
      sx={{ padding: 0 }}
      onClick={() => {
        if (notification.roomInfo) {
          router.push(
            `/dashboard/?property_id=${notification.roomInfo.property_id}&task_id=${notification.roomInfo.task_id}`,
            `/dashboard`
          )
        }
      }
      }
    >
      <>
        <ListItemAvatar sx={{ mt: 0.5 }}>
          <Avatar src={notification.avatar}>
            <VideocamOutlined />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ mr: 0.5 }} variant="subtitle2">
                {notification.title}
              </Typography>
              <Typography sx={{ mr: 0.5 }} variant="body2">
                {notification.body}
              </Typography>
            </Box>
          }
          secondary={
            notification.roomInfo ?
              <Typography color="textSecondary" variant="caption">
                {dayjs(new Date(notification.roomInfo.created_at)).format("lll")}
              </Typography>
              :
              <Typography color="textSecondary" variant="caption">
                {dayjs(new Date(notification.created_at)).format("lll")}
              </Typography>
          }
          sx={{ my: 0 }}
        />
      </>
    </ListItem>
  );
};

export const NotificationsPopover = (props) => {
  const { anchorEl, onClose, onUpdateUnread, open, userNotifications, ...other } = props;
  const user = getUser();
  const router = useRouter();
  const othersNotifications = getState().notifications?.filter(
    (_) => _.roomInfo.inspector_id !== user?.id
  );
  const myNotifications = getState().notifications?.filter(
    (_) => _.roomInfo.inspector_id === user?.id
  );

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: updateNoti, data: updateData } = useMutation((data) =>
    customInstance.patch(`push-notifications/${data.id}`, { read: data.read })
  );

  useEffect(() => {
    if (updateData !== undefined) {
      (async () => {
        await queryClient.refetchQueries(
          ["allnotificationList"],
          {
            active: true,
            exact: true,
          }
        );
      })()
    }
  }, [updateData])

  const { mutateAsync: deleteNoti, data: delData } = useMutation((id) =>
    customInstance.delete(`push-notifications/${id}`)
  );

  useEffect(() => {
    if (delData !== undefined) {
      (async () => {
        await queryClient.refetchQueries(
          ["allnotificationList"],
          {
            active: true,
            exact: true,
          }
        );
      })()
    }
  }, [delData])

  const unread = useMemo(
    () =>
      myNotifications.reduce(
        (acc, notification) => acc + (notification.read ? 0 : 1),
        0
      ),
    [myNotifications]
  );

  useEffect(() => {
    onUpdateUnread?.(unread);
  }, [onUpdateUnread, unread]);

  const handleMarkAllAsRead = () => {
    const markNotificationsRead = myNotifications?.map((_) => ({
      ..._,
      read: true,
    }));
    setState({
      notifications: [...othersNotifications, ...markNotificationsRead],
    });
  };

  const handleRemoveOne = (notificationId) => {
    const data = [...myNotifications];
    const idx = data.findIndex((_) => _.roomInfo.id === notificationId);
    if (idx >= 0) {
      data.splice(idx, 1);
      setState({
        notifications: [...othersNotifications, ...data],
      });
    }
  };

  const handleReadUnread = (notificationId, readUnreadStat) => {
    const data = [...myNotifications];
    const idx = data.findIndex((_) => _.roomInfo.id === notificationId);
    if (idx >= 0) {
      data[idx].read = readUnreadStat;
      setState({
        notifications: [...othersNotifications, ...data],
      });
    }
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 380 } }}
      transitionDuration={0}
      {...other}
    >
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography color="inherit" variant="h6">
          Notifications
        </Typography>
        <Tooltip title="Mark all as read">
          <IconButton
            onClick={handleMarkAllAsRead}
            size="small"
            sx={{ color: "inherit" }}
          >
            <MailOpenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {[...userNotifications, ...myNotifications].length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            There are no notifications
          </Typography>
        </Box>
      ) : (
        <Scrollbar sx={{ maxHeight: 400 }}>
          <List disablePadding>
            {[...userNotifications, ...myNotifications].map((notification, idx) => (
              <ListItem
                divider
                key={idx}
                sx={{
                  backgroundColor: notification.read
                    ? "white"
                    : "rgb(220 225 235)",
                  alignItems: "flex-start",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  "& .MuiListItemSecondaryAction-root": {
                    top: "24%",
                  },
                }}
                secondaryAction={
                  <>
                    <Tooltip title="Mark Read">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          if (notification.roomInfo) {
                            handleReadUnread(
                              notification.roomInfo.id,
                              !notification.read
                            )
                          } else {
                            (async () => {
                              await updateNoti({ id: notification.id, read: !notification.read })
                            })()
                            // handleReadUnread(
                            //   notification.id,
                            //   !notification.read
                            // )
                          }
                        }
                        }
                        size="small"
                      >
                        {notification.read ? (
                          <MailOpenIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <MailIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          if (notification.roomInfo) {
                            handleRemoveOne(notification.roomInfo.id)
                          } else {
                            (async () => {
                              await deleteNoti(notification.id)
                            })()
                            // handleRemoveOne(notification.id)
                          }
                        }
                        }
                        size="small"
                      >
                        <XIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                {getNotificationContent(notification, router)}
              </ListItem>
            ))}
          </List>
        </Scrollbar>
      )}
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  onUpdateUnread: PropTypes.func,
  open: PropTypes.bool,
};
