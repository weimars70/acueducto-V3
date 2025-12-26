import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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

      // Detectar si el token expiró
      const message = info?.message === 'jwt expired'
        ? 'Sesión expirada. Por favor inicie sesión nuevamente.'
        : info?.message === 'No auth token'
        ? 'Token de autenticación no proporcionado.'
        : 'No autorizado.';

      throw new UnauthorizedException(message);
    }

    console.log('✅ JWT Guard - Authentication successful:', {
      userId: user.userId,
      email: user.email,
      empresaId: user.empresaId
    });

    return user;
  }
}