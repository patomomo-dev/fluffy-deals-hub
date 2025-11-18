import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import client from './lib/apolloClient.ts';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
    <BrowserRouter>
        <ApolloProvider client={client}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ApolloProvider>
    </BrowserRouter>
);
