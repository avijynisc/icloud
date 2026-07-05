import { connect } from "cloudflare:sockets";

const DEFAULT_IMAP_HOST = "imap.mail.me.com";
const DEFAULT_IMAP_PORT = 993;
const DEFAULT_POLL_INTERVAL_SECONDS = 10;
const DEFAULT_SESSION_TTL_SECONDS = 300;
const DEFAULT_RECENT_MINUTES = 5;
const DEFAULT_INBOX_INTERVAL_SECONDS = 10;
const DEFAULT_JUNK_INTERVAL_SECONDS = 25;
const DEFAULT_MAX_RECENT_MESSAGES = 20;
const DEFAULT_CODE_LIMIT = 80;
const SESSION_COOKIE = "hme_panel_session";
const SESSION_MAX_AGE_SECONDS = 86400;

const INDEPENDENT_HTML = `<!doctype html>
<html lang="zh-CN" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ChatGPT专属邮箱接码</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='15' fill='%2310a37f'/%3E%3Cpath d='M32 9c5 0 9.3 2.9 11.2 7.2 4.8.7 8.8 4 10.2 8.8 1.4 4.7-.4 9.8-4.2 12.7.8 4.8-1.3 9.7-5.4 12.4-4.2 2.7-9.5 2.4-13.4-.5-4.5 1.7-9.7.5-13-3.1-3.4-3.7-4.1-8.9-2-13.3-3.3-3.5-4.2-8.8-2.1-13.3 2.1-4.5 6.6-7.2 11.3-7.1C26.5 10.4 29.1 9 32 9Z' fill='none' stroke='white' stroke-width='4.2' stroke-linejoin='round'/%3E%3Cpath d='M23.7 13.3 38 21.5v14.9L25.2 43.8M49.5 25.8 35.2 17.6 22.3 25v14.9M44.1 50.1V33.7l-12.9-7.4-12.8 7.4M14.9 34 29.1 42.2 42 34.8' fill='none' stroke='white' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
  <link rel="shortcut icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='15' fill='%2310a37f'/%3E%3Cpath d='M32 9c5 0 9.3 2.9 11.2 7.2 4.8.7 8.8 4 10.2 8.8 1.4 4.7-.4 9.8-4.2 12.7.8 4.8-1.3 9.7-5.4 12.4-4.2 2.7-9.5 2.4-13.4-.5-4.5 1.7-9.7.5-13-3.1-3.4-3.7-4.1-8.9-2-13.3-3.3-3.5-4.2-8.8-2.1-13.3 2.1-4.5 6.6-7.2 11.3-7.1C26.5 10.4 29.1 9 32 9Z' fill='none' stroke='white' stroke-width='4.2' stroke-linejoin='round'/%3E%3Cpath d='M23.7 13.3 38 21.5v14.9L25.2 43.8M49.5 25.8 35.2 17.6 22.3 25v14.9M44.1 50.1V33.7l-12.9-7.4-12.8 7.4M14.9 34 29.1 42.2 42 34.8' fill='none' stroke='white' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; --bg:#f5f8ff; --panel:#fff; --text:#0f172a; --muted:#64748b; --line:#dbe5f2; --accent:#2563eb; --accent2:#06b6d4; --ok:#11884a; --warn:#a45d00; --bad:#b42318; --soft:#eef6ff; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; font-family:'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:linear-gradient(180deg,#eaf3ff 0%,#f7f9ff 44%,#f4f7fb 100%); color:var(--text); }
    body:before { content:""; position:fixed; inset:0; pointer-events:none; background:radial-gradient(circle at 12% 12%, rgba(37,99,235,.16), transparent 32%), radial-gradient(circle at 88% 0%, rgba(6,182,212,.16), transparent 30%); }
    main { position:relative; width:min(1120px, calc(100vw - 32px)); margin:0 auto; padding:24px 0 40px; }
    header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; padding:14px 16px; background:rgba(255,255,255,.78); border:1px solid rgba(219,229,242,.9); border-radius:8px; box-shadow:0 18px 50px rgba(15,23,42,.08); backdrop-filter:blur(14px); }
    .brand { display:flex; align-items:center; gap:12px; min-width:0; }
    .logo { width:42px; height:42px; border-radius:8px; display:grid; place-items:center; color:#fff; font-weight:900; background:linear-gradient(135deg,var(--accent),var(--accent2)); box-shadow:0 10px 24px rgba(37,99,235,.22); }
    h1 { margin:0; font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-size:24px; letter-spacing:0; }
    .email { margin-top:4px; color:var(--muted); font-size:14px; word-break:break-all; }
    .toolbar { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
    button { border:1px solid var(--line); background:var(--panel); color:var(--text); border-radius:8px; min-height:42px; padding:0 16px; cursor:pointer; font:inherit; font-weight:750; box-shadow:0 8px 18px rgba(15,23,42,.05); }
    button.primary { border-color:transparent; background:linear-gradient(135deg,var(--accent),#1d4ed8); color:#fff; box-shadow:0 12px 26px rgba(37,99,235,.24); }
    button.success { border-color:transparent; background:linear-gradient(135deg,#059669,#0f9f6e); color:#fff; box-shadow:0 12px 26px rgba(5,150,105,.22); }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .hero { display:grid; grid-template-columns:340px 1fr; gap:18px; align-items:stretch; }
    .panel { background:rgba(255,255,255,.86); border:1px solid var(--line); border-radius:8px; padding:22px; box-shadow:0 18px 50px rgba(15,23,42,.08); backdrop-filter:blur(10px); }
    .mail-card { display:flex; flex-direction:column; gap:18px; }
    .mail-address { padding:14px; border:1px solid #dbeafe; border-radius:8px; background:linear-gradient(180deg,#f8fbff,#eef6ff); }
    .mail-address .caption { color:var(--muted); font-size:13px; margin-bottom:6px; }
    .mail-address .value { font-size:16px; font-weight:800; color:#1e3a8a; word-break:break-all; }
    dl { display:grid; gap:16px; margin:0; }
    dt { color:var(--muted); font-size:14px; }
    dd { margin:6px 0 0; font-size:24px; font-weight:850; word-break:break-word; }
    .label { color:var(--muted); font-size:15px; font-weight:750; margin-bottom:12px; }
    .code-panel { position:relative; overflow:hidden; min-height:390px; display:flex; flex-direction:column; justify-content:center; }
    .code-panel:before { content:""; position:absolute; left:0; top:0; width:100%; height:5px; background:linear-gradient(90deg,var(--accent),var(--accent2),#22c55e); }
    .code { font-size:clamp(56px, 10vw, 118px); line-height:1; font-weight:900; letter-spacing:0; min-height:122px; display:flex; align-items:center; word-break:break-all; color:#0b1220; }
    .code.is-waiting { font-size:clamp(22px, 4vw, 34px); font-weight:800; color:var(--muted); }
    .code-actions { margin-top:18px; display:flex; gap:12px; flex-wrap:wrap; }
    .status { margin-top:14px; font-size:15px; color:var(--muted); }
    .status.ok { color:var(--ok); }
    .status.warn { color:var(--warn); }
    .status.bad { color:var(--bad); }
    .timer { display:inline-flex; align-items:center; gap:8px; border:1px solid #b7ebc6; background:#f0fff5; color:#16a34a; border-radius:8px; padding:9px 14px; font-weight:900; }
    .state-pill { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; border:1px solid #dbeafe; background:#eff6ff; color:#1d4ed8; font-weight:800; font-size:13px; width:max-content; }
    .topbar { position:sticky; top:0; z-index:10; background:rgba(255,255,255,.78); border-bottom:1px solid rgba(219,229,242,.85); backdrop-filter:blur(16px); box-shadow:0 8px 26px rgba(15,23,42,.06); }
    .topbar-inner { width:min(1180px, calc(100vw - 32px)); margin:0 auto; min-height:72px; display:flex; align-items:center; gap:16px; }
    .brand-text { font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-size:18px; font-weight:800; }
    .brand-icon { width:42px; height:42px; border-radius:12px; display:grid; place-items:center; color:#fff; background:linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow:0 10px 26px rgba(99,102,241,.26); }
    .role-badge { margin-left:auto; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:800; color:#1d4ed8; border:1px solid rgba(59,130,246,.24); background:rgba(239,246,255,.9); }
    .nav-actions { display:flex; gap:10px; align-items:center; }
    .container { width:min(1180px, calc(100vw - 32px)); margin:28px auto 44px; }
    .mailbox-main { display:grid; gap:20px; }
    .card { background:rgba(255,255,255,.9); border:1px solid rgba(219,229,242,.92); border-radius:18px; padding:24px; box-shadow:0 18px 50px rgba(15,23,42,.08); backdrop-filter:blur(12px); }
    .card h2, .listcard-title { margin:0; display:flex; align-items:center; gap:10px; font-size:20px; font-weight:800; }
    .card-icon, .mailbox-icon { width:34px; height:34px; border-radius:10px; display:inline-grid; place-items:center; color:#4f46e5; background:rgba(99,102,241,.12); }
    .mailbox-info { margin-top:18px; display:grid; gap:16px; }
    .mailbox-display { display:flex; align-items:center; gap:12px; padding:16px; border:1px solid rgba(219,229,242,.95); border-radius:14px; background:linear-gradient(135deg,rgba(248,250,252,.9),rgba(239,246,255,.9)); }
    .mailbox-address { font-size:20px; font-weight:800; color:#0f172a; word-break:break-all; }
    .mailbox-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    .toolbar-left, .toolbar-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .chip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px; font-size:13px; font-weight:750; color:#475569; background:rgba(248,250,252,.9); border:1px solid rgba(219,229,242,.95); }
    .chip-unread { color:#047857; border-color:rgba(16,185,129,.28); background:rgba(236,253,245,.9); }
    .chip-total { color:#1d4ed8; border-color:rgba(59,130,246,.28); background:rgba(239,246,255,.9); }
    .listcard-header { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:16px; }
    .retention-hint { font-size:12px; color:#64748b; font-weight:700; background:#f8fafc; border:1px solid #e2e8f0; border-radius:999px; padding:4px 10px; }
    .list-viewport { border:1px solid rgba(219,229,242,.95); border-radius:16px; overflow:hidden; background:#fff; }
    .email-item { display:flex; align-items:center; gap:12px; padding:16px; border-bottom:1px solid #e5edf7; background:linear-gradient(180deg,#fff,#f8fbff); }
    .email-avatar { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; color:#fff; font-weight:900; background:linear-gradient(135deg,#2563eb,#06b6d4); }
    .chatgpt-logo { width:28px; height:28px; display:block; }
    .email-meta { min-width:0; flex:1; }
    .email-subject { font-size:16px; font-weight:850; color:#0f172a; }
    .muted-line { margin-top:4px; color:#64748b; font-size:13px; word-break:break-all; }
    .status-badge { display:inline-flex; align-items:center; padding:5px 10px; border-radius:999px; font-size:12px; font-weight:800; color:#047857; background:rgba(236,253,245,.95); border:1px solid rgba(16,185,129,.25); }
    .mail-content-card { padding:28px; display:grid; gap:16px; }
    .code-label { color:#64748b; font-size:13px; font-weight:800; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--line); background:var(--panel); color:var(--text); border-radius:12px; min-height:42px; padding:0 16px; cursor:pointer; font:inherit; font-weight:750; box-shadow:0 8px 18px rgba(15,23,42,.05); }
    .btn-primary { border-color:transparent; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 12px 30px rgba(99,102,241,.28); }
    .btn-ghost { background:rgba(255,255,255,.75); }
    :root.dark {
      color-scheme: dark;
      --surface: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #1e293b 50%, #18181b 75%, #1c1917 100%);
      --surface-mesh:
        radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.10) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.10) 0px, transparent 50%),
        radial-gradient(at 80% 50%, rgba(245, 158, 11, 0.08) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.12) 0px, transparent 50%);
      --bg:#0f172a;
      --panel:rgba(30, 41, 59, 0.85);
      --panel-soft:rgba(15, 23, 42, 0.58);
      --panel-hover:rgba(51, 65, 85, 0.72);
      --text:#f8fafc;
      --text-light:#e2e8f0;
      --muted:#94a3b8;
      --line:rgba(255, 255, 255, 0.10);
      --line-strong:rgba(148, 163, 184, 0.35);
      --accent:#6366f1;
      --accent2:#8b5cf6;
      --ok:#34d399;
      --warn:#fbbf24;
      --bad:#f87171;
      --soft:rgba(99, 102, 241, 0.16);
    }
    .dark body {
      background:var(--surface);
      color:var(--text);
      overflow-x:hidden;
    }
    .dark body:before {
      inset:-50%;
      width:200%;
      height:200%;
      background:var(--surface-mesh);
      animation:backgroundFloat 25s ease-in-out infinite;
      opacity:1;
      z-index:-2;
    }
    .dark body:after {
      content:"";
      position:fixed;
      inset:0;
      pointer-events:none;
      background:
        radial-gradient(circle at 50% 12%, rgba(99,102,241,.20), transparent 24%),
        radial-gradient(circle at 16% 86%, rgba(59,130,246,.12), transparent 28%),
        radial-gradient(circle at 88% 88%, rgba(245,158,11,.10), transparent 30%);
      animation:backgroundPulse 18s ease-in-out infinite;
      z-index:-1;
    }
    .dark .topbar {
      background:rgba(30, 41, 59, 0.85);
      border-bottom:1px solid var(--line);
      box-shadow:0 12px 34px rgba(0,0,0,.18);
      backdrop-filter:blur(24px);
    }
    .dark .brand-text {
      color:#a78bfa;
      text-shadow:0 0 22px rgba(129,140,248,.22);
    }
    .dark .brand-icon {
      color:#818cf8;
      background:rgba(99,102,241,.14);
      border:1px solid rgba(129,140,248,.30);
      box-shadow:0 12px 28px rgba(99,102,241,.18);
    }
    .dark .role-badge {
      color:#a5b4fc;
      background:rgba(99,102,241,.18);
      border-color:rgba(129,140,248,.34);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
    }
    .dark .card {
      position:relative;
      background:var(--panel);
      border:1px solid var(--line);
      border-radius:18px;
      box-shadow:0 22px 70px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.05);
      backdrop-filter:blur(24px);
    }
    .dark .mailbox-info-card:before,
    .dark .inbox-card:before {
      content:"";
      position:absolute;
      left:0;
      right:0;
      top:0;
      height:3px;
      border-radius:18px 18px 0 0;
      background:linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef);
      box-shadow:0 0 28px rgba(139,92,246,.42);
    }
    .dark .card h2,
    .dark .listcard-title,
    .dark .email-subject {
      color:var(--text);
    }
    .dark .card-icon,
    .dark .mailbox-icon {
      color:#818cf8;
      background:rgba(99,102,241,.13);
      border:1px solid rgba(129,140,248,.22);
    }
    .dark .mailbox-display {
      background:linear-gradient(135deg, rgba(67, 56, 202, .30), rgba(51, 65, 85, .58));
      border:1px solid rgba(129,140,248,.32);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 12px 28px rgba(0,0,0,.16);
    }
    .dark .mailbox-address {
      color:#c4b5fd;
      font-family:"Poppins", ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size:18px;
      letter-spacing:.2px;
    }
    .dark .mailbox-address.has-email {
      display:inline-block;
      width:100%;
      padding:6px 10px;
      border:2px dashed rgba(148,163,184,.30);
      border-radius:8px;
      background:rgba(15,23,42,.30);
      color:#d8b4fe;
    }
    .dark .chip {
      color:#cbd5e1;
      background:rgba(15,23,42,.55);
      border-color:var(--line);
      box-shadow:0 8px 18px rgba(0,0,0,.16);
    }
    .dark .chip-unread,
    .dark .chip-total {
      color:#a5b4fc;
      border-color:rgba(129,140,248,.25);
      background:rgba(99,102,241,.16);
    }
    .dark .retention-hint {
      color:#a5b4fc;
      background:rgba(99,102,241,.18);
      border-color:rgba(129,140,248,.26);
    }
    .dark .list-viewport {
      background:rgba(15,23,42,.48);
      border:1px solid var(--line);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
    }
    .dark .email-item {
      background:rgba(15,23,42,.34);
      border-bottom:1px solid var(--line);
    }
    .dark .email-avatar {
      color:#c4b5fd;
      background:rgba(99,102,241,.17);
      border:1px solid rgba(129,140,248,.26);
      box-shadow:0 10px 22px rgba(99,102,241,.14);
    }
    .dark .email-avatar.chatgpt-avatar {
      color:#f8fafc;
      background:linear-gradient(135deg, rgba(16,185,129,.22), rgba(99,102,241,.20));
      border-color:rgba(255,255,255,.16);
    }
    .dark .muted-line,
    .dark .code-label,
    .dark .status {
      color:var(--muted);
    }
    .dark .mail-content-card {
      background:rgba(15,23,42,.18);
    }
    .dark .code {
      color:var(--text);
      text-shadow:0 0 30px rgba(129,140,248,.16);
    }
    .dark .code.is-waiting {
      color:var(--muted);
      text-shadow:none;
    }
    .dark .status.ok { color:var(--ok); }
    .dark .status.warn { color:var(--warn); }
    .dark .status.bad { color:var(--bad); }
    .dark .status-badge {
      color:#86efac;
      background:rgba(16,185,129,.12);
      border-color:rgba(52,211,153,.25);
    }
    .dark .btn {
      color:var(--text-light);
      background:rgba(30,41,59,.74);
      border:1px solid var(--line);
      box-shadow:0 12px 24px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04);
    }
    .dark .btn:hover {
      background:rgba(51,65,85,.86);
      border-color:rgba(148,163,184,.34);
      transform:translateY(-1px);
    }
    .dark .btn-primary {
      position:relative;
      overflow:hidden;
      color:#fff;
      background:linear-gradient(135deg, #6366f1, #8b5cf6);
      border-color:rgba(129,140,248,.38);
      box-shadow:0 14px 34px rgba(99,102,241,.30), inset 0 1px 0 rgba(255,255,255,.15);
    }
    .dark .btn-primary:after {
      content:"";
      position:absolute;
      top:-70%;
      left:-55%;
      width:42%;
      height:240%;
      background:linear-gradient(90deg, transparent, rgba(255,255,255,.62), transparent);
      transform:rotate(22deg) translateX(-120%);
      opacity:0;
      pointer-events:none;
    }
    .dark .btn-primary:hover:after {
      opacity:1;
      animation:buttonShine .82s ease;
    }
    .dark .btn-ghost {
      background:rgba(30,41,59,.72);
    }
    .dark .topbar-inner {
      width:min(1200px, calc(100vw - 80px));
      min-height:78px;
    }
    .dark .container {
      width:min(820px, calc(100vw - 32px));
      margin:30px auto 56px;
    }
    .dark .mailbox-main {
      gap:30px;
    }
    .dark .card {
      padding:24px;
      border-radius:14px;
      background:rgba(30, 41, 59, 0.82);
      border-color:rgba(148,163,184,.16);
      box-shadow:0 20px 60px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.04);
    }
    .dark .mailbox-info-card:before,
    .dark .inbox-card:before {
      height:4px;
      border-radius:14px 14px 0 0;
      background:linear-gradient(90deg, #6366f1 0%, #8b5cf6 58%, #c084fc 100%);
    }
    .dark .card h2,
    .dark .listcard-title {
      gap:14px;
      font-size:24px;
      letter-spacing:0;
    }
    .dark .card-icon {
      width:28px;
      height:28px;
      border-radius:8px;
      color:#818cf8;
      background:transparent;
      border:0;
      transform:rotate(-16deg);
    }
    .dark .mailbox-info {
      margin-top:20px;
    }
    .dark .mailbox-display {
      min-height:70px;
      padding:12px;
      border-radius:14px;
      background:linear-gradient(135deg, rgba(15,23,42,.72), rgba(30,41,59,.58));
      border:1px solid rgba(148,163,184,.16);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 14px 30px rgba(0,0,0,.16);
    }
    .dark .mailbox-icon {
      width:46px;
      height:46px;
      border-radius:13px;
      color:#c4b5fd;
      background:linear-gradient(135deg, rgba(99,102,241,.22), rgba(139,92,246,.10));
      border:1px solid rgba(129,140,248,.24);
      box-shadow:0 10px 22px rgba(99,102,241,.12);
      flex:0 0 auto;
    }
    .dark .mailbox-address {
      flex:1;
      min-width:0;
    }
    .dark .mailbox-address.has-email {
      position:relative;
      min-height:46px;
      display:flex;
      align-items:center;
      padding:0 14px 0 36px;
      color:#f5d0fe;
      border:1px solid rgba(129,140,248,.14);
      border-radius:13px;
      background:rgba(15,23,42,.46);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      font-size:17px;
      line-height:1.25;
      white-space:nowrap;
      text-overflow:ellipsis;
      overflow:hidden;
    }
    .dark .mailbox-address.has-email:before {
      content:"";
      position:absolute;
      left:15px;
      top:50%;
      width:8px;
      height:8px;
      border-radius:999px;
      background:#34d399;
      box-shadow:0 0 0 5px rgba(52,211,153,.11), 0 0 18px rgba(52,211,153,.45);
      transform:translateY(-50%);
    }
    .dark .mailbox-address.has-email:after {
      content:"iCloud";
      margin-left:auto;
      padding:4px 9px;
      border-radius:999px;
      color:#a5b4fc;
      background:rgba(99,102,241,.12);
      border:1px solid rgba(129,140,248,.18);
      font-family:'Open Sans', ui-sans-serif, system-ui, sans-serif;
      font-size:12px;
      font-weight:850;
      letter-spacing:0;
      flex:0 0 auto;
    }
    .dark .mailbox-toolbar {
      margin-top:10px;
    }
    .dark .chip {
      min-height:30px;
      padding:6px 12px;
      border-radius:12px;
      color:#cbd5e1;
      background:rgba(15,23,42,.56);
      border-color:rgba(148,163,184,.18);
    }
    .dark .chip-unread,
    .dark .chip-total {
      border-radius:14px;
      color:#a5b4fc;
      background:rgba(99,102,241,.18);
      box-shadow:0 8px 18px rgba(0,0,0,.16);
    }
    .dark .timer-chip {
      gap:8px;
      min-width:142px;
      justify-content:center;
      color:#e2e8f0;
      background:rgba(15,23,42,.42);
      border-color:rgba(148,163,184,.18);
    }
    .dark .timer-icon {
      width:16px;
      height:16px;
      color:#cbd5e1;
      flex:0 0 auto;
      filter:drop-shadow(0 0 10px rgba(148,163,184,.22));
    }
    .dark .inbox-card {
      min-height:410px;
    }
    .dark .listcard-header {
      align-items:center;
      margin-bottom:20px;
    }
    .dark .retention-hint {
      padding:4px 10px;
      font-size:12px;
      color:#94a3b8;
      background:rgba(99,102,241,.16);
      border-color:rgba(129,140,248,.18);
    }
    .dark .list-viewport {
      min-height:302px;
      border-radius:12px;
      border:0;
      background:rgba(15, 23, 42, .18);
    }
    .dark .email-item {
      min-height:72px;
      padding:16px 18px;
      background:rgba(15,23,42,.22);
      border-bottom:1px solid rgba(148,163,184,.11);
    }
    .dark .email-avatar {
      width:42px;
      height:42px;
      border-radius:10px;
    }
    .dark .mail-content-card {
      min-height:230px;
      place-items:center;
      text-align:center;
      padding:26px 24px 34px;
      background:transparent;
    }
    .dark .code-label {
      font-size:14px;
      color:#94a3b8;
    }
    .dark .code {
      justify-content:center;
      min-height:auto;
      font-size:clamp(58px, 9vw, 92px);
    }
    .dark .code.is-waiting {
      font-size:22px;
      font-weight:800;
      color:#94a3b8;
    }
    .dark .code-actions {
      margin-top:2px;
      justify-content:center;
    }
    .dark .code-actions .btn-primary {
      min-height:52px;
      padding:0 28px;
      border-radius:14px;
      font-size:18px;
      font-weight:900;
      letter-spacing:0;
      box-shadow:0 18px 40px rgba(139,92,246,.36), inset 0 1px 0 rgba(255,255,255,.22);
    }
    .dark .btn {
      min-height:38px;
      border-radius:10px;
      padding:0 16px;
    }
    .dark .nav-actions .btn {
      min-height:48px;
      padding:0 22px;
    }
    @keyframes backgroundFloat {
      0%,100% { transform:translate(0,0) rotate(0deg); }
      33% { transform:translate(30px,-30px) rotate(120deg); }
      66% { transform:translate(-20px,20px) rotate(240deg); }
    }
    @keyframes backgroundPulse {
      0%,100% { opacity:.72; }
      50% { opacity:1; }
    }
    @keyframes buttonShine {
      from { transform:rotate(22deg) translateX(-140%); }
      to { transform:rotate(22deg) translateX(430%); }
    }
    @media (max-width: 820px) { header { align-items:stretch; flex-direction:column; } .toolbar { justify-content:flex-start; } .hero { grid-template-columns:1fr; } .code-panel { min-height:300px; } .topbar-inner { align-items:flex-start; flex-direction:column; padding:14px 0; } .role-badge { margin-left:0; } .listcard-header { align-items:flex-start; flex-direction:column; } .mail-content-card { padding:20px; } }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></span>
        <span class="brand-text">ChatGPT专属邮箱接码</span>
      </div>
      <div id="role-badge" class="role-badge">验证码用户</div>
      <div class="nav-actions">
        <button id="toggle" class="btn btn-primary">暂停</button>
        <button id="refresh" class="btn btn-ghost">刷新</button>
      </div>
    </div>
  </div>

  <div class="container mailbox-container">
    <div class="main mailbox-main">
      <div class="card mailbox-info-card">
        <h2><span class="card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></span>我的邮箱</h2>
        <div class="mailbox-info">
          <div class="mailbox-display">
            <span class="mailbox-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></span>
            <span id="mailValue" class="mailbox-address">正在读取</span>
          </div>
          <div class="mailbox-toolbar">
            <div class="toolbar-left">
              <span class="chip chip-unread">状态 <span id="statePill">等待邮件</span></span>
              <span class="chip timer-chip"><svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M12 3v2"/><path d="M12 19v2"/><path d="M3 12h2"/><path d="M19 12h2"/></svg><span id="countdown">10s 后刷新</span></span>
            </div>
            <div class="toolbar-right">
              <span class="chip">最后刷新 <span id="updated">--</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="card inbox-card">
        <div class="listcard-header">
          <h2 class="listcard-title"><span class="card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></span><span>收件箱</span><span class="retention-hint">验证码仅保留 10 分钟</span></h2>
          <div class="status" id="status">等待新邮件</div>
        </div>
        <div class="list-viewport">
          <div class="email-item">
            <div class="email-avatar chatgpt-avatar"><svg class="chatgpt-logo" viewBox="0 0 48 48" fill="none" aria-label="ChatGPT logo"><path d="M24 5.5c4.1 0 7.6 2.4 9.2 5.9 3.9.5 7.3 3.3 8.4 7.2 1.2 3.9-.2 8.1-3.3 10.5.7 3.9-1 7.9-4.4 10.1-3.4 2.2-7.8 2-11-.4-3.7 1.4-8 .5-10.7-2.5-2.8-3-3.4-7.3-1.7-10.9-2.7-2.9-3.5-7.2-1.7-10.9 1.7-3.7 5.4-5.9 9.3-5.8 1.6-2 3.8-3.2 5.9-3.2Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M18.4 8.8 30 15.5v12.2l-10.5 6.1" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M38.4 19.1 26.8 12.4 16.2 18.5v12.2" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.2 38.6V25.2L23.7 19.1 13.2 25.2" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 25.4 22 32.1 32.5 26" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div class="email-meta">
              <div class="email-subject">ChatGPT 登陆验证码</div>
              <div class="muted-line" id="email"></div>
            </div>
            <span class="status-badge" id="sourceBadge">INBOX</span>
          </div>
          <div class="mail-content-card">
            <div class="code-label">验证码</div>
            <div class="code is-waiting" id="code">等待邮件</div>
            <div class="code-actions"><button id="copy" class="btn btn-primary">复制验证码</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    const state = { running:true, latestCode:"", sessionId:"", intervalMs:10000, expiresAt:0, restarting:false, nextRefreshAt:0 };
    const emailEl = document.getElementById("email");
    const mailValue = document.getElementById("mailValue");
    const codeEl = document.getElementById("code");
    const statusEl = document.getElementById("status");
    const statePill = document.getElementById("statePill");
    const updated = document.getElementById("updated");
    const countdown = document.getElementById("countdown");
    const sourceBadge = document.getElementById("sourceBadge");
    const toggle = document.getElementById("toggle");
    const refresh = document.getElementById("refresh");
    const copy = document.getElementById("copy");
    function currentEmailParam() {
      return "";
    }
    function currentAccessToken() {
      if (location.pathname.startsWith("/code/")) return decodeURIComponent(location.pathname.slice("/code/".length));
      return "";
    }
    function apiPath(path) {
      return path;
    }
    function sessionStorageKey() {
      return "hmeSession:" + currentAccessToken();
    }
    function setStatus(text, kind) {
      statusEl.textContent = text;
      statusEl.className = "status " + (kind || "");
      statePill.textContent = kind === "ok" ? "已收到验证码" : kind === "bad" ? "连接异常" : "等待邮件";
    }
    function setMailAddress(value) {
      const text = value ? "邮箱号：" + value : "邮箱号";
      emailEl.textContent = text;
      mailValue.textContent = value || "正在读取";
      mailValue.classList.toggle("has-email", Boolean(value));
    }
    function updateCountdown() {
      if (!state.running) { countdown.textContent = "已暂停"; return; }
      if (!state.nextRefreshAt) { countdown.textContent = Math.round(state.intervalMs / 1000) + "s 后刷新"; return; }
      const seconds = Math.max(0, Math.ceil((state.nextRefreshAt - Date.now()) / 1000));
      countdown.textContent = seconds + "s 后刷新";
    }
    async function createSession() {
      const accessToken = currentAccessToken();
      setMailAddress("");
      const storageKey = sessionStorageKey();
      try {
        const cached = JSON.parse(sessionStorage.getItem(storageKey) || "null");
        if (cached && cached.sessionId && cached.expiresAt && Date.parse(cached.expiresAt) > Date.now()) {
          state.sessionId = cached.sessionId;
          state.expiresAt = Date.parse(cached.expiresAt);
          return;
        }
      } catch {}
      const res = await fetch(apiPath("/api/session"), {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body:JSON.stringify({ accessToken, label:"independent" }),
        cache:"no-store"
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "创建等待会话失败");
      state.sessionId = data.session.sessionId;
      state.expiresAt = Date.parse(data.session.expiresAt);
      state.intervalMs = Number(data.poll_interval_seconds || 10) * 1000;
      if (data.session.targetEmail) setMailAddress(data.session.targetEmail);
      sessionStorage.setItem(storageKey, JSON.stringify({ sessionId: state.sessionId, expiresAt: data.session.expiresAt }));
    }
    async function restartSession() {
      if (state.restarting) return false;
      state.restarting = true;
      try {
        sessionStorage.removeItem(sessionStorageKey());
        state.sessionId = "";
        state.expiresAt = 0;
        await createSession();
        return true;
      } finally {
        state.restarting = false;
      }
    }
    async function refreshCode() {
      if (!state.sessionId) return;
      refresh.disabled = true;
      try {
        const res = await fetch("/api/code?sessionId=" + encodeURIComponent(state.sessionId), {
          cache:"no-store",
          headers:{ "x-access-token": currentAccessToken() }
        });
        const data = await res.json();
        updated.textContent = new Date().toLocaleTimeString("zh-CN", { hour12:false });
        if (!res.ok || !data.ok) { setStatus(data.error || "读取缓存失败", "bad"); return; }
        const session = data.session;
        if (session.sessionId) state.sessionId = session.sessionId;
        if (session.targetEmail) setMailAddress(session.targetEmail);
        state.expiresAt = Date.parse(session.expiresAt);
        sessionStorage.setItem(sessionStorageKey(), JSON.stringify({ sessionId: state.sessionId, expiresAt: session.expiresAt }));
        if (session.status === "success" && session.code) {
          state.latestCode = session.code;
          codeEl.classList.remove("is-waiting");
          codeEl.textContent = session.code;
          sourceBadge.textContent = session.source || "INBOX";
          setStatus("已识别验证码，来源：" + (session.source || "--"), "ok");
        } else if (session.status === "expired") {
          codeEl.classList.add("is-waiting");
          codeEl.textContent = "等待邮件";
          setStatus("本次等待已过期，正在重新开始", "warn");
          const restarted = await restartSession();
          if (restarted) await refreshCode();
        } else {
          codeEl.classList.add("is-waiting");
          codeEl.textContent = "等待邮件";
          setStatus("等待新邮件", "warn");
        }
      } catch (err) {
        setStatus(String(err), "bad");
      } finally {
        refresh.disabled = false;
        state.nextRefreshAt = Date.now() + state.intervalMs;
        updateCountdown();
      }
    }
    toggle.addEventListener("click", () => {
      state.running = !state.running;
      toggle.textContent = state.running ? "暂停" : "继续";
      toggle.classList.toggle("btn-primary", state.running);
      if (state.running) state.nextRefreshAt = Date.now() + state.intervalMs;
      updateCountdown();
    });
    refresh.addEventListener("click", refreshCode);
    copy.addEventListener("click", async () => {
      if (!state.latestCode) return;
      await navigator.clipboard.writeText(state.latestCode);
      setStatus("验证码已复制", "ok");
    });
    async function loop() {
      if (state.running) await refreshCode();
      else updateCountdown();
      setTimeout(loop, state.intervalMs);
    }
    createSession().then(() => { setInterval(updateCountdown, 1000); updateCountdown(); loop(); }).catch((err) => setStatus(String(err), "bad"));
  </script>
</body>
</html>`;

const LOGIN_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>集中接码登录</title>
  <style>
    :root { color-scheme:light; --bg:#f4f7fb; --panel:#fff; --text:#111827; --muted:#64748b; --line:#dbe3ef; --accent:#0f67b1; --bad:#b42318; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; display:grid; place-items:center; font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:linear-gradient(180deg,#f8fbff 0%,#eef3f8 100%); color:var(--text); }
    main { width:min(420px, calc(100vw - 32px)); }
    h1 { margin:0 0 8px; font-size:30px; letter-spacing:0; }
    p { margin:0 0 18px; color:var(--muted); line-height:1.6; }
    form { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:22px; box-shadow:0 18px 50px rgba(15,23,42,.08); }
    label { display:block; color:var(--muted); font-size:14px; margin-bottom:8px; }
    input { width:100%; height:44px; border:1px solid var(--line); border-radius:8px; padding:0 12px; font:inherit; }
    button { width:100%; height:44px; margin-top:14px; border:1px solid var(--accent); border-radius:8px; background:var(--accent); color:#fff; font:inherit; font-weight:750; cursor:pointer; }
    .error { min-height:22px; margin-top:12px; color:var(--bad); font-size:14px; }
  </style>
</head>
<body>
  <main>
    <h1>集中接码面板</h1>
    <p>登录后统一查看 mailWorker 已识别的验证码缓存。</p>
    <form id="form">
      <label for="password">访问密码</label>
      <input id="password" type="password" autocomplete="current-password" autofocus>
      <button>进入面板</button>
      <div class="error" id="error"></div>
    </form>
  </main>
  <script>
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";
      const res = await fetch("/api/login", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body:JSON.stringify({ password:password.value })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) location.reload();
      else error.textContent = data.error || "登录失败";
    });
  </script>
</body>
</html>`;

const CENTRAL_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>集中接码面板</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme:light;
      --surface:linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 25%,#f8fafc 50%,#fff1f2 75%,#fef3e8 100%);
      --surface-mesh:
        radial-gradient(at 40% 20%, rgba(99,102,241,.08) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(236,72,153,.06) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(16,185,129,.06) 0px, transparent 50%),
        radial-gradient(at 80% 50%, rgba(245,158,11,.05) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(59,130,246,.08) 0px, transparent 50%);
      --panel:rgba(255,255,255,.88);
      --panel-strong:#fff;
      --panel-soft:rgba(255,255,255,.64);
      --text:#0f172a;
      --muted:#64748b;
      --line:rgba(148,163,184,.26);
      --line-soft:rgba(226,232,240,.86);
      --primary:#6366f1;
      --primary2:#8b5cf6;
      --accent:#ec4899;
      --ok:#10b981;
      --warn:#f59e0b;
      --bad:#ef4444;
      --info:#0ea5e9;
      --shadow:0 22px 70px rgba(15,23,42,.10);
      --shadow-soft:0 12px 30px rgba(15,23,42,.08);
    }
    * { box-sizing:border-box; }
    body {
      margin:0;
      min-height:100vh;
      font-family:'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:var(--surface);
      color:var(--text);
      overflow-x:hidden;
    }
    body:before {
      content:"";
      position:fixed;
      inset:-50%;
      width:200%;
      height:200%;
      pointer-events:none;
      background:var(--surface-mesh);
      animation:floatMesh 25s ease-in-out infinite;
      z-index:-2;
    }
    body:after {
      content:"";
      position:fixed;
      inset:0;
      pointer-events:none;
      background:radial-gradient(circle at 50% 0%, rgba(99,102,241,.13), transparent 28%), radial-gradient(circle at 12% 86%, rgba(14,165,233,.08), transparent 26%), radial-gradient(circle at 90% 84%, rgba(236,72,153,.08), transparent 24%);
      z-index:-1;
    }
    .topbar {
      position:sticky;
      top:0;
      z-index:20;
      background:rgba(255,255,255,.74);
      border-bottom:1px solid rgba(226,232,240,.82);
      box-shadow:0 10px 34px rgba(15,23,42,.06);
      backdrop-filter:blur(24px);
    }
    .topbar-inner {
      width:min(1220px, calc(100vw - 44px));
      min-height:78px;
      margin:0 auto;
      display:flex;
      align-items:center;
      gap:16px;
    }
    .brand { display:flex; align-items:center; gap:12px; min-width:0; }
    .brand-icon {
      width:42px;
      height:42px;
      border-radius:14px;
      display:grid;
      place-items:center;
      color:#4f46e5;
      background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(236,72,153,.10));
      border:1px solid rgba(99,102,241,.22);
      box-shadow:0 12px 28px rgba(99,102,241,.16);
    }
    .brand-text {
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-size:19px;
      font-weight:850;
      color:#4f46e5;
      letter-spacing:0;
    }
    .role-badge {
      margin-left:auto;
      display:inline-flex;
      align-items:center;
      gap:7px;
      padding:7px 12px;
      border-radius:999px;
      color:#4338ca;
      background:rgba(99,102,241,.10);
      border:1px solid rgba(99,102,241,.20);
      font-size:12px;
      font-weight:800;
    }
    .role-badge:before {
      content:"";
      width:7px;
      height:7px;
      border-radius:999px;
      background:var(--ok);
      box-shadow:0 0 0 4px rgba(16,185,129,.12);
    }
    .nav-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
    .container {
      width:min(1220px, calc(100vw - 44px));
      margin:26px auto 48px;
      display:grid;
      gap:18px;
    }
    .card {
      position:relative;
      background:var(--panel);
      border:1px solid var(--line-soft);
      border-radius:18px;
      box-shadow:var(--shadow);
      backdrop-filter:blur(18px);
    }
    .card:before {
      content:"";
      position:absolute;
      top:0;
      left:0;
      right:0;
      height:3px;
      border-radius:18px 18px 0 0;
      background:linear-gradient(90deg,var(--primary),var(--primary2),var(--accent));
      opacity:.82;
    }
    .hero-card {
      padding:24px;
      display:grid;
      grid-template-columns:minmax(280px,1fr) auto;
      gap:18px;
      align-items:center;
    }
    h1 {
      margin:0;
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-size:32px;
      line-height:1.15;
      letter-spacing:0;
    }
    .sub {
      margin-top:8px;
      color:var(--muted);
      line-height:1.7;
      font-size:14px;
    }
    .hero-meta {
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
      margin-top:16px;
    }
    button, select, input {
      min-height:42px;
      border:1px solid var(--line);
      border-radius:12px;
      background:rgba(255,255,255,.78);
      color:var(--text);
      padding:0 14px;
      font:inherit;
      outline:none;
      transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    }
    button {
      cursor:pointer;
      font-weight:800;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      box-shadow:0 8px 18px rgba(15,23,42,.06);
    }
    button:hover, select:hover, input:hover {
      border-color:rgba(99,102,241,.34);
    }
    button:hover {
      transform:translateY(-1px);
      box-shadow:0 12px 26px rgba(15,23,42,.10);
    }
    button.primary {
      border-color:transparent;
      color:#fff;
      background:linear-gradient(135deg,var(--primary),var(--primary2));
      box-shadow:0 14px 34px rgba(99,102,241,.24);
    }
    button.ok {
      border-color:transparent;
      color:#fff;
      background:linear-gradient(135deg,#10b981,#34d399);
      box-shadow:0 14px 30px rgba(16,185,129,.22);
    }
    a.nav-link {
      min-height:42px;
      padding:0 16px;
      border:1px solid var(--line);
      border-radius:14px;
      color:var(--text);
      background:rgba(255,255,255,.82);
      text-decoration:none;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      font-weight:800;
      box-shadow:0 8px 18px rgba(15,23,42,.06);
    }
    .btn-icon { width:18px; height:18px; flex:0 0 auto; }
    .stats {
      display:grid;
      grid-template-columns:repeat(4, minmax(170px,1fr));
      gap:14px;
    }
    .stat-card {
      min-height:112px;
      padding:18px;
      overflow:hidden;
    }
    .stat-card:after {
      content:"";
      position:absolute;
      right:-26px;
      bottom:-26px;
      width:90px;
      height:90px;
      border-radius:999px;
      background:linear-gradient(135deg,rgba(99,102,241,.10),rgba(236,72,153,.08));
    }
    .label {
      color:var(--muted);
      font-weight:750;
      font-size:13px;
      margin-bottom:10px;
    }
    .value {
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-size:28px;
      line-height:1;
      font-weight:850;
    }
    .mini {
      margin-top:8px;
      color:#94a3b8;
      font-size:12px;
      font-weight:700;
    }
    .filters {
      padding:16px;
      display:grid;
      grid-template-columns:minmax(240px,1fr) 110px auto auto;
      gap:12px;
      align-items:center;
    }
    .search-wrap { position:relative; }
    .search-wrap svg {
      position:absolute;
      left:13px;
      top:50%;
      transform:translateY(-50%);
      color:#94a3b8;
      width:18px;
      height:18px;
    }
    .search-wrap input {
      width:100%;
      padding-left:42px;
      background:rgba(255,255,255,.86);
    }
    label.inline {
      min-height:42px;
      display:flex;
      align-items:center;
      gap:9px;
      color:var(--muted);
      font-weight:750;
      padding:0 4px;
      white-space:nowrap;
    }
    input[type="checkbox"] {
      width:18px;
      height:18px;
      min-height:auto;
      padding:0;
      accent-color:var(--accent);
    }
    .status-line {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      color:var(--muted);
      font-size:14px;
      min-height:28px;
      padding:0 4px;
    }
    .status-pill, .source-pill, .fresh-pill {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      border-radius:999px;
      padding:5px 10px;
      font-size:12px;
      font-weight:800;
      border:1px solid rgba(99,102,241,.18);
      background:rgba(99,102,241,.08);
      color:#4f46e5;
    }
    .fresh-pill {
      color:#047857;
      background:rgba(16,185,129,.10);
      border-color:rgba(16,185,129,.20);
    }
    .inbox-card { padding:20px; }
    .inbox-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      margin-bottom:16px;
    }
    .inbox-title {
      display:flex;
      align-items:center;
      gap:12px;
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-size:22px;
      font-weight:850;
    }
    .title-icon {
      width:34px;
      height:34px;
      border-radius:12px;
      display:grid;
      place-items:center;
      color:#4f46e5;
      background:rgba(99,102,241,.10);
      border:1px solid rgba(99,102,241,.16);
      transform:rotate(-12deg);
    }
    .code-list {
      display:grid;
      gap:12px;
      min-height:280px;
    }
    .code-row {
      display:grid;
      grid-template-columns:minmax(230px,1.2fr) minmax(130px,.55fr) minmax(160px,.75fr) minmax(92px,.38fr) minmax(190px,1fr) minmax(210px,.9fr);
      gap:12px;
      align-items:center;
      padding:15px;
      border:1px solid rgba(226,232,240,.92);
      border-radius:14px;
      background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(248,250,252,.88));
      box-shadow:0 10px 24px rgba(15,23,42,.05);
    }
    .code-row:hover {
      border-color:rgba(99,102,241,.26);
      transform:translateY(-1px);
      box-shadow:0 16px 34px rgba(15,23,42,.08);
    }
    .field-label {
      color:#94a3b8;
      font-size:11px;
      font-weight:850;
      margin-bottom:5px;
    }
    .email-text, .subject-text {
      font-weight:800;
      word-break:break-all;
    }
    .subject-text {
      color:#475569;
      font-weight:750;
      font-size:13px;
      line-height:1.45;
    }
    .code-text {
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-size:25px;
      line-height:1;
      font-weight:900;
      letter-spacing:.3px;
    }
    .time-text {
      color:#475569;
      font-size:13px;
      font-weight:750;
      line-height:1.4;
    }
    .source-pill {
      min-width:64px;
      color:#0f67b1;
      background:#eef6ff;
      border-color:#dbeafe;
    }
    .actions {
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap:8px;
      flex-wrap:wrap;
    }
    .actions button {
      min-height:36px;
      padding:0 11px;
      border-radius:10px;
      font-size:13px;
    }
    .empty {
      min-height:280px;
      display:grid;
      place-items:center;
      color:var(--muted);
      text-align:center;
      border:1px dashed rgba(148,163,184,.35);
      border-radius:16px;
      background:rgba(255,255,255,.52);
    }
    .empty strong {
      display:block;
      color:#334155;
      font-size:18px;
      margin-bottom:6px;
    }
    .toast {
      position:fixed;
      right:22px;
      bottom:22px;
      z-index:50;
      min-width:180px;
      padding:12px 14px;
      border-radius:14px;
      color:#fff;
      background:linear-gradient(135deg,#0f172a,#334155);
      box-shadow:0 18px 44px rgba(15,23,42,.22);
      opacity:0;
      transform:translateY(12px);
      pointer-events:none;
      transition:opacity .2s ease, transform .2s ease;
      font-weight:800;
    }
    .toast.show {
      opacity:1;
      transform:translateY(0);
    }
    @keyframes floatMesh {
      0%,100% { transform:translate(0,0) rotate(0deg); }
      33% { transform:translate(28px,-24px) rotate(120deg); }
      66% { transform:translate(-18px,18px) rotate(240deg); }
    }
    @media (max-width:1100px) {
      .code-row { grid-template-columns:1fr 130px 150px; }
      .row-source, .row-subject, .actions { grid-column:auto; }
      .actions { justify-content:flex-start; }
    }
    @media (max-width:820px) {
      .topbar-inner { width:min(100vw - 28px, 1220px); align-items:flex-start; flex-direction:column; padding:14px 0; }
      .role-badge { margin-left:0; }
      .container { width:min(100vw - 28px, 1220px); }
      .hero-card { grid-template-columns:1fr; }
      .nav-actions { justify-content:flex-start; }
      .stats { grid-template-columns:1fr 1fr; }
      .filters { grid-template-columns:1fr; }
      .code-row { grid-template-columns:1fr; }
      .inbox-header { align-items:flex-start; flex-direction:column; }
    }
    @media (max-width:520px) {
      .stats { grid-template-columns:1fr; }
      h1 { font-size:26px; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></span>
        <span class="brand-text">ChatGPT 集中接码</span>
      </div>
      <div class="role-badge">明亮模式 · 管理员</div>
      <div class="nav-actions">
        <a class="nav-link" href="/admin/emails">邮箱管理</a>
        <button class="primary" id="toggle"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h4v16H6z"/><path d="M14 4h4v16h-4z"/></svg><span id="toggleText">暂停</span></button>
        <button id="refresh"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.3"/><path d="M3 12A9 9 0 0 1 18.5 5.7"/><path d="M18 3v4h4"/><path d="M6 21v-4H2"/></svg>刷新</button>
        <button id="logout"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>退出</button>
      </div>
    </div>
  </div>

  <main class="container">
    <section class="card hero-card">
      <div>
        <h1>集中接码面板</h1>
        <div class="sub">统一查看 mailWorker 已识别的验证码缓存。页面只读缓存，不触发 IMAP 登录，也不扫描邮箱。</div>
        <div class="hero-meta">
          <span class="status-pill" id="status">正在读取缓存</span>
          <span class="fresh-pill">最近 10 分钟展示</span>
        </div>
      </div>
      <div class="nav-actions">
        <button class="ok" id="copyAll"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>复制全部</button>
      </div>
    </section>

    <section class="stats">
      <div class="card stat-card"><div class="label">显示数量</div><div class="value" id="shown">--</div><div class="mini">当前筛选结果</div></div>
      <div class="card stat-card"><div class="label">验证码记录</div><div class="value" id="total">--</div><div class="mini">缓存内有效记录</div></div>
      <div class="card stat-card"><div class="label">轮询间隔</div><div class="value" id="interval">10 秒</div><div class="mini" id="nextRefresh">自动刷新中</div></div>
      <div class="card stat-card"><div class="label">最后刷新</div><div class="value" id="updated">--</div><div class="mini">中国时间</div></div>
    </section>

    <section class="card filters">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>
        <input id="search" placeholder="搜索邮箱、验证码、主题、来源">
      </div>
      <select id="limit"><option>20</option><option selected>50</option><option>100</option><option>200</option></select>
      <label class="inline"><input type="checkbox" id="onlyWithCode" checked> 只看有验证码</label>
      <button id="clearSearch"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>清空</button>
    </section>

    <div class="status-line">
      <span id="statusText">正在读取缓存...</span>
      <span class="status-pill" id="healthText">mailWorker 缓存</span>
    </div>

    <section class="card inbox-card">
      <div class="inbox-header">
        <div class="inbox-title"><span class="title-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></span>验证码收件箱</div>
        <span class="fresh-pill">一次收信，多端显示</span>
      </div>
      <div id="list" class="code-list"><div class="empty"><div><strong>等待缓存</strong><span>mailWorker 识别到验证码后会自动出现在这里</span></div></div></div>
    </section>
  </main>
  <div class="toast" id="toast"></div>
  <script>
    const state = { running:true, intervalMs:10000, items:[], nextAt:0, searchTimer:null, toastTimer:null };
    const list = document.getElementById("list");
    const shown = document.getElementById("shown");
    const total = document.getElementById("total");
    const interval = document.getElementById("interval");
    const updated = document.getElementById("updated");
    const statusEl = document.getElementById("status");
    const statusText = document.getElementById("statusText");
    const healthText = document.getElementById("healthText");
    const nextRefresh = document.getElementById("nextRefresh");
    const searchInput = document.getElementById("search");
    const limitInput = document.getElementById("limit");
    const onlyWithCodeInput = document.getElementById("onlyWithCode");
    const clearSearchBtn = document.getElementById("clearSearch");
    const toggleText = document.getElementById("toggleText");
    const toast = document.getElementById("toast");
    function fmtDate(value) {
      if (!value) return "--";
      return new Date(value).toLocaleString("zh-CN", { timeZone:"Asia/Shanghai", hour12:false });
    }
    function showToast(text) {
      toast.textContent = text;
      toast.classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
    }
    async function copyText(text, label) {
      if (!text) return showToast("没有可复制内容");
      await navigator.clipboard.writeText(text);
      showToast(label || "已复制");
    }
    function render(items) {
      state.items = items;
      shown.textContent = String(items.length);
      list.innerHTML = "";
      if (!items.length) {
        list.innerHTML = '<div class="empty"><div><strong>暂未识别到验证码</strong><span>新的验证码会在 mailWorker 写入缓存后显示</span></div></div>';
        return;
      }
      for (const item of items) {
        const row = document.createElement("article");
        row.className = "code-row";
        row.innerHTML = '<div><div class="field-label">邮箱</div><div class="email-text"></div></div><div><div class="field-label">验证码</div><div class="code-text"></div></div><div><div class="field-label">时间</div><div class="time-text"></div></div><div class="row-source"><div class="field-label">来源</div><span class="source-pill"></span></div><div class="row-subject"><div class="field-label">主题</div><div class="subject-text"></div></div><div class="actions"><button type="button" data-copy-code>复制验证码</button><button type="button" data-copy-link>复制链接</button></div>';
        row.querySelector(".email-text").textContent = item.targetEmail || "--";
        row.querySelector(".code-text").textContent = item.code || "--";
        row.querySelector(".time-text").textContent = fmtDate(item.emailDate);
        row.querySelector(".source-pill").textContent = item.source || "--";
        row.querySelector(".subject-text").textContent = item.subject || "";
        row.querySelector("[data-copy-code]").addEventListener("click", () => copyText(item.code || "", "验证码已复制"));
        row.querySelector("[data-copy-link]").addEventListener("click", () => copyText(item.accessUrl || "", "专属链接已复制"));
        list.appendChild(row);
      }
    }
    async function fetchCodes(params) {
      const res = await fetch("/api/admin/codes?" + params.toString(), { cache:"no-store", credentials:"same-origin" });
      const data = await res.json();
      return { res, data };
    }
    async function load() {
      const params = new URLSearchParams({
        onlyWithCode: onlyWithCodeInput.checked ? "1" : "0",
        search: searchInput.value.trim(),
        limit: limitInput.value
      });
      const { res, data } = await fetchCodes(params);
      updated.textContent = new Date().toLocaleTimeString("zh-CN", { hour12:false });
      if (!res.ok || !data.ok) {
        statusEl.textContent = "读取失败";
        statusText.textContent = data.error || "读取缓存失败";
        healthText.textContent = "需要检查登录";
        return;
      }
      interval.textContent = (data.poll_interval_seconds || 10) + " 秒";
      state.intervalMs = Number(data.poll_interval_seconds || 10) * 1000;
      state.nextAt = Date.now() + state.intervalMs;
      total.textContent = String(data.total || 0);
      if (!data.items.length && searchInput.value.trim()) {
        const fallbackParams = new URLSearchParams({ onlyWithCode: onlyWithCodeInput.checked ? "1" : "0", limit: limitInput.value });
        const fallback = await fetchCodes(fallbackParams);
        const fallbackCount = fallback.data?.items?.length || 0;
        statusEl.textContent = "无匹配结果";
        statusText.textContent = fallbackCount ? "当前搜索没有匹配；最近缓存里还有 " + fallbackCount + " 条验证码" : "当前搜索没有匹配，最近缓存也为空";
        healthText.textContent = "搜索条件生效中";
        render([]);
        return;
      }
      statusEl.textContent = data.items.length ? "缓存已同步" : "等待新验证码";
      statusText.textContent = data.items.length ? "已显示最新验证码缓存，共 " + data.items.length + " 条" : "暂无验证码，等待 mailWorker 写入缓存";
      healthText.textContent = "mailWorker 缓存正常";
      render(data.items);
    }
    function scheduleSearchLoad() {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(load, 180);
    }
    function updateNextRefresh() {
      if (!state.running) {
        nextRefresh.textContent = "自动刷新已暂停";
        return;
      }
      if (!state.nextAt) {
        nextRefresh.textContent = "自动刷新中";
        return;
      }
      const left = Math.max(0, Math.ceil((state.nextAt - Date.now()) / 1000));
      nextRefresh.textContent = left ? left + " 秒后刷新" : "正在刷新";
    }
    toggle.addEventListener("click", () => {
      state.running = !state.running;
      toggleText.textContent = state.running ? "暂停" : "继续";
      toggle.classList.toggle("primary", state.running);
      updateNextRefresh();
    });
    refresh.addEventListener("click", load);
    logout.addEventListener("click", async () => { await fetch("/api/logout", { method:"POST" }); location.reload(); });
    copyAll.addEventListener("click", () => copyText(state.items.map((x) => [x.targetEmail, x.code, x.accessUrl].filter(Boolean).join("\\t")).join("\\n"), "全部记录已复制"));
    clearSearchBtn.addEventListener("click", () => { searchInput.value = ""; load(); });
    searchInput.addEventListener("input", scheduleSearchLoad);
    limitInput.addEventListener("change", load);
    onlyWithCodeInput.addEventListener("change", load);
    async function loop() {
      if (state.running) await load();
      setTimeout(loop, state.intervalMs);
    }
    setInterval(updateNextRefresh, 1000);
    loop();
  </script>
</body>
</html>`;

const EMAILS_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>iCloud 邮箱管理</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: light;
      --surface:linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 28%,#f8fafc 58%,#fff1f2 100%);
      --panel:rgba(255,255,255,.9);
      --panel-strong:#fff;
      --text:#0f172a;
      --muted:#64748b;
      --line:rgba(148,163,184,.28);
      --primary:#6366f1;
      --primary2:#8b5cf6;
      --accent:#ec4899;
      --ok:#10b981;
      --warn:#f59e0b;
      --bad:#ef4444;
      --shadow:0 22px 70px rgba(15,23,42,.1);
    }
    * { box-sizing:border-box; }
    body {
      margin:0;
      min-height:100vh;
      font-family:'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color:var(--text);
      background:var(--surface);
      overflow-x:hidden;
    }
    body:before {
      content:"";
      position:fixed;
      inset:0;
      pointer-events:none;
      background:
        radial-gradient(circle at 12% 18%, rgba(99,102,241,.16), transparent 30%),
        radial-gradient(circle at 86% 8%, rgba(236,72,153,.10), transparent 28%),
        radial-gradient(circle at 88% 88%, rgba(16,185,129,.09), transparent 30%);
      z-index:-1;
    }
    .topbar {
      position:sticky;
      top:0;
      z-index:10;
      background:rgba(255,255,255,.82);
      border-bottom:1px solid rgba(226,232,240,.9);
      backdrop-filter:blur(18px);
      box-shadow:0 12px 30px rgba(15,23,42,.06);
    }
    .topbar-inner {
      width:min(1280px, calc(100vw - 32px));
      margin:0 auto;
      min-height:76px;
      display:flex;
      align-items:center;
      gap:16px;
    }
    .brand {
      display:flex;
      align-items:center;
      gap:12px;
      min-width:0;
      font-family:'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-weight:900;
      color:#4f46e5;
      font-size:20px;
    }
    .brand-icon {
      width:42px;
      height:42px;
      border-radius:14px;
      display:grid;
      place-items:center;
      color:#4f46e5;
      background:rgba(99,102,241,.12);
      border:1px solid rgba(99,102,241,.18);
      box-shadow:0 12px 28px rgba(99,102,241,.16);
    }
    .actions {
      margin-left:auto;
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
      justify-content:flex-end;
    }
    button, .nav-link, select, input {
      min-height:44px;
      border:1px solid var(--line);
      border-radius:14px;
      background:rgba(255,255,255,.86);
      color:var(--text);
      font:inherit;
      font-weight:800;
      padding:0 16px;
      box-shadow:0 8px 18px rgba(15,23,42,.06);
    }
    button, .nav-link { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; }
    button:hover, .nav-link:hover { transform:translateY(-1px); border-color:rgba(99,102,241,.36); box-shadow:0 14px 26px rgba(15,23,42,.1); }
    button.primary { color:#fff; border-color:transparent; background:linear-gradient(135deg,var(--primary),var(--primary2)); box-shadow:0 14px 34px rgba(99,102,241,.24); }
    button.ok { color:#fff; border-color:transparent; background:linear-gradient(135deg,#10b981,#34d399); box-shadow:0 14px 34px rgba(16,185,129,.22); }
    button.warn { color:#fff; border-color:transparent; background:linear-gradient(135deg,#f59e0b,#f97316); box-shadow:0 14px 34px rgba(245,158,11,.2); }
    button.small { min-height:36px; padding:0 12px; border-radius:12px; font-size:13px; }
    button:disabled { opacity:.55; cursor:not-allowed; transform:none; }
    .btn-icon { width:18px; height:18px; flex:0 0 auto; }
    .container { width:min(1280px, calc(100vw - 32px)); margin:28px auto 48px; display:grid; gap:18px; }
    .card {
      position:relative;
      background:var(--panel);
      border:1px solid rgba(226,232,240,.9);
      border-radius:22px;
      box-shadow:var(--shadow);
      backdrop-filter:blur(14px);
      overflow:hidden;
    }
    .card:before {
      content:"";
      position:absolute;
      inset:0 0 auto 0;
      height:4px;
      background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);
    }
    .hero { padding:26px; display:flex; align-items:center; justify-content:space-between; gap:20px; }
    h1 { margin:0 0 8px; font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-size:32px; letter-spacing:0; }
    .muted { color:var(--muted); font-weight:700; }
    .pills { margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; }
    .pill {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      color:#4f46e5;
      background:rgba(99,102,241,.1);
      border:1px solid rgba(99,102,241,.16);
      font-size:13px;
      font-weight:850;
    }
    .pill.ok { color:#047857; background:rgba(16,185,129,.11); border-color:rgba(16,185,129,.20); }
    .pill.warn { color:#b45309; background:rgba(245,158,11,.12); border-color:rgba(245,158,11,.22); }
    .stats { display:grid; grid-template-columns:repeat(5, minmax(160px,1fr)); gap:14px; }
    .stat { min-height:112px; padding:20px; }
    .stat:after {
      content:"";
      position:absolute;
      right:-28px;
      bottom:-28px;
      width:92px;
      height:92px;
      border-radius:999px;
      background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(236,72,153,.08));
    }
    .label { color:var(--muted); font-size:13px; font-weight:800; margin-bottom:10px; }
    .value { font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-size:30px; font-weight:900; line-height:1; }
    .mini { margin-top:8px; color:#94a3b8; font-size:12px; font-weight:800; }
    .filters { padding:16px; display:grid; grid-template-columns:minmax(260px,1fr) 120px auto auto auto; gap:12px; align-items:center; }
    .search-wrap { position:relative; }
    .search-wrap svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:#94a3b8; }
    .search-wrap input { width:100%; padding-left:44px; font-weight:700; }
    label.inline { display:flex; align-items:center; gap:8px; color:var(--muted); font-weight:850; white-space:nowrap; }
    input[type="checkbox"] { width:18px; height:18px; min-height:auto; padding:0; accent-color:var(--accent); box-shadow:none; }
    .status-line { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 4px; color:var(--muted); font-weight:750; }
    .table-card { padding:20px; }
    .table-head { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:16px; }
    .table-title { display:flex; align-items:center; gap:12px; font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-size:22px; font-weight:900; }
    .title-icon { width:36px; height:36px; border-radius:12px; display:grid; place-items:center; color:#4f46e5; background:rgba(99,102,241,.10); border:1px solid rgba(99,102,241,.16); }
    .table-wrap { border:1px solid rgba(226,232,240,.95); border-radius:18px; overflow:auto; background:#fff; }
    table { width:100%; min-width:1280px; border-collapse:collapse; }
    th, td { padding:14px 16px; text-align:left; border-bottom:1px solid #e8eef7; vertical-align:middle; }
    th { color:#64748b; font-size:13px; font-weight:900; background:#f8fbff; position:sticky; top:0; z-index:1; }
    tr:last-child td { border-bottom:0; }
    .email { font-size:15px; font-weight:900; color:#0f172a; word-break:break-all; }
    .sub { margin-top:4px; color:#94a3b8; font-size:12px; font-weight:750; word-break:break-all; }
    .code { font-family:'Poppins', ui-sans-serif, system-ui, sans-serif; font-weight:900; font-size:20px; letter-spacing:0; }
    .badge {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      border-radius:999px;
      padding:6px 10px;
      font-size:12px;
      font-weight:900;
      background:#eef2ff;
      color:#4f46e5;
      border:1px solid rgba(99,102,241,.18);
      white-space:nowrap;
    }
    .badge.ok { color:#047857; background:#ecfdf5; border-color:rgba(16,185,129,.22); }
    .badge.warn { color:#b45309; background:#fffbeb; border-color:rgba(245,158,11,.24); }
    .badge.bad { color:#b91c1c; background:#fef2f2; border-color:rgba(239,68,68,.20); }
    .badge.sold { color:#7c2d12; background:#fff7ed; border-color:rgba(249,115,22,.26); }
    .row-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .empty {
      min-height:260px;
      display:grid;
      place-items:center;
      color:#64748b;
      text-align:center;
      padding:36px;
      border:1px dashed rgba(148,163,184,.4);
      border-radius:18px;
      background:#fff;
    }
    .toast {
      position:fixed;
      right:20px;
      bottom:20px;
      z-index:99;
      transform:translateY(18px);
      opacity:0;
      pointer-events:none;
      border-radius:16px;
      color:#fff;
      background:linear-gradient(135deg,#0f172a,#334155);
      padding:12px 16px;
      font-weight:850;
      box-shadow:0 18px 48px rgba(15,23,42,.25);
      transition:.22s ease;
    }
    .toast.show { transform:translateY(0); opacity:1; }
    @media (max-width: 980px) {
      .topbar-inner { align-items:flex-start; flex-direction:column; padding:14px 0; }
      .actions { margin-left:0; justify-content:flex-start; }
      .hero { align-items:flex-start; flex-direction:column; }
      .stats { grid-template-columns:repeat(2, minmax(0,1fr)); }
      .filters { grid-template-columns:1fr; }
    }
    @media (max-width: 560px) {
      .stats { grid-template-columns:1fr; }
      h1 { font-size:26px; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-icon"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg></span>
        <span>iCloud 邮箱管理</span>
      </div>
      <div class="actions">
        <a class="nav-link" href="/">集中接码</a>
        <button class="primary" id="refresh"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.3"/><path d="M3 12A9 9 0 0 1 18.5 5.7"/><path d="M18 3v4h4"/><path d="M6 21v-4H2"/></svg>刷新</button>
        <button id="logout"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>退出</button>
      </div>
    </div>
  </div>

  <main class="container">
    <section class="card hero">
      <div>
        <h1>邮箱资产面板</h1>
        <div class="muted">汇总专属链接、最近验证码和独立 session。页面只读缓存，不触发 IMAP 扫描。</div>
        <div class="pills">
          <span class="pill">只展示后台缓存</span>
          <span class="pill ok">可补专属链接</span>
          <span class="pill warn">可发现缺失 token</span>
        </div>
      </div>
      <button class="ok" id="ensureMissing"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>补全部缺失链接</button>
    </section>

    <section class="stats">
      <div class="card stat"><div class="label">邮箱总数</div><div class="value" id="statTotal">--</div><div class="mini">缓存中识别到的邮箱</div></div>
      <div class="card stat"><div class="label">已有专属链接</div><div class="value" id="statWithToken">--</div><div class="mini">可打开 /code/:token</div></div>
      <div class="card stat"><div class="label">缺失链接</div><div class="value" id="statMissing">--</div><div class="mini">建议立即补齐</div></div>
      <div class="card stat"><div class="label">最近有验证码</div><div class="value" id="statRecent">--</div><div class="mini">最近保留窗口内</div></div>
      <div class="card stat"><div class="label">成品/已出</div><div class="value" id="statFinished">--</div><div class="mini">已标记完成状态</div></div>
    </section>

    <section class="card filters">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="search" placeholder="搜索邮箱、标签、验证码、主题、状态">
      </div>
      <select id="limit">
        <option value="50">50</option>
        <option value="100" selected>100</option>
        <option value="200">200</option>
        <option value="500">500</option>
      </select>
      <label class="inline"><input id="missingOnly" type="checkbox"> 只看缺失链接</label>
      <button id="copyAll"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>复制列表</button>
      <button id="clearSearch"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>清空</button>
    </section>

    <div class="status-line">
      <span id="status">正在读取缓存...</span>
      <span class="pill ok" id="health">管理缓存正常</span>
    </div>

    <section class="card table-card">
      <div class="table-head">
        <div class="table-title"><span class="title-icon"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg></span>邮箱列表</div>
        <span class="pill" id="shownPill">--</span>
      </div>
      <div class="table-wrap" id="tableWrap">
        <table>
          <thead>
            <tr>
              <th>邮箱</th>
              <th>注册时间</th>
              <th>状态</th>
              <th>专属链接</th>
              <th>最近验证码</th>
              <th>最近收信</th>
              <th>最近 Session</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      <div class="empty" id="empty" hidden>
        <div>
          <h2>暂无邮箱记录</h2>
          <p class="muted">生成专属链接或收到验证码后，这里会自动出现。</p>
        </div>
      </div>
    </section>
  </main>
  <div class="toast" id="toast"></div>

  <script>
    const state = { items: [], timer: null };
    const $ = (selector) => document.querySelector(selector);
    const rowsEl = $("#rows");
    const emptyEl = $("#empty");
    const tableWrap = $("#tableWrap");
    const toastEl = $("#toast");
    const searchInput = $("#search");
    const limitInput = $("#limit");
    const missingOnlyInput = $("#missingOnly");
    const statTotal = $("#statTotal");
    const statWithToken = $("#statWithToken");
    const statMissing = $("#statMissing");
    const statRecent = $("#statRecent");
    const statFinished = $("#statFinished");
    const statusEl = $("#status");
    const healthEl = $("#health");
    const shownPill = $("#shownPill");

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
    }
    function formatTime(value) {
      if (!value) return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "--";
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone:"Asia/Shanghai",
        year:"numeric",
        month:"2-digit",
        day:"2-digit",
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit",
        hour12:false
      }).format(date);
    }
    function showToast(message) {
      toastEl.textContent = message;
      toastEl.classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
    }
    async function copyText(text, message) {
      if (!text) return showToast("没有可复制内容");
      try {
        await navigator.clipboard.writeText(text);
        showToast(message || "已复制");
      } catch {
        showToast("复制失败，请手动复制");
      }
    }
    async function api(path, options) {
      const res = await fetch(path, {
        cache:"no-store",
        credentials:"same-origin",
        headers:{ "content-type":"application/json" },
        ...(options || {})
      });
      if (res.status === 401) {
        location.href = "/";
        return { ok:false };
      }
      return res.json().catch(() => ({ ok:false, error:"响应解析失败" }));
    }
    function buildParams() {
      const params = new URLSearchParams({
        search: searchInput.value.trim(),
        limit: limitInput.value,
        missingOnly: missingOnlyInput.checked ? "1" : "0"
      });
      return params.toString();
    }
    async function load() {
      statusEl.textContent = "正在读取缓存...";
      healthEl.textContent = "同步中";
      const data = await api("/api/admin/emails?" + buildParams());
      if (!data.ok) {
        statusEl.textContent = data.error || "读取失败";
        healthEl.textContent = "读取异常";
        render([]);
        return;
      }
      state.items = data.items || [];
      const summary = data.summary || {};
      statTotal.textContent = summary.totalEmails ?? 0;
      statWithToken.textContent = summary.withToken ?? 0;
      statMissing.textContent = summary.missingToken ?? 0;
      statRecent.textContent = summary.withRecentCode ?? 0;
      statFinished.textContent = summary.finishedOrOut ?? 0;
      shownPill.textContent = "显示 " + state.items.length + " / " + (data.total || 0);
      statusEl.textContent = state.items.length ? "缓存已同步" : "没有匹配的邮箱记录";
      healthEl.textContent = "管理缓存正常";
      render(state.items);
    }
    function render(items) {
      tableWrap.hidden = !items.length;
      emptyEl.hidden = !!items.length;
      rowsEl.innerHTML = items.map((item, index) => {
        const linkBadge = item.hasToken
          ? '<span class="badge ok">已有链接</span>'
          : '<span class="badge bad">缺失链接</span>';
        const code = item.latestCode
          ? '<div class="code">' + escapeHtml(item.latestCode) + '</div><div class="sub">' + escapeHtml(item.latestCodeSubject || "--") + '</div>'
          : '<span class="muted">--</span>';
        const sessionBadge = item.latestSessionStatus
          ? '<span class="badge ' + (item.latestSessionStatus === "success" ? "ok" : item.latestSessionStatus === "expired" ? "warn" : "") + '">' + escapeHtml(item.latestSessionStatus) + '</span>'
          : '<span class="muted">--</span>';
        const productStatus = item.productStatus === "out"
          ? '<span class="badge sold">成品/已出</span><div class="sub">' + escapeHtml(formatTime(item.productStatusAt)) + '</div>'
          : '<span class="badge">未标记</span>';
        const statusButtonText = item.productStatus === "out" ? "取消已出" : "成品/已出";
        const statusButtonClass = item.productStatus === "out" ? "small" : "small warn";
        return '<tr>' +
          '<td><div class="email">' + escapeHtml(item.targetEmail) + '</div><div class="sub">' + escapeHtml(item.label || "未标记") + '</div></td>' +
          '<td>' + escapeHtml(formatTime(item.registeredAt)) + '<div class="sub">' + escapeHtml(item.registeredAtSource || "未知") + '</div></td>' +
          '<td>' + productStatus + '</td>' +
          '<td>' + linkBadge + '<div class="sub">' + escapeHtml(item.accessUrl ? "可复制专属链接" : "需要补链接") + '</div></td>' +
          '<td>' + code + '</td>' +
          '<td><span class="badge">' + escapeHtml(item.latestCodeSource || "--") + '</span><div class="sub">' + escapeHtml(formatTime(item.latestCodeAt)) + '</div></td>' +
          '<td>' + sessionBadge + '<div class="sub">' + escapeHtml(formatTime(item.latestSessionAt)) + '</div></td>' +
          '<td><div class="row-actions">' +
            '<button class="small" data-action="copy-email" data-index="' + index + '">复制邮箱</button>' +
            '<button class="small" data-action="copy-link" data-index="' + index + '"' + (item.accessUrl ? "" : " disabled") + '>复制链接</button>' +
            '<button class="small ok" data-action="ensure" data-index="' + index + '">' + (item.hasToken ? "检查链接" : "补链接") + '</button>' +
            '<button class="small warn" data-action="reset" data-index="' + index + '">重置链接</button>' +
            '<button class="' + statusButtonClass + '" data-action="toggle-status" data-index="' + index + '">' + statusButtonText + '</button>' +
          '</div></td>' +
        '</tr>';
      }).join("");
    }
    async function ensureToken(item) {
      const data = await api("/api/admin/emails/ensure-token", {
        method:"POST",
        body:JSON.stringify({ targetEmail:item.targetEmail, label:item.label || "managed" })
      });
      if (data.ok) showToast("专属链接已补齐");
      else showToast(data.error || "补链接失败");
      await load();
    }
    rowsEl.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const item = state.items[Number(button.dataset.index)];
      if (!item) return;
      const action = button.dataset.action;
      if (action === "copy-email") return copyText(item.targetEmail, "邮箱已复制");
      if (action === "copy-link") return copyText(item.accessUrl, "专属链接已复制");
      if (action === "ensure") return ensureToken(item);
      if (action === "toggle-status") {
        button.disabled = true;
        const nextStatus = item.productStatus === "out" ? "" : "out";
        const data = await api("/api/admin/emails/status", { method:"POST", body:JSON.stringify({ targetEmail:item.targetEmail, productStatus:nextStatus }) });
        showToast(data.ok ? (nextStatus ? "已标记成品/已出" : "已取消成品/已出") : (data.error || "状态更新失败"));
        await load();
        return;
      }
      if (action === "reset") {
        button.disabled = true;
        const data = await api("/api/admin/tokens/reset", { method:"POST", body:JSON.stringify({ targetEmail:item.targetEmail }) });
        showToast(data.ok ? "专属链接已重置" : (data.error || "重置失败"));
        await load();
      }
    });
    $("#ensureMissing").addEventListener("click", async () => {
      const missing = state.items.filter((item) => !item.hasToken);
      if (!missing.length) return showToast("没有缺失链接");
      $("#ensureMissing").disabled = true;
      for (const item of missing) await ensureToken(item);
      $("#ensureMissing").disabled = false;
      showToast("缺失链接已补齐");
      await load();
    });
    $("#copyAll").addEventListener("click", () => copyText(state.items.map((item) => [
      item.targetEmail,
      formatTime(item.registeredAt),
      item.productStatus === "out" ? "成品/已出" : "未标记",
      item.accessUrl || "",
      item.latestCode || ""
    ].join("\\t")).join("\\n"), "列表已复制"));
    $("#clearSearch").addEventListener("click", () => { searchInput.value = ""; missingOnlyInput.checked = false; load(); });
    $("#refresh").addEventListener("click", load);
    $("#logout").addEventListener("click", async () => { await fetch("/api/logout", { method:"POST" }); location.href = "/"; });
    searchInput.addEventListener("input", () => { clearTimeout(state.timer); state.timer = setTimeout(load, 180); });
    limitInput.addEventListener("change", load);
    missingOnlyInput.addEventListener("change", load);
    load();
  </script>
</body>
</html>`;

export class MailWorker {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.scanning = false;
  }

  async fetch(request) {
    const url = new URL(request.url);
    await this.ensureAlarm();

    if (url.pathname === "/start") {
      return json({ ok: true });
    }

    if (url.pathname === "/session" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try {
        return json({ ok: true, session: await this.createSession(body) });
      } catch {
        return json({ ok: false, error: "Unauthorized" }, 403);
      }
    }

    if (url.pathname === "/code") {
      const sessionId = url.searchParams.get("sessionId") || "";
      const accessToken = request.headers.get("x-access-token") || "";
      const session = await this.getSession(sessionId);
      if (!session) return json({ ok: false, error: "Session not found" }, 404);
      if (!(await this.canReadSession(session, accessToken))) return json({ ok: false, error: "Unauthorized" }, 403);
      if (session.status === "expired") {
        const nextSession = await this.createSession({ accessToken, label: "independent-refresh" });
        return json({ ok: true, session: nextSession, replacedSessionId: session.sessionId });
      }
      return json({ ok: true, session: publicSession(session) });
    }

    if (url.pathname === "/admin/tokens") {
      if (request.method === "GET") {
        const limit = clampNumber(Number(url.searchParams.get("limit") || 200), 1, 500);
        const tokens = await this.listAccessTokens(limit);
        return json({ ok: true, tokens, total: tokens.length });
      }
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        try {
          const token = await this.registerAccessToken(body);
          return json({ ok: true, token });
        } catch {
          return json({ ok: false, error: "Invalid token request" }, 400);
        }
      }
    }

    if (url.pathname === "/admin/tokens/reset" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try {
        const token = await this.resetAccessToken(body);
        return json({ ok: true, token });
      } catch {
        return json({ ok: false, error: "Token not found" }, 404);
      }
    }

    if (url.pathname === "/admin/emails") {
      const search = (url.searchParams.get("search") || "").trim().toLowerCase();
      const limit = clampNumber(Number(url.searchParams.get("limit") || 100), 1, 500);
      const missingOnly = isTruthy(url.searchParams.get("missingOnly") || "false");
      const result = await this.listManagedEmails({ search, limit, missingOnly });
      return json({ ok: true, ...result });
    }

    if (url.pathname === "/admin/emails/ensure-token" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try {
        const token = await this.ensureAccessToken(body);
        return json({ ok: true, token });
      } catch {
        return json({ ok: false, error: "Invalid email" }, 400);
      }
    }

    if (url.pathname === "/admin/emails/status" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try {
        const item = await this.setEmailStatus(body);
        return json({ ok: true, item });
      } catch {
        return json({ ok: false, error: "Invalid email status" }, 400);
      }
    }

    if (url.pathname === "/admin/codes") {
      const onlyWithCode = isTruthy(url.searchParams.get("onlyWithCode") || "true");
      const search = (url.searchParams.get("search") || "").trim().toLowerCase();
      const limit = clampNumber(Number(url.searchParams.get("limit") || DEFAULT_CODE_LIMIT), 1, 500);
      const items = await this.listCodes({ onlyWithCode, search, limit });
      const total = items.length;
      return json({
        ok: true,
        items,
        total,
        poll_interval_seconds: Number(getEnv(this.env, "POLL_INTERVAL_SECONDS", DEFAULT_POLL_INTERVAL_SECONDS)),
      });
    }

    if (url.pathname === "/admin/sessions") {
      const limit = clampNumber(Number(url.searchParams.get("limit") || 200), 1, 500);
      const sessions = await this.listSessions(limit);
      return json({ ok: true, sessions, total: sessions.length });
    }

    if (url.pathname === "/admin/status") {
      return json({
        ok: true,
        lastInboxCheck: await this.state.storage.get("meta:lastInboxCheck"),
        lastJunkCheck: await this.state.storage.get("meta:lastJunkCheck"),
        codes: await this.countByPrefix("code:"),
        sessions: await this.countByPrefix("session:"),
        processedUIDs: await this.countByPrefix("processed:"),
        errors: Array.from((await this.state.storage.list({ prefix: "error:" })).values()),
      });
    }

    return json({ ok: false, error: "Not found" }, 404);
  }

  async alarm() {
    await this.scanDue();
    await this.state.storage.setAlarm(Date.now() + 10000);
  }

  async ensureAlarm() {
    const current = await this.state.storage.getAlarm();
    if (!current) await this.state.storage.setAlarm(Date.now() + 1000);
  }

  async createSession(body) {
    const access = await this.getAccessToken(body.accessToken);
    if (!access) throw new Error("Invalid accessToken");
    const accessToken = access.accessToken;
    const targetEmail = access.targetEmail;
    const now = Date.now();
    const ttlMs = Number(getEnv(this.env, "SESSION_TTL_SECONDS", DEFAULT_SESSION_TTL_SECONDS)) * 1000;
    const session = {
      sessionId: crypto.randomUUID(),
      targetEmail,
      accessTokenHash: await sha256Hex(accessToken),
      label: String(body.label || ""),
      startTime: new Date(now).toISOString(),
      status: "waiting",
      code: "",
      subject: "",
      emailDate: "",
      source: "",
      matchedAt: "",
      expiresAt: new Date(now + ttlMs).toISOString(),
    };
    await this.matchExistingCode(session);
    await this.state.storage.put(`session:${session.sessionId}`, session);
    return publicSession(session);
  }

  async getSession(sessionId) {
    if (!sessionId) return null;
    const key = `session:${sessionId}`;
    const session = await this.state.storage.get(key);
    if (!session) return null;
    if (session.status === "waiting" && Date.parse(session.expiresAt) <= Date.now()) {
      session.status = "expired";
      await this.state.storage.put(key, session);
    } else if (session.status === "waiting") {
      await this.matchExistingCode(session);
      if (session.status === "success") await this.state.storage.put(key, session);
    }
    return session;
  }

  async canReadSession(session, accessToken) {
    if (!session || !accessToken) return false;
    const access = await this.getAccessToken(accessToken);
    if (!access) return false;
    return constantTimeEqualHex(session.accessTokenHash, await sha256Hex(access.accessToken));
  }

  async getAccessToken(accessToken) {
    const token = resolveAccessToken(accessToken);
    if (!token) return null;
    const item = await this.state.storage.get(`token:${token}`);
    if (!item || item.revokedAt) return null;
    return item;
  }

  async registerAccessToken(body) {
    const targetEmail = String(body.targetEmail || "").trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@icloud\.com$/i.test(targetEmail)) throw new Error("Invalid targetEmail");
    const accessToken = normalizeAccessToken(body.accessToken) || randomHex(24);
    const nowIso = new Date().toISOString();
    const registeredAt = normalizeIsoDate(body.registeredAt) || nowIso;
    const item = {
      accessToken,
      targetEmail,
      label: String(body.label || ""),
      registeredAt,
      createdAt: nowIso,
      resetAt: "",
      revokedAt: "",
    };
    await this.state.storage.put(`token:${accessToken}`, item);
    return item;
  }

  async resetAccessToken(body) {
    const currentToken = normalizeAccessToken(body.accessToken);
    const targetEmail = String(body.targetEmail || "").trim().toLowerCase();
    let current = currentToken ? await this.state.storage.get(`token:${currentToken}`) : null;
    if (!current && targetEmail) {
      const rows = Array.from((await this.state.storage.list({ prefix: "token:" })).values());
      current = rows.find((item) => item.targetEmail === targetEmail && !item.revokedAt) || null;
    }
    if (!current) throw new Error("Token not found");
    current.revokedAt = new Date().toISOString();
    await this.state.storage.put(`token:${current.accessToken}`, current);
    const next = await this.registerAccessToken({
      targetEmail: current.targetEmail,
      label: current.label,
      registeredAt: current.registeredAt || current.createdAt,
      accessToken: randomHex(24),
    });
    next.resetAt = new Date().toISOString();
    await this.state.storage.put(`token:${next.accessToken}`, next);
    return next;
  }

  async ensureAccessToken(body) {
    const targetEmail = String(body.targetEmail || "").trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@icloud\.com$/i.test(targetEmail)) throw new Error("Invalid targetEmail");
    const current = await this.findActiveTokenByEmail(targetEmail);
    if (current) return current;
    const meta = await this.getEmailMeta(targetEmail);
    return this.registerAccessToken({
      targetEmail,
      label: String(body.label || "managed"),
      registeredAt: normalizeIsoDate(body.registeredAt) || meta.registeredAt || "",
      accessToken: randomHex(24),
    });
  }

  async findActiveTokenByEmail(targetEmail) {
    const rows = Array.from((await this.state.storage.list({ prefix: "token:" })).values());
    return rows
      .filter((item) => item.targetEmail === targetEmail && !item.revokedAt)
      .sort((a, b) => Date.parse(b.createdAt || b.resetAt || 0) - Date.parse(a.createdAt || a.resetAt || 0))[0] || null;
  }

  async getEmailMeta(targetEmail) {
    const email = String(targetEmail || "").trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@icloud\.com$/i.test(email)) return {};
    return (await this.state.storage.get(`email:${email}`)) || {};
  }

  async setEmailStatus(body) {
    const targetEmail = String(body.targetEmail || "").trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@icloud\.com$/i.test(targetEmail)) throw new Error("Invalid targetEmail");
    const productStatus = String(body.productStatus || body.status || "").trim().toLowerCase() === "out" ? "out" : "";
    const current = await this.getEmailMeta(targetEmail);
    const nowIso = new Date().toISOString();
    const item = {
      ...current,
      targetEmail,
      registeredAt: normalizeIsoDate(body.registeredAt) || current.registeredAt || "",
      productStatus,
      productStatusLabel: productStatus ? "成品/已出" : "",
      productStatusAt: productStatus ? nowIso : "",
      updatedAt: nowIso,
    };
    await this.state.storage.put(`email:${targetEmail}`, item);
    return item;
  }

  async scanDue() {
    if (this.scanning) return;
    this.scanning = true;
    try {
      const now = Date.now();
      const inboxInterval = Number(getEnv(this.env, "INBOX_INTERVAL_SECONDS", DEFAULT_INBOX_INTERVAL_SECONDS)) * 1000;
      const junkInterval = Number(getEnv(this.env, "JUNK_INTERVAL_SECONDS", DEFAULT_JUNK_INTERVAL_SECONDS)) * 1000;
      const lastInbox = Number((await this.state.storage.get("meta:lastInboxCheck")) || 0);
      const lastJunk = Number((await this.state.storage.get("meta:lastJunkCheck")) || 0);

      if (now - lastInbox >= inboxInterval) {
        await this.scanMailbox("INBOX").catch((error) => this.storeError("INBOX", error));
        await this.state.storage.put("meta:lastInboxCheck", Date.now());
      }

      if (now - lastJunk >= junkInterval) {
        for (const mailbox of ["Junk", "Spam"]) {
          await this.scanMailbox(mailbox).catch((error) => {
            if (isMissingMailboxError(error)) return this.state.storage.delete(`error:${mailbox}`);
            return this.storeError(mailbox, error);
          });
        }
        await this.state.storage.put("meta:lastJunkCheck", Date.now());
      }

      await this.pruneOldRecords();
    } finally {
      this.scanning = false;
    }
  }

  async scanMailbox(source) {
    const imapUser = getEnv(this.env, "HME_IMAP_USER", "");
    const imapPassword = getEnv(this.env, "HME_IMAP_PASSWORD", "");
    const imapHost = getEnv(this.env, "IMAP_HOST", DEFAULT_IMAP_HOST);
    const imapPort = Number(getEnv(this.env, "IMAP_PORT", DEFAULT_IMAP_PORT));
    const maxMessages = Number(getEnv(this.env, "MAX_RECENT_MESSAGES", DEFAULT_MAX_RECENT_MESSAGES));
    const recentMinutes = Number(getEnv(this.env, "RECENT_MINUTES", DEFAULT_RECENT_MINUTES));

    if (!imapUser || !imapPassword) throw new Error("Missing HME_IMAP_USER or HME_IMAP_PASSWORD");

    const client = await createImapClient(imapHost, imapPort);
    try {
      await client.expectGreeting();
      await client.command(`LOGIN ${quoteImap(imapUser)} ${quoteImap(imapPassword)}`);
      await client.command(`SELECT ${quoteImap(source)}`);
      const uids = await searchLatestUids(client, maxMessages, recentMinutes);
      for (const uid of uids) {
        await this.processUid(client, source.toUpperCase() === "JUNK" || source.toUpperCase() === "SPAM" ? "JUNK" : "INBOX", uid, imapUser);
      }
    } finally {
      await client.close().catch(() => {});
    }
  }

  async processUid(client, source, uid, imapUser) {
    const processedKey = `processed:${source}:${uid}`;
    if (await this.state.storage.get(processedKey)) return;

    const fetchText = await client.command(`UID FETCH ${uid} (UID BODY.PEEK[])`);
    const rawMessage = extractFetchMessage(fetchText);
    if (!rawMessage) return;

    const headers = parseHeaders(rawMessage);
    const emailTime = parseMailDate(headers.date);
    const recentMs = Number(getEnv(this.env, "RECENT_MINUTES", DEFAULT_RECENT_MINUTES)) * 60000;
    if (!emailTime || Date.now() - emailTime > recentMs) return;
    if (!isOpenAiSender(headers) && !isTruthy(getEnv(this.env, "ALLOW_NON_OPENAI_TEST_MAIL", "false"))) return;

    const subject = decodeMimeWords(headers.subject || "");
    const from = decodeMimeWords(headers.from || "");
    const body = extractTextBody(rawMessage);
    const code = extractSixDigitCode(`${subject}\n${body}\n${rawMessage}`);
    if (!code) return;

    const targetEmail = extractTargetEmail(headers, rawMessage, imapUser);
    if (!targetEmail) return;

    const record = {
      uid: `${source}:${uid}`,
      targetEmail,
      code,
      subject,
      from,
      emailDate: new Date(emailTime).toISOString(),
      emailDateChina: formatChinaTime(emailTime),
      source,
      matchedSessionId: "",
      createdAt: new Date().toISOString(),
    };

    const matchedSessions = await this.matchWaitingSessions(record);
    if (matchedSessions.length) record.matchedSessionId = matchedSessions.map((session) => session.sessionId).join(",");
    await this.state.storage.put(`code:${record.uid}`, record);
    await this.state.storage.put(processedKey, new Date().toISOString());
  }

  async matchWaitingSessions(record) {
    const sessions = await this.state.storage.list({ prefix: "session:" });
    const emailTime = Date.parse(record.emailDate);
    const now = Date.now();
    const matched = [];

    for (const [key, session] of sessions) {
      if (session.status !== "waiting") continue;
      if (session.targetEmail !== record.targetEmail) continue;
      if (Date.parse(session.expiresAt) <= now) {
        session.status = "expired";
        await this.state.storage.put(key, session);
        continue;
      }
      if (emailTime < Date.parse(session.startTime) - 30000) continue;

      session.status = "success";
      session.code = record.code;
      session.subject = record.subject;
      session.emailDate = record.emailDate;
      session.source = record.source;
      session.matchedAt = new Date().toISOString();
      await this.state.storage.put(key, session);
      matched.push(session);
    }

    return matched;
  }

  async matchExistingCode(session) {
    const displayMs = Number(getEnv(this.env, "CODE_DISPLAY_MINUTES", "10")) * 60000;
    const minTime = Date.now() - displayMs;
    const maxTime = Date.parse(session.expiresAt);
    const rows = Array.from((await this.state.storage.list({ prefix: "code:" })).values())
      .filter((item) => item.targetEmail === session.targetEmail && item.code)
      .filter((item) => {
        const emailTime = Date.parse(item.emailDate || 0);
        return emailTime >= minTime && emailTime <= maxTime;
      })
      .sort((a, b) => Date.parse(b.emailDate || 0) - Date.parse(a.emailDate || 0));

    const latest = rows[0];
    if (!latest) return;

    session.status = "success";
    session.code = latest.code;
    session.subject = latest.subject;
    session.emailDate = latest.emailDate;
    session.source = latest.source;
    session.matchedAt = new Date().toISOString();
    latest.matchedSessionId = session.sessionId;
    await this.state.storage.put(`code:${latest.uid}`, latest);
  }

  async listCodes({ onlyWithCode, search, limit }) {
    const rows = Array.from((await this.state.storage.list({ prefix: "code:" })).values());
    const now = Date.now();
    const displayMs = Number(getEnv(this.env, "CODE_DISPLAY_MINUTES", "10")) * 60000;
    const visible = rows
      .filter((item) => {
        const itemTime = Date.parse(item.emailDate || item.createdAt || 0);
        return itemTime && itemTime >= now - displayMs;
      })
      .filter((item) => !onlyWithCode || item.code)
      .filter((item) => {
        if (!search) return true;
        return [item.targetEmail, item.code, item.subject, item.from, item.source].join(" ").toLowerCase().includes(search);
      })
      .sort((a, b) => Date.parse(b.emailDate || b.createdAt || 0) - Date.parse(a.emailDate || a.createdAt || 0))
      .slice(0, limit);

    return Promise.all(
      visible.map(async (item) => ({
        ...item,
        accessUrl: await this.accessUrlForEmail(item.targetEmail),
      }))
    );
  }

  async listManagedEmails({ search, limit, missingOnly }) {
    const tokens = Array.from((await this.state.storage.list({ prefix: "token:" })).values());
    const codes = Array.from((await this.state.storage.list({ prefix: "code:" })).values());
    const sessions = Array.from((await this.state.storage.list({ prefix: "session:" })).values());
    const metas = Array.from((await this.state.storage.list({ prefix: "email:" })).values());
    const map = new Map();

    const ensureRow = (targetEmail) => {
      const email = String(targetEmail || "").trim().toLowerCase();
      if (!/^[a-z0-9._%+-]+@icloud\.com$/i.test(email)) return null;
      if (!map.has(email)) {
        map.set(email, {
          targetEmail: email,
          label: "",
          registeredAt: "",
          registeredAtSource: "",
          productStatus: "",
          productStatusLabel: "",
          productStatusAt: "",
          hasToken: false,
          tokenCount: 0,
          tokenCreatedAt: "",
          accessUrl: "",
          latestCode: "",
          latestCodeAt: "",
          latestCodeSource: "",
          latestCodeSubject: "",
          latestSessionStatus: "",
          latestSessionAt: "",
          missingToken: true,
        });
      }
      return map.get(email);
    };

    for (const meta of metas) {
      const row = ensureRow(meta.targetEmail);
      if (!row) continue;
      if (meta.registeredAt) {
        row.registeredAt = meta.registeredAt;
        row.registeredAtSource = "后台标记";
      }
      row.productStatus = meta.productStatus || "";
      row.productStatusLabel = meta.productStatusLabel || "";
      row.productStatusAt = meta.productStatusAt || "";
    }

    for (const token of tokens) {
      if (!token) continue;
      const row = ensureRow(token.targetEmail);
      if (!row) continue;
      const registeredAt = token.registeredAt || token.createdAt || "";
      const registeredTime = Date.parse(registeredAt || 0);
      const currentRegisteredTime = Date.parse(row.registeredAt || 0);
      if (registeredTime && (!currentRegisteredTime || registeredTime < currentRegisteredTime)) {
        row.registeredAt = registeredAt;
        row.registeredAtSource = token.registeredAt ? "邮箱注册时间" : "链接创建时间";
      }
      if (token.revokedAt) continue;
      row.hasToken = true;
      row.missingToken = false;
      row.tokenCount += 1;
      if (!row.label && token.label) row.label = token.label;
      const tokenTime = Date.parse(token.resetAt || token.createdAt || 0);
      const currentTime = Date.parse(row.tokenCreatedAt || 0);
      if (tokenTime >= currentTime) {
        row.tokenCreatedAt = token.resetAt || token.createdAt || "";
        row.accessUrl = `${getEnv(this.env, "PUBLIC_RECEIVER_BASE_URL", "https://icloudd.cc.cd").replace(/\/+$/, "")}/code/${token.accessToken}`;
      }
    }

    for (const item of codes) {
      const row = ensureRow(item.targetEmail);
      if (!row) continue;
      const itemTime = Date.parse(item.emailDate || item.createdAt || 0);
      const currentTime = Date.parse(row.latestCodeAt || 0);
      if (item.code && itemTime >= currentTime) {
        row.latestCode = item.code;
        row.latestCodeAt = item.emailDate || item.createdAt || "";
        row.latestCodeSource = item.source || "";
        row.latestCodeSubject = item.subject || "";
      }
    }

    for (const session of sessions) {
      const row = ensureRow(session.targetEmail);
      if (!row) continue;
      if (!row.label && session.label) row.label = session.label;
      const sessionTime = Date.parse(session.matchedAt || session.startTime || 0);
      const currentTime = Date.parse(row.latestSessionAt || 0);
      if (sessionTime >= currentTime) {
        row.latestSessionStatus = session.status || "";
        row.latestSessionAt = session.matchedAt || session.startTime || "";
      }
    }

    const activityTime = (row) => Math.max(
      Date.parse(row.latestCodeAt || 0) || 0,
      Date.parse(row.latestSessionAt || 0) || 0,
      Date.parse(row.productStatusAt || 0) || 0,
      Date.parse(row.registeredAt || 0) || 0,
      Date.parse(row.tokenCreatedAt || 0) || 0
    );
    const allRows = Array.from(map.values()).sort((a, b) => {
      if (a.missingToken !== b.missingToken) return a.missingToken ? -1 : 1;
      return activityTime(b) - activityTime(a) || a.targetEmail.localeCompare(b.targetEmail);
    });
    const summary = {
      totalEmails: allRows.length,
      withToken: allRows.filter((row) => row.hasToken).length,
      missingToken: allRows.filter((row) => row.missingToken).length,
      withRecentCode: allRows.filter((row) => row.latestCode).length,
      finishedOrOut: allRows.filter((row) => row.productStatus === "out").length,
    };
    const filtered = allRows
      .filter((row) => !missingOnly || row.missingToken)
      .filter((row) => {
        if (!search) return true;
        return [
          row.targetEmail,
          row.label,
          row.latestCode,
          row.latestCodeSubject,
          row.latestCodeSource,
          row.latestSessionStatus,
          row.productStatusLabel || row.productStatus,
          row.registeredAtSource,
        ].join(" ").toLowerCase().includes(search);
      });

    return { items: filtered.slice(0, limit), total: filtered.length, summary };
  }

  async accessUrlForEmail(targetEmail) {
    const rows = Array.from((await this.state.storage.list({ prefix: "token:" })).values())
      .filter((item) => item.targetEmail === targetEmail && !item.revokedAt)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    const token = rows[0]?.accessToken || "";
    if (!token) return "";
    return `${getEnv(this.env, "PUBLIC_RECEIVER_BASE_URL", "https://icloudd.cc.cd").replace(/\/+$/, "")}/code/${token}`;
  }

  async listSessions(limit) {
    const rows = Array.from((await this.state.storage.list({ prefix: "session:" })).values());
    return rows
      .sort((a, b) => Date.parse(b.startTime || 0) - Date.parse(a.startTime || 0))
      .slice(0, limit)
      .map(({ accessTokenHash, ...session }) => session);
  }

  async listAccessTokens(limit) {
    const rows = Array.from((await this.state.storage.list({ prefix: "token:" })).values());
    return rows
      .filter((item) => !item.revokedAt)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0))
      .slice(0, limit);
  }

  async countByPrefix(prefix) {
    return (await this.state.storage.list({ prefix })).size;
  }

  async pruneOldRecords() {
    const now = Date.now();
    const codeTtlMs = Number(getEnv(this.env, "CODE_TTL_MINUTES", getEnv(this.env, "CODE_DISPLAY_MINUTES", "10"))) * 60000;
    const sessionTtlMs = Number(getEnv(this.env, "SESSION_HISTORY_HOURS", 6)) * 3600000;
    const processedTtlMs = Number(getEnv(this.env, "PROCESSED_TTL_HOURS", 24)) * 3600000;

    for (const [key, item] of await this.state.storage.list({ prefix: "code:" })) {
      if (Date.parse(item.createdAt || item.emailDate || 0) < now - codeTtlMs) await this.state.storage.delete(key);
    }
    for (const [key, item] of await this.state.storage.list({ prefix: "session:" })) {
      if (Date.parse(item.startTime || 0) < now - sessionTtlMs) await this.state.storage.delete(key);
    }
    for (const [key, value] of await this.state.storage.list({ prefix: "processed:" })) {
      if (Date.parse(value || 0) < now - processedTtlMs) await this.state.storage.delete(key);
    }
  }

  async storeError(source, error) {
    await this.state.storage.put(`error:${source}`, { source, error: String(error), at: new Date().toISOString() });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    ctx.waitUntil(startMailWorker(env));

    if (url.pathname === "/api/login") return login(request, env);
    if (url.pathname === "/api/logout") return logout();

    if (url.pathname === "/api/session" && request.method === "POST") {
      return mailWorkerFetch(env, "/session", request);
    }

    if (url.pathname === "/api/code") return mailWorkerFetch(env, `/code${url.search}`, request);

    if (url.pathname === "/api/admin/tokens") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized", tokens: [] }, 401);
      return mailWorkerFetch(env, `/admin/tokens${url.search}`, request);
    }

    if (url.pathname === "/api/admin/tokens/reset") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
      return mailWorkerFetch(env, "/admin/tokens/reset", request);
    }

    if (url.pathname === "/api/admin/emails") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized", items: [] }, 401);
      return mailWorkerFetch(env, `/admin/emails${url.search}`);
    }

    if (url.pathname === "/api/admin/emails/ensure-token") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
      return mailWorkerFetch(env, "/admin/emails/ensure-token", request);
    }

    if (url.pathname === "/api/admin/emails/status") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
      return mailWorkerFetch(env, "/admin/emails/status", request);
    }

    if (url.pathname === "/api/admin/codes") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized", items: [] }, 401);
      return mailWorkerFetch(env, `/admin/codes${url.search}`);
    }

    if (url.pathname === "/api/admin/sessions") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized", sessions: [] }, 401);
      return mailWorkerFetch(env, `/admin/sessions${url.search}`);
    }

    if (url.pathname === "/api/admin/status") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
      return mailWorkerFetch(env, "/admin/status");
    }

    if (url.pathname === "/api/config") {
      return json({
        ok: true,
        poll_interval_seconds: Number(getEnv(env, "POLL_INTERVAL_SECONDS", DEFAULT_POLL_INTERVAL_SECONDS)),
        session_ttl_seconds: Number(getEnv(env, "SESSION_TTL_SECONDS", DEFAULT_SESSION_TTL_SECONDS)),
      });
    }

    if (url.pathname === "/api/all" || url.pathname === "/all.json") {
      if (!(await hasPanelSession(request, env))) return json({ ok: false, error: "Unauthorized", results: [] }, 401);
      const proxy = await mailWorkerFetch(env, `/admin/codes${url.search || "?limit=50&onlyWithCode=1"}`);
      const data = await proxy.json();
      return json({ ok: data.ok, results: data.items || [], count: (data.items || []).length, poll_interval_seconds: data.poll_interval_seconds || 10 });
    }

    if (url.pathname === "/api/latest" || url.pathname === "/latest") {
      return json({ ok: false, error: "Deprecated endpoint" }, 410);
    }

    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/all") {
      return html(await hasPanelSession(request, env) ? CENTRAL_HTML : LOGIN_HTML);
    }

    if (url.pathname === "/admin/emails" || url.pathname === "/emails") {
      return html(await hasPanelSession(request, env) ? EMAILS_HTML : LOGIN_HTML);
    }

    if (url.pathname.startsWith("/code/")) {
      return html(INDEPENDENT_HTML);
    }

    if (url.pathname.startsWith("/e/")) {
      return json({ ok: false, error: "Deprecated link format" }, 410);
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(startMailWorker(env));
  },
};

async function startMailWorker(env) {
  return mailWorkerFetch(env, "/start");
}

async function mailWorkerFetch(env, path, originalRequest = null) {
  const id = env.MAIL_WORKER.idFromName("global-mail-worker");
  const stub = env.MAIL_WORKER.get(id);
  const init = originalRequest
    ? { method: originalRequest.method, headers: originalRequest.headers, body: originalRequest.body }
    : undefined;
  return stub.fetch(new Request(`https://mail-worker.local${path}`, init));
}

async function searchLatestUids(client, maxMessages, recentMinutes = DEFAULT_RECENT_MINUTES) {
  const since = formatImapDate(new Date(Date.now() - Number(recentMinutes || DEFAULT_RECENT_MINUTES) * 60000));
  const attempts = [`UID SEARCH SINCE ${since}`, "UID SEARCH ALL"];
  for (const command of attempts) {
    const text = await client.command(command);
    const ids = parseSearchIds(text);
    if (ids.length) return ids.slice(-maxMessages).reverse();
  }
  return [];
}

async function createImapClient(hostname, port) {
  const socket = connect({ hostname, port }, { secureTransport: "on" });
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let tagNo = 1;
  let buffer = "";

  async function readChunk() {
    const { value, done } = await reader.read();
    if (done) throw new Error("IMAP connection closed");
    return decoder.decode(value, { stream: true });
  }

  async function readUntilTagged(tag) {
    while (!buffer.includes(`\r\n${tag} `) && !buffer.startsWith(`${tag} `)) {
      buffer += await readChunk();
    }
    const marker = buffer.startsWith(`${tag} `) ? `${tag} ` : `\r\n${tag} `;
    const markerIndex = buffer.indexOf(marker);
    const afterMarker = markerIndex + marker.length;
    while (buffer.indexOf("\r\n", afterMarker) === -1) buffer += await readChunk();
    const finalEnd = buffer.indexOf("\r\n", afterMarker);
    const output = buffer.slice(0, finalEnd + 2);
    buffer = buffer.slice(finalEnd + 2);
    if (!output.includes(`${tag} OK`)) throw new Error(`IMAP command failed: ${output.slice(-500)}`);
    return output;
  }

  return {
    async expectGreeting() {
      while (!buffer.includes("\r\n")) buffer += await readChunk();
      const lineEnd = buffer.indexOf("\r\n");
      const greeting = buffer.slice(0, lineEnd);
      buffer = buffer.slice(lineEnd + 2);
      if (!greeting.includes("OK")) throw new Error(`Bad IMAP greeting: ${greeting}`);
    },
    async command(commandText) {
      const tag = `A${String(tagNo++).padStart(4, "0")}`;
      await writer.write(encoder.encode(`${tag} ${commandText}\r\n`));
      return readUntilTagged(tag);
    },
    async close() {
      try {
        const tag = `A${String(tagNo++).padStart(4, "0")}`;
        await writer.write(encoder.encode(`${tag} LOGOUT\r\n`));
      } finally {
        writer.releaseLock();
        reader.releaseLock();
        socket.close();
      }
    },
  };
}

function extractFetchMessage(fetchText) {
  const literalMatch = fetchText.match(/\{(\d+)\}\r\n/);
  if (!literalMatch) return "";
  const start = literalMatch.index + literalMatch[0].length;
  const length = Number(literalMatch[1]);
  return fetchText.slice(start, start + length);
}

function parseSearchIds(searchText) {
  const match = searchText.match(/\* SEARCH ([^\r\n]*)/);
  if (!match || !match[1].trim()) return [];
  return match[1].trim().split(/\s+/).filter(Boolean);
}

function parseHeaders(rawMessage) {
  const headerText = rawMessage.split(/\r?\n\r?\n/, 1)[0] || "";
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
  const headers = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index <= 0) continue;
    const name = line.slice(0, index).toLowerCase();
    const value = line.slice(index + 1).trim();
    if (!headers[name]) headers[name] = value;
  }
  return headers;
}

function extractTextBody(rawMessage) {
  const headers = parseHeaders(rawMessage);
  const parts = rawMessage.split(/\r?\n\r?\n/);
  const body = parts.slice(1).join("\n\n");
  const contentType = (headers["content-type"] || "").toLowerCase();
  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const chunks = body.split(`--${boundary}`);
    const textParts = [];
    for (const chunk of chunks) {
      const normalized = chunk.trim();
      if (!normalized || normalized === "--") continue;
      const chunkHeaders = parseHeaders(normalized);
      const chunkBody = normalized.split(/\r?\n\r?\n/).slice(1).join("\n\n");
      const chunkType = (chunkHeaders["content-type"] || "").toLowerCase();
      const encoding = (chunkHeaders["content-transfer-encoding"] || "").toLowerCase();
      if (chunkType.includes("text/plain") || chunkType.includes("text/html")) {
        const decoded = decodeTransfer(chunkBody, encoding);
        textParts.push(chunkType.includes("text/html") ? stripHtml(decoded) : decoded.trim());
      }
    }
    if (textParts.length) return textParts.join("\n").trim();
  }
  const encoding = (headers["content-transfer-encoding"] || "").toLowerCase();
  const decoded = decodeTransfer(body, encoding);
  return contentType.includes("text/html") ? stripHtml(decoded) : decoded.trim();
}

function decodeTransfer(value, encoding) {
  if (encoding.includes("base64")) {
    try {
      const bytes = Uint8Array.from(atob(value.replace(/\s+/g, "")), (c) => c.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return value;
    }
  }
  if (encoding.includes("quoted-printable")) return decodeQuotedPrintable(value);
  return value;
}

function decodeQuotedPrintable(value) {
  const compact = value.replace(/=\r?\n/g, "");
  const bytes = [];
  for (let i = 0; i < compact.length; i++) {
    if (compact[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(compact.slice(i + 1, i + 3))) {
      bytes.push(parseInt(compact.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(compact.charCodeAt(i));
    }
  }
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeMimeWords(value) {
  return String(value || "").replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g, (_all, charset, mode, text) => {
    try {
      let bytes;
      if (mode.toUpperCase() === "B") {
        bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
      } else {
        bytes = Uint8Array.from(decodeQuotedPrintable(text.replace(/_/g, " ")), (c) => c.charCodeAt(0));
      }
      return new TextDecoder(charset).decode(bytes);
    } catch {
      return text;
    }
  });
}

function extractSixDigitCode(value) {
  const text = String(value || "");
  const contextualPatterns = [
    /(?:enter\s+(?:this\s+)?temporary\s+verification\s+code\s+to\s+continue|temporary\s+(?:chatgpt\s+)?verification\s+code|verification\s+code|openai\s+code\s+is|code\s+is)\D{0,80}(\d{6})/i,
    /(?:\u8f93\u5165\u6b64\u4e34\u65f6\u9a8c\u8bc1\u7801\u4ee5\u7ee7\u7eed|\u4e34\u65f6\s*ChatGPT\s*\u767b\u5f55\u4ee3\u7801|OpenAI\s*\u4ee3\u7801\u4e3a|\u9a8c\u8bc1\u7801|\u4ee3\u7801)\D{0,80}(\d{6})/i,
  ];
  for (const pattern of contextualPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  const fallback = text.match(/\b\d{6}\b/);
  return fallback ? fallback[0] : "";
}

function isOpenAiSender(headers) {
  const from = decodeMimeWords(headers.from || "").toLowerCase();
  return /openai|chatgpt|@openai\.com|openai\.com/.test(from);
}

function extractTargetEmail(headers, rawMessage, imapUser) {
  const haystack = [
    headers.to || "",
    headers["delivered-to"] || "",
    headers["x-original-to"] || "",
    headers["apparently-to"] || "",
    rawMessage,
  ].join("\n");
  const emails = Array.from(new Set((haystack.match(/[a-z0-9._%+-]+@icloud\.com/gi) || []).map((x) => x.toLowerCase())));
  const user = String(imapUser || "").toLowerCase();
  return emails.find((email) => email !== user) || "";
}

function quoteImap(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function formatImapDate(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getUTCDate()}-${months[date.getUTCMonth()]}-${date.getUTCFullYear()}`;
}

function parseMailDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatChinaTime(time) {
  return new Date(time).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}

async function login(request, env) {
  const panelPassword = getPanelPassword(env);
  if (!panelPassword) return json({ ok: false, error: "Missing panel password" }, 500);
  const contentType = request.headers.get("content-type") || "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    password = String(body.password || "");
  } else {
    const form = await request.formData().catch(() => null);
    password = form ? String(form.get("password") || "") : "";
  }
  if (!(await timingSafeEqualText(password, panelPassword))) return json({ ok: false, error: "密码不正确" }, 401);
  const token = await sessionToken(env);
  return json({ ok: true }, 200, {
    "set-cookie": `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
  });
}

function logout() {
  return json({ ok: true }, 200, {
    "set-cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  });
}

async function hasPanelSession(request, env) {
  const cookie = getCookie(request.headers.get("cookie") || "", SESSION_COOKIE);
  if (!cookie) return false;
  return timingSafeEqualText(cookie, await sessionToken(env));
}

async function sessionToken(env) {
  return sha256Hex([getPanelPassword(env), getEnv(env, "HME_IMAP_PASSWORD", ""), getEnv(env, "HME_IMAP_USER", ""), "panel-v2"].join(":"));
}

function getPanelPassword(env) {
  return getEnv(env, "PANEL_PASSWORD", getEnv(env, "HME_PANEL_PASSWORD", ""));
}

function getCookie(cookieHeader, name) {
  for (const part of String(cookieHeader || "").split(/;\s*/)) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index) === name) return part.slice(index + 1);
  }
  return "";
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function timingSafeEqualText(left, right) {
  return constantTimeEqualHex(await sha256Hex(left), await sha256Hex(right));
}

function constantTimeEqualHex(left, right) {
  left = String(left || "");
  right = String(right || "");
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

function getEnv(env, name, fallback = "") {
  return env && env[name] !== undefined && env[name] !== null ? String(env[name]) : fallback;
}

function isTruthy(value) {
  return /^(1|true|yes|on)$/i.test(String(value || ""));
}

function isMissingMailboxError(error) {
  return /NONEXISTENT|Mailbox does not exist/i.test(String(error || ""));
}

function normalizeAccessToken(value) {
  const token = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{48}$/.test(token) ? token : "";
}

function normalizeIsoDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const time = Date.parse(text);
  if (!Number.isFinite(time)) return "";
  return new Date(time).toISOString();
}

function resolveAccessToken(value) {
  const token = String(value || "").trim().toLowerCase();
  const exact = normalizeAccessToken(token);
  if (exact) return exact;
  const prefix = token.match(/^[a-f0-9]{48}/)?.[0] || "";
  return prefix;
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicSession(session) {
  const { accessTokenHash, ...safeSession } = session || {};
  return safeSession;
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function html(value) {
  return new Response(value, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
