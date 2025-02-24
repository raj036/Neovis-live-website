import { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import nProgress from "nprogress";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { HMSRoomProvider } from "@100mslive/react-sdk";
// import { LocalizationProvider } from "@mui/lab";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";

import { LocalizationProvider } from "@mui/x-date-pickers";
// date-fns
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { RTL } from "../components/rtl";
import { SettingsButton } from "../components/settings-button";
import { SplashScreen } from "../components/splash-screen";
import {
  SettingsConsumer,
  SettingsProvider,
} from "../contexts/settings-context";
import { AuthConsumer, AuthProvider } from "../contexts/jwt-context";
import { gtmConfig } from "../config";
import { gtm } from "../lib/gtm";
import { store } from "../store";
import { createTheme } from "../theme";
import { createEmotionCache } from "../utils/create-emotion-cache";
import "../i18n";
import "../app.css";
import Script from "next/script";

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

const clientSideEmotionCache = createEmotionCache();

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      })
  );

  // useEffect(() => {
  //   gtm.initialize(gtmConfig);
  // }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <QueryClientProvider client={client}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>virtual insepect</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <Script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCraSNfyN4PuuLEZx6zQue5R14k5b8deFA&libraries=places" />
          <ReduxProvider store={store}>
            <AuthProvider>
              <HMSRoomProvider>
                <SettingsProvider>
                  <SettingsConsumer>
                    {({ settings }) => (
                      <ThemeProvider
                        theme={createTheme({
                          direction: settings.direction,
                          responsiveFontSizes: settings.responsiveFontSizes,
                          mode: settings.theme,
                        })}
                      >
                        <RTL direction={settings.direction}>
                          <CssBaseline />
                          <Toaster position="top-center" />
                          <AuthConsumer>
                            {(auth) =>
                              !auth.isInitialized ? (
                                <SplashScreen />
                              ) : (
                                getLayout(<Component {...pageProps} />)
                              )
                            }
                          </AuthConsumer>
                        </RTL>
                      </ThemeProvider>
                    )}
                  </SettingsConsumer>
                </SettingsProvider>
              </HMSRoomProvider>
            </AuthProvider>
          </ReduxProvider>
        </CacheProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </LocalizationProvider>

  );
};

export default App;
