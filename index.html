<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExamVault — Online Examination System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d',950:'#052e16' },
                        surface: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg:#020617; --fg:#f1f5f9; --muted:#64748b; --accent:#22c55e; --card:#0f172a; --border:#1e293b; --card-hover:#1e293b; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--fg); min-height:100vh; overflow-x:hidden; }
        h1,h2,h3,h4,h5,h6,.font-display { font-family:'Space Grotesk',sans-serif; }
        .bg-grid { background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0); background-size:40px 40px; }
        .glow-blob { position:fixed; border-radius:50%; filter:blur(120px); opacity:0.15; pointer-events:none; z-index:0; }
        .glow-1 { width:600px; height:600px; background:#22c55e; top:-200px; left:-200px; animation:float1 20s ease-in-out infinite; }
        .glow-2 { width:400px; height:400px; background:#059669; bottom:-100px; right:-100px; animation:float2 25s ease-in-out infinite; }
        .glow-3 { width:300px; height:300px; background:#10b981; top:50%; left:60%; animation:float3 18s ease-in-out infinite; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(80px,60px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-60px,-80px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-40px,50px)} 66%{transform:translate(50px,-30px)} }
        .card { background:var(--card); border:1px solid var(--border); border-radius:12px; transition:all 0.3s ease; }
        .card:hover { background:var(--card-hover); border-color:rgba(34,197,94,0.2); transform:translateY(-2px); box-shadow:0 8px 30px rgba(34,197,94,0.08); }
        .btn-primary { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; font-weight:600; padding:10px 24px; border-radius:8px; border:none; cursor:pointer; transition:all 0.2s; font-size:14px; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 20px rgba(34,197,94,0.3); }
        .btn-primary:active { transform:translateY(0); }
        .btn-secondary { background:transparent; color:var(--fg); font-weight:500; padding:10px 24px; border-radius:8px; border:1px solid var(--border); cursor:pointer; transition:all 0.2s; font-size:14px; }
        .btn-secondary:hover { border-color:var(--accent); color:var(--accent); }
        .btn-danger { background:linear-gradient(135deg,#dc2626,#ef4444); color:#fff; font-weight:600; padding:10px 24px; border-radius:8px; border:none; cursor:pointer; transition:all 0.2s; font-size:14px; }
        .btn-danger:hover { box-shadow:0 4px 20px rgba(239,68,68,0.3); }
        .input-field { background:var(--bg); border:1px solid var(--border); color:var(--fg); padding:10px 14px; border-radius:8px; font-size:14px; width:100%; transition:border-color 0.2s; outline:none; font-family:'DM Sans',sans-serif; }
        .input-field:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(34,197,94,0.1); }
        .input-field::placeholder { color:var(--muted); }
        select.input-field { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; }
        .toast-container { position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
        .toast { padding:12px 20px; border-radius:8px; font-size:14px; font-weight:500; animation:slideIn 0.3s ease,fadeOut 0.3s ease 2.7s forwards; display:flex; align-items:center; gap:8px; min-width:280px; }
        .toast-success { background:#14532d; border:1px solid #166534; color:#86efac; }
        .toast-error { background:#450a0a; border:1px solid #7f1d1d; color:#fca5a5; }
        .toast-info { background:#0c2340; border:1px solid #1e3a5f; color:#93c5fd; }
        @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeOut { to{opacity:0;transform:translateX(50px)} }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.2s ease; }
        .modal-content { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:32px; max-width:640px; width:90%; max-height:85vh; overflow-y:auto; animation:scaleIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }
        .timer-pulse { animation:pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .option-radio { appearance:none; width:20px; height:20px; border:2px solid var(--border); border-radius:50%; cursor:pointer; transition:all 0.2s; position:relative; flex-shrink:0; }
        .option-radio:checked { border-color:var(--accent); background:var(--accent); }
        .option-radio:checked::after { content:''; position:absolute; top:3px; left:3px; width:10px; height:10px; background:#fff; border-radius:50%; }
        .option-label { cursor:pointer; padding:14px 18px; border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; gap:12px; transition:all 0.2s; }
        .option-label:hover { border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); }
        .option-radio:checked + .option-label-text { color:var(--accent); }
        .progress-bar { height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
        .progress-fill { height:100%; background:linear-gradient(90deg,#16a34a,#22c55e); border-radius:2px; transition:width 0.5s ease; }
        .stat-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:24px; }
        .tab-btn { padding:8px 16px; border-radius:6px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; background:transparent; color:var(--muted); }
        .tab-btn.active { background:rgba(34,197,94,0.15); color:var(--accent); }
        .tab-btn:hover:not(.active) { color:var(--fg); }
        .fade-in { animation:fadeIn 0.4s ease; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:var(--bg); }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:var(--muted); }
        @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:0.01ms!important; transition-duration:0.01ms!important; } }
    </style>
</head>
<body class="h-full bg-grid">
    <!-- Ambient glow blobs -->
    <div class="glow-blob glow-1"></div>
    <div class="glow-blob glow-2"></div>
    <div class="glow-blob glow-3"></div>

    <!-- Toast container -->
    <div id="toast-container" class="toast-container"></div>

    <!-- Modal container -->
    <div id="modal-root"></div>

    <!-- App root -->
    <div id="app" class="relative z-10 min-h-screen"></div>

    <script src="js/db.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/app.js"></script>
</body>
</html>