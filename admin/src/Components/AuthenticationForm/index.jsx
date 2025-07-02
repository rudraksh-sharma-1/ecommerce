import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  Container,
  Box,
} from "@mantine/core";
import { SitemarkIcon } from "./CustomIcons";


export default function AuthenticationForm() {
  const navigate = useNavigate();
  const [formType, setFormType] = useState("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, logout } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (formType === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (formType === "login") {
        const loginResult = await login(email, password);
        if (loginResult.success) {
          if (loginResult.isAdmin) {
            navigate('/');
          } else {
            setError("You do not have admin privileges");
            await logout();
          }
        } else {
          setError(loginResult.error || "Invalid credentials");
        }
      } else {
        const registerResult = await register(email, password);
        if (registerResult.success) {
          setFormType("login");
        } else {
          setError(registerResult.error || "Registration failed");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const toggleFormType = () => {
    setFormType((current) => (current === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--mantine-color-body)" }}>
      <Container size="xs">
        <Paper radius="lg" p="xl" withBorder className="mantine-card">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-full">
              <SitemarkIcon size={30} color="#fff" />
            </div>
          </div>
          <Title order={2} align="center" mt="sm" mb={30}>
            {formType === "login" ? "Welcome back!" : "Create an account"}
          </Title>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                required
                label="Email"
                placeholder="hello@example.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                error={error && !email ? "Email is required" : null}
                radius="md"
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                error={error && !password ? "Password is required" : null}
                radius="md"
              />

              {formType === "register" && (
                <PasswordInput
                  required
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                  error={error && password !== confirmPassword ? "Passwords do not match" : null}
                  radius="md"
                />
              )}

              <Button
                fullWidth
                mt="xl"
                size="md"
                type="submit"
                loading={loading}
                radius="md"
                className="bg-red-500 hover:bg-red-600 transition-colors"
              >
                {formType === "login" ? "Sign in" : "Create account"}
              </Button>

              <Text align="center" mt="md">
                {formType === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <Anchor
                  component="button"
                  type="button"
                  ml={5}
                  onClick={toggleFormType}
                  className="text-red-500 hover:text-red-600"
                >
                  {formType === "login" ? "Register" : "Login"}
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
