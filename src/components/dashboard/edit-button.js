import { Box, IconButton, Tooltip } from "@mui/material";

import NextLink from "next/link";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";

export const EditButton = (props) => {
  const { path, title } = props;

  return (
    <NextLink href={path} passHref>
      <Tooltip title={title}>
        <IconButton component="a">
          <PencilAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </NextLink>
  );
};
