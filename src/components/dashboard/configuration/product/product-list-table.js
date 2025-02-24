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

export const ProductTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    products,
    productsCount,
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
              {/* <TableCell>product Type</TableCell> */}
              <TableCell>Status</TableCell>
              <TableCell>View Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              return (
                <Fragment key={product.id}>
                  <TableRow hover>
                    <TableCell width="30%">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                        }}
                      >
                        {product.photo ? (
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${product?.photo}")`,
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
                            href={`/dashboard/configurations/products/${product.id}/detail`}
                            as={`/dashboard/configurations/products/${product.id}/detail`}
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
                              {product.name}
                            </Link>
                          </NextLink>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.code}</TableCell>
                    {/* <TableCell>{product.product_type}</TableCell> */}
                    <TableCell>
                      <SeverityPill
                        color={
                          product.status === "Active" ? "success" : "warning"
                        }
                      >
                        {product.status}
                      </SeverityPill>
                    </TableCell>
                    <TableCell>
                      <NextLink
                        href={`/dashboard/configurations/products/${product.id}/viewstock`}
                        as={`/dashboard/configurations/products/${product.id}/viewstock`}
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
                      {editable && !product.default && (
                        <EditButton
                          path={`/dashboard/configurations/products/${product.id}/edit`}
                          title="Edit"
                        />
                      )}
                      <ViewButton
                        path={`/dashboard/configurations/products/${product.id}/detail`}
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
        count={productsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  productsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
