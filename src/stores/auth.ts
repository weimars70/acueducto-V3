import { defineStore } from 'pinia';
import { authService } from '../services/api/auth.service';
import type { LoginCredentials, User } from '../types/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentEmpresa: (state) => state.user?.empresa || null,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      console.log('Login request:', { email: credentials.email, empresaId: credentials.empresaId });

      try {
        const response = await authService.login(credentials);
        const { access_token, user } = response;

        if (access_token && user) {
          this.setSession(access_token, user);
          console.log('Session established:', { user: user.name, empresa: user.empresa?.nombre });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Session saved to localStorage:', {
        userId: user.id,
        email: user.email,
        empresaId: user.empresaId,
        empresa: user.empresa?.nombre
      });
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      console.log('Session cleared');
    },

    initializeAuth() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setSession(token, user);
          console.log('Session restored from localStorage:', {
            userId: user.id,
            empresaId: user.empresaId,
            empresa: user.empresa?.nombre
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
          this.logout();
        }
      } else {
        this.logout();
      }
    }
  }
});
