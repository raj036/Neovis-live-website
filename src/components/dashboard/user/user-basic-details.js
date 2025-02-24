import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const UserBasicDetails = (props) => {
  const {
    first_name,
    last_name,
    email,
    user_role,
    status,
    phone_number,
    is_external,
    dob,
  } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const align = mdUp ? "horizontal" : "vertical";

  const router = useRouter()
  const [isOwnerRoute, setIsOwnerRoute] = useState(false)

  useEffect(() => {
    if (router.pathname.includes('/owner/')) {
      setIsOwnerRoute(true)
    } else {
      setIsOwnerRoute(false)
    }
  }, [router])

  return (
    <Card>
      <CardHeader title="Basic Details" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          divider
          label="First Name"
          value={first_name}
        />
        <PropertyListItem
          align={align}
          divider
          label="Last Name"
          value={last_name}
        />
        <PropertyListItem align={align} divider label="Email" value={email} />
        <PropertyListItem
          align={align}
          divider
          label="Phone Number"
          value={phone_number}
        />
        <PropertyListItem
          align={align}
          divider
          label="DOB"
          value={dob ? format(new Date(dob), "MM/dd/yyyy") : ""}
        />
        <PropertyListItem
          align={align}
          divider
          label="Role"
          value={user_role?.role}
        />
        <PropertyListItem
          align={align}
          divider
          label="External"
          value={is_external ? "Yes" : "No"}
        />
        <PropertyListItem align={align} divider label="Status" value={status} />
        {isOwnerRoute &&
          <Box>
            <PropertyListItem align={align} divider label="Address" value={props?.address} />
            <PropertyListItem align={align} divider label="City" value={props?.city} />
            <PropertyListItem align={align} divider label="Country" value={props?.country?.name} />
            <PropertyListItem align={align} divider label="Province" value={props?.province} />
            <PropertyListItem align={align} divider label="Zip code" value={props?.zip_code} />
            <PropertyListItem align={align} divider label="Bank owner name" value={props?.bank_owner_name} />
            <PropertyListItem align={align} divider label="Bank account number" value={props?.bank_account_number} />
            <PropertyListItem align={align} divider label="Bank account code" value={props?.bank_account_code} />
          </Box>
        }
      </PropertyList>
    </Card>
  );
};

UserBasicDetails.propTypes = {
  address1: PropTypes.string,
  address2: PropTypes.string,
  // country: PropTypes.string,
  email: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string,
};
