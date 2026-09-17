// Authentication and Session Security Service for KROMA Coffee POS

export interface AdminUser {
  id: string;
  name: string;
  role: 'barista' | 'manager' | 'owner';
  shift: string;
}

interface AuthSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

const SESSION_KEY = 'kroma_admin_session';
const ATTEMPTS_KEY = 'kroma_login_attempts';
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

// Valid Credentials
const VALID_PINS: Record<string, AdminUser> = {
  '8888': { id: 'usr-1', name: 'Barista Shift A', role: 'barista', shift: 'Pagi - Siang' },
  '1234': { id: 'usr-2', name: 'Barista Shift B', role: 'barista', shift: 'Sore - Malam' },
  '9999': { id: 'usr-3', name: 'Head Barista / Manager', role: 'manager', shift: 'Full Shift' },
};

const VALID_CREDENTIALS = [
  {
    email: 'admin@brewbean.coffee',
    password: 'brewbean2026',
    user: { id: 'usr-admin', name: 'Store Owner', role: 'owner' as const, shift: 'All Shifts' },
  },
  {
    email: 'barista@brewbean.coffee',
    password: 'brewbean2026',
    user: { id: 'usr-barista', name: 'Barista Kasir', role: 'barista' as const, shift: 'Shift Aktif' },
  },
  {
    email: 'admin@kroma.coffee',
    password: 'kroma2026',
    user: { id: 'usr-admin', name: 'Store Owner', role: 'owner' as const, shift: 'All Shifts' },
  },
  {
    email: 'barista@kroma.coffee',
    password: 'kroma2026',
    user: { id: 'usr-barista', name: 'Barista Kasir', role: 'barista' as const, shift: 'Shift Aktif' },
  },
];

class AuthService {
  public isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    try {
      const session: AuthSession = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  public getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      const session: AuthSession = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session.user;
    } catch {
      return null;
    }
  }

  public getLockoutRemainingSeconds(): number {
    if (typeof window === 'undefined') return 0;
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return 0;

    try {
      const data = JSON.parse(raw);
      if (data.attempts >= MAX_ATTEMPTS && data.lockedUntil) {
        const diff = data.lockedUntil - Date.now();
        return diff > 0 ? Math.ceil(diff / 1000) : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private recordFailedAttempt(): { remainingAttempts: number; isLocked: boolean; lockoutSeconds: number } {
    if (typeof window === 'undefined') return { remainingAttempts: 5, isLocked: false, lockoutSeconds: 0 };
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    let attempts = 0;
    let lockedUntil: number | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        attempts = parsed.attempts || 0;
      } catch {}
    }

    attempts += 1;
    if (attempts >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ attempts, lockedUntil }));

    return {
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
      isLocked: attempts >= MAX_ATTEMPTS,
      lockoutSeconds: attempts >= MAX_ATTEMPTS ? 30 : 0,
    };
  }

  private resetFailedAttempts(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ATTEMPTS_KEY);
    }
  }

  public loginWithPin(pin: string): { success: boolean; error?: string; user?: AdminUser } {
    const lockRemaining = this.getLockoutRemainingSeconds();
    if (lockRemaining > 0) {
      return {
        success: false,
        error: `Akses terkunci karena terlalu banyak percobaan salah. Silakan coba lagi dalam ${lockRemaining} detik.`,
      };
    }

    const matchedUser = VALID_PINS[pin];
    if (matchedUser) {
      this.createSession(matchedUser);
      this.resetFailedAttempts();
      return { success: true, user: matchedUser };
    }

    const { remainingAttempts, isLocked, lockoutSeconds } = this.recordFailedAttempt();
    if (isLocked) {
      return {
        success: false,
        error: `PIN salah. Akun terkunci selama ${lockoutSeconds} detik demi keamanan.`,
      };
    }

    return {
      success: false,
      error: `PIN tidak valid. Sisa percobaan: ${remainingAttempts} kali.`,
    };
  }

  public loginWithCredentials(
    email: string,
    pass: string
  ): { success: boolean; error?: string; user?: AdminUser } {
    const lockRemaining = this.getLockoutRemainingSeconds();
    if (lockRemaining > 0) {
      return {
        success: false,
        error: `Akses terkunci. Silakan coba lagi dalam ${lockRemaining} detik.`,
      };
    }

    const found = VALID_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === pass
    );

    if (found) {
      this.createSession(found.user);
      this.resetFailedAttempts();
      return { success: true, user: found.user };
    }

    const { remainingAttempts, isLocked, lockoutSeconds } = this.recordFailedAttempt();
    if (isLocked) {
      return {
        success: false,
        error: `Kredensial salah. Sistem terkunci selama ${lockoutSeconds} detik.`,
      };
    }

    return {
      success: false,
      error: `Email atau password salah. Sisa kesempatan: ${remainingAttempts} kali.`,
    };
  }

  private createSession(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    const session: AuthSession = {
      token: 'kroma_token_' + Math.random().toString(36).substring(2) + Date.now(),
      user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours shift validity
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  public logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }
}

export const authService = new AuthService();
