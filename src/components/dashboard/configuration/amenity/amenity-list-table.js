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
  Box,
  Typography
} from "@mui/material";
import { Image as ImageIcon } from "../../../../icons/image";
import NextLink from "next/link";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const AmenityTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    amenities,
    amenitiesCount,
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
              <TableCell>PMS Id</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {amenities.map((amenity) => {
              return (
                <Fragment key={amenity.id}>
                  <TableRow hover>
                    <TableCell width="30%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {amenity.photo ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${amenity?.photo}")`,
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
                            href={`/dashboard/configurations/amenities/${amenity.id}/detail`}
                            as={`/dashboard/configurations/amenities/${amenity.id}/detail`}
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
                              {amenity.name}
                            </Link>
                          </NextLink>
                          {amenity?.add_on && <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            <SeverityPill
                              color={"primary"}
                            >
                              Add On
                            </SeverityPill>
                          </Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    {/* <TableCell width="30%">
                      <NextLink
                        href={`/dashboard/configurations/amenities/${amenity.id}/detail`}
                        as={`/dashboard/configurations/amenities/${amenity.id}/detail`}
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
                          {amenity.name}
                        </Link>
                      </NextLink>
                    </TableCell> */}
                    <TableCell>{amenity.code}</TableCell>
                    <TableCell>{amenity.pms_id}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          amenity.status === "Active" ? "success" : "warning"
                        }
                      >
                        {amenity.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell>
                      <NextLink
                        href={`/dashboard/configurations/amenities/${amenity.id}/viewstock`}
                        as={`/dashboard/configurations/amenities/${amenity.id}/viewstock`}
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
                          view
                        </Link>
                      </NextLink>
                    </TableCell>
                    <TableCell align="right">
                      {editable && !amenity.default && (
                        <EditButton
                          path={`/dashboard/configurations/amenities/${amenity.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/configurations/amenities/${amenity.id}/detail`}
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
        count={amenitiesCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

AmenityTable.propTypes = {
  amenities: PropTypes.array.isRequired,
  amenitiesCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
