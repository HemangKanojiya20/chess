export const USER = {
  ErrorMessages: {
    USER_CREATION_FAILED: 'User could not be created due to some errors.',
    USER_NOT_FOUND: 'User not found.',
    USER_UNEXPECTED_ERROR:
      'An unexpected error occurred while creating the user.',
    USER_EMAIL_ALREADY_EXIST: 'User with this email already exists',
    USERNAME_ALREADY_EXIST: 'Username already taken',
    EMAIL_OR_PASSWORD_REQUIRED: 'Email and password are required',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_INVALID_CREDS: 'Invalid credentials',
  },
  SuccessMessages: {
    USER_CREATION_SUCCESS: 'User successfully registered',
  },
};

export const GAME = {
  ErrorMessages: {
    PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
    GAME_NOT_FOUND: 'GAME_NOT_FOUND',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    GAME_ALREADY_FINISHED: 'GAME_ALREADY_FINISHED',
    YOU_ARE_HOST: 'You are already a host of this game, you cannot join',
    NOT_YOUR_TURN: 'This is not your turn',
    NOT_VALID_MOVE: 'This is not valid move',
  },
};
