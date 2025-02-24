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
import { Image as ImageIcon } from "../../../../icons/image";
import { useRouter } from "next/router";
import { EditButton } from "../../edit-button";
import { ViewButton } from "../../view-button";

export const UnitListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    units,
    unitsCount,
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
              <TableCell width="20%">Name</TableCell>
              <TableCell width="10%">Code</TableCell>
              <TableCell width="15%">Unit Type</TableCell>
              <TableCell>PMS Id</TableCell>
              <TableCell width="30%">Property Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width="10%" align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units?.map((unit) => {
              return (
                <Fragment key={unit.id}>
                  <TableRow hover>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {unit.images ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${
                                unit?.main_image
                                  ? unit?.main_image
                                  : unit.images[0]
                              }")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                              borderRadius: 1,
                              display: "flex",
                              minHeight: 80,
                              justifyContent: "center",
                              overflow: "hidden",
                              minWidth: 80,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              borderRadius: 1,
                              display: "flex",
                              height: 80,
                              justifyContent: "center",
                              width: 80,
                            }}
                          >
                            <ImageIcon fontSize="small" />
                          </Box>
                        )}
                        <Box
                          sx={{
                            cursor: "pointer",
                            ml: 2,
                          }}
                        >
                          <NextLink
                            href={`/dashboard/properties/units/${unit.id}/detail`}
                            as={`/dashboard/properties/units/${unit.id}/detail`}
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
                              {unit.unit_name}
                            </Link>
                          </NextLink>
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            <SeverityPill color={"primary"}>
                              {unit.unit_condition}
                            </SeverityPill>
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* <TableCell width="15%">
                      <NextLink
                        href={`/dashboard/properties/units/${unit.id}/detail`}
                        as={`/dashboard/properties/units/${unit.id}/detail`}
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
                          {unit.unit_name}
                        </Link>
                      </NextLink>
                    </TableCell> */}
                    <TableCell>{unit.unit_code}</TableCell>
                    {/* <TableCell>{unit.unit_condition}</TableCell> */}
                    <TableCell width="15%">
                      {unit.unit_type?.unit_type_name}
                    </TableCell>
                    <TableCell width="10%">
                      {unit?.pms_id}
                    </TableCell>
                    <TableCell width="30%">
                      {unit.property?.property_name}
                    </TableCell>
                    <TableCell>
                      <SeverityPill
                        color={unit.status === "Active" ? "success" : "warning"}
                      >
                        {unit.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="center">
                      {editable && (
                        <EditButton
                          path={`/dashboard/properties/units/${unit.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/properties/units/${unit.id}/detail`}
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
        count={unitsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

UnitListTable.propTypes = {
  units: PropTypes.array.isRequired,
  unitsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
