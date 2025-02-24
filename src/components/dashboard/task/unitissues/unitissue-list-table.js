import { Fragment } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";

export const UnitIssueListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    unitIssues,
    unitsIssueCount,
    rowsPerPage,
    editable,
    ...other
  } = props;

  const router = useRouter();

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell width="25%">Title</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Unit Area</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unitIssues?.map((unitIssue) => {
              return (
                <Fragment key={unitIssue.id}>
                  <TableRow hover>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          cursor: "pointer",
                          ml: 2,
                        }}
                      >
                        <NextLink
                          href={`/dashboard/tasks/unitissues/${unitIssue.id}/detail`}
                          as={`/dashboard/tasks/unitissues/${unitIssue.id}/detail`}
                          passHref
                        >
                          <Link
                            color="inherit"
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "black",
                            }}
                          >
                            {unitIssue.issue_title}
                          </Link>
                        </NextLink>
                        <Typography
                          color="textSecondary"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          <SeverityPill color={"primary"}>
                            {unitIssue.issue_type?.name}
                          </SeverityPill>
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{unitIssue.unit?.unit_name}</TableCell>
                    <TableCell>{unitIssue.unit_area?.area_name}</TableCell>
                    <TableCell>{unitIssue.source_task?.task_title}</TableCell>
                    <TableCell>
                      {unitIssue.reported_by?.first_name}{" "}
                      {unitIssue.reported_by?.last_name}
                    </TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          unitIssue.status === "Active" ? "success" : "warning"
                        }
                      >
                        {unitIssue.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      <ViewButton
                        path={`/dashboard/tasks/unitissues/${unitIssue.id}/detail`}
                        title="View"
                      />
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={unitsIssueCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

UnitIssueListTable.propTypes = {
  units: PropTypes.array.isRequired,
  unitsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
