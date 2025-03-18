import { Request } from 'express';
import { User } from '../user/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}
