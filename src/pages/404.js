import { useEffect } from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { gtm } from "../lib/gtm";
import { DashboardLayout } from "../components/dashboard/dashboard-layout";

const NotFound = () => {
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <DashboardLayout isLoading={false}>
      <Head>
        <title>Error: Coming Soon</title>
      </Head>
      <Box
        component="main"
        sx={{
          alignItems: "center",
          backgroundColor: "background.paper",
          display: "flex",
          flexGrow: 1,
          py: "80px",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <Box
              alt="Under development"
              component="img"
              src={`/static/error/under_construction_${theme.palette.mode}.svg`}
              sx={{
                height: "auto",
                maxWidth: "100%",
                width: 400,
              }}
            />
          </Box>
          <Typography align="center" variant={mobileDevice ? "h4" : "h1"}>
            {/* 404: The page you are looking for isn’t here */}
            Coming Soon
          </Typography>
          <Typography
            align="center"
            color="textSecondary"
            sx={{ mt: 0.5 }}
            variant="subtitle2"
          >
            Our team is working on this feature and we’ll bring it to you soon.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <NextLink href="/dashboard" passHref>
              <Button component="a" variant="outlined">
                Back to Dashboard
              </Button>
            </NextLink>
          </Box>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default NotFound;
