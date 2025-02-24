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
import { Image as ImageIcon } from "../../../../icons/image";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { EditButton } from "../../edit-button";
import { ViewButton } from "../../view-button";

export const UnitTypeListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    unittypes,
    unittypesCount,
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
              <TableCell width="25%">Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell width="30%">Property Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unittypes?.map((unittype) => {
              return (
                <Fragment key={unittype.id}>
                  <TableRow hover>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {unittype.images ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${
                                unittype?.main_image
                                  ? unittype?.main_image
                                  : unittype.images[0]
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
                            href={`/dashboard/properties/unittypes/${unittype.id}/detail?propertyId=${unittype.property_id}`}
                            as={`/dashboard/properties/unittypes/${unittype.id}/detail`}
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
                              {unittype.unit_type_name}
                            </Link>
                          </NextLink>
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            <SeverityPill color={"primary"}>
                              {unittype.unit_class}
                            </SeverityPill>
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{unittype.unit_type_code}</TableCell>
                    <TableCell>{unittype.property?.property_name}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          unittype.status === "Active" ? "success" : "warning"
                        }
                      >
                        {unittype.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      {editable && (
                        <EditButton
                          path={`/dashboard/properties/unittypes/${unittype.id}/edit?propertyId=${unittype.property_id}`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/properties/unittypes/${unittype.id}/detail?propertyId=${unittype.property_id}`}
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
        count={unittypesCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

UnitTypeListTable.propTypes = {
  unittypes: PropTypes.array.isRequired,
  unittypesCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
