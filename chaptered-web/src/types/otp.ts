export interface OTPRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export interface OTPErrorResponse {
  error: string;
  attemptsRemaining?: number;
}