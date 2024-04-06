import { INestApplication } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { UsersService } from '@src/core/users/users.service';

export const createUser = (app: INestApplication) => async (email: string, password: string) => {
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  const user = await usersService.createUser({
    email,
    password,
    confirmed: true,
  });

  const getAuthToken = async () => {
    const { access_token } = await authService.login(user);
    return access_token;
  };

  return {
    user,
    password,
    getAuthToken,
  };
};
