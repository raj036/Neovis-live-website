import { Fragment } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const TaskConfigurationListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    totalCount,
    configs,
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
              <TableCell width="15%">Name</TableCell>
              <TableCell width="12%">Task Type</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Unit Groups</TableCell>
              <TableCell align="center">Task Execution Moment</TableCell>
              <TableCell align="center">Priority</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs?.map((cfg) => {
              return (
                <Fragment key={cfg.id}>
                  <TableRow hover>
                    <TableCell >{cfg?.name}</TableCell>
                    <TableCell >{cfg?.task_type}</TableCell>
                    <TableCell >{cfg?.property?.property_name}</TableCell>
                    <TableCell >{
                      cfg?.unit_groups?.map(f => f.name).join(", ")}
                    </TableCell>
                    <TableCell align="center">{cfg?.execution_moment}</TableCell>
                    <TableCell align="center">
                      <SeverityPill
                        color={cfg?.priority === "Low" ? "success" :
                               cfg?.priority === "Medium" ? "warning" : "error"}
                      >
                        {cfg?.priority}
                      </SeverityPill>
                    </TableCell>
                    <TableCell >
                      {editable && (
                        <EditButton
                          path={`/dashboard/planning/configuration/${cfg?.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/planning/configuration/${cfg?.id}/detail`}
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
        count={totalCount || 0}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page || 0}
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

TaskConfigurationListTable.propTypes = {
  unitareas: PropTypes.array.isRequired,
  unitareasCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
