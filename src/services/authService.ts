import { gql } from '@apollo/client';

export interface User {
  userId: number;
  userName: string;
  email: string;
  role: {
    roleId: number;
    roleName: string;
  };
}

export interface LoginResponse {
  login: {
    success: boolean;
    token: string;
    user: User;
  };
}

export interface CurrentUserResponse {
  currentUser: User;
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
      user {
        userId
        userName
        email
        role {
          roleId
          roleName
        }
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      userId
      userName
      email
      role {
        roleId
        roleName
      }
    }
  }
`;