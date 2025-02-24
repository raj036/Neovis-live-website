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

export const IssueTypeTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    issuetypes,
    issuetypesCount,
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
              <TableCell width="30%">Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issuetypes.map((issuetype) => {
              return (
                <Fragment key={issuetype.id}>
                  <TableRow hover>
                    <TableCell width="30%">
                      <NextLink
                        href={`/dashboard/configurations/issuetypes/${issuetype.id}/detail`}
                        as={`/dashboard/configurations/issuetypes/${issuetype.id}/detail`}
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
                          {issuetype.name}
                        </Link>
                      </NextLink>
                    </TableCell>
                    <TableCell>{issuetype.code}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          issuetype.status === "Active" ? "success" : "warning"
                        }
                      >
                        {issuetype.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      {editable && !issuetype.default && (
                        <EditButton
                          path={`/dashboard/configurations/issuetypes/${issuetype.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/configurations/issuetypes/${issuetype.id}/detail`}
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
        count={issuetypesCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

IssueTypeTable.propTypes = {
  issuetypes: PropTypes.array.isRequired,
  issuetypesCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
