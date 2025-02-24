import { Box, Button } from "@mui/material";

import NextLink from "next/link";

import { ArrowLeft as ArrowLeftIcon } from "../../icons/arrow-left";

export const BackButton = (props) => {
  const { path, title, as } = props;

  return (
    <Box sx={{ mb: 3 }}>
      <NextLink href={path} as={as ? as : path} passHref>
        <Button component="a" startIcon={<ArrowLeftIcon fontSize="small" />}>
          {title}
        </Button>
      </NextLink>
    </Box>
  );
};
