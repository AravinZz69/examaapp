/* ============================================
   ExamVault — Main Application Controller
   Handles routing, rendering all views,
   exam taking engine, and UI interactions.
   ============================================ */

const App = {
    currentView: 'login',
    examTimer: null,
    examStartTime: null,

    // Initialize the application
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    // Simple hash-based routing
    navigate(view) {
        window.location.hash = '#' + view;
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'login';
        const publicRoutes = ['login', 'register'];
        const user = Auth.getCurrentUser();

        // Redirect authenticated users away from auth pages
        if (user && publicRoutes.includes(hash)) {
            this.navigate('dashboard');
            return;
        }
        // Redirect unauthenticated users to login
        if (!user && !publicRoutes.includes(hash)) {
            this.navigate('login');
            return;
        }

        this.currentView = hash;
        this.clearExamTimer();
        this.render();
    },

    clearExamTimer() {
        if (this.examTimer) { clearInterval(this.examTimer); this.examTimer = null; }
    },

    // Main render dispatcher
    render() {
        const app = document.getElementById('app');
        switch(this.currentView) {
            case 'login': app.innerHTML = this.loginView(); break;
            case 'register': app.innerHTML = this.registerView(); break;
            case 'dashboard': app.innerHTML = this.dashboardView(); break;
            case 'create-exam': app.innerHTML = this.createExamView(); break;
            case 'edit-exam': app.innerHTML = this.editExamView(); break;
            case 'exam-results': app.innerHTML = this.examResultsView(); break;
            case 'take-exam': app.innerHTML = this.takeExamView(); break;
            case 'my-results': app.innerHTML = this.myResultsView(); break;
            case 'review': app.innerHTML = this.reviewView(); break;
            default: app.innerHTML = this.dashboardView();
        }
        this.bindEvents();
    },

    /* ============ UTILITY HELPERS ============ */
    toast(message, type='success') {
        const c = document.getElementById('toast-container');
        const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle' };
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    showModal(content) {
        const root = document.getElementById('modal-root');
        root.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal-content fade-in">${content}</div></div>`;
        document.getElementById('modal-overlay').addEventListener('click', e => {
            if (e.target.id === 'modal-overlay') this.closeModal();
        });
    },

    closeModal() {
        document.getElementById('modal-root').innerHTML = '';
    },

    formatDate(iso) {
        if (!iso) return 'N/A';
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) + ' ' +
               d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    },

    formatDuration(seconds) {
        const m = Math.floor(seconds/60), s = seconds%60;
        return `${m}:${s.toString().padStart(2,'0')}`;
    },

    getExamStatus(exam) {
        const now = Date.now();
        if (exam.status === 'draft') return { label:'Draft', color:'text-surface-400', bg:'bg-surface-800' };
        const start = new Date(exam.startDate).getTime();
        const end = new Date(exam.endDate).getTime();
        if (now < start) return { label:'Upcoming', color:'text-amber-400', bg:'bg-amber-400/10' };
        if (now > end) return { label:'Expired', color:'text-red-400', bg:'bg-red-400/10' };
        return { label:'Active', color:'text-brand-400', bg:'bg-brand-400/10' };
    },

    /* ============ NAVBAR ============ */
    navbar() {
        const user = Auth.getCurrentUser();
        if (!user) return '';
        const roleLabel = user.role === 'teacher' ? 'Teacher' : 'Student';
        const roleIcon = user.role === 'teacher' ? 'fa-chalkboard-teacher' : 'fa-user-graduate';
        return `
        <nav class="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center gap-3 cursor-pointer" onclick="App.navigate('dashboard')">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                            <i class="fas fa-shield-halved text-white text-sm"></i>
                        </div>
                        <span class="font-display font-bold text-lg">ExamVault</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50">
                            <i class="fas ${roleIcon} text-brand-400 text-xs"></i>
                            <span class="text-xs text-surface-400">${roleLabel}</span>
                        </div>
                        <div class="flex items-center gap-3 pl-4 border-l border-surface-800">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <span class="text-sm font-medium hidden sm:block">${user.name}</span>
                        </div>
                        <button onclick="Auth.logout(); App.navigate('login'); App.toast('Logged out successfully','info');" class="btn-secondary !py-1.5 !px-3 !text-xs">
                            <i class="fas fa-sign-out-alt mr-1"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>`;
    },

    /* ============ LOGIN VIEW ============ */
    loginView() {
        return `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-md fade-in">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4 shadow-lg shadow-brand-500/20">
                        <i class="fas fa-shield-halved text-white text-2xl"></i>
                    </div>
                    <h1 class="font-display text-3xl font-bold mb-2">Welcome Back</h1>
                    <p class="text-surface-400">Sign in to your ExamVault account</p>
                </div>
                <div class="card !p-8">
                    <form id="login-form" class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Email Address</label>
                            <input type="email" id="login-email" class="input-field" placeholder="you@example.com" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Password</label>
                            <input type="password" id="login-password" class="input-field" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn-primary w-full !py-3 text-base">Sign In</button>
                    </form>
                </div>
                <div class="mt-6 text-center">
                    <p class="text-surface-400 text-sm">Don't have an account?
                        <a href="#register" class="text-brand-400 hover:text-brand-300 font-medium ml-1">Create one</a>
                    </p>
                </div>
                <div class="mt-8 card !p-5">
                    <p class="text-xs text-surface-500 mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div class="bg-surface-950 rounded-lg p-3 cursor-pointer hover:border-brand-500/30 border border-transparent transition-colors" onclick="document.getElementById('login-email').value='teacher@examvault.com';document.getElementById('login-password').value='teacher123';">
                            <p class="text-surface-400 mb-1">Teacher</p>
                            <p class="text-surface-300 font-mono">teacher@examvault.com</p>
                            <p class="text-surface-500 font-mono">teacher123</p>
                        </div>
                        <div class="bg-surface-950 rounded-lg p-3 cursor-pointer hover:border-brand-500/30 border border-transparent transition-colors" onclick="document.getElementById('login-email').value='alex@student.com';document.getElementById('login-password').value='student123';">
                            <p class="text-surface-400 mb-1">Student</p>
                            <p class="text-surface-300 font-mono">alex@student.com</p>
                            <p class="text-surface-500 font-mono">student123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    /* ============ REGISTER VIEW ============ */
    registerView() {
        return `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-md fade-in">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4 shadow-lg shadow-brand-500/20">
                        <i class="fas fa-user-plus text-white text-2xl"></i>
                    </div>
                    <h1 class="font-display text-3xl font-bold mb-2">Create Account</h1>
                    <p class="text-surface-400">Join ExamVault as a student or teacher</p>
                </div>
                <div class="card !p-8">
                    <form id="register-form" class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Full Name</label>
                            <input type="text" id="reg-name" class="input-field" placeholder="John Doe" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Email Address</label>
                            <input type="email" id="reg-email" class="input-field" placeholder="you@example.com" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Password</label>
                            <input type="password" id="reg-password" class="input-field" placeholder="Minimum 6 characters" required minlength="6">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2 text-surface-300">Role</label>
                            <select id="reg-role" class="input-field">
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary w-full !py-3 text-base">Create Account</button>
                    </form>
                </div>
                <div class="mt-6 text-center">
                    <p class="text-surface-400 text-sm">Already have an account?
                        <a href="#login" class="text-brand-400 hover:text-brand-300 font-medium ml-1">Sign in</a>
                    </p>
                </div>
            </div>
        </div>`;
    },

    /* ============ DASHBOARD VIEW ============ */
    dashboardView() {
        const user = Auth.getCurrentUser();
        if (user.role === 'teacher') return this.teacherDashboard();
        return this.studentDashboard();
    },

    teacherDashboard() {
        const user = Auth.getCurrentUser();
        const exams = DB.exams.find({ teacherId: user.id });
        const allResults = DB.results.find({});
        const activeExams = exams.filter(e => this.getExamStatus(e).label === 'Active');
        const totalSubmissions = allResults.length;
        const avgScore = totalSubmissions > 0 ? Math.round(allResults.reduce((s,r) => s + (r.score/r.total*100), 0) / totalSubmissions) : 0;

        let examsList = exams.map(e => {
            const st = this.getExamStatus(e);
            const res = allResults.filter(r => r.examId === e.id);
            const avg = res.length > 0 ? Math.round(res.reduce((s,r) => s + (r.score/r.total*100), 0) / res.length) : 0;
            return `
            <tr class="border-t border-surface-800 hover:bg-surface-800/30 transition-colors">
                <td class="py-4 pr-4">
                    <div class="font-medium text-sm">${e.title}</div>
                    <div class="text-xs text-surface-500 mt-0.5">${e.questionCount} questions &middot; ${e.duration} min</div>
                </td>
                <td class="py-4 pr-4"><span class="px-2.5 py-1 rounded-md text-xs font-medium ${st.color} ${st.bg}">${st.label}</span></td>
                <td class="py-4 pr-4 text-sm text-surface-400">${res.length}</td>
                <td class="py-4 pr-4 text-sm text-surface-400">${res.length > 0 ? avg + '%' : '—'}</td>
                <td class="py-4">
                    <div class="flex items-center gap-2">
                        <button onclick="App.viewExamResults('${e.id}')" class="text-xs text-brand-400 hover:text-brand-300 font-medium" title="View Results"><i class="fas fa-chart-bar mr-1"></i>Results</button>
                        <button onclick="App.navigate('edit-exam?${e.id}')" class="text-xs text-surface-400 hover:text-surface-300 font-medium" title="Edit"><i class="fas fa-pen"></i></button>
                        <button onclick="App.deleteExam('${e.id}')" class="text-xs text-red-400 hover:text-red-300 font-medium" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        return `
        ${this.navbar()}
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 class="font-display text-2xl font-bold">Teacher Dashboard</h1>
                    <p class="text-surface-400 text-sm mt-1">Manage your examinations and monitor student performance</p>
                </div>
                <button onclick="App.navigate('create-exam')" class="btn-primary"><i class="fas fa-plus mr-2"></i>Create Exam</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center"><i class="fas fa-file-alt text-brand-400"></i></div><div><p class="text-2xl font-bold font-display">${exams.length}</p><p class="text-xs text-surface-500">Total Exams</p></div></div></div>
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><i class="fas fa-play-circle text-emerald-400"></i></div><div><p class="text-2xl font-bold font-display">${activeExams.length}</p><p class="text-xs text-surface-500">Active Now</p></div></div></div>
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><i class="fas fa-users text-cyan-400"></i></div><div><p class="text-2xl font-bold font-display">${totalSubmissions}</p><p class="text-xs text-surface-500">Submissions</p></div></div></div>
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><i class="fas fa-trophy text-amber-400"></i></div><div><p class="text-2xl font-bold font-display">${avgScore}%</p><p class="text-xs text-surface-500">Avg. Score</p></div></div></div>
            </div>
            <div class="card !p-0 overflow-hidden">
                <div class="px-6 py-4 border-b border-surface-800"><h2 class="font-display font-semibold">All Examinations</h2></div>
                ${exams.length === 0 ? '<div class="p-12 text-center text-surface-500"><i class="fas fa-inbox text-3xl mb-3 block"></i>No exams created yet. Click "Create Exam" to get started.</div>' : `
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr class="text-xs text-surface-500 uppercase tracking-wider border-b border-surface-800">
                            <th class="px-6 py-3 font-medium">Exam</th><th class="px-4 py-3 font-medium">Status</th><th class="px-4 py-3 font-medium">Submissions</th><th class="px-4 py-3 font-medium">Avg Score</th><th class="px-4 py-3 font-medium">Actions</th>
                        </tr></thead>
                        <tbody class="px-6">${examsList}</tbody>
                    </table>
                </div>`}
            </div>
        </main>`;
    },

    studentDashboard() {
        const user = Auth.getCurrentUser();
        const exams = DB.exams.find({ status:'active' });
        const myResults = DB.results.find({ studentId: user.id });
        const takenIds = new Set(myResults.map(r => r.examId));
        const avgScore = myResults.length > 0 ? Math.round(myResults.reduce((s,r) => s + (r.score/r.total*100), 0) / myResults.length) : 0;

        // Separate available and completed
        const available = exams.filter(e => {
            const st = this.getExamStatus(e);
            return st.label === 'Active' && !takenIds.has(e.id);
        });
        const completed = exams.filter(e => takenIds.has(e.id)).map(e => {
            const res = myResults.find(r => r.examId === e.id);
            return { ...e, result: res };
        });

        let availableCards = available.map(e => {
            const end = new Date(e.endDate).getTime();
            const remaining = Math.max(0, Math.ceil((end - Date.now()) / 60000));
            return `
            <div class="card !p-5">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="font-display font-semibold text-sm">${e.title}</h3>
                    <span class="px-2 py-0.5 rounded text-xs bg-brand-400/10 text-brand-400 font-medium">Active</span>
                </div>
                <p class="text-xs text-surface-500 mb-4 line-clamp-2">${e.description}</p>
                <div class="flex items-center gap-4 text-xs text-surface-400 mb-4">
                    <span><i class="fas fa-clock mr-1"></i>${e.duration} min</span>
                    <span><i class="fas fa-list-ol mr-1"></i>${e.questionCount} questions</span>
                    <span><i class="fas fa-hourglass-half mr-1"></i>${remaining}m left</span>
                </div>
                <button onclick="App.startExam('${e.id}')" class="btn-primary w-full !text-sm">Start Exam</button>
            </div>`;
        }).join('') || '<div class="col-span-full text-center py-12 text-surface-500"><i class="fas fa-check-circle text-3xl mb-3 block"></i>No available exams right now. Check back later.</div>';

        let completedCards = completed.map(e => {
            const pct = Math.round(e.result.score / e.result.total * 100);
            const color = pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
            return `
            <div class="card !p-5">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="font-display font-semibold text-sm">${e.title}</h3>
                    <span class="text-lg font-bold font-display ${color}">${pct}%</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-surface-400 mb-4">
                    <span><i class="fas fa-check mr-1"></i>${e.result.score}/${e.result.total}</span>
                    <span><i class="fas fa-clock mr-1"></i>${this.formatDuration(e.result.timeTaken)}</span>
                    <span><i class="fas fa-calendar mr-1"></i>${this.formatDate(e.result.submittedAt)}</span>
                </div>
                <button onclick="App.reviewResult('${e.result.id}')" class="btn-secondary w-full !text-sm">Review Answers</button>
            </div>`;
        }).join('') || '';

        return `
        ${this.navbar()}
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <div class="mb-8">
                <h1 class="font-display text-2xl font-bold">Student Dashboard</h1>
                <p class="text-surface-400 text-sm mt-1">View available exams and track your performance</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center"><i class="fas fa-play text-brand-400"></i></div><div><p class="text-2xl font-bold font-display">${available.length}</p><p class="text-xs text-surface-500">Available</p></div></div></div>
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><i class="fas fa-check-double text-cyan-400"></i></div><div><p class="text-2xl font-bold font-display">${completed.length}</p><p class="text-xs text-surface-500">Completed</p></div></div></div>
                <div class="stat-card"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><i class="fas fa-trophy text-amber-400"></i></div><div><p class="text-2xl font-bold font-display">${avgScore}%</p><p class="text-xs text-surface-500">Avg. Score</p></div></div></div>
            </div>
            <h2 class="font-display font-semibold text-lg mb-4">Available Exams</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">${availableCards}</div>
            ${completed.length > 0 ? `<h2 class="font-display font-semibold text-lg mb-4">Completed Exams</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${completedCards}</div>` : ''}
        </main>`;
    },

    /* ============ CREATE EXAM VIEW ============ */
    createExamView() {
        if (!Auth.requireRole('teacher')) return '';
        return `
        ${this.navbar()}
        <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <button onclick="App.navigate('dashboard')" class="text-sm text-surface-400 hover:text-surface-300 mb-6 inline-flex items-center gap-2"><i class="fas fa-arrow-left"></i>Back to Dashboard</button>
            <h1 class="font-display text-2xl font-bold mb-2">Create New Exam</h1>
            <p class="text-surface-400 text-sm mb-8">Fill in the exam details and add multiple-choice questions</p>
            <form id="exam-form" class="space-y-6">
                <div class="card !p-6 space-y-4">
                    <h2 class="font-display font-semibold text-base">Exam Details</h2>
                    <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Title</label><input type="text" id="exam-title" class="input-field" placeholder="e.g., Midterm Web Development" required></div>
                    <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Description</label><textarea id="exam-desc" class="input-field" rows="2" placeholder="Brief description of the exam" required></textarea></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Duration (minutes)</label><input type="number" id="exam-duration" class="input-field" min="5" max="180" value="30" required></div>
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Status</label><select id="exam-status" class="input-field"><option value="active">Active</option><option value="draft">Draft</option></select></div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Start Date & Time</label><input type="datetime-local" id="exam-start" class="input-field" required></div>
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">End Date & Time</label><input type="datetime-local" id="exam-end" class="input-field" required></div>
                    </div>
                </div>
                <div class="card !p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-display font-semibold text-base">Questions</h2>
                        <button type="button" onclick="App.addQuestionRow()" class="btn-primary !text-xs !py-2"><i class="fas fa-plus mr-1"></i>Add Question</button>
                    </div>
                    <div id="questions-container" class="space-y-6"></div>
                    <div id="no-questions" class="py-8 text-center text-surface-500 text-sm">
                        <i class="fas fa-layer-group text-2xl mb-2 block"></i>No questions added yet. Click "Add Question" to begin.
                    </div>
                </div>
                <div class="flex gap-3 justify-end">
                    <button type="button" onclick="App.navigate('dashboard')" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary !px-8">Create Exam</button>
                </div>
            </form>
        </main>`;
    },

    addQuestionRow() {
        const container = document.getElementById('questions-container');
        const noQ = document.getElementById('no-questions');
        if (noQ) noQ.remove();
        const idx = container.children.length;
        const qDiv = document.createElement('div');
        qDiv.className = 'border border-surface-800 rounded-lg p-4 space-y-3 relative';
        qDiv.dataset.qidx = idx;
        qDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-brand-400">Question ${idx+1}</span>
                <button type="button" onclick="this.closest('[data-qidx]').remove(); App.renumberQuestions();" class="text-xs text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
            </div>
            <input type="text" class="input-field question-text" placeholder="Enter question text" required>
            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2"><input type="radio" name="correct_${idx}" value="0" class="option-radio" checked><input type="text" class="input-field !text-sm option-text" placeholder="Option A" required></div>
                <div class="flex items-center gap-2"><input type="radio" name="correct_${idx}" value="1" class="option-radio"><input type="text" class="input-field !text-sm option-text" placeholder="Option B" required></div>
                <div class="flex items-center gap-2"><input type="radio" name="correct_${idx}" value="2" class="option-radio"><input type="text" class="input-field !text-sm option-text" placeholder="Option C" required></div>
                <div class="flex items-center gap-2"><input type="radio" name="correct_${idx}" value="3" class="option-radio"><input type="text" class="input-field !text-sm option-text" placeholder="Option D" required></div>
            </div>
            <p class="text-xs text-surface-500"><i class="fas fa-info-circle mr-1"></i>Select the radio button next to the correct answer</p>`;
        container.appendChild(qDiv);
    },

    renumberQuestions() {
        document.querySelectorAll('#questions-container > div').forEach((div, i) => {
            div.dataset.qidx = i;
            div.querySelector('span').textContent = `Question ${i+1}`;
        });
    },

    /* ============ EDIT EXAM VIEW ============ */
    editExamView() {
        if (!Auth.requireRole('teacher')) return '';
        const examId = this.currentView.split('?')[1];
        const exam = DB.exams.findById(examId);
        if (!exam) { this.navigate('dashboard'); return ''; }

        const startLocal = new Date(exam.startDate);
        const endLocal = new Date(exam.endDate);
        const toLocal = d => d.toISOString().slice(0,16);

        let questionsHTML = exam.questions.map((q, i) => `
            <div class="border border-surface-800 rounded-lg p-4 space-y-3 relative" data-qidx="${i}">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-brand-400">Question ${i+1}</span>
                    <button type="button" onclick="this.closest('[data-qidx]').remove(); App.renumberQuestions();" class="text-xs text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
                </div>
                <input type="text" class="input-field question-text" value="${this.escapeHtml(q.text)}" required>
                <div class="grid grid-cols-2 gap-2">
                    ${q.options.map((opt, oi) => `
                    <div class="flex items-center gap-2"><input type="radio" name="correct_${i}" value="${oi}" class="option-radio" ${oi===q.correctIndex?'checked':''}><input type="text" class="input-field !text-sm option-text" value="${this.escapeHtml(opt)}" required></div>`).join('')}
                </div>
            </div>`).join('');

        return `
        ${this.navbar()}
        <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <button onclick="App.navigate('dashboard')" class="text-sm text-surface-400 hover:text-surface-300 mb-6 inline-flex items-center gap-2"><i class="fas fa-arrow-left"></i>Back to Dashboard</button>
            <h1 class="font-display text-2xl font-bold mb-2">Edit Exam</h1>
            <p class="text-surface-400 text-sm mb-8">Modify exam details and questions</p>
            <form id="exam-form" data-exam-id="${exam.id}" class="space-y-6">
                <div class="card !p-6 space-y-4">
                    <h2 class="font-display font-semibold text-base">Exam Details</h2>
                    <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Title</label><input type="text" id="exam-title" class="input-field" value="${this.escapeHtml(exam.title)}" required></div>
                    <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Description</label><textarea id="exam-desc" class="input-field" rows="2" required>${this.escapeHtml(exam.description)}</textarea></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Duration (minutes)</label><input type="number" id="exam-duration" class="input-field" min="5" max="180" value="${exam.duration}" required></div>
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Status</label><select id="exam-status" class="input-field"><option value="active" ${exam.status==='active'?'selected':''}>Active</option><option value="draft" ${exam.status==='draft'?'selected':''}>Draft</option></select></div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">Start Date & Time</label><input type="datetime-local" id="exam-start" class="input-field" value="${toLocal(startLocal)}" required></div>
                        <div><label class="block text-sm font-medium mb-1.5 text-surface-300">End Date & Time</label><input type="datetime-local" id="exam-end" class="input-field" value="${toLocal(endLocal)}" required></div>
                    </div>
                </div>
                <div class="card !p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-display font-semibold text-base">Questions</h2>
                        <button type="button" onclick="App.addQuestionRow()" class="btn-primary !text-xs !py-2"><i class="fas fa-plus mr-1"></i>Add Question</button>
                    </div>
                    <div id="questions-container" class="space-y-6">${questionsHTML}</div>
                </div>
                <div class="flex gap-3 justify-end">
                    <button type="button" onclick="App.navigate('dashboard')" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary !px-8">Save Changes</button>
                </div>
            </form>
        </main>`;
    },

    /* ============ EXAM RESULTS VIEW (Teacher) ============ */
    viewExamResults(examId) {
        this.navigate('exam-results?' + examId);
    },

    examResultsView() {
        if (!Auth.requireRole('teacher')) return '';
        const examId = this.currentView.split('?')[1];
        const exam = DB.exams.findById(examId);
        if (!exam) { this.navigate('dashboard'); return ''; }
        const results = DB.results.find({ examId });
        const avgScore = results.length > 0 ? Math.round(results.reduce((s,r) => s + (r.score/r.total*100), 0) / results.length) : 0;
        const highScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
        const avgTime = results.length > 0 ? this.formatDuration(Math.round(results.reduce((s,r) => s + r.timeTaken, 0) / results.length)) : '—';

        let rows = results.map(r => {
            const student = DB.users.findById(r.studentId);
            const pct = Math.round(r.score / r.total * 100);
            const color = pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
            return `
            <tr class="border-t border-surface-800 hover:bg-surface-800/30 transition-colors">
                <td class="py-3 pr-4 text-sm">${student ? student.name : 'Unknown'}</td>
                <td class="py-3 pr-4 text-sm ${color} font-bold">${pct}%</td>
                <td class="py-3 pr-4 text-sm">${r.score}/${r.total}</td>
                <td class="py-3 pr-4 text-sm text-surface-400">${this.formatDuration(r.timeTaken)}</td>
                <td class="py-3 text-sm text-surface-400">${this.formatDate(r.submittedAt)}</td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" class="py-12 text-center text-surface-500">No submissions yet</td></tr>';

        return `
        ${this.navbar()}
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <button onclick="App.navigate('dashboard')" class="text-sm text-surface-400 hover:text-surface-300 mb-6 inline-flex items-center gap-2"><i class="fas fa-arrow-left"></i>Back to Dashboard</button>
            <h1 class="font-display text-2xl font-bold mb-1">${this.escapeHtml(exam.title)}</h1>
            <p class="text-surface-400 text-sm mb-6">${this.escapeHtml(exam.description)}</p>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="stat-card text-center"><p class="text-2xl font-bold font-display">${results.length}</p><p class="text-xs text-surface-500">Submissions</p></div>
                <div class="stat-card text-center"><p class="text-2xl font-bold font-display text-brand-400">${avgScore}%</p><p class="text-xs text-surface-500">Average Score</p></div>
                <div class="stat-card text-center"><p class="text-2xl font-bold font-display text-amber-400">${highScore}/${exam.questionCount}</p><p class="text-xs text-surface-500">Highest Score</p></div>
                <div class="stat-card text-center"><p class="text-2xl font-bold font-display">${avgTime}</p><p class="text-xs text-surface-500">Avg. Time</p></div>
            </div>
            <div class="card !p-0 overflow-hidden">
                <div class="px-6 py-4 border-b border-surface-800"><h2 class="font-display font-semibold">Student Results</h2></div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr class="text-xs text-surface-500 uppercase tracking-wider border-b border-surface-800">
                            <th class="px-6 py-3 font-medium">Student</th><th class="px-4 py-3 font-medium">Score</th><th class="px-4 py-3 font-medium">Correct</th><th class="px-4 py-3 font-medium">Time Taken</th><th class="px-4 py-3 font-medium">Submitted</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        </main>`;
    },

    /* ============ TAKE EXAM VIEW ============ */
    startExam(examId) {
        const user = Auth.getCurrentUser();
        const exam = DB.exams.findById(examId);
        if (!exam) { this.toast('Exam not found','error'); return; }
        const st = this.getExamStatus(exam);
        if (st.label !== 'Active') { this.toast('This exam is not currently active','error'); return; }
        const existing = DB.results.findOne({ studentId:user.id, examId });
        if (existing) { this.toast('You have already taken this exam','error'); return; }
        // Create session
        DB.sessions.set(examId, user.id, {
            examId, studentId: user.id,
            currentQ: 0,
            answers: new Array(exam.questions.length).fill(-1),
            startTime: Date.now()
        });
        this.navigate('take-exam?' + examId);
    },

    takeExamView() {
        if (!Auth.requireRole('student')) return '';
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const exam = DB.exams.findById(examId);
        const session = DB.sessions.get(examId, user.id);
        if (!exam || !session) { this.navigate('dashboard'); this.toast('Exam session not found','error'); return ''; }

        const qIdx = session.currentQ;
        const question = exam.questions[qIdx];
        if (!question) { this.navigate('dashboard'); return ''; }
        const total = exam.questions.length;
        const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
        const remaining = Math.max(0, exam.duration * 60 - elapsed);
        const progress = ((qIdx + 1) / total * 100).toFixed(0);
        const isLast = qIdx === total - 1;
        const selectedAnswer = session.answers[qIdx];

        const optionsHTML = question.options.map((opt, i) => `
            <label class="option-label">
                <input type="radio" name="exam-answer" value="${i}" class="option-radio" ${selectedAnswer === i ? 'checked' : ''} onchange="App.selectAnswer(${i})">
                <span class="option-label-text text-sm"><span class="text-surface-500 font-mono mr-2">${String.fromCharCode(65+i)}.</span>${this.escapeHtml(opt)}</span>
            </label>`).join('');

        const questionNav = exam.questions.map((_, i) => {
            const answered = session.answers[i] !== -1;
            const isCurrent = i === qIdx;
            return `<button onclick="App.goToQuestion(${i})" class="w-9 h-9 rounded-lg text-xs font-medium transition-all ${isCurrent ? 'bg-brand-500 text-white' : answered ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'}">${i+1}</button>`;
        }).join('');

        return `
        ${this.navbar()}
        <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 fade-in">
            <!-- Timer & progress -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div class="flex items-center gap-4">
                    <h2 class="font-display font-semibold text-sm">${this.escapeHtml(exam.title)}</h2>
                    <span class="text-xs text-surface-500">Question ${qIdx+1} of ${total}</span>
                </div>
                <div id="exam-timer" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 ${remaining < 60 ? 'border-red-500/50' : ''}">
                    <i class="fas fa-clock text-sm ${remaining < 60 ? 'text-red-400 timer-pulse' : 'text-brand-400'}"></i>
                    <span class="font-mono text-sm font-bold ${remaining < 60 ? 'text-red-400' : 'text-surface-200'}" id="timer-display">${this.formatDuration(remaining)}</span>
                </div>
            </div>
            <div class="progress-bar mb-6"><div class="progress-fill" style="width:${progress}%"></div></div>

            <!-- Question navigation -->
            <div class="flex flex-wrap gap-2 mb-6">${questionNav}</div>

            <!-- Question card -->
            <div class="card !p-6 mb-6">
                <p class="text-base font-medium mb-5 leading-relaxed">${this.escapeHtml(question.text)}</p>
                <div class="space-y-3">${optionsHTML}</div>
            </div>

            <!-- Navigation buttons -->
            <div class="flex items-center justify-between">
                <button onclick="App.prevQuestion()" class="btn-secondary ${qIdx === 0 ? 'opacity-30 pointer-events-none' : ''}" ${qIdx === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left mr-2"></i>Previous
                </button>
                ${isLast ?
                    `<button onclick="App.submitExam()" class="btn-primary !bg-gradient-to-r !from-amber-600 !to-amber-500 hover:!shadow-amber-500/30"><i class="fas fa-paper-plane mr-2"></i>Submit Exam</button>` :
                    `<button onclick="App.nextQuestion()" class="btn-primary">Next<i class="fas fa-arrow-right ml-2"></i></button>`}
            </div>
        </main>`;
    },

    selectAnswer(idx) {
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const session = DB.sessions.get(examId, user.id);
        if (session) { session.answers[session.currentQ] = idx; DB.sessions.set(examId, user.id, session); }
    },

    nextQuestion() {
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const session = DB.sessions.get(examId, user.id);
        if (session && session.currentQ < session.answers.length - 1) {
            session.currentQ++;
            DB.sessions.set(examId, user.id, session);
            this.render();
        }
    },

    prevQuestion() {
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const session = DB.sessions.get(examId, user.id);
        if (session && session.currentQ > 0) {
            session.currentQ--;
            DB.sessions.set(examId, user.id, session);
            this.render();
        }
    },

    goToQuestion(idx) {
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const session = DB.sessions.get(examId, user.id);
        if (session) { session.currentQ = idx; DB.sessions.set(examId, user.id, session); this.render(); }
    },

    submitExam() {
        const user = Auth.getCurrentUser();
        const examId = this.currentView.split('?')[1];
        const session = DB.sessions.get(examId, user.id);
        const exam = DB.exams.findById(examId);
        if (!session || !exam) return;

        const unanswered = session.answers.filter(a => a === -1).length;
        const doSubmit = () => {
            const timeTaken = Math.floor((Date.now() - session.startTime) / 1000);
            let score = 0;
            exam.questions.forEach((q, i) => { if (session.answers[i] === q.correctIndex) score++; });
            DB.results.insertOne({
                studentId: user.id, examId,
                answers: session.answers,
                score, total: exam.questions.length,
                timeTaken
            });
            DB.sessions.clear(examId, user.id);
            this.clearExamTimer();
            this.showSubmitResult(score, exam.questions.length, timeTaken);
        };

        if (unanswered > 0) {
            this.showModal(`
                <div class="text-center">
                    <div class="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4"><i class="fas fa-exclamation-triangle text-amber-400 text-xl"></i></div>
                    <h3 class="font-display font-bold text-lg mb-2">Unanswered Questions</h3>
                    <p class="text-surface-400 text-sm mb-6">You have <strong class="text-amber-400">${unanswered}</strong> unanswered question${unanswered>1?'s':''}. Unanswered questions will be marked as incorrect.</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="App.closeModal()" class="btn-secondary">Go Back</button>
                        <button onclick="App.closeModal(); App._doSubmit();" class="btn-primary">Submit Anyway</button>
                    </div>
                </div>`);
            this._doSubmit = doSubmit;
        } else {
            doSubmit();
        }
    },

    showSubmitResult(score, total, timeTaken) {
        const pct = Math.round(score / total * 100);
        const color = pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
        const bgGrad = pct >= 80 ? 'from-brand-500/20 to-emerald-500/20' : pct >= 50 ? 'from-amber-500/20 to-orange-500/20' : 'from-red-500/20 to-pink-500/20';
        const icon = pct >= 80 ? 'fa-trophy' : pct >= 50 ? 'fa-check-circle' : 'fa-times-circle';
        const msg = pct >= 80 ? 'Excellent performance!' : pct >= 50 ? 'Good effort, keep improving!' : 'Keep practicing, you will improve!';
        this.showModal(`
            <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br ${bgGrad} flex items-center justify-center mx-auto mb-5"><i class="fas ${icon} ${color} text-3xl"></i></div>
                <h3 class="font-display font-bold text-xl mb-1">Exam Submitted</h3>
                <p class="text-surface-400 text-sm mb-6">${msg}</p>
                <div class="flex items-center justify-center gap-8 mb-6">
                    <div><p class="text-3xl font-bold font-display ${color}">${pct}%</p><p class="text-xs text-surface-500 mt-1">Score</p></div>
                    <div class="w-px h-12 bg-surface-800"></div>
                    <div><p class="text-3xl font-bold font-display">${score}/${total}</p><p class="text-xs text-surface-500 mt-1">Correct</p></div>
                    <div class="w-px h-12 bg-surface-800"></div>
                    <div><p class="text-3xl font-bold font-display">${this.formatDuration(timeTaken)}</p><p class="text-xs text-surface-500 mt-1">Time</p></div>
                </div>
                <button onclick="App.closeModal(); App.navigate('dashboard');" class="btn-primary w-full">Back to Dashboard</button>
            </div>`);
    },

    /* ============ REVIEW VIEW (Student) ============ */
    reviewResult(resultId) {
        this.navigate('review?' + resultId);
    },

    reviewView() {
        if (!Auth.requireRole('student')) return '';
        const resultId = this.currentView.split('?')[1];
        const result = DB.results.find({}).find(r => r.id === resultId);
        if (!result) { this.navigate('dashboard'); return ''; }
        const exam = DB.exams.findById(result.examId);
        if (!exam) { this.navigate('dashboard'); return ''; }
        const pct = Math.round(result.score / result.total * 100);

        let questionsHTML = exam.questions.map((q, i) => {
            const studentAnswer = result.answers[i];
            const isCorrect = studentAnswer === q.correctIndex;
            return `
            <div class="border border-surface-800 rounded-lg p-5">
                <div class="flex items-start gap-3 mb-4">
                    <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isCorrect ? 'bg-brand-500/20 text-brand-400' : 'bg-red-500/20 text-red-400'}">
                        ${isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                    </span>
                    <p class="text-sm font-medium leading-relaxed">${this.escapeHtml(q.text)}</p>
                </div>
                <div class="space-y-2 ml-10">
                    ${q.options.map((opt, oi) => {
                        let cls = 'bg-surface-950 border-surface-800';
                        if (oi === q.correctIndex) cls = 'bg-brand-500/10 border-brand-500/40';
                        else if (oi === studentAnswer && !isCorrect) cls = 'bg-red-500/10 border-red-500/40';
                        return `<div class="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${cls}">
                            <span class="text-surface-500 font-mono text-xs">${String.fromCharCode(65+oi)}.</span>
                            <span class="${oi === q.correctIndex ? 'text-brand-300' : oi === studentAnswer && !isCorrect ? 'text-red-300' : 'text-surface-300'}">${this.escapeHtml(opt)}</span>
                            ${oi === q.correctIndex ? '<span class="ml-auto text-xs text-brand-400 font-medium">Correct</span>' : ''}
                            ${oi === studentAnswer && !isCorrect ? '<span class="ml-auto text-xs text-red-400 font-medium">Your answer</span>' : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }).join('');

        return `
        ${this.navbar()}
        <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <button onclick="App.navigate('dashboard')" class="text-sm text-surface-400 hover:text-surface-300 mb-6 inline-flex items-center gap-2"><i class="fas fa-arrow-left"></i>Back to Dashboard</button>
            <div class="flex items-center gap-4 mb-2">
                <h1 class="font-display text-2xl font-bold">${this.escapeHtml(exam.title)}</h1>
                <span class="text-2xl font-bold font-display ${pct >= 80 ? 'text-brand-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}">${pct}%</span>
            </div>
            <p class="text-surface-400 text-sm mb-6">Score: ${result.score}/${result.total} &middot; Time: ${this.formatDuration(result.timeTaken)} &middot; Submitted: ${this.formatDate(result.submittedAt)}</p>
            <div class="space-y-4">${questionsHTML}</div>
        </main>`;
    },

    /* ============ DELETE EXAM ============ */
    deleteExam(examId) {
        this.showModal(`
            <div class="text-center">
                <div class="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><i class="fas fa-trash-alt text-red-400 text-xl"></i></div>
                <h3 class="font-display font-bold text-lg mb-2">Delete Exam</h3>
                <p class="text-surface-400 text-sm mb-6">This will permanently delete the exam and all associated results. This action cannot be undone.</p>
                <div class="flex gap-3 justify-center">
                    <button onclick="App.closeModal()" class="btn-secondary">Cancel</button>
                    <button onclick="App._confirmDelete('${examId}')" class="btn-danger">Delete</button>
                </div>
            </div>`);
    },

    _confirmDelete(examId) {
        DB.exams.deleteById(examId);
        this.closeModal();
        this.toast('Exam deleted successfully');
        this.render();
    },

    /* ============ HTML ESCAPE ============ */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /* ============ EXAM TIMER ============ */
    startExamTimer(durationSeconds) {
        this.clearExamTimer();
        const startTime = Date.now();
        const timerEl = () => document.getElementById('timer-display');
        const timerWrap = () => document.getElementById('exam-timer');

        this.examTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, durationSeconds - elapsed);
            const el = timerEl();
            const wrap = timerWrap();
            if (el) el.textContent = this.formatDuration(remaining);
            if (wrap) {
                if (remaining < 60) {
                    wrap.classList.add('border-red-500/50');
                    wrap.classList.remove('border-surface-700');
                    if (el) { el.classList.add('text-red-400','timer-pulse'); el.classList.remove('text-surface-200'); }
                    const icon = wrap.querySelector('i');
                    if (icon) { icon.classList.add('text-red-400','timer-pulse'); icon.classList.remove('text-brand-400'); }
                }
            }
            if (remaining <= 0) {
                this.clearExamTimer();
                this.toast('Time is up! Your exam has been auto-submitted.','error');
                this.submitExam();
            }
        }, 1000);
    },

    /* ============ EVENT BINDING ============ */
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', e => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value;
                if (!email || !password) { this.toast('Please fill in all fields','error'); return; }
                const result = Auth.login(email, password);
                if (result.success) { this.toast('Welcome back, ' + result.user.name); this.navigate('dashboard'); }
                else { this.toast(result.message, 'error'); }
            });
        }

        // Register form
        const regForm = document.getElementById('register-form');
        if (regForm) {
            regForm.addEventListener('submit', e => {
                e.preventDefault();
                const name = document.getElementById('reg-name').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const password = document.getElementById('reg-password').value;
                const role = document.getElementById('reg-role').value;
                if (!name || !email || !password) { this.toast('Please fill in all fields','error'); return; }
                const result = Auth.register(name, email, password, role);
                if (result.success) { this.toast('Account created successfully! Welcome, ' + result.user.name); this.navigate('dashboard'); }
                else { this.toast(result.message, 'error'); }
            });
        }

        // Exam create/edit form
        const examForm = document.getElementById('exam-form');
        if (examForm) {
            examForm.addEventListener('submit', e => {
                e.preventDefault();
                const title = document.getElementById('exam-title').value.trim();
                const description = document.getElementById('exam-desc').value.trim();
                const duration = parseInt(document.getElementById('exam-duration').value);
                const status = document.getElementById('exam-status').value;
                const startDate = new Date(document.getElementById('exam-start').value).toISOString();
                const endDate = new Date(document.getElementById('exam-end').value).toISOString();

                if (!title || !description) { this.toast('Please fill in all required fields','error'); return; }
                if (new Date(endDate) <= new Date(startDate)) { this.toast('End date must be after start date','error'); return; }

                // Collect questions
                const qDivs = document.querySelectorAll('#questions-container > div');
                if (qDivs.length === 0) { this.toast('Add at least one question','error'); return; }

                const questions = [];
                let valid = true;
                qDivs.forEach((div, i) => {
                    const text = div.querySelector('.question-text').value.trim();
                    const opts = div.querySelectorAll('.option-text');
                    const correct = div.querySelector(`input[name="correct_${div.dataset.qidx}"]:checked`);
                    if (!text) { valid = false; return; }
                    const options = [];
                    opts.forEach(o => {
                        const v = o.value.trim();
                        if (!v) valid = false;
                        options.push(v);
                    });
                    if (!valid) return;
                    questions.push({
                        id: 'q_' + Date.now() + '_' + i,
                        text,
                        options,
                        correctIndex: parseInt(correct.value)
                    });
                });

                if (!valid || questions.length === 0) { this.toast('Please complete all questions and options','error'); return; }

                const user = Auth.getCurrentUser();
                const editId = examForm.dataset.examId;

                if (editId) {
                    DB.exams.updateById(editId, { title, description, duration, status, startDate, endDate, questions });
                    this.toast('Exam updated successfully');
                } else {
                    DB.exams.insertOne({ teacherId:user.id, title, description, duration, status, startDate, endDate, questions });
                    this.toast('Exam created successfully');
                }
                this.navigate('dashboard');
            });
        }

        // Start exam timer
        if (this.currentView === 'take-exam') {
            const examId = this.currentView.split('?')[1];
            const user = Auth.getCurrentUser();
            const session = DB.sessions.get(examId, user.id);
            const exam = DB.exams.findById(examId);
            if (session && exam) {
                this.startExamTimer(exam.duration * 60);
            }
        }
    }
};

// Boot the application
document.addEventListener('DOMContentLoaded', () => App.init());