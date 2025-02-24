import { Box, Container, Typography } from '@mui/material'
import Head from 'next/head'
import React from 'react'

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
      </Head>
      <Box
        component="main"
        sx={{
          py: 5,
          px: 3
        }}
      >
        <Container maxWidth="xl">
          <Typography variant='h4' sx={{ mb: 2 }}>
            Privacy Policy
          </Typography>
          <Typography variant='body1' sx={{ my: 2 }}>
            Your privacy is of utmost importance to us, and we are committed to safeguarding the personal information you provide to us. This Privacy Policy outlines how we collect, use, disclose, and protect your personal data when you access and use our App. By using the App, you consent to the practices described in this Privacy Policy.
          </Typography>

          <Typography variant='body1'>Information We Collect:</Typography>
          <ol>
            <li>
              Personal Information: When you sign up or use our App, we may collect certain personal information, such as your name, email address, phone number, and other relevant contact details.
            </li>
            <li>
              Usage Data: We may automatically collect non-personal information, such as your IP address, device information, browser type, and other anonymous usage data, to enhance your experience and improve our services.
            </li>
          </ol>

          <Typography variant='body1'>How We Use Your Information:</Typography>
          <ol>
            <li>
              Providing Services: We may use your personal information to deliver the services offered by our App, process transactions, and fulfill your requests.
            </li>
            <li>
              Improving App Functionality: Your usage data allows us to analyze App performance, detect errors, and optimize its functionality for a better user experience.
            </li>
            <li>
              Communication: We may use your contact information to send you important updates, newsletters, and promotional materials. You can opt-out of marketing communications at any time.
            </li>
          </ol>

          <Typography variant='body1'>How We Share Your Information:</Typography>
          <ol>
            <li>
              Third-Party Service Providers: We may share your information with trusted third-party service providers to assist us in delivering our services and improving App functionality. These providers will only have access to the data necessary to perform their tasks.
            </li>
            <li>
              Legal Requirements: We may disclose your personal information if required by law, court order, or governmental authority, to protect our rights, or to address security issues.
            </li>
          </ol>

          <Typography variant='body1'>Data Security:</Typography>
          <ol>
            <li>
              We employ industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, please note that no transmission method over the internet or electronic storage is entirely secure, and we cannot guarantee absolute data security.
            </li>
          </ol>
        </Container>
      </Box>
    </>
  )
}

export default PrivacyPolicy