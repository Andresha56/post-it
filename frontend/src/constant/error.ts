export const MESSAGES: Record<string, string> = {
  CodeMismatchException:
    "That code is incorrect. Check your email and try again.",
  ExpiredCodeException: "That code has expired. Request a new code.",
  LimitExceededException:
    "Too many attempts. Please wait a while and try again.",
  TooManyRequestsException:
    "Too many requests. Please wait a moment and try again.",
  TooManyFailedAttemptsException:
    "Too many failed attempts. Please wait a while and try again.",
  UserNotFoundException:
    "We could not find a pending registration for that email.",
  UsernameExistsException:
    "An account with this email already exists. Try signing in.",
  InvalidPasswordException: "Your password does not meet the requirements.",
  InvalidParameterException:
    "Please check the details you entered and try again.",
  NotAuthorizedException: "Incorrect email or password.",
  UserNotConfirmedException: "Your email address is not verified yet.",
  NetworkError: "Network error. Check your connection and try again.",
};