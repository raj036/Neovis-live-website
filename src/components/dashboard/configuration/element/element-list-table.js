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
} from "@mui/material";
import NextLink from "next/link";
import { Image as ImageIcon } from "../../../../icons/image";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const ElementTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    elements,
    elementsCount,
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
              <TableCell>Element Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {elements.map((element) => {
              return (
                <Fragment key={element.id}>
                  <TableRow hover>
                    <TableCell width="30%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {element.photo ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${element?.photo}")`,
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
                            href={`/dashboard/configurations/elements/${element.id}/detail`}
                            as={`/dashboard/configurations/elements/${element.id}/detail`}
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
                              {element.name}
                            </Link>
                          </NextLink>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{element.code}</TableCell>
                    <TableCell>{element.element_type}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={
                          element.status === "Active" ? "success" : "warning"
                        }
                      >
                        {element.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell>
                      <NextLink
                        href={`/dashboard/configurations/elements/${element.id}/viewstock`}
                        as={`/dashboard/configurations/elements/${element.id}/viewstock`}
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
                      </NextLink></TableCell>
                    <TableCell align="right">
                      {editable && !element.default && (
                        <EditButton
                          path={`/dashboard/configurations/elements/${element.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/configurations/elements/${element.id}/detail`}
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
        count={elementsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

ElementTable.propTypes = {
  elements: PropTypes.array.isRequired,
  elementsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
