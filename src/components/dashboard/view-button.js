import { IconButton, Tooltip } from "@mui/material";

import NextLink from "next/link";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";

export const ViewButton = (props) => {
  const { path, title } = props;

  return (
    <NextLink href={path} passHref>
      <Tooltip title={title}>
        <IconButton component="a">
          <ArrowRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </NextLink>
  );
};
