import { Fragment } from "react";
import PropTypes from "prop-types";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import NextLink from "next/link";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { EditButton } from "../../edit-button";
import { ViewButton } from "../../view-button";

export const ChecklistTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    checklists,
    checklistsCount,
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
              <TableCell width="30%">Title</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Area Type</TableCell>
              <TableCell>Task Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checklists?.map((checklist) => {
              return (
                <Fragment key={checklist.id}>
                  <TableRow hover>
                    <TableCell width="30%">
                      <NextLink
                        href={`/dashboard/tasks/checklists/${checklist.id}/detail`}
                        as={`/dashboard/tasks/checklists/${checklist.id}/detail`}
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
                          {checklist.checklist_title}
                        </Link>
                      </NextLink>
                    </TableCell>
                    <TableCell>{checklist.checklist_code}</TableCell>
                    <TableCell>{checklist.area_type}</TableCell>
                    <TableCell>{checklist.task_type}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          checklist.status === "Active" ? "success" : "warning"
                        }
                      >
                        {checklist.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      {editable && !checklist.default && (
                        <EditButton
                          path={`/dashboard/tasks/checklists/${checklist.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/tasks/checklists/${checklist.id}/detail`}
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
        count={checklistsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

ChecklistTable.propTypes = {
  checklists: PropTypes.array.isRequired,
  checklistsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
