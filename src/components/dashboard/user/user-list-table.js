import NextLink from "next/link";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { SeverityPill } from "../../severity-pill";
import { EditButton } from "../edit-button";
import { ViewButton } from "../view-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const UserListTable = (props) => {
  const {
    users,
    usersCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    refreshTable,
    ...other
  } = props;

  const router = useRouter()
  const [isOwnerRoute, setIsOwnerRoute] = useState(false)

  useEffect(() => {
    if (router.pathname.includes('/owner')) {
      setIsOwnerRoute(true)
    } else {
      setIsOwnerRoute(false)
    }
  }, [router])

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead
          // sx={{ visibility: "visible" }}
          >
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>External</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              return (
                <TableRow hover key={user.id}>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <Avatar
                        src={user.image}
                        sx={{
                          height: 42,
                          width: 42,
                        }}
                      >
                        {user?.first_name?.charAt(0) +
                          user?.last_name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ ml: 1 }}>
                        <NextLink href={isOwnerRoute ? `/dashboard/owner/${user.id}` : `/dashboard/users/${user.id}`} passHref>
                          <Link color="inherit" variant="subtitle2">
                            {user?.first_name + " " + user?.last_name}
                          </Link>
                        </NextLink>
                        <Typography color="textSecondary" variant="body2">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.user_role.role}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>
                    <SeverityPill
                      color={!user.is_external ? "success" : "warning"}
                    >
                      {user.is_external ? "Yes" : "No"}
                    </SeverityPill>
                  </TableCell>
                  <TableCell>
                    <SeverityPill
                      color={user.status === "Active" ? "success" : "warning"}
                    >
                      {user.status}
                    </SeverityPill>
                  </TableCell>
                  <TableCell align="right">
                    <EditButton
                      path={isOwnerRoute ? `/dashboard/owner/${user.id}/edit` : `/dashboard/users/${user.id}/edit`}
                      title="Edit"
                    />
                    <ViewButton
                      path={isOwnerRoute ? `/dashboard/owner/${user.id}` : `/dashboard/users/${user.id}`}
                      title="View"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={usersCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

UserListTable.propTypes = {
  users: PropTypes.array.isRequired,
  usersCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
