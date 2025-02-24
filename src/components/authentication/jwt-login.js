import { useRouter } from "next/router";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  TextField,
} from "@mui/material";
import { setUser } from "../../utils/helper";
import { useMounted } from "../../hooks/use-mounted";
import { useAuth } from "../../hooks/use-auth";
import { useState } from "react";

export const JWTLogin = (props) => {
  const { login } = useAuth();
  const router = useRouter();
  const isMounted = useMounted();

  const [loading, setLoading] = useState();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      // email: "prof.ajaybhatia@gmail.com",
      // password: "Ajay@321",
      // email: "ankit.kumar2041@gmail.com",
      // password: "Ankit@263",
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      setLoading(true);
      try {
        const userdata = await login(values.email, values.password);
        setLoading(false);
        if (isMounted()) {
          const returnUrl = router.query.returnUrl || "/dashboard";
          if (userdata && userdata.user?.user_role?.role === "Owner") {
            router.push(`${returnUrl}/tasks`).catch(console.error);
          } else {
            router.push(returnUrl).catch(console.error);
          }
        }
      } catch (err) {
        setLoading(false);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit} {...props}>
      <TextField
        autoFocus
        error={Boolean(formik.touched.email && formik.errors.email)}
        fullWidth
        helperText={formik.touched.email && formik.errors.email}
        label="Email Address"
        margin="normal"
        name="email"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="email"
        value={formik.values.email}
      />
      <TextField
        error={Boolean(formik.touched.password && formik.errors.password)}
        fullWidth
        helperText={formik.touched.password && formik.errors.password}
        label="Password"
        margin="normal"
        name="password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="password"
        value={formik.values.password}
      />
      {formik.errors.submit && (
        <Box sx={{ mt: 3 }}>
          <FormHelperText error>{formik.errors.submit}</FormHelperText>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          {loading ? (
            <CircularProgress style={{ color: "white" }} size={26} />
          ) : (
            "Log In"
          )}
        </Button>
      </Box>
    </form>
  );
};
