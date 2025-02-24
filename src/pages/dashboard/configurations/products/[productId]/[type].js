import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { ProductEditForm } from "../../../../../components/dashboard/configuration/product/product-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";

const ProductCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [productId, setproductId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["productById", productId],
    () => customInstance.get(`products/${productId}`),
    { enabled: productId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.productId !== "newproduct") {
        setproductId(router.query.productId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setIsEdit(true);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Product Create</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="md">
            <div>
              <BackButton
                path={`/dashboard/configurations/products`}
                as="/dashboard/configurations/products"
                title="product"
              />
              {productId && (
                <>
                  <Grid container justifyContent="space-between" spacing={3}>
                    <Grid
                      item
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <div>
                        <Typography variant="h4">{data?.data?.name}</Typography>
                      </div>
                    </Grid>
                    {!isEdit && !data?.data?.default && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/configurations/products/${productId}/edit`}
                          as={`/dashboard/configurations/products/${productId}/edit`}
                          passHref
                        >
                          <Button
                            component="a"
                            endIcon={<PencilAltIcon fontSize="small" />}
                            sx={{ m: 1 }}
                            variant="outlined"
                            onClick={() => setIsEdit(true)}
                          >
                            Edit
                          </Button>
                        </NextLink>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </div>

            <Box sx={{ mb: 3 }}>
              {!productId && (
                <Typography variant="h4">Create a new product</Typography>
              )}
            </Box>
            <ProductEditForm
              isEdit={isEdit}
              product={productId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default ProductCreate;
