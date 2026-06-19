import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig, cognitoConfig } from './config';

// Initialize Cognito Client
const cognitoClient = new CognitoIdentityProviderClient(awsConfig);

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserAttributes {
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

// User Sign Up
export async function signUp(
  email: string,
  password: string,
  attributes: UserAttributes
): Promise<string> {
  const userAttributes = [
    { Name: 'email', Value: email },
    ...(attributes.name ? [{ Name: 'name', Value: attributes.name }] : []),
    ...(attributes.phone ? [{ Name: 'phone_number', Value: attributes.phone }] : []),
    ...(attributes.role ? [{ Name: 'custom:role', Value: attributes.role }] : []),
  ];

  const command = new SignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    Password: password,
    UserAttributes: userAttributes,
  });

  const response = await cognitoClient.send(command);
  return response.UserSub || '';
}

// Confirm Sign Up
export async function confirmSignUp(email: string, code: string): Promise<void> {
  const command = new ConfirmSignUpCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    ConfirmationCode: code,
  });
  await cognitoClient.send(command);
}

// Sign In
export async function signIn(email: string, password: string): Promise<AuthTokens> {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: cognitoConfig.clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const response = await cognitoClient.send(command);
  const result = response.AuthenticationResult;

  if (!result) {
    throw new Error('Authentication failed');
  }

  return {
    accessToken: result.AccessToken || '',
    idToken: result.IdToken || '',
    refreshToken: result.RefreshToken || '',
    expiresIn: result.ExpiresIn || 3600,
  };
}

// Refresh Token
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const command = new InitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: cognitoConfig.clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  const response = await cognitoClient.send(command);
  const result = response.AuthenticationResult;

  if (!result) {
    throw new Error('Token refresh failed');
  }

  return {
    accessToken: result.AccessToken || '',
    idToken: result.IdToken || '',
    refreshToken: refreshToken,
    expiresIn: result.ExpiresIn || 3600,
  };
}

// Forgot Password
export async function forgotPassword(email: string): Promise<void> {
  const command = new ForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
  });
  await cognitoClient.send(command);
}

// Confirm Forgot Password
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: cognitoConfig.clientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });
  await cognitoClient.send(command);
}

// Get Current User
export async function getCurrentUser(accessToken: string): Promise<UserAttributes> {
  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  const response = await cognitoClient.send(command);
  const attributes: UserAttributes = { email: '' };

  response.UserAttributes?.forEach((attr) => {
    switch (attr.Name) {
      case 'email':
        attributes.email = attr.Value || '';
        break;
      case 'name':
        attributes.name = attr.Value;
        break;
      case 'phone_number':
        attributes.phone = attr.Value;
        break;
      case 'custom:role':
        attributes.role = attr.Value;
        break;
    }
  });

  return attributes;
}

// Sign Out (Global)
export async function signOut(accessToken: string): Promise<void> {
  const command = new GlobalSignOutCommand({
    AccessToken: accessToken,
  });
  await cognitoClient.send(command);
}

// Admin: Get User
export async function adminGetUser(username: string): Promise<UserAttributes | null> {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: cognitoConfig.userPoolId,
      Username: username,
    });

    const response = await cognitoClient.send(command);
    const attributes: UserAttributes = { email: '' };

    response.UserAttributes?.forEach((attr) => {
      switch (attr.Name) {
        case 'email':
          attributes.email = attr.Value || '';
          break;
        case 'name':
          attributes.name = attr.Value;
          break;
        case 'phone_number':
          attributes.phone = attr.Value;
          break;
        case 'custom:role':
          attributes.role = attr.Value;
          break;
      }
    });

    return attributes;
  } catch {
    return null;
  }
}

// Admin: Create User
export async function adminCreateUser(
  email: string,
  temporaryPassword: string,
  attributes: UserAttributes
): Promise<void> {
  const userAttributes = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' },
    ...(attributes.name ? [{ Name: 'name', Value: attributes.name }] : []),
    ...(attributes.phone ? [{ Name: 'phone_number', Value: attributes.phone }] : []),
    ...(attributes.role ? [{ Name: 'custom:role', Value: attributes.role }] : []),
  ];

  const command = new AdminCreateUserCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Username: email,
    TemporaryPassword: temporaryPassword,
    UserAttributes: userAttributes,
    MessageAction: 'SUPPRESS',
  });

  await cognitoClient.send(command);
}

// Admin: Delete User
export async function adminDeleteUser(username: string): Promise<void> {
  const command = new AdminDeleteUserCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Username: username,
  });
  await cognitoClient.send(command);
}

// Admin: Update User Attributes
export async function adminUpdateUserAttributes(
  username: string,
  attributes: Partial<UserAttributes>
): Promise<void> {
  const userAttributes = [
    ...(attributes.name ? [{ Name: 'name', Value: attributes.name }] : []),
    ...(attributes.phone ? [{ Name: 'phone_number', Value: attributes.phone }] : []),
    ...(attributes.role ? [{ Name: 'custom:role', Value: attributes.role }] : []),
  ];

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Username: username,
    UserAttributes: userAttributes,
  });

  await cognitoClient.send(command);
}

// Admin: List Users
export async function adminListUsers(
  limit: number = 50,
  paginationToken?: string
): Promise<{ users: UserAttributes[]; nextToken?: string }> {
  const command = new ListUsersCommand({
    UserPoolId: cognitoConfig.userPoolId,
    Limit: limit,
    PaginationToken: paginationToken,
  });

  const response = await cognitoClient.send(command);
  const users: UserAttributes[] = [];

  response.Users?.forEach((user) => {
    const attrs: UserAttributes = { email: '' };
    user.Attributes?.forEach((attr) => {
      switch (attr.Name) {
        case 'email':
          attrs.email = attr.Value || '';
          break;
        case 'name':
          attrs.name = attr.Value;
          break;
        case 'phone_number':
          attrs.phone = attr.Value;
          break;
        case 'custom:role':
          attrs.role = attr.Value;
          break;
      }
    });
    users.push(attrs);
  });

  return {
    users,
    nextToken: response.PaginationToken,
  };
}

export { cognitoClient, cognitoConfig };
