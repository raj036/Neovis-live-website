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
import { Image as ImageIcon } from "../../../icons/image";
import { Scrollbar } from "../../scrollbar";
import { SeverityPill } from "../../severity-pill";
import { EditButton } from "../edit-button";
import { ViewButton } from "../view-button";

export const PropertyListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    properties,
    propertiesCount,
    rowsPerPage,
    ...other
  } = props;

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell width="25%">Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell width="20%">Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Province</TableCell>
              <TableCell>Zip</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => {
              return (
                <Fragment key={property.id}>
                  <TableRow hover>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {property.images ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${
                                property?.main_image
                                  ? property?.main_image
                                  : property.images[0]
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
                            href={`/dashboard/properties/${property.id}/detail`}
                            passHref
                          >
                            <Link
                              color="inherit"
                              variant="subtitle2"
                              sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                            >
                              {property.property_name}
                            </Link>
                          </NextLink>
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            <SeverityPill
                              color={
                                property.property_type === "Hotel"
                                  ? "primary"
                                  : property.property_type === "Vacation Rental"
                                  ? "secondary"
                                  : "info"
                              }
                            >
                              {property.property_type}
                            </SeverityPill>
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{property.property_code}</TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>{property.province}</TableCell>
                    <TableCell>{property.zip_code}</TableCell>
                    <TableCell>{property.country?.name}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          property.status === "Active" ? "success" : "warning"
                        }
                      >
                        {property.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell align="right">
                      <EditButton
                        path={`/dashboard/properties/${property.id}/edit`}
                        title="Edit"
                      />
                      <ViewButton
                        path={`/dashboard/properties/${property.id}/detail`}
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
        count={propertiesCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

PropertyListTable.propTypes = {
  properties: PropTypes.array.isRequired,
  propertiesCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
