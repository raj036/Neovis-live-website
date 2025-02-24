import { useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Card, Container, Divider, Link, Typography } from "@mui/material";
import { GuestGuard } from "../../components/authentication/guest-guard";
import { AuthBanner } from "../../components/authentication/auth-banner";
import { AmplifyLogin } from "../../components/authentication/amplify-login";
import { Auth0Login } from "../../components/authentication/auth0-login";
import { FirebaseLogin } from "../../components/authentication/firebase-login";
import { JWTLogin } from "../../components/authentication/jwt-login";
import { Logo } from "../../components/logo";
import { useAuth } from "../../hooks/use-auth";
import { gtm } from "../../lib/gtm";

const Login = () => {
  const router = useRouter();
  const { platform } = useAuth();
  const { disableGuard } = router.query;

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            py: {
              xs: "60px",
              md: "120px",
            },
          }}
        >
          <Card elevation={16} sx={{ p: 4 }}>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <NextLink href="/" passHref>
                <a>
                  <Logo
                    sx={{
                      height: 40,
                      width: 40,
                    }}
                  />
                </a>
              </NextLink>
              <Typography variant="h4">Log in</Typography>
              <Typography color="textSecondary" sx={{ mt: 2 }} variant="body2">
                Sign in on the Neovis platform
              </Typography>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                mt: 3,
              }}
            >
              <JWTLogin />
            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
};

Login.getLayout = (page) => <GuestGuard>{page}</GuestGuard>;

export default Login;
