import { gql } from '@apollo/client';

export interface LoginResponse {
  login: {
    success: boolean;
    token: string;
  };
}

export interface LoginVariables {
  email: string;
  password: string;
}

export const AUTH_LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      token
    }
  }
`;