import React, { useRef, useState } from "react";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import "./App.css";

interface UserData {
  email: string;
  number: string;
}

// interface FormData {
//   email: string;
//   number: string;
// }

const App: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserData>();
  const [result, setResult] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [emptyResult, setEmptyResult] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const onSubmit = async (data: UserData) => {
    setLoading(true);
    setEmptyResult("");
    setResult([]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    try {
      const response = await fetch("http://localhost:3001/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: newAbortController.signal,
      });

      const resultData: UserData[] = await response.json();
      if (!resultData.length) setEmptyResult("Nothing found");
      setResult(resultData);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request canceled.");
      } else {
        console.error("Query error:", error);
      }
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  };

  console.log("");

  return (
    <Container maxWidth="sm" sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          The search form
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            disabled={loading}
            helperText={errors.email ? errors.email.message : ""}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          <TextField
            label="Number"
            fullWidth
            margin="normal"
            error={!!errors.number}
            disabled={loading}
            helperText={errors.number ? errors.number.message : ""}
            inputProps={{ maxLength: 8 }}
            {...register("number", {
              pattern: {
                value: /^(\d{2}-\d{2}-\d{2}|\d{6})$/,
                message: "Invalid number format",
              },
            })}
          />
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Request"}
            </Button>
          </Box>
        </form>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ marginTop: 4 }}
        >
          Query results:
        </Typography>
        <Box>
          {result.length > 0 ? (
            result.map((userData, index) => (
              <Typography key={index}>
                {`${index + 1}. email: ${
                  userData.email
                }, phone number: ${userData.number.replace(
                  /(\d{2})(\d{2})(\d{2})/g,
                  "$1-$2-$3"
                )}`}
              </Typography>
            ))
          ) : (
            <Typography>{emptyResult}</Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default App;
