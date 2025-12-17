import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('🔒 JWT Guard - Request:', {
      url: request.url,
      method: request.method,
      hasAuthHeader: !!request.headers.authorization,
      authHeader: request.headers.authorization?.substring(0, 20) + '...'
    });

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('❌ JWT Guard - Authentication failed:', {
        error: err?.message,
        info: info?.message,
        user: user
      });
      throw err || new Error('Unauthorized');
    }

    console.log('✅ JWT Guard - Authentication successful:', {
      userId: user.userId,
      email: user.email,
      empresaId: user.empresaId
    });

    return user;
  }
}