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
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const UnitareaListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    unitareas,
    unitareasCount,
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
              <TableCell>Code</TableCell>
              <TableCell>Area Type</TableCell>
              <TableCell width="15%">Unit Type</TableCell>
              <TableCell width="30%">Property Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unitareas?.map((unitarea) => {
              return (
                <Fragment key={unitarea.id}>
                  <TableRow hover>
                    <TableCell width="15%">
                      <NextLink
                        href={`/dashboard/properties/unitareas/${unitarea.id}/detail`}
                        as={`/dashboard/properties/unitareas/${unitarea.id}/detail`}
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
                          {unitarea.area_name}
                        </Link>
                      </NextLink>
                    </TableCell>
                    <TableCell>{unitarea.area_code}</TableCell>
                    <TableCell>{unitarea.area_type}</TableCell>
                    <TableCell width="15%">
                      {unitarea.unit_type?.unit_type_name}
                    </TableCell>
                    <TableCell width="30%">
                      {unitarea.property?.property_name}
                    </TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          unitarea.status === "Active" ? "success" : "warning"
                        }
                      >
                        {unitarea.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      {editable && (
                        <EditButton
                          path={`/dashboard/properties/unitareas/${unitarea.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/properties/unitareas/${unitarea.id}/detail`}
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
        count={unitareasCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

UnitareaListTable.propTypes = {
  unitareas: PropTypes.array.isRequired,
  unitareasCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
