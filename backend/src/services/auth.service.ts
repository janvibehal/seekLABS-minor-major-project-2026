import { comparePassword, hashPassword } from "./password.service.js";

import {
  createUser,
  findUserByEmail,
  findUserById
} from "../repositories/user.repository.js";

import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

import { generateAccessToken, generateRefreshToken , verifyRefreshToken } from "../utils/jwt.js";

import { hashToken } from "../utils/password.js";

import { createRefreshToken , findRefreshToken , revokeRefreshToken } from "../repositories/refreshToken.repository.js";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    role: "CANDIDATE",
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Your account has been disabled");
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  const refreshTokenHash = hashToken(refreshToken);

  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken({
    tokenHash: refreshTokenHash,
    userId: user.id,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  };
};


export const refreshAccessToken = async (
  refreshToken: string,
) => {
  let payload

  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new Error('Invalid refresh token')
  }

  const tokenHash = hashToken(refreshToken)

  const storedToken = await findRefreshToken(tokenHash)

  if (!storedToken) {
    throw new Error('Refresh token not found')
  }

  if (storedToken.revokedAt) {
    throw new Error('Refresh token has been revoked')
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token has expired')
  }

  if (!storedToken.user.isActive) {
    throw new Error('Your account has been disabled')
  }

  if (storedToken.user.id !== payload.userId) {
    throw new Error('Invalid refresh token')
  }

  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    role: storedToken.user.role,
  })

  return {
    accessToken,
    user: {
      id: storedToken.user.id,
      firstName: storedToken.user.firstName,
      lastName: storedToken.user.lastName,
      email: storedToken.user.email,
      role: storedToken.user.role,
      emailVerified: storedToken.user.emailVerified,
    },
  }
}


export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  if (!user.isActive) {
    throw new Error('Your account has been disabled')
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  }
} 


export const logoutUser = async (
  refreshToken: string,
) => {
  const tokenHash = hashToken(refreshToken)

  await revokeRefreshToken(tokenHash)
}