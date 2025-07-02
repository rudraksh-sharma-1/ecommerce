import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core"; 
import "./index.css";
import App from "./App.jsx";

// Create a custom theme
const theme = createTheme({
  primaryColor: 'red',
  fontFamily: 'Roboto, sans-serif',
  headings: { fontFamily: 'Roboto, sans-serif' },
  defaultRadius: 'md',
  colors: {
    brand: [
      '#fff5f5',
      '#ffe3e3',
      '#ffc9c9',
      '#ffa8a8',
      '#ff8787',
      '#ff6b6b',
      '#fa5252',
      '#f03e3e',
      '#e03131',
      '#c92a2a',
    ]
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>
);
