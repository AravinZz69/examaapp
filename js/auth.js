/* ============================================
   ExamVault — Authentication & Session Manager
   Handles login, registration, role checks,
   and secure session persistence.
   ============================================ */

const Auth = {
    SESSION_KEY: 'ev_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    // Get current logged-in user
    getCurrentUser() {
        try {
            const raw = sessionStorage.getItem(this.SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            // Check expiration
            if (Date.now() - session.timestamp > this.SESSION_DURATION) {
                this.logout();
                return null;
            }
            return session.user;
        } catch { return null; }
    },

    // Check if logged in
    isLoggedIn() { return this.getCurrentUser() !== null; },

    // Check role
    isTeacher() { const u = this.getCurrentUser(); return u && u.role === 'teacher'; },
    isStudent() { const u = this.getCurrentUser(); return u && u.role === 'student'; },

    // Login
    login(email, password) {
        const user = DB.users.find({ email, password })[0];
        if (!user) return { success: false, message: 'Invalid email or password.' };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
            user: { id:user.id, name:user.name, email:user.email, role:user.role },
            timestamp: Date.now()
        }));
        return { success: true, user: { id:user.id, name:user.name, email:user.email, role:user.role } };
    },

    // Register
    register(name, email, password, role) {
        // Check if email exists
        if (DB.users.find({ email }).length > 0) {
            return { success: false, message: 'An account with this email already exists.' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters.' };
        }
        const user = DB.users.insertOne({ name, email, password, role });
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
            user: { id:user.id, name:user.name, email:user.email, role:user.role },
            timestamp: Date.now()
        }));
        return { success: true, user: { id:user.id, name:user.name, email:user.email, role:user.role } };
    },

    // Logout
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
    },

    // Require authentication — redirect if not logged in
    requireAuth() {
        if (!this.isLoggedIn()) {
            App.navigate('login');
            return false;
        }
        return true;
    },

    // Require specific role
    requireRole(role) {
        if (!this.isLoggedIn()) { App.navigate('login'); return false; }
        const user = this.getCurrentUser();
        if (user.role !== role) {
            App.navigate('dashboard');
            return false;
        }
        return true;
    }
};0