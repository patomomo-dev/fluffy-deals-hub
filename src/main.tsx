import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import client from "./lib/apolloClient.ts";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById('root')!).render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>);
