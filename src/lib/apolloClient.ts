import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('token');

    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : "",
        },
    }));

    return forward(operation);
});

const httpLink = new HttpLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include',
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;