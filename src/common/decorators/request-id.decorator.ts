import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_ID_KEY } from '../interceptors/request-id.interceptor';

export const RequestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request[REQUEST_ID_KEY];
  },
);
