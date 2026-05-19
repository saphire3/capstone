window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<pre style="color:#be123c;padding:20px;white-space:pre-wrap;background:#fff0f5;">JS ERROR:\n${msg}\n${src}:${line}:${col}\n${err?.stack || ""}</pre>`;
};

const { useEffect, useMemo, useState, useCallback, useRef } = React;

function useHashRoute(defaultRoute = "/login") {
  const [hash, setHash] = useState(() => window.location.hash || `#${defaultRoute}`);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || `#${defaultRoute}`);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [defaultRoute]);
  const route = useMemo(() => (hash || "").replace("#", ""), [hash]);
  return { route, go: (r) => (window.location.hash = `#${r}`) };
}

const TOKEN_KEY = "pg_token";
const saveToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || (text && text.slice(0, 200)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function Alert({ type = "error", children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

function Field({ label, required: isRequired, optional, ...props }) {
  return (
    <div className="field">
      <label className="label">
        {label}
        {isRequired && <span style={{ color: "#be123c", marginLeft: 3 }}>*</span>}
        {optional && <span style={{ color: "var(--gray-400)", fontSize: 11, marginLeft: 5 }}>(optional)</span>}
      </label>
      <input className="input" {...props} />
    </div>
  );
}

function PasswordField({ label, required: isRequired, optional, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="label">
        {label}
        {isRequired && <span style={{ color: "#be123c", marginLeft: 3 }}>*</span>}
        {optional && <span style={{ color: "var(--gray-400)", fontSize: 11, marginLeft: 5 }}>(optional)</span>}
      </label>
      <div className="pw-input-wrapper">
        <input className="input" type={show ? "text" : "password"}
          value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete} />
        <button type="button" className="pw-eye-btn" onClick={() => setShow(s => !s)} tabIndex={-1} title={show ? "Hide password" : "Show password"}>
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function ScissorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
}

function AvatarCircle({ username, size = 44 }) {
  const letter = (username || "?")[0].toUpperCase();
  const src = username ? localStorage.getItem(`pg_avatar_${username}`) : null;
  if (src) {
    return (
      <img src={src} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        flexShrink: 0, cursor: "pointer", boxShadow: "0 2px 8px rgba(233,30,99,0.25)"
      }} alt={username} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--pink-400), var(--pink-600))",
      color: "white", fontWeight: 700, fontSize: Math.round(size * 0.4),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 2px 8px rgba(233,30,99,0.25)", cursor: "pointer"
    }}>{letter}</div>
  );
}

const iconStroke = { fill: "none", stroke: "currentColor", strokeWidth: "3.5", strokeLinejoin: "round", strokeLinecap: "round" };
const iconLine   = { stroke: "currentColor", strokeWidth: "3.5", strokeLinecap: "round" };

function TopsGroupIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 28 C 42 39 58 39 63 28 L 70 25 L 84 22 L 86 43 L 75 47 L 70 40 L 70 78 L 30 78 L 30 40 L 25 47 L 14 43 L 16 22 L 30 25 Z"/>
      <line x1="30" y1="40" x2="30" y2="60"/><line x1="70" y1="40" x2="70" y2="60"/>
    </svg>
  );
}

function BottomsGroupIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 20 20 L 80 20 L 80 80 L 58 80 L 52 42 L 48 42 L 42 80 L 20 80 Z"/>
    </svg>
  );
}

function TShirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 28 C 42 39 58 39 63 28 L 70 25 L 84 22 L 86 43 L 75 47 L 70 40 L 70 78 L 30 78 L 30 40 L 25 47 L 14 43 L 16 22 L 30 25 Z"/>
      <line x1="30" y1="40" x2="30" y2="60"/><line x1="70" y1="40" x2="70" y2="60"/>
    </svg>
  );
}

function SleevelessIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 38 27 C 43 36 57 36 62 27 L 65 24 C 73 27 78 36 78 47 C 78 57 73 63 68 66 L 68 78 L 32 78 L 32 66 C 27 63 22 57 22 47 C 22 36 27 27 35 24 Z"/>
    </svg>
  );
}

function PantsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 20 20 L 80 20 L 80 80 L 58 80 L 52 42 L 48 42 L 42 80 L 20 80 Z"/>
    </svg>
  );
}

function ShortsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 18 25 L 82 25 L 82 60 L 60 60 L 52 36 L 48 36 L 40 60 L 18 60 Z"/>
    </svg>
  );
}
function SkirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 30 28 L 70 28 L 78 68 C 64 72 50 74 50 74 C 36 72 22 68 22 68 Z"/>
      <line x1="28" y1="38" x2="72" y2="38"/>
    </svg>
  );
}
function JacketIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M22 16 C26 23 33 27 40 27 C47 27 54 23 58 16 L68 26 L58 32 L58 66 L22 66 L22 32 L12 26 Z" {...iconStroke}/>
      <line x1="40" y1="27" x2="40" y2="66" {...iconLine}/>
      <line x1="22" y1="45" x2="40" y2="45" {...iconLine}/>
    </svg>
  );
}
function FootwearIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M14 54 L14 34 C14 30 18 26 24 26 L32 26 C34 26 36 28 36 30 L36 40 L58 40 C64 40 66 44 66 48 L66 54 C66 58 62 60 58 60 L20 60 C16 60 14 58 14 54 Z" {...iconStroke}/>
    </svg>
  );
}
function HeadwearIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 46 C20 33 28 22 40 22 C52 22 60 33 60 46 Z" {...iconStroke}/>
      <line x1="13" y1="46" x2="67" y2="46" {...iconLine}/>
      <path d="M13 46 C13 52 17 54 20 54 L52 54" stroke="var(--pink-500)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function DressIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M29 12 C32 17 36 20 40 20 C44 20 48 17 51 12 L58 22 L52 28 L57 68 L23 68 L28 28 L22 22 Z" {...iconStroke}/>
    </svg>
  );
}
function CoatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 14 C24 21 32 26 40 26 C48 26 56 21 60 14 L70 24 L60 30 L60 72 L20 72 L20 30 L10 24 Z" {...iconStroke}/>
      <line x1="40" y1="26" x2="40" y2="72" {...iconLine}/>
      <line x1="20" y1="50" x2="40" y2="50" {...iconLine}/>
    </svg>
  );
}
function UnderwearIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M14 20 L66 20 L60 56 L48 56 L44 32 L36 32 L32 56 L20 56 Z" {...iconStroke}/>
    </svg>
  );
}
function ShapewearIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M28 10 C32 16 36 20 40 20 C44 20 48 16 52 10 L56 16 L56 46 L50 60 L44 60 L42 36 L38 36 L36 60 L30 60 L24 46 L24 16 Z" {...iconStroke}/>
    </svg>
  );
}
function LongSleeveIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 27 C 42 37 58 37 63 27 L 70 24 L 86 30 L 86 78 L 14 78 L 14 30 L 30 24 Z"/>
      <line x1="30" y1="36" x2="30" y2="78"/><line x1="70" y1="36" x2="70" y2="78"/>
    </svg>
  );
}
function CropTopIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 30 C 42 41 58 41 63 30 L 70 27 L 84 24 L 86 45 L 75 49 L 70 42 L 70 64 L 30 64 L 30 42 L 25 49 L 14 45 L 16 24 L 30 27 Z"/>
      <line x1="30" y1="42" x2="30" y2="56"/><line x1="70" y1="42" x2="70" y2="56"/>
    </svg>
  );
}
function VNeckIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 27 L 50 44 L 63 27 L 70 24 L 84 21 L 86 42 L 75 46 L 70 39 L 70 78 L 30 78 L 30 39 L 25 46 L 14 42 L 16 21 L 30 24 Z"/>
      <line x1="30" y1="39" x2="30" y2="59"/><line x1="70" y1="39" x2="70" y2="59"/>
    </svg>
  );
}
function HoodieIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 18 C24 25 31 30 40 30 C49 30 56 25 60 18 L70 28 L60 34 L60 66 L20 66 L20 34 L10 28 Z" {...iconStroke}/>
      <path d="M31 18 C33 14 37 12 40 12 C43 12 47 14 49 18" stroke="var(--pink-500)" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function JoggersIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M16 12 L64 12 L64 58 L54 58 L52 64 L48 64 L44 30 L36 30 L32 64 L28 64 L26 58 L16 58 Z" {...iconStroke}/>
    </svg>
  );
}
function LeggingsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 22 20 L 78 20 C 78 30 76 38 74 46 C 72 54 76 62 76 70 C 76 76 72 80 68 82 L 58 82 L 52 44 L 48 44 L 42 82 L 32 82 C 28 80 24 76 24 70 C 24 62 28 54 26 46 C 24 38 22 30 22 20 Z"/>
    </svg>
  );
}
function MiniSkirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 30 32 L 70 32 L 76 62 C 62 66 50 68 50 68 C 38 66 24 62 24 62 Z"/>
      <line x1="28" y1="42" x2="72" y2="42"/>
    </svg>
  );
}
function MidiSkirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M27 16 L53 16 L62 60 L18 60 Z" {...iconStroke}/>
      <line x1="25" y1="24" x2="55" y2="24" {...iconLine}/>
    </svg>
  );
}
function MaxiSkirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M27 10 L53 10 L66 72 L14 72 Z" {...iconStroke}/>
      <line x1="25" y1="18" x2="55" y2="18" {...iconLine}/>
    </svg>
  );
}
function PleatedSkirtIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M27 12 L53 12 L64 68 L16 68 Z" {...iconStroke}/>
      <line x1="25" y1="22" x2="55" y2="22" {...iconLine}/>
      <line x1="33" y1="23" x2="30" y2="65" {...iconLine}/>
      <line x1="40" y1="23" x2="40" y2="65" {...iconLine}/>
      <line x1="47" y1="23" x2="50" y2="65" {...iconLine}/>
    </svg>
  );
}
function BomberJacketIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M22 18 C26 24 33 28 40 28 C47 28 54 24 58 18 L68 28 L58 34 L58 56 L22 56 L22 34 L12 28 Z" {...iconStroke}/>
      <line x1="20" y1="60" x2="60" y2="60" {...iconLine}/>
    </svg>
  );
}
function BlazerIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M22 16 C26 20 32 22 36 22 L40 30 L44 22 C48 22 54 20 58 16 L68 26 L58 32 L58 66 L22 66 L22 32 L12 26 Z" {...iconStroke}/>
      <line x1="40" y1="30" x2="40" y2="66" {...iconLine}/>
    </svg>
  );
}
function DenimJacketIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M22 16 C26 23 33 27 40 27 C47 27 54 23 58 16 L68 26 L58 32 L58 58 L22 58 L22 32 L12 26 Z" {...iconStroke}/>
      <line x1="22" y1="44" x2="58" y2="44" {...iconLine}/>
    </svg>
  );
}
function PufferJacketIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 18 C24 26 33 30 40 30 C47 30 56 26 60 18 L72 30 L60 38 L60 66 L20 66 L20 38 L8 30 Z" {...iconStroke}/>
      <line x1="20" y1="46" x2="60" y2="46" {...iconLine}/>
      <line x1="20" y1="54" x2="60" y2="54" {...iconLine}/>
    </svg>
  );
}
function MiniDressIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M30 12 C33 17 36 20 40 20 C44 20 47 17 50 12 L57 20 L52 26 L56 52 L24 52 L28 26 L23 20 Z" {...iconStroke}/>
    </svg>
  );
}
function MidiDressIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M30 12 C33 17 36 20 40 20 C44 20 47 17 50 12 L57 20 L52 26 L57 62 L23 62 L28 26 L23 20 Z" {...iconStroke}/>
    </svg>
  );
}
function MaxiDressIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M30 10 C33 15 36 18 40 18 C44 18 47 15 50 10 L58 18 L52 24 L60 72 L20 72 L28 24 L22 18 Z" {...iconStroke}/>
    </svg>
  );
}
function WrapDressIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M30 12 C33 17 36 20 40 20 L45 26 C49 20 54 16 58 12 L57 22 L52 28 L57 68 L23 68 L28 28 L22 22 Z" {...iconStroke}/>
      <line x1="40" y1="20" x2="28" y2="68" {...iconLine}/>
    </svg>
  );
}
function TrenchCoatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 14 C24 21 32 26 40 26 C48 26 56 21 60 14 L70 24 L60 30 L60 72 L20 72 L20 30 L10 24 Z" {...iconStroke}/>
      <line x1="26" y1="42" x2="54" y2="42" {...iconLine}/>
      <line x1="40" y1="26" x2="40" y2="72" {...iconLine}/>
    </svg>
  );
}
function PeaCoatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M22 14 C26 20 32 22 36 22 L40 28 L44 22 C48 22 54 20 58 14 L68 24 L58 30 L58 66 L22 66 L22 30 L12 24 Z" {...iconStroke}/>
      <line x1="40" y1="28" x2="40" y2="66" {...iconLine}/>
    </svg>
  );
}
function PufferCoatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 14 C24 22 33 26 40 26 C47 26 56 22 60 14 L72 26 L60 34 L60 72 L20 72 L20 34 L8 26 Z" {...iconStroke}/>
      <line x1="20" y1="44" x2="60" y2="44" {...iconLine}/>
      <line x1="20" y1="54" x2="60" y2="54" {...iconLine}/>
      <line x1="20" y1="64" x2="60" y2="64" {...iconLine}/>
    </svg>
  );
}
function BootsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M28 14 L36 14 L36 50 L52 50 C60 50 64 54 64 60 L64 66 L18 66 L18 60 C18 56 20 54 24 54 L28 54 Z" {...iconStroke}/>
    </svg>
  );
}
function SandalsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M14 56 L66 56 L66 64 L14 64 Z" {...iconStroke}/>
      <line x1="28" y1="56" x2="34" y2="36" {...iconLine}/>
      <line x1="52" y1="56" x2="46" y2="36" {...iconLine}/>
      <line x1="30" y1="46" x2="50" y2="46" {...iconLine}/>
    </svg>
  );
}
function HeelsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M16 56 C20 42 30 34 44 34 L62 34 L62 44 L44 44 C34 44 26 50 24 56 Z" {...iconStroke}/>
      <line x1="16" y1="56" x2="16" y2="66" {...iconLine}/>
      <line x1="12" y1="66" x2="46" y2="66" {...iconLine}/>
    </svg>
  );
}
function BaseballCapIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M18 42 C18 28 27 20 40 20 C53 20 62 28 62 42 Z" {...iconStroke}/>
      <line x1="16" y1="42" x2="64" y2="42" {...iconLine}/>
      <path d="M40 42 L68 44 C70 44 70 50 68 50 L40 48" stroke="var(--pink-500)" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function BeanieIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M18 46 C18 28 27 16 40 16 C53 16 62 28 62 46 Z" {...iconStroke}/>
      <line x1="14" y1="46" x2="66" y2="46" {...iconLine}/>
      <line x1="14" y1="52" x2="66" y2="52" {...iconLine}/>
    </svg>
  );
}
function BucketHatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M28 20 L52 20 L56 44 L24 44 Z" {...iconStroke}/>
      <path d="M16 44 L18 54 L62 54 L64 44 Z" {...iconStroke}/>
    </svg>
  );
}
function WideBrimHatIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M30 22 L50 22 L54 40 L26 40 Z" {...iconStroke}/>
      <path d="M10 40 C10 50 22 56 40 56 C58 56 70 50 70 40 Z" {...iconStroke}/>
    </svg>
  );
}
function BraletteIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M16 38 C16 30 22 24 30 24 C38 24 40 36 40 38 C40 36 42 24 50 24 C58 24 64 30 64 38 Z" {...iconStroke}/>
      <line x1="14" y1="38" x2="66" y2="38" {...iconLine}/>
      <line x1="28" y1="24" x2="26" y2="14" {...iconLine}/>
      <line x1="52" y1="24" x2="54" y2="14" {...iconLine}/>
    </svg>
  );
}
function SportsBraIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M18 40 C18 30 24 24 32 24 C40 24 40 36 40 40 C40 36 40 24 48 24 C56 24 62 30 62 40 Z" {...iconStroke}/>
      <line x1="16" y1="40" x2="64" y2="40" {...iconLine}/>
      <line x1="26" y1="24" x2="26" y2="12" {...iconLine}/>
      <line x1="54" y1="24" x2="54" y2="12" {...iconLine}/>
      <line x1="26" y1="12" x2="54" y2="12" {...iconLine}/>
    </svg>
  );
}
function BoxersIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M14 20 L66 20 L60 58 L48 58 L44 36 L36 36 L32 58 L20 58 Z" {...iconStroke}/>
      <line x1="12" y1="28" x2="68" y2="28" {...iconLine}/>
    </svg>
  );
}
function CorsetIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M26 10 L54 10 L60 28 L52 44 L58 62 L22 62 L28 44 L20 28 Z" {...iconStroke}/>
      <line x1="40" y1="10" x2="40" y2="62" {...iconLine}/>
      <line x1="30" y1="22" x2="50" y2="22" {...iconLine}/>
      <line x1="28" y1="44" x2="52" y2="44" {...iconLine}/>
    </svg>
  );
}
function ShapingShortsIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 20 L60 20 L58 52 L46 52 L42 32 L38 32 L34 52 L22 52 Z" {...iconStroke}/>
    </svg>
  );
}
function FullBodyShaperIcon({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M28 10 C32 16 36 20 40 20 C44 20 48 16 52 10 L56 16 L56 50 L50 66 L44 66 L42 36 L38 36 L36 66 L30 66 L24 50 L24 16 Z" {...iconStroke}/>
    </svg>
  );
}

const CATEGORY_GROUPS = [
  { label: "Tops",       labelKey: "cat.TOPS",      icon: TopsGroupIcon,    value: "TOPS" },
  { label: "Bottoms",    labelKey: "cat.BOTTOMS",   icon: BottomsGroupIcon, value: "BOTTOMS" },
  { label: "Skirts",     labelKey: "cat.SKIRTS",    icon: SkirtIcon,        value: "SKIRTS" },
  { label: "Jackets",    labelKey: "cat.JACKETS",   icon: JacketIcon,       value: "JACKETS" },
  { label: "Dresses",    labelKey: "cat.DRESSES",   icon: DressIcon,        value: "DRESSES" },
  { label: "Coats",      labelKey: "cat.COATS",     icon: CoatIcon,         value: "COATS" },
  { label: "Footwear",   labelKey: "cat.FOOTWEAR",  icon: FootwearIcon,     value: "FOOTWEAR" },
  { label: "Headwear",   labelKey: "cat.HEADWEAR",  icon: HeadwearIcon,     value: "HEADWEAR" },
  { label: "Underwear",  labelKey: "cat.UNDERWEAR", icon: UnderwearIcon,    value: "UNDERWEAR" },
  { label: "Shapewear",  labelKey: "cat.SHAPEWEAR", icon: ShapewearIcon,    value: "SHAPEWEAR" },
];

const CLOTHING_TYPES = [
  { value: "T_SHIRT",          label: "T-Shirt",           icon: TShirtIcon,        group: "Tops" },
  { value: "SLEEVELESS_TOP",   label: "Sleeveless Top",    icon: SleevelessIcon,    group: "Tops" },
  { value: "LONG_SLEEVE",      label: "Long Sleeve",       icon: LongSleeveIcon,    group: "Tops" },
  { value: "CROP_TOP",         label: "Crop Top",          icon: CropTopIcon,       group: "Tops" },
  { value: "BLOUSE",           label: "Blouse",            icon: VNeckIcon,         group: "Tops" },
  { value: "HOODIE",           label: "Hoodie",            icon: HoodieIcon,        group: "Tops" },
  { value: "REGULAR_PANTS",    label: "Regular Pants",     icon: PantsIcon,         group: "Bottoms" },
  { value: "SHORTS",           label: "Shorts",            icon: ShortsIcon,        group: "Bottoms" },
  { value: "JOGGERS",          label: "Joggers",           icon: JoggersIcon,       group: "Bottoms" },
  { value: "LEGGINGS",         label: "Leggings",          icon: LeggingsIcon,      group: "Bottoms" },
  { value: "MINI_SKIRT",       label: "Mini Skirt",        icon: MiniSkirtIcon,     group: "Skirts" },
  { value: "MIDI_SKIRT",       label: "Midi Skirt",        icon: MidiSkirtIcon,     group: "Skirts" },
  { value: "MAXI_SKIRT",       label: "Maxi Skirt",        icon: MaxiSkirtIcon,     group: "Skirts" },
  { value: "PLEATED_SKIRT",    label: "Pleated Skirt",     icon: PleatedSkirtIcon,  group: "Skirts" },
  { value: "BOMBER_JACKET",    label: "Bomber Jacket",     icon: BomberJacketIcon,  group: "Jackets" },
  { value: "BLAZER",           label: "Blazer",            icon: BlazerIcon,        group: "Jackets" },
  { value: "DENIM_JACKET",     label: "Denim Jacket",      icon: DenimJacketIcon,   group: "Jackets" },
  { value: "PUFFER_JACKET",    label: "Puffer Jacket",     icon: PufferJacketIcon,  group: "Jackets" },
  { value: "MINI_DRESS",       label: "Mini Dress",        icon: MiniDressIcon,     group: "Dresses" },
  { value: "MIDI_DRESS",       label: "Midi Dress",        icon: MidiDressIcon,     group: "Dresses" },
  { value: "MAXI_DRESS",       label: "Maxi Dress",        icon: MaxiDressIcon,     group: "Dresses" },
  { value: "WRAP_DRESS",       label: "Wrap Dress",        icon: WrapDressIcon,     group: "Dresses" },
  { value: "TRENCH_COAT",      label: "Trench Coat",       icon: TrenchCoatIcon,    group: "Coats" },
  { value: "PEA_COAT",         label: "Pea Coat",          icon: PeaCoatIcon,       group: "Coats" },
  { value: "OVERCOAT",         label: "Overcoat",          icon: CoatIcon,          group: "Coats" },
  { value: "PUFFER_COAT",      label: "Puffer Coat",       icon: PufferCoatIcon,    group: "Coats" },
  { value: "SNEAKERS",         label: "Sneakers",          icon: FootwearIcon,      group: "Footwear" },
  { value: "BOOTS",            label: "Boots",             icon: BootsIcon,         group: "Footwear" },
  { value: "SANDALS",          label: "Sandals",           icon: SandalsIcon,       group: "Footwear" },
  { value: "HEELS",            label: "Heels",             icon: HeelsIcon,         group: "Footwear" },
  { value: "BASEBALL_CAP",     label: "Baseball Cap",      icon: BaseballCapIcon,   group: "Headwear" },
  { value: "BEANIE",           label: "Beanie",            icon: BeanieIcon,        group: "Headwear" },
  { value: "BUCKET_HAT",       label: "Bucket Hat",        icon: BucketHatIcon,     group: "Headwear" },
  { value: "WIDE_BRIM_HAT",    label: "Wide Brim Hat",     icon: WideBrimHatIcon,   group: "Headwear" },
  { value: "BRIEFS",           label: "Briefs",            icon: UnderwearIcon,     group: "Underwear" },
  { value: "BOXERS",           label: "Boxers",            icon: BoxersIcon,        group: "Underwear" },
  { value: "BRALETTE",         label: "Bralette",          icon: BraletteIcon,      group: "Underwear" },
  { value: "SPORTS_BRA",       label: "Sports Bra",        icon: SportsBraIcon,     group: "Underwear" },
  { value: "BODYSUIT",         label: "Bodysuit",          icon: ShapewearIcon,     group: "Shapewear" },
  { value: "CORSET",           label: "Corset",            icon: CorsetIcon,        group: "Shapewear" },
  { value: "SHAPING_SHORTS",   label: "Shaping Shorts",    icon: ShapingShortsIcon, group: "Shapewear" },
  { value: "FULL_BODY_SHAPER", label: "Full Body Shaper",  icon: FullBodyShaperIcon,group: "Shapewear" },
];

const CLOTHING_SIZES = ["XXS","XS","S","M","L","XL","XXL","XXXL"];

const SIZE_RANGES = {
  XXS:  { chest:[72,84],   shoulder:[34,40], waist:[54,67],   hip:[78,91],   outseam:[79,106] },
  XS:   { chest:[80,91],   shoulder:[36,43], waist:[60,73],   hip:[84,97],   outseam:[83,109] },
  S:    { chest:[84,97],   shoulder:[37,45], waist:[64,78],   hip:[88,103],  outseam:[86,111] },
  M:    { chest:[92,109],  shoulder:[39,48], waist:[70,89],   hip:[94,113],  outseam:[89,113] },
  L:    { chest:[100,121], shoulder:[41,51], waist:[78,101],  hip:[102,125], outseam:[91,115] },
  XL:   { chest:[108,133], shoulder:[43,54], waist:[86,113],  hip:[110,137], outseam:[92,116] },
  XXL:  { chest:[116,146], shoulder:[44,57], waist:[94,126],  hip:[118,150], outseam:[93,117] },
  XXXL: { chest:[128,162], shoulder:[46,60], waist:[106,142], hip:[130,166], outseam:[94,118] },
};

const BODY_SHAPES = [
  { value: "hourglass", labelKey: "shape.hourglass", label: "Hourglass",          desc: "Chest ≈ hip, significantly narrower waist" },
  { value: "pear",      labelKey: "shape.pear",      label: "Pear",               desc: "Hips noticeably wider than chest" },
  { value: "apple",     labelKey: "shape.apple",     label: "Apple",              desc: "Fuller midsection, narrower hips" },
  { value: "rectangle", labelKey: "shape.rectangle", label: "Rectangle / Straight",desc: "Chest, waist, hip roughly equal" },
  { value: "inverted",  labelKey: "shape.inverted",  label: "Inverted Triangle",  desc: "Chest/shoulders wider than hips" },
];

const ALL_MEASUREMENT_FIELDS = [
  { code: "CHEST",          label: "Chest (cm)" },
  { code: "SHOULDER_WIDTH", label: "Shoulder Width (cm)" },
  { code: "SHIRT_LENGTH",   label: "Shirt Length (cm)" },
  { code: "SLEEVE_LENGTH",  label: "Sleeve Length (cm)" },
  { code: "WAIST",          label: "Waist (cm)" },
  { code: "HIP",            label: "Hip (cm)" },
  { code: "OUTSEAM",        label: "Outseam (cm)" },
  { code: "NECK",           label: "Neck (cm)" },
  { code: "ARMHOLE_DEPTH",  label: "Armhole Depth (cm)" },
  { code: "BICEP",          label: "Bicep (cm)" },
];

const PATTERN_FIELDS_BY_CATEGORY = {
  TOPS:      { required: ["CHEST","SHOULDER_WIDTH","SHIRT_LENGTH"],           optional: ["NECK","ARMHOLE_DEPTH","BICEP"] },
  BOTTOMS:   { required: ["WAIST","HIP","OUTSEAM"],                           optional: [] },
  SKIRTS:    { required: ["WAIST","HIP"],                                     optional: ["SHIRT_LENGTH"] },
  DRESSES:   { required: ["CHEST","WAIST","HIP","SHIRT_LENGTH"],              optional: ["SHOULDER_WIDTH","SLEEVE_LENGTH","NECK"] },
  JACKETS:   { required: ["CHEST","SHOULDER_WIDTH","SHIRT_LENGTH"],           optional: ["SLEEVE_LENGTH","WAIST","NECK"] },
  COATS:     { required: ["CHEST","SHOULDER_WIDTH","SHIRT_LENGTH"],           optional: ["SLEEVE_LENGTH","WAIST","HIP","NECK"] },
  UNDERWEAR: { required: ["CHEST","WAIST","HIP"],                             optional: [] },
  SHAPEWEAR: { required: ["CHEST","WAIST","HIP"],                             optional: [] },
  FOOTWEAR:  { required: [],                                                   optional: [] },
  HEADWEAR:  { required: [],                                                   optional: [] },
};
function getPatternFieldConfig(pattern) {
  const cfg = pattern ? PATTERN_FIELDS_BY_CATEGORY[pattern.category] : null;
  if (!cfg) {
    const codes = ALL_MEASUREMENT_FIELDS.map(f => f.code);
    return { required: [], optional: codes };
  }
  const shown = [...cfg.required, ...cfg.optional];
  return { required: cfg.required, optional: cfg.optional, shown };
}

const BODY_SHAPE_RATIOS = {
  hourglass: { wCh:[0.60,0.82], hCh:[0.92,1.14] },
  pear:      { wCh:[0.67,0.91], hCh:[1.04,1.38] },
  apple:     { wCh:[0.82,1.08], hCh:[0.84,1.10] },
  rectangle: { wCh:[0.75,0.97], hCh:[0.87,1.13] },
  inverted:  { wCh:[0.67,0.90], hCh:[0.76,1.04] },
};

function measurementsFromSize(size, shape) {
  const sr = SIZE_RANGES[size]; if (!sr) return {};
  const mid = r => Math.round((r[0] + r[1]) / 2);
  const chest = mid(sr.chest), shoulder = mid(sr.shoulder), outseam = mid(sr.outseam);
  const bsr = BODY_SHAPE_RATIOS[shape];
  const wMid = bsr ? (bsr.wCh[0] + bsr.wCh[1]) / 2 : 0.86;
  const hMid = bsr ? (bsr.hCh[0] + bsr.hCh[1]) / 2 : 1.00;
  return {
    CHEST: chest,
    SHOULDER_WIDTH: shoulder,
    WAIST: Math.round(chest * wMid),
    HIP: Math.round(chest * hMid),
    OUTSEAM: outseam,
    SHIRT_LENGTH: Math.round(outseam * 0.62),
    SLEEVE_LENGTH: Math.round(chest * 0.46),
  };
}

const MENU_CATS = CATEGORY_GROUPS.map(g => ({ label: g.label, labelKey: g.labelKey, value: g.value, icon: g.icon }));

function getMeasurementWarnings(vals, { clothingSize = null, bodyShape = null } = {}) {
  const warns = [];
  const g = k => (vals[k] !== "" && vals[k] != null && !isNaN(Number(vals[k]))) ? Number(vals[k]) : null;
  const chest = g("CHEST"), shoulder = g("SHOULDER_WIDTH"), shirtLen = g("SHIRT_LENGTH"),
        sleeve = g("SLEEVE_LENGTH"), waist = g("WAIST"), hip = g("HIP"), outseam = g("OUTSEAM");

  const sr = clothingSize ? SIZE_RANGES[clothingSize] : null;
  if (sr) {
    if (chest    !== null && (chest    < sr.chest[0]    || chest    > sr.chest[1]))    warns.push(`Chest (${chest} cm) is outside the expected range for size ${clothingSize} (${sr.chest[0]}–${sr.chest[1]} cm)`);
    if (shoulder !== null && (shoulder < sr.shoulder[0] || shoulder > sr.shoulder[1])) warns.push(`Shoulder (${shoulder} cm) is outside the expected range for size ${clothingSize} (${sr.shoulder[0]}–${sr.shoulder[1]} cm)`);
    if (waist    !== null && (waist    < sr.waist[0]    || waist    > sr.waist[1]))    warns.push(`Waist (${waist} cm) is outside the expected range for size ${clothingSize} (${sr.waist[0]}–${sr.waist[1]} cm)`);
    if (hip      !== null && (hip      < sr.hip[0]      || hip      > sr.hip[1]))      warns.push(`Hip (${hip} cm) is outside the expected range for size ${clothingSize} (${sr.hip[0]}–${sr.hip[1]} cm)`);
    if (outseam  !== null && (outseam  < sr.outseam[0]  || outseam  > sr.outseam[1]))  warns.push(`Outseam (${outseam} cm) is outside the expected range for size ${clothingSize} (${sr.outseam[0]}–${sr.outseam[1]} cm)`);
  }

  const bsr = bodyShape ? BODY_SHAPE_RATIOS[bodyShape] : null;
  const shapeName = BODY_SHAPES.find(b => b.value === bodyShape)?.label || bodyShape;
  if (bsr) {
    if (chest && waist) {
      const r = waist / chest;
      if (r < bsr.wCh[0] || r > bsr.wCh[1])
        warns.push(`Waist/chest ratio (${Math.round(r*100)}%) seems unusual for ${shapeName} — expected ${Math.round(bsr.wCh[0]*100)}–${Math.round(bsr.wCh[1]*100)}%`);
    }
    if (chest && hip) {
      const r = hip / chest;
      if (r < bsr.hCh[0] || r > bsr.hCh[1])
        warns.push(`Hip/chest ratio (${Math.round(r*100)}%) seems unusual for ${shapeName} — expected ${Math.round(bsr.hCh[0]*100)}–${Math.round(bsr.hCh[1]*100)}%`);
    }
  }

  if (sleeve !== null && shirtLen !== null && sleeve > shirtLen * 1.2)
    warns.push("Sleeve length exceeds shirt length — please double-check");
  const entered = [chest, shoulder, shirtLen, sleeve, waist, hip, outseam].filter(v => v !== null);
  if (entered.length >= 3) {
    const max = Math.max(...entered), min = Math.min(...entered);
    if (max > 55 && (max - min) / max < 0.12)
      warns.push("All measurements are nearly identical — unlikely for a real body. Please verify.");
  }

  return warns;
}

function MeasurementWarnings({ vals, clothingSize, bodyShape }) {
  const warns = getMeasurementWarnings(vals, { clothingSize, bodyShape });
  if (!warns.length) return null;
  return (
    <div style={{ marginTop: 10, display: "grid", gap: 4 }}>
      {warns.map((w, i) => (
        <div key={i} style={{ color: "#be123c", fontSize: 12, display: "flex", gap: 5, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0 }}>⚠</span><span>{w}</span>
        </div>
      ))}
    </div>
  );
}

const TRANSLATIONS = {
  en: {
    "nav.home":"Home","nav.menu":"Menu","nav.generator":"Generator","nav.myPatterns":"My Patterns",
    "nav.admin":"Admin","nav.myAccount":"My Account","nav.logout":"Log out",
    "auth.login":"Log In","auth.signup":"Sign Up","auth.username":"Username",
    "auth.password":"Password","auth.email":"Email","auth.confirmPassword":"Confirm Password",
    "auth.noAccount":"Don't have an account?","auth.haveAccount":"Already have an account?",
    "auth.signIn":"Sign In","auth.createAccount":"Create Account",
    "auth.appName":"Pattern Generator","auth.tagline":"Create custom sewing patterns",
    "auth.joinTagline":"Join Pattern Generator today",
    "gen.chooseType":"Choose Clothing Type","gen.chooseStyle":"Choose a Style",
    "gen.chooseMeasurements":"Choose Measurements","gen.generate":"Generate Pattern",
    "gen.generating":"Generating…","gen.bySize":"By Size & Shape","gen.byCm":"By cm Measurements",
    "gen.useSavedFolder":"Use Saved Folder","gen.enterManually":"Enter Manually",
    "gen.newPattern":"New Pattern","gen.saveAsFolder":"+ Save as folder",
    "gen.folderName":"Folder name","gen.measurementFolder":"Measurement Folder",
    "gen.useDefault":"Use default measurements","gen.back":"← Back",
    "gen.optionalDesc":"Optional — leave blank to use pattern defaults",
    "gen.missingRequired":"Please fill in required fields:",
    "gen.missingFields":"Missing required fields:","gen.defaultsUsed":"— pattern defaults will be used",
    "gen.derivedMeasurements":"Derived measurements:","gen.clothingSize":"Clothing Size","gen.bodyShape":"Body Shape",
    "meas.CHEST":"Chest (cm)","meas.SHOULDER_WIDTH":"Shoulder Width (cm)",
    "meas.SHIRT_LENGTH":"Shirt Length (cm)","meas.SLEEVE_LENGTH":"Sleeve Length (cm)",
    "meas.WAIST":"Waist (cm)","meas.HIP":"Hip (cm)","meas.OUTSEAM":"Outseam (cm)",
    "meas.NECK":"Neck (cm)","meas.ARMHOLE_DEPTH":"Armhole Depth (cm)","meas.BICEP":"Bicep (cm)",
    "save":"Save","cancel":"Cancel","edit":"Edit","delete":"Delete","create":"Create",
    "account.measurements":"Measurements","account.savedPatterns":"Saved Patterns",
    "account.measurementGuide":"Measurement Guide","account.newFolder":"+ New Folder",
    "account.noFolders":"No folders yet","account.createFirst":"Click + above to create one",
    "home.welcome":"Welcome back","home.quickStart":"Quick Start",
    "home.heroTitle":"Your Custom Sewing Patterns",
    "home.heroDesc":"Pick a clothing type, enter your measurements, and get a pattern made for you.",
    "home.createPattern":"Create a Pattern","home.myMeasurements":"My Measurements","home.adminDashboard":"Admin Dashboard",
    "home.howItWorks":"How it works","home.recentlyUsed":"Recently Used","home.popularPatterns":"Popular Patterns",
    "home.noPatterns":"No patterns yet","home.noPatternsDesc":"Generate your first pattern to see it here","home.startNow":"Start now",
    "home.step1Title":"Save Measurements","home.step1Desc":"Create a named folder with your body measurements.",
    "home.step2Title":"Choose a Pattern","home.step2Desc":"Browse t-shirts, pants, shorts and more.",
    "home.step3Title":"Generate","home.step3Desc":"Get a custom pattern adjusted to your exact size.",
    "home.step4Title":"Sew!","home.step4Desc":"Use the SVG output and measurements to cut fabric.",
    "account.viewInfo":"View info ▼","account.hideInfo":"Hide info ▲",
    "account.fullName":"Full Name","account.nickname":"Nickname / Display Name","account.phoneNumber":"Phone Number",
    "account.email":"Email","account.role":"Role",
    "account.editFolderTitle":"Edit Folder","account.newFolderTitle":"New Folder","account.folderName":"Folder Name",
    "account.useInGenerator":"Use in Generator","account.updateFolder":"Update Folder","account.createFolderBtn":"Create Folder",
    "account.noSavedPatterns":"No saved patterns yet","account.noSavedDesc":"Generate a pattern and click \"💾 Save\"",
    "account.generatePattern":"Generate a Pattern","account.viewAll":"View all →","account.download":"🖨 Download",
    "account.viewAllCount":"View all {n} patterns →",
    "meas.defaultTitle":"Default Measurements","meas.defaultDesc":"Used when generating patterns without a named folder.",
    "meas.backAccount":"← Account","meas.loadSaved":"Load Saved","meas.clear":"Clear",
    "profiles.title":"Measurement Folders","profiles.desc":"Save named sets of measurements for different people or use cases.",
    "profiles.editFolder":"Edit Folder","profiles.newFolderTitle":"New Folder",
    "profiles.noFolders":"No measurement folders yet","profiles.noFoldersDesc":"Create a folder to save measurements for a person",
    "profiles.createFirst":"Create First Folder","profiles.noMeasurements":"No measurements saved","profiles.use":"Use",
    "patterns.title":"My Saved Patterns","patterns.desc":"All patterns you've generated and saved. Re-download anytime.",
    "patterns.noPatterns":"No saved patterns yet","patterns.noDesc":"Generate a pattern and click \"💾 Save\" to store it here.",
    "patterns.generatePattern":"Generate a Pattern","patterns.saved":"Saved","patterns.measurementsUsed":"Measurements used:",
    "patterns.patternPieces":"Pattern pieces:","patterns.downloadZip":"🖨 Download ZIP",
    "admin.title":"Admin Dashboard","admin.desc":"Manage users and clothing patterns.",
    "admin.stats":"Statistics","admin.patternsTab":"Patterns","admin.usersTab":"Users","admin.accessDenied":"Access denied. Admin only.",
    "auth.firstName":"First Name","auth.lastName":"Last Name","auth.phoneNumber":"Phone Number",
    "auth.passwordsMatch":"Passwords match ✓","auth.passwordsNoMatch":"Passwords do not match",
    "auth.passwordsNoMatchErr":"Passwords do not match. Please try again.",
    "auth.repeatPassword":"Repeat your password","auth.confirmPasswordLabel":"Confirm Password",
    "auth.chooseName":"Choose a username","auth.enterEmail":"you@example.com","auth.createPassword":"Create a password",
    "auth.firstNamePh":"e.g. Narine","auth.lastNamePh":"e.g. Petrosyan","auth.phonePh":"e.g. +1 555 123 4567",
    "loading":"Loading…",
    "cat.TOPS":"Tops","cat.BOTTOMS":"Bottoms","cat.SKIRTS":"Skirts","cat.JACKETS":"Jackets",
    "cat.DRESSES":"Dresses","cat.COATS":"Coats","cat.FOOTWEAR":"Footwear","cat.HEADWEAR":"Headwear",
    "cat.UNDERWEAR":"Underwear","cat.SHAPEWEAR":"Shapewear",
    "type.T_SHIRT":"T-Shirt","type.SLEEVELESS_TOP":"Sleeveless Top","type.LONG_SLEEVE":"Long Sleeve",
    "type.CROP_TOP":"Crop Top","type.BLOUSE":"Blouse","type.HOODIE":"Hoodie",
    "type.REGULAR_PANTS":"Regular Pants","type.SHORTS":"Shorts","type.JOGGERS":"Joggers","type.LEGGINGS":"Leggings",
    "type.MINI_SKIRT":"Mini Skirt","type.MIDI_SKIRT":"Midi Skirt","type.MAXI_SKIRT":"Maxi Skirt","type.PLEATED_SKIRT":"Pleated Skirt",
    "type.BOMBER_JACKET":"Bomber Jacket","type.BLAZER":"Blazer","type.DENIM_JACKET":"Denim Jacket","type.PUFFER_JACKET":"Puffer Jacket",
    "type.MINI_DRESS":"Mini Dress","type.MIDI_DRESS":"Midi Dress","type.MAXI_DRESS":"Maxi Dress","type.WRAP_DRESS":"Wrap Dress",
    "type.TRENCH_COAT":"Trench Coat","type.PEA_COAT":"Pea Coat","type.OVERCOAT":"Overcoat","type.PUFFER_COAT":"Puffer Coat",
    "type.SNEAKERS":"Sneakers","type.BOOTS":"Boots","type.SANDALS":"Sandals","type.HEELS":"Heels",
    "type.BASEBALL_CAP":"Baseball Cap","type.BEANIE":"Beanie","type.BUCKET_HAT":"Bucket Hat","type.WIDE_BRIM_HAT":"Wide Brim Hat",
    "type.BRIEFS":"Briefs","type.BOXERS":"Boxers","type.BRALETTE":"Bralette","type.SPORTS_BRA":"Sports Bra",
    "type.BODYSUIT":"Bodysuit","type.CORSET":"Corset","type.SHAPING_SHORTS":"Shaping Shorts","type.FULL_BODY_SHAPER":"Full Body Shaper",
    "shape.hourglass":"Hourglass","shape.pear":"Pear","shape.apple":"Apple",
    "shape.rectangle":"Rectangle / Straight","shape.inverted":"Inverted Triangle",
    "pname.Basic T-Shirt":"Basic T-Shirt","pname.Sleeveless Top":"Sleeveless Top",
    "pname.Oversized Long Sleeve Top":"Oversized Long Sleeve Top","pname.Crop Top":"Crop Top",
    "pname.Blouse":"Blouse","pname.Hoodie":"Hoodie","pname.Regular Pants":"Regular Pants",
    "pname.Shorts":"Shorts","pname.Joggers":"Joggers","pname.Leggings":"Leggings",
    "pname.Mini Skirt":"Mini Skirt","pname.Midi Skirt":"Midi Skirt","pname.Maxi Skirt":"Maxi Skirt","pname.Pleated Skirt":"Pleated Skirt",
    "pname.Bomber Jacket":"Bomber Jacket","pname.Blazer":"Blazer","pname.Denim Jacket":"Denim Jacket","pname.Puffer Jacket":"Puffer Jacket",
    "pname.Mini Dress":"Mini Dress","pname.Midi Dress":"Midi Dress","pname.Maxi Dress":"Maxi Dress","pname.Wrap Dress":"Wrap Dress",
    "pname.Trench Coat":"Trench Coat","pname.Pea Coat":"Pea Coat","pname.Overcoat":"Overcoat","pname.Puffer Coat":"Puffer Coat",
    "pname.Sneakers":"Sneakers","pname.Boots":"Boots","pname.Sandals":"Sandals","pname.Heels":"Heels",
    "pname.Baseball Cap":"Baseball Cap","pname.Beanie":"Beanie","pname.Bucket Hat":"Bucket Hat","pname.Wide Brim Hat":"Wide Brim Hat",
    "pname.Briefs":"Briefs","pname.Boxers":"Boxers","pname.Bralette":"Bralette","pname.Sports Bra":"Sports Bra",
    "pname.Bodysuit":"Bodysuit","pname.Corset":"Corset","pname.Shaping Shorts":"Shaping Shorts","pname.Full Body Shaper":"Full Body Shaper",
  },
  ru: {
    "nav.home":"Главная","nav.menu":"Каталог","nav.generator":"Генератор","nav.myPatterns":"Мои выкройки",
    "nav.admin":"Админ","nav.myAccount":"Мой аккаунт","nav.logout":"Выйти",
    "auth.login":"Войти","auth.signup":"Регистрация","auth.username":"Имя пользователя",
    "auth.password":"Пароль","auth.email":"Эл. почта","auth.confirmPassword":"Подтвердите пароль",
    "auth.noAccount":"Нет аккаунта?","auth.haveAccount":"Уже есть аккаунт?",
    "auth.signIn":"Войти","auth.createAccount":"Создать аккаунт",
    "auth.appName":"Генератор выкроек","auth.tagline":"Создавайте выкройки под ваши мерки",
    "auth.joinTagline":"Зарегистрируйтесь сегодня",
    "gen.chooseType":"Выберите тип одежды","gen.chooseStyle":"Выберите стиль",
    "gen.chooseMeasurements":"Введите мерки","gen.generate":"Сгенерировать выкройку",
    "gen.generating":"Генерация…","gen.bySize":"По размеру и форме","gen.byCm":"По меркам (см)",
    "gen.useSavedFolder":"Сохранённая папка","gen.enterManually":"Ввести вручную",
    "gen.newPattern":"Новая выкройка","gen.saveAsFolder":"+ Сохранить как папку",
    "gen.folderName":"Название папки","gen.measurementFolder":"Папка с мерками",
    "gen.useDefault":"Стандартные мерки","gen.back":"← Назад",
    "gen.optionalDesc":"Необязательно — будут применены значения по умолчанию",
    "gen.missingRequired":"Заполните обязательные поля:",
    "gen.missingFields":"Отсутствующие обязательные поля:","gen.defaultsUsed":"— значения выкройки",
    "gen.derivedMeasurements":"Расчётные мерки:","gen.clothingSize":"Размер одежды","gen.bodyShape":"Тип фигуры",
    "meas.CHEST":"Обхват груди (см)","meas.SHOULDER_WIDTH":"Ширина плеч (см)",
    "meas.SHIRT_LENGTH":"Длина изделия (см)","meas.SLEEVE_LENGTH":"Длина рукава (см)",
    "meas.WAIST":"Обхват талии (см)","meas.HIP":"Обхват бёдер (см)","meas.OUTSEAM":"Длина брюк (см)",
    "meas.NECK":"Обхват шеи (см)","meas.ARMHOLE_DEPTH":"Глубина проймы (см)","meas.BICEP":"Обхват бицепса (см)",
    "save":"Сохранить","cancel":"Отмена","edit":"Редактировать","delete":"Удалить","create":"Создать",
    "account.measurements":"Мерки","account.savedPatterns":"Сохранённые выкройки",
    "account.measurementGuide":"Руководство по меркам","account.newFolder":"+ Новая папка",
    "account.noFolders":"Папок пока нет","account.createFirst":"Нажмите + чтобы создать",
    "home.welcome":"С возвращением","home.quickStart":"Быстрый старт",
    "home.heroTitle":"Выкройки по вашим меркам",
    "home.heroDesc":"Выберите тип одежды, введите мерки — и получите готовую выкройку.",
    "home.createPattern":"Создать выкройку","home.myMeasurements":"Мои мерки","home.adminDashboard":"Панель администратора",
    "home.howItWorks":"Как это работает","home.recentlyUsed":"Недавно использованные","home.popularPatterns":"Популярные выкройки",
    "home.noPatterns":"Выкроек ещё нет","home.noPatternsDesc":"Создайте первую выкройку, чтобы увидеть её здесь","home.startNow":"Начать",
    "home.step1Title":"Сохраните мерки","home.step1Desc":"Создайте именную папку с вашими мерками тела.",
    "home.step2Title":"Выберите выкройку","home.step2Desc":"Просматривайте футболки, брюки, шорты и другое.",
    "home.step3Title":"Генерация","home.step3Desc":"Получите выкройку, скорректированную под ваш размер.",
    "home.step4Title":"Шейте!","home.step4Desc":"Используйте SVG и мерки для раскроя ткани.",
    "account.viewInfo":"Подробнее ▼","account.hideInfo":"Скрыть ▲",
    "account.fullName":"Полное имя","account.nickname":"Псевдоним / отображаемое имя","account.phoneNumber":"Номер телефона",
    "account.email":"Эл. почта","account.role":"Роль",
    "account.editFolderTitle":"Редактировать папку","account.newFolderTitle":"Новая папка","account.folderName":"Название папки",
    "account.useInGenerator":"Использовать в генераторе","account.updateFolder":"Обновить папку","account.createFolderBtn":"Создать папку",
    "account.noSavedPatterns":"Сохранённых выкроек нет","account.noSavedDesc":"Сгенерируйте выкройку и нажмите «💾 Сохранить»",
    "account.generatePattern":"Создать выкройку","account.viewAll":"Смотреть все →","account.download":"🖨 Скачать",
    "account.viewAllCount":"Смотреть все {n} выкроек →",
    "meas.defaultTitle":"Стандартные мерки","meas.defaultDesc":"Используются при генерации без выбранной папки.",
    "meas.backAccount":"← Аккаунт","meas.loadSaved":"Загрузить","meas.clear":"Очистить",
    "profiles.title":"Папки с мерками","profiles.desc":"Сохраняйте именные наборы мерок для разных людей.",
    "profiles.editFolder":"Редактировать папку","profiles.newFolderTitle":"Новая папка",
    "profiles.noFolders":"Папок с мерками ещё нет","profiles.noFoldersDesc":"Создайте папку для сохранения мерок",
    "profiles.createFirst":"Создать первую папку","profiles.noMeasurements":"Мерки не сохранены","profiles.use":"Использовать",
    "patterns.title":"Мои сохранённые выкройки","patterns.desc":"Все сохранённые выкройки. Скачивайте в любое время.",
    "patterns.noPatterns":"Сохранённых выкроек нет","patterns.noDesc":"Сгенерируйте выкройку и нажмите «💾 Сохранить».",
    "patterns.generatePattern":"Создать выкройку","patterns.saved":"Сохранено","patterns.measurementsUsed":"Использованные мерки:",
    "patterns.patternPieces":"Детали выкройки:","patterns.downloadZip":"🖨 Скачать ZIP",
    "admin.title":"Панель администратора","admin.desc":"Управление пользователями и выкройками.",
    "admin.stats":"Статистика","admin.patternsTab":"Выкройки","admin.usersTab":"Пользователи","admin.accessDenied":"Доступ запрещён. Только для администраторов.",
    "auth.firstName":"Имя","auth.lastName":"Фамилия","auth.phoneNumber":"Номер телефона",
    "auth.passwordsMatch":"Пароли совпадают ✓","auth.passwordsNoMatch":"Пароли не совпадают",
    "auth.passwordsNoMatchErr":"Пароли не совпадают. Пожалуйста, попробуйте снова.",
    "auth.repeatPassword":"Повторите пароль","auth.confirmPasswordLabel":"Подтвердите пароль",
    "auth.chooseName":"Выберите имя пользователя","auth.enterEmail":"вы@example.com","auth.createPassword":"Придумайте пароль",
    "auth.firstNamePh":"Например, Анна","auth.lastNamePh":"Например, Иванова","auth.phonePh":"Например, +7 999 123 4567",
    "loading":"Загрузка…",
    "cat.TOPS":"Верх","cat.BOTTOMS":"Низ","cat.SKIRTS":"Юбки","cat.JACKETS":"Куртки",
    "cat.DRESSES":"Платья","cat.COATS":"Пальто","cat.FOOTWEAR":"Обувь","cat.HEADWEAR":"Головные уборы",
    "cat.UNDERWEAR":"Нижнее бельё","cat.SHAPEWEAR":"Корр. бельё",
    "type.T_SHIRT":"Футболка","type.SLEEVELESS_TOP":"Топ без рукавов","type.LONG_SLEEVE":"Лонгслив",
    "type.CROP_TOP":"Кроп-топ","type.BLOUSE":"Блузка","type.HOODIE":"Худи",
    "type.REGULAR_PANTS":"Брюки","type.SHORTS":"Шорты","type.JOGGERS":"Джоггеры","type.LEGGINGS":"Леггинсы",
    "type.MINI_SKIRT":"Мини-юбка","type.MIDI_SKIRT":"Миди-юбка","type.MAXI_SKIRT":"Макси-юбка","type.PLEATED_SKIRT":"Юбка со складками",
    "type.BOMBER_JACKET":"Бомбер","type.BLAZER":"Блейзер","type.DENIM_JACKET":"Джинсовая куртка","type.PUFFER_JACKET":"Пуховик",
    "type.MINI_DRESS":"Мини-платье","type.MIDI_DRESS":"Миди-платье","type.MAXI_DRESS":"Макси-платье","type.WRAP_DRESS":"Платье-запах",
    "type.TRENCH_COAT":"Тренч","type.PEA_COAT":"Бушлат","type.OVERCOAT":"Пальто","type.PUFFER_COAT":"Дутое пальто",
    "type.SNEAKERS":"Кроссовки","type.BOOTS":"Ботинки","type.SANDALS":"Сандалии","type.HEELS":"Туфли на каблуке",
    "type.BASEBALL_CAP":"Бейсболка","type.BEANIE":"Шапка-бини","type.BUCKET_HAT":"Панама","type.WIDE_BRIM_HAT":"Шляпа с полями",
    "type.BRIEFS":"Трусы-слипы","type.BOXERS":"Боксёры","type.BRALETTE":"Бралетт","type.SPORTS_BRA":"Спортивный бра",
    "type.BODYSUIT":"Боди","type.CORSET":"Корсет","type.SHAPING_SHORTS":"Корр. шорты","type.FULL_BODY_SHAPER":"Боди-корсет",
    "shape.hourglass":"Песочные часы","shape.pear":"Груша","shape.apple":"Яблоко",
    "shape.rectangle":"Прямоугольник","shape.inverted":"Перевёрн. треугольник",
    "pname.Basic T-Shirt":"Базовая футболка","pname.Sleeveless Top":"Топ без рукавов",
    "pname.Oversized Long Sleeve Top":"Оверсайз лонгслив","pname.Crop Top":"Кроп-топ",
    "pname.Blouse":"Блузка","pname.Hoodie":"Худи","pname.Regular Pants":"Брюки",
    "pname.Shorts":"Шорты","pname.Joggers":"Джоггеры","pname.Leggings":"Леггинсы",
    "pname.Mini Skirt":"Мини-юбка","pname.Midi Skirt":"Миди-юбка","pname.Maxi Skirt":"Макси-юбка","pname.Pleated Skirt":"Юбка со складками",
    "pname.Bomber Jacket":"Бомбер","pname.Blazer":"Блейзер","pname.Denim Jacket":"Джинсовая куртка","pname.Puffer Jacket":"Пуховик",
    "pname.Mini Dress":"Мини-платье","pname.Midi Dress":"Миди-платье","pname.Maxi Dress":"Макси-платье","pname.Wrap Dress":"Платье-запах",
    "pname.Trench Coat":"Тренч","pname.Pea Coat":"Бушлат","pname.Overcoat":"Пальто","pname.Puffer Coat":"Дутое пальто",
    "pname.Sneakers":"Кроссовки","pname.Boots":"Ботинки","pname.Sandals":"Сандалии","pname.Heels":"Туфли на каблуке",
    "pname.Baseball Cap":"Бейсболка","pname.Beanie":"Шапка-бини","pname.Bucket Hat":"Панама","pname.Wide Brim Hat":"Шляпа с полями",
    "pname.Briefs":"Трусы-слипы","pname.Boxers":"Боксёры","pname.Bralette":"Бралетт","pname.Sports Bra":"Спортивный бра",
    "pname.Bodysuit":"Боди","pname.Corset":"Корсет","pname.Shaping Shorts":"Корр. шорты","pname.Full Body Shaper":"Боди-корсет",
  },
  hy: {
    "nav.home":"Գlxavor","nav.menu":"Կatalog","nav.generator":"Getnerator","nav.myPatterns":"Kaghaparnere",
    "nav.admin":"Admin","nav.myAccount":"Im Hashive","nav.logout":"Durs gal",
    "auth.login":"Moutk","auth.signup":"Granchoum","auth.username":"Ogtageri anoun",
    "auth.password":"Gaghtnabarre","auth.email":"El. posht","auth.confirmPassword":"Hastatel gaghtnabarre",
    "auth.noAccount":"Hashiv chuneks?","auth.haveAccount":"Artchen hashiv ouneks?",
    "auth.signIn":"Moutk gal","auth.createAccount":"Steghtsel hashiv",
    "auth.appName":"Kaghaparneri Getnerator","auth.tagline":"Steghtsets kari kaghaparnere",
    "auth.joinTagline":"Miatsek mez aysor",
    "gen.chooseType":"Entrirem haghousti tesaky","gen.chooseStyle":"Entrirem ouche",
    "gen.chooseMeasurements":"Moutkagrele chaphoomner","gen.generate":"Steghtsel kaghapare",
    "gen.generating":"Steghzvoum e...","gen.bySize":"Yste chaphsi","gen.byCm":"Yste sm-i",
    "gen.useSavedFolder":"Pahpanvatz tghthapanak","gen.enterManually":"Dzerkov moutkagrele",
    "gen.newPattern":"Nor kaghapare","gen.saveAsFolder":"+ Pahel orpes tghthapanak",
    "gen.folderName":"Tghthapanaki anoun","gen.measurementFolder":"Chaphoomneri tghthapanak",
    "gen.useDefault":"Kankhadzrvatz chaphoomner","gen.back":"← Het",
    "gen.optionalDesc":"Kamkantir — kanoghdzagordzvoum en kankhadzrvatz arjekhnere",
    "gen.missingRequired":"Lratsrek partadire dashteri:","gen.missingFields":"Bacayach partadire dashteri:",
    "gen.defaultsUsed":"— kaghapari kankhadzrvatz arjekhnere","gen.derivedMeasurements":"Hashvarkrvatz chaphoomner:",
    "gen.clothingSize":"Haghousti chaphse","gen.bodyShape":"Marmnin dzeve",
    "meas.CHEST":"Kurtsk (sm)","meas.SHOULDER_WIDTH":"Ousneri lopoutyoun (sm)",
    "meas.SHIRT_LENGTH":"Shapiki erkakoutyoun (sm)","meas.SLEEVE_LENGTH":"Tapaki erkakoutyoun (sm)",
    "meas.WAIST":"Gotnakap (sm)","meas.HIP":"Konk (sm)","meas.OUTSEAM":"Kayini erkakoutyoun (sm)",
    "meas.NECK":"Patnots (sm)","meas.ARMHOLE_DEPTH":"Tapetini amka (sm)","meas.BICEP":"Bazoukin (sm)",
    "save":"Pahel","cancel":"Chegharknel","edit":"Khozmbogrel","delete":"Jnjel","create":"Steghtsel",
    "account.measurements":"Chaphoomner","account.savedPatterns":"Pahpanvatz kaghaparnere",
    "account.measurementGuide":"Chaphoomneri oghekhorhoumn",
    "account.newFolder":"+ Nor tghthapanak","account.noFolders":"Tghthapanakner chkan",
    "account.createFirst":"Snmets + steghtselou hamar",
    "home.welcome":"Bari veradarts","home.quickStart":"Aregout meknark",
    "home.heroTitle":"Dzez anhatakan kaghaparnere",
    "home.heroDesc":"Entrirem haghousti tesiake, moutkagreke chaphoomner — steghtsets kaghapare",
    "home.createPattern":"Steghtsel kaghapare","home.myMeasurements":"Im chaphoomner",
    "home.adminDashboard":"Administratori vanel",
    "home.howItWorks":"Inchpes e ashkhatoum","home.recentlyUsed":"Verjins ogtagordzvatzner",
    "home.popularPatterns":"Haghtecoghakan kaghaparnere",
    "home.noPatterns":"Kaghaparnere chkan","home.noPatternsDesc":"Steghtsets dzer arachein kaghapare tesneloo",
    "home.startNow":"Sksek hima",
    "home.step1Title":"Pahel chaphoomner","home.step1Desc":"Steghtsets anvamov tghthapanak dzer chaphoomneri hamar",
    "home.step2Title":"Entrirem kaghapare","home.step2Desc":"Detratranets shapikner, sharovarnere yev ayn:",
    "home.step3Title":"Steghtsel","home.step3Desc":"Steghtsets kaghapare dzez harchakavats chaphoomneri hamar",
    "home.step4Title":"Karkeq!","home.step4Desc":"Ogtagordzek SVG-e yev chaphoomnere gortsi hamar",
    "account.viewInfo":"Tesnel manouramastouttunere ▼","account.hideInfo":"Tsatkel ▲",
    "account.fullName":"Amboghjakan anoun","account.nickname":"Makanamoun / caradzagan anoun",
    "account.phoneNumber":"Herakhosi hamere",
    "account.email":"El. posht","account.role":"Derand",
    "account.editFolderTitle":"Khozmbogrel tghthapanake","account.newFolderTitle":"Nor tghthapanak",
    "account.folderName":"Tghthapanaki anoun",
    "account.useInGenerator":"Ogtagordzel getneratoroum","account.updateFolder":"Tarnagel tghthapanake",
    "account.createFolderBtn":"Steghtsel tghthapanak",
    "account.noSavedPatterns":"Pahpanvatz kaghaparnere chkan",
    "account.noSavedDesc":"Steghtsets kaghapare yev snmets «Pahel»",
    "account.generatePattern":"Steghtsel kaghapare","account.viewAll":"Tesnel berbure ->",
    "account.download":"Bejnatrel",
    "account.viewAllCount":"Tesnel berbure {n} kaghaparnere ->",
    "meas.defaultTitle":"Kankhadzrvatz chaphoomner",
    "meas.defaultDesc":"Ogtagordzvoum en tghthapanak ynchouche steghtselouts",
    "meas.backAccount":"<- Hashiv","meas.loadSaved":"Berbel pahpanvatze","meas.clear":"Maghrel",
    "profiles.title":"Chaphoomneri tghthapanakner",
    "profiles.desc":"Pahpanets anvamov chaphoomneri havakoumner tarberagouyn andzants hamar",
    "profiles.editFolder":"Khozmbogrel tghthapanake","profiles.newFolderTitle":"Nor tghthapanak",
    "profiles.noFolders":"Tghthapanakner chkan",
    "profiles.noFoldersDesc":"Steghtsets tghthapanak chaphoomner pahpanelou hamar",
    "profiles.createFirst":"Steghtsel arachein tghthapanake",
    "profiles.noMeasurements":"Chaphoomner pahpanvatz chkan","profiles.use":"Ogtagordzel",
    "patterns.title":"Im pahpanvatz kaghaparnere",
    "patterns.desc":"Berbur pahpanvatz kaghaparnere. Bejnatrek yekas bolor zhame",
    "patterns.noPatterns":"Pahpanvatz kaghaparnere chkan",
    "patterns.noDesc":"Steghtsets kaghapare yev snmets «Pahel».",
    "patterns.generatePattern":"Steghtsel kaghapare","patterns.saved":"Pahpanvatz",
    "patterns.measurementsUsed":"Ogtagordzatz chaphoomner:","patterns.patternPieces":"Kaghapari masere:",
    "patterns.downloadZip":"Bejnatrel ZIP",
    "admin.title":"Administratori vanel","admin.desc":"Karoum e ogtatirounery yev kaghaparnere",
    "admin.stats":"Vichakagnere","admin.patternsTab":"Kaghaparnere","admin.usersTab":"Ogtatirounere",
    "admin.accessDenied":"Moutke artgelvatz e. Miayene administratorneri hamar.",
    "auth.firstName":"Anoun","auth.lastName":"Azganoun","auth.phoneNumber":"Herakhosi hamere",
    "auth.passwordsMatch":"Gaghtnabarrnere nooyn en",
    "auth.passwordsNoMatch":"Gaghtnabarrnere chehn nooyn",
    "auth.passwordsNoMatchErr":"Gaghtnabarrnere chehn nooyn. Ktampek kanee meghin.",
    "auth.repeatPassword":"Kretarele gaghtnabarre","auth.confirmPasswordLabel":"Hastatel gaghtnabarre",
    "auth.chooseName":"Entrirem ogtageri anoun","auth.enterEmail":"duk@example.com",
    "auth.createPassword":"Steghtsel gaghtnabarre",
    "auth.firstNamePh":"Nar. Narine","auth.lastNamePh":"Nar. Petrosyan","auth.phonePh":"Nar. +374 99 123456",
    "loading":"Bornakvoum e...",
    "cat.TOPS":"Верна hagoust","cat.BOTTOMS":"Nerk hagoust","cat.SKIRTS":"Kisashrgaghestr","cat.JACKETS":"Bazhkonner",
    "cat.DRESSES":"Zgestnere","cat.COATS":"Verarkunere","cat.FOOTWEAR":"Kayinsapatnere","cat.HEADWEAR":"Glkharkner",
    "cat.UNDERWEAR":"Nerkevins Zgestner","cat.SHAPEWEAR":"Dzevavorich Zgestner",
    "type.T_SHIRT":"Futbolka","type.SLEEVELESS_TOP":"Anther Shapik","type.LONG_SLEEVE":"Yerkartapov Shapik",
    "type.CROP_TOP":"Krop Top","type.BLOUSE":"Bluz","type.HOODIE":"Houdi",
    "type.REGULAR_PANTS":"Sharovar","type.SHORTS":"Karchatabot","type.JOGGERS":"Jogger","type.LEGGINGS":"Leggins",
    "type.MINI_SKIRT":"Mini Kisash.","type.MIDI_SKIRT":"Midi Kisash.",
    "type.MAXI_SKIRT":"Maksi Kisash.","type.PLEATED_SKIRT":"Kntakavorzapov Kisash.",
    "type.BOMBER_JACKET":"Bomber","type.BLAZER":"Bleizer","type.DENIM_JACKET":"Djinse Bazhkon","type.PUFFER_JACKET":"Phoufer Bazhkon",
    "type.MINI_DRESS":"Mini Zgest","type.MIDI_DRESS":"Midi Zgest","type.MAXI_DRESS":"Maksi Zgest","type.WRAP_DRESS":"Apakan Zgest",
    "type.TRENCH_COAT":"Trench","type.PEA_COAT":"Klassik Verarku","type.OVERCOAT":"Verar Zgest","type.PUFFER_COAT":"Phoufer Verarku",
    "type.SNEAKERS":"Sportayin Kayink","type.BOOTS":"Artasahin","type.SANDALS":"Sandal","type.HEELS":"Karunkakap",
    "type.BASEBALL_CAP":"Baseball Gortsarik","type.BEANIE":"Ghlkhatapi","type.BUCKET_HAT":"Kubo Gortsarik","type.WIDE_BRIM_HAT":"Lernkhorar Gortsarik",
    "type.BRIEFS":"Sripts","type.BOXERS":"Boksyornere","type.BRALETTE":"Bralett","type.SPORTS_BRA":"Sportayin Bra",
    "type.BODYSUIT":"Bodi","type.CORSET":"Korset","type.SHAPING_SHORTS":"Karch Dzevavorich","type.FULL_BODY_SHAPER":"Amboghjakan Dzevavorich",
    "shape.hourglass":"Avazakaghar","shape.pear":"Tonakaghi","shape.apple":"Khndzorvi",
    "shape.rectangle":"Ourankyoun","shape.inverted":"Sharunakvatz Yeressavour",
    "pname.Basic T-Shirt":"Hitmnakan Futbolka","pname.Sleeveless Top":"Anther Shapik",
    "pname.Oversized Long Sleeve Top":"Oversayzt Yerkartapov Shapik","pname.Crop Top":"Krop Top",
    "pname.Blouse":"Bluz","pname.Hoodie":"Houdi","pname.Regular Pants":"Sharovar",
    "pname.Shorts":"Karchatabot","pname.Joggers":"Jogger","pname.Leggings":"Leggins",
    "pname.Mini Skirt":"Mini Kisash.","pname.Midi Skirt":"Midi Kisash.",
    "pname.Maxi Skirt":"Maksi Kisash.","pname.Pleated Skirt":"Kntakav. Kisash.",
    "pname.Bomber Jacket":"Bomber","pname.Blazer":"Bleizer",
    "pname.Denim Jacket":"Djinse Bazhkon","pname.Puffer Jacket":"Phoufer Bazhkon",
    "pname.Mini Dress":"Mini Zgest","pname.Midi Dress":"Midi Zgest",
    "pname.Maxi Dress":"Maksi Zgest","pname.Wrap Dress":"Apakan Zgest",
    "pname.Trench Coat":"Trench","pname.Pea Coat":"Klassik Verarku",
    "pname.Overcoat":"Verar Zgest","pname.Puffer Coat":"Phoufer Verarku",
    "pname.Sneakers":"Sportayin Kayink","pname.Boots":"Artasahin",
    "pname.Sandals":"Sandal","pname.Heels":"Karunkakap",
    "pname.Baseball Cap":"Baseball Gortsarik","pname.Beanie":"Ghlkhatapi",
    "pname.Bucket Hat":"Kubo Gortsarik","pname.Wide Brim Hat":"Lernkhorar Gortsarik",
    "pname.Briefs":"Sripts","pname.Boxers":"Boksyornere","pname.Bralette":"Bralett","pname.Sports Bra":"Sportayin Bra",
    "pname.Bodysuit":"Bodi","pname.Corset":"Korset","pname.Shaping Shorts":"Karch Dzevavorich","pname.Full Body Shaper":"Amboghjakan Dzevavorich",
  },
};
const LangContext = React.createContext({ lang: "en", setLang: () => {} });
function useT() {
  const { lang } = React.useContext(LangContext);
  return (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}
function AuthLangSwitcher() {
  const { lang, setLang } = React.useContext(LangContext);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
      {[{code:"en",label:"EN"},{code:"ru",label:"RU"},{code:"hy",label:"ՀԱՅ"}].map(l => (
        <button key={l.code} type="button"
          onClick={() => setLang(l.code)}
          style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: lang === l.code ? "2px solid var(--pink-500)" : "1.5px solid var(--gray-300)",
            background: lang === l.code ? "var(--pink-50)" : "transparent",
            color: lang === l.code ? "var(--pink-600)" : "var(--gray-500)",
          }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Navbar({ me, go, setMe }) {
  const t = useT();
  const { lang, setLang } = React.useContext(LangContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [navPatterns, setNavPatterns] = useState([]);
  const isAdmin = me?.role === "ADMIN";

  useEffect(() => {
    if (me) api("/api/patterns").then(setNavPatterns).catch(() => {});
  }, [me]);

  function logout() { clearToken(); setMe(null); go("/login"); }

  function goWithGroup(groupValue) {
    sessionStorage.setItem("pg_initGroup", groupValue);
    setMenuOpen(false); setHoveredCat(null);
    go("/generator");
  }

  function goWithPatternId(patternId) {
    sessionStorage.setItem("pg_initPatternId", String(patternId));
    setMenuOpen(false); setHoveredCat(null);
    go("/generator");
  }

  const LANG_OPTIONS = [
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
    { code: "hy", label: "Հայերեն" },
  ];

  const hoveredGroupValue = MENU_CATS.find(c => c.label === hoveredCat)?.value;
  const submenuPatterns = hoveredGroupValue ? navPatterns.filter(p => p.category === hoveredGroupValue) : [];

  return (
    <nav className="navbar">
      <div className="navbar-top-row">
        <div className="navbar-brand" onClick={() => go("/home")}>
          <div className="brand-icon"><ScissorIcon /></div>
          <span>Pattern Generator</span>
        </div>
      </div>
      <div className="navbar-bottom-row">
        <div className="navbar-nav-left">
          <button className="nav-btn" onClick={() => go("/home")}>{t("nav.home")}</button>

          <div className="nav-menu-wrapper"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => { setMenuOpen(false); setHoveredCat(null); }}>
            <button className="nav-btn">{t("nav.menu")} ▾</button>
            {menuOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-col">
                  {MENU_CATS.map(cat => (
                    <div key={cat.label}
                      className={`nav-dropdown-item${hoveredCat === cat.label ? " hovered" : ""}`}
                      onMouseEnter={() => setHoveredCat(cat.label)}
                      onClick={() => goWithGroup(cat.value)}>
                      {t(cat.labelKey)}
                    </div>
                  ))}
                </div>
                {hoveredCat && (
                  <div className="nav-dropdown-col nav-dropdown-sub">
                    {submenuPatterns.length > 0
                      ? submenuPatterns.map(p => (
                          <div key={p.id} className="nav-dropdown-item"
                            onClick={() => goWithPatternId(p.id)}>
                            {(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}
                          </div>
                        ))
                      : <div className="nav-dropdown-item" style={{color:"var(--gray-400)",fontStyle:"italic",cursor:"default"}}>No patterns yet</div>
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="nav-btn" onClick={() => go("/generator")}>{t("nav.generator")}</button>
          <button className="nav-btn" onClick={() => go("/my-patterns")}>{t("nav.myPatterns")}</button>
          {isAdmin && <button className="nav-btn" onClick={() => go("/admin")}>{t("nav.admin")}</button>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="nav-user-wrapper" style={{ position: "relative" }}
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}>
            <button className="nav-btn" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {lang.toUpperCase()} ▾
            </button>
            {langOpen && (
              <div className="nav-user-dropdown" style={{ minWidth: 120 }}>
                {LANG_OPTIONS.map(l => (
                  <div key={l.code} className="nav-user-dropdown-item"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    <span>{l.label}</span>
                    {lang === l.code && <span style={{ color: "var(--pink-500)", fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {me && (
            <div className="nav-user-wrapper"
              onMouseEnter={() => setUserDropOpen(true)}
              onMouseLeave={() => setUserDropOpen(false)}>
              <div className="navbar-user-info" onClick={() => go("/account")} style={{ cursor: "pointer" }}>
                <AvatarCircle username={me.username} size={30} />
                <span className="navbar-username">{me.username}</span>
                <span style={{ fontSize: 9, color: "var(--gray-400)", marginLeft: 2 }}>▾</span>
              </div>
              {userDropOpen && (
                <div className="nav-user-dropdown">
                  <div className="nav-user-dropdown-item" onClick={() => { setUserDropOpen(false); go("/account"); }}>{t("nav.myAccount")}</div>
                  <div className="nav-user-dropdown-item" onClick={() => { setUserDropOpen(false); go("/my-patterns"); }}>{t("nav.myPatterns")}</div>
                  <div className="nav-user-dropdown-item nav-user-logout" onClick={logout}>{t("nav.logout")}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function LoginPage({ go, setMe }) {
  const t = useT();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setErr(null); setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { usernameOrEmail: login, password } });
      saveToken(data.token);
      const userData = await api("/api/users/me");
      setMe(userData);
      go("/home");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-container">
      <div className="card card-sm">
        <AuthLangSwitcher />
        <div className="auth-brand">
          <div className="auth-brand-logo"><ScissorIcon /></div>
          <div className="auth-brand-name">{t("auth.appName")}</div>
          <div className="auth-brand-sub">{t("auth.tagline")}</div>
        </div>
        {err && <Alert type="error">{err}</Alert>}
        <form className="form" onSubmit={onSubmit}>
          <Field label={t("auth.username")} placeholder="e.g. narine / narine@mail.com"
            value={login} onChange={e => setLogin(e.target.value)} autoComplete="username" />
          <PasswordField required label={t("auth.password")} placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? "…" : t("auth.signIn")}
          </button>
        </form>
        <div className="divider" />
        <div className="flex items-center gap-2" style={{ justifyContent: "center", fontSize: 14 }}>
          <span className="text-muted">{t("auth.noAccount")}</span>
          <a className="link" href="#/signup" onClick={e => { e.preventDefault(); go("/signup"); }}>{t("auth.signup")}</a>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ go, setMe }) {
  const t = useT();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setErr(null);
    if (password !== confirmPassword) { setErr(t("auth.passwordsNoMatchErr")); return; }
    setLoading(true);
    try {
      const data = await api("/api/auth/signup", { method: "POST", body: { username, email, password } });
      saveToken(data.token);
      const userData = await api("/api/users/me");
      try {
        const update = {};
        if (firstName.trim() || lastName.trim()) update.fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        if (phone.trim()) update.phone = phone.trim();
        if (Object.keys(update).length > 0)
          localStorage.setItem(`pg_userinfo_${userData.username}`, JSON.stringify(update));
      } catch {}
      setMe(userData);
      go("/home");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const pwMatch = confirmPassword && password === confirmPassword;
  const pwMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="auth-container">
      <div className="card card-sm">
        <AuthLangSwitcher />
        <div className="auth-brand">
          <div className="auth-brand-logo"><ScissorIcon /></div>
          <div className="auth-brand-name">{t("auth.createAccount")}</div>
          <div className="auth-brand-sub">{t("auth.joinTagline")}</div>
        </div>
        {err && <Alert type="error">{err}</Alert>}
        <form className="form" onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field optional label={t("auth.firstName")} placeholder={t("auth.firstNamePh")}
              value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
            <Field optional label={t("auth.lastName")} placeholder={t("auth.lastNamePh")}
              value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
          </div>
          <Field required label={t("auth.username")} placeholder={t("auth.chooseName")}
            value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
          <Field required label={t("auth.email")} placeholder={t("auth.enterEmail")} type="email"
            value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          <PasswordField required label={t("auth.password")} placeholder={t("auth.createPassword")}
            value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          <div className="field">
            <label className="label">
              {t("auth.confirmPasswordLabel")}<span style={{ color: "#be123c", marginLeft: 3 }}>*</span>
            </label>
            <div className="pw-input-wrapper">
              <input className="input" type={showConfirm ? "text" : "password"} placeholder={t("auth.repeatPassword")}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={{ borderColor: pwMismatch ? "#be123c" : pwMatch ? "#16a34a" : undefined }} />
              <button type="button" className="pw-eye-btn" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}>
                {showConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {pwMismatch && <div style={{ color: "#be123c", fontSize: 12, marginTop: 4 }}>{t("auth.passwordsNoMatch")}</div>}
            {pwMatch && <div style={{ color: "#16a34a", fontSize: 12, marginTop: 4 }}>{t("auth.passwordsMatch")}</div>}
          </div>
          <Field optional label={t("auth.phoneNumber")} placeholder={t("auth.phonePh")} type="tel"
            value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? "…" : t("auth.createAccount")}
          </button>
        </form>
        <div className="divider" />
        <div className="flex items-center gap-2" style={{ justifyContent: "center", fontSize: 14 }}>
          <span className="text-muted">{t("auth.haveAccount")}</span>
          <a className="link" href="#/login" onClick={e => { e.preventDefault(); go("/login"); }}>{t("auth.signIn")}</a>
        </div>
      </div>
    </div>
  );
}

function PatternUsageGuide() {
  const steps = [
    { icon: "📥", title: "Download the ZIP", body: 'Click "🖨 Print / ZIP" above. Each pattern piece is saved as a separate PDF inside the archive.' },
    { icon: "🖨", title: "Print at 100% scale", body: "Open each PDF. In your printer dialog set scale to 100% — never 'fit to page'. Check the printed ruler on page 1 is accurate before cutting." },
    { icon: "✂️", title: "Tape multi-page pieces", body: "Large pieces span several A4 sheets. Align the 5 mm overlap guides printed at page edges, tape together, then cut the outer line." },
    { icon: "📌", title: "Pin to fabric", body: "Lay the assembled pattern on your fabric (fold fabric for symmetric pieces). Pin every 5–8 cm. Add 1–1.5 cm seam allowance outside the printed line." },
    { icon: "🧵", title: "Cut & transfer marks", body: "Cut the fabric along your seam-allowance line. Transfer notches and grain-line arrows with tailor's chalk or a tracing wheel." },
    { icon: "👗", title: "Sew it together", body: "Join pieces following grain lines and notch positions. Ease is already included in the pattern dimensions — seam allowance is not." },
  ];
  return (
    <div className="card" style={{ marginBottom: 20, border: "1.5px solid var(--pink-200)" }}>
      <h2 className="section-title" style={{ marginBottom: 16 }}>✂️ How to Use Your Pattern</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: "var(--pink-50)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, borderTop: "3px solid var(--pink-300)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--pink-500)", color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--pink-700)" }}>{s.title}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-600)", lineHeight: 1.55, paddingLeft: 34 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementGuide() {
  const B = "#e8c4a0";
  const S = "#a07048";
  const P = "#e91e63";
  const T = "#880e4f";
  const measurements = [
    { num: 1, label: "Shoulder Width", color: "#8b5cf6",
      desc: "Across your back from shoulder point to shoulder point." },
    { num: 2, label: "Chest / Bust", color: "#e91e63",
      desc: "Around the fullest part of your chest, tape parallel to the floor." },
    { num: 3, label: "Waist", color: "#16a34a",
      desc: "Around the narrowest part — roughly 1 inch above your belly button." },
    { num: 4, label: "Hip", color: "#ea580c",
      desc: "Around the fullest part of your hips and seat." },
    { num: 5, label: "Shirt / Dress Length", color: "#2563eb",
      desc: "Back of neck (cervical bone) straight down to desired hem." },
    { num: 6, label: "Sleeve Length", color: "#d97706",
      desc: "Outer shoulder point down to wrist, arm slightly bent." },
    { num: 7, label: "Outseam / Trouser Length", color: "#475569",
      desc: "Side of waist straight down to ankle." },
  ];

  return (
    <div className="card" style={{ marginBottom: 20, border: "1.5px solid var(--pink-200)", padding: "18px 22px" }}>
      <h2 className="section-title" style={{ marginBottom: 4 }}>How to Take Your Measurements</h2>
      <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 8 }}>
        Use a soft measuring tape. Stand straight and relaxed.
      </p>
      <div style={{ fontSize: 11.5, color: "var(--gray-500)", marginBottom: 16, display: "flex", gap: 18, flexWrap: "wrap" }}>
        <span>
          <svg width="28" height="10" style={{ verticalAlign: "middle", marginRight: 5 }}>
            <line x1="0" y1="5" x2="28" y2="5" stroke={P} strokeWidth="1.8" strokeDasharray="4 3"/>
          </svg>
          Around (360°)
        </span>
        <span>
          <svg width="28" height="10" style={{ verticalAlign: "middle", marginRight: 5 }}>
            <line x1="0" y1="5" x2="28" y2="5" stroke={P} strokeWidth="1.8"/>
          </svg>
          One side only
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox="0 0 420 640" style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto" }}>

          <ellipse cx="190" cy="48" rx="26" ry="33" fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
          <path d="M 182 79 C 182 88 179 95 178 104 L 202 104 C 201 95 198 88 198 79"
            fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
          <path d="
            M 178 104
            C 158 109, 124 120, 104 136
            C 91 148, 77 196, 74 250
            C 71 298, 71 338, 74 364
            C 75 376, 80 388, 89 390
            C 98 392, 104 382, 107 370
            C 111 346, 116 304, 119 258
            C 122 212, 121 170, 117 150
            C 113 154, 107 163, 104 180
            C 101 196, 100 214, 103 232
            C 107 252, 113 274, 116 294
            C 118 310, 127 340, 141 362
            C 151 378, 154 396, 154 410
            L 154 492 L 153 574 L 152 610
            C 152 620, 154 630, 160 634
            L 172 635
            C 175 631, 178 623, 178 613
            L 178 574 L 178 492 L 178 410
            C 182 415, 190 417, 198 415
            L 202 410 L 202 492 L 202 574 L 202 613
            C 202 623, 205 631, 208 635
            L 220 634
            C 226 630, 228 620, 228 610
            L 227 574 L 226 492 L 226 410
            C 226 396, 229 378, 239 362
            C 253 340, 262 310, 264 294
            C 267 274, 273 252, 277 232
            C 280 214, 279 196, 276 180
            C 273 163, 267 154, 263 150
            C 259 170, 259 212, 261 258
            C 264 304, 269 346, 273 370
            C 276 382, 282 392, 291 390
            C 300 388, 305 376, 306 364
            C 309 338, 309 298, 306 250
            C 303 196, 289 148, 276 136
            C 256 120, 222 109, 202 104
            Z
          " fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>


          <line x1="102" y1="108" x2="278" y2="108" stroke={P} strokeWidth="1.8"/>
          <line x1="102" y1="102" x2="102" y2="114" stroke={P} strokeWidth="1.8"/>
          <line x1="278" y1="102" x2="278" y2="114" stroke={P} strokeWidth="1.8"/>
          <text x="190" y="98" textAnchor="middle" fontSize="9.5" fill={T} fontWeight="700">Shoulder Width</text>

          <ellipse cx="190" cy="96" rx="22" ry="8" fill="none" stroke={P} strokeWidth="1.8" strokeDasharray="4 3"/>
          <line x1="212" y1="96" x2="322" y2="82" stroke={P} strokeWidth="1" opacity="0.7"/>
          <circle cx="212" cy="96" r="2.5" fill={P}/>
          <text x="325" y="86" fontSize="11" fill={T} fontWeight="700">Neck</text>

          <ellipse cx="190" cy="152" rx="70" ry="15" fill="none" stroke={P} strokeWidth="1.8" strokeDasharray="4 3"/>
          <line x1="260" y1="152" x2="322" y2="138" stroke={P} strokeWidth="1" opacity="0.7"/>
          <circle cx="260" cy="152" r="2.5" fill={P}/>
          <text x="325" y="142" fontSize="11" fill={T} fontWeight="700">Chest</text>

          <ellipse cx="190" cy="244" rx="56" ry="12" fill="none" stroke={P} strokeWidth="1.8" strokeDasharray="4 3"/>
          <line x1="246" y1="244" x2="322" y2="232" stroke={P} strokeWidth="1" opacity="0.7"/>
          <circle cx="246" cy="244" r="2.5" fill={P}/>
          <text x="325" y="236" fontSize="11" fill={T} fontWeight="700">Waist</text>

          <ellipse cx="190" cy="300" rx="72" ry="15" fill="none" stroke={P} strokeWidth="1.8" strokeDasharray="4 3"/>
          <line x1="262" y1="300" x2="322" y2="316" stroke={P} strokeWidth="1" opacity="0.7"/>
          <circle cx="262" cy="300" r="2.5" fill={P}/>
          <text x="325" y="320" fontSize="11" fill={T} fontWeight="700">Hip</text>

          <line x1="52" y1="118" x2="52" y2="302" stroke={P} strokeWidth="1.8"/>
          <line x1="46" y1="118" x2="58" y2="118" stroke={P} strokeWidth="1.8"/>
          <line x1="46" y1="302" x2="58" y2="302" stroke={P} strokeWidth="1.8"/>
          <line x1="52" y1="118" x2="100" y2="118" stroke={P} strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
          <line x1="52" y1="302" x2="116" y2="302" stroke={P} strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
          <text x="41" y="210" textAnchor="middle" fontSize="10" fill={T} fontWeight="700" transform="rotate(-90, 41, 210)">Shirt Length</text>

          <line x1="106" y1="118" x2="78" y2="368" stroke={P} strokeWidth="1.8"/>
          <line x1="99" y1="116" x2="113" y2="120" stroke={P} strokeWidth="1.8"/>
          <line x1="71" y1="366" x2="85" y2="370" stroke={P} strokeWidth="1.8"/>
          <text x="20" y="244" textAnchor="middle" fontSize="10" fill={T} fontWeight="700" transform="rotate(-74, 20, 244)">Sleeve Length</text>

          <line x1="52" y1="302" x2="52" y2="596" stroke={P} strokeWidth="1.8"/>
          <line x1="46" y1="596" x2="58" y2="596" stroke={P} strokeWidth="1.8"/>
          <line x1="52" y1="596" x2="105" y2="596" stroke={P} strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
          <text x="41" y="449" textAnchor="middle" fontSize="10" fill={T} fontWeight="700" transform="rotate(-90, 41, 449)">Outseam</text>

        </svg>
      </div>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {measurements.map(m => (
          <div key={m.num} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--pink-50)", borderRadius: 8, borderLeft: `4px solid ${m.color}`, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, color: "#fff", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{m.num}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: m.color, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "var(--gray-600)", lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage({ me, go, setMe }) {
  const t = useT();
  const isAdmin = me?.role === "ADMIN";
  const [popularPatterns, setPopularPatterns] = useState([]);
  const [recentPatterns, setRecentPatterns] = useState([]);

  useEffect(() => {
    api("/api/patterns").then(data => {
      try {
        const usage = JSON.parse(localStorage.getItem(`pg_usage_${me.username}`) || "{}");
        const withUsage = data.map(p => ({ ...p, useCount: usage[p.id] || 0 }));
        const used = withUsage.filter(p => p.useCount > 0).sort((a, b) => b.useCount - a.useCount);
        setPopularPatterns((used.length ? used : withUsage).slice(0, 5));
      } catch { setPopularPatterns(data.slice(0, 5)); }
    }).catch(() => {});
    try { setRecentPatterns(JSON.parse(localStorage.getItem(`pg_recent_${me.username}`) || "[]").slice(0, 5)); } catch {}
  }, []);

  const typeIcon = cat => {
    const g = CATEGORY_GROUPS.find(g => g.value === cat);
    if (!g) return null;
    const Icon = g.icon;
    return <Icon size={28} />;
  };

  return (
    <div>
      <Navbar me={me} go={go} setMe={setMe} />
      <div className="page-container">

        {isAdmin && (
          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="stat-card"><div className="stat-number">∞</div><div className="stat-label">Pattern Templates</div></div>
            <div className="stat-card"><div className="stat-number">7</div><div className="stat-label">Measurement Fields</div></div>
            <div className="stat-card"><div className="stat-number">{CATEGORY_GROUPS.length}</div><div className="stat-label">Clothing Groups</div></div>
          </div>
        )}

        <div className="home-hero" style={{ marginBottom: 20 }}>
          <div className="home-hero-text">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--pink-700)", margin: "0 0 6px" }}>{t("home.heroTitle")}</h1>
            <p style={{ fontSize: 14, color: "var(--gray-500)", margin: "0 0 16px" }}>{t("home.heroDesc")}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => go("/generator")}>{t("home.createPattern")}</button>
              <button className="btn btn-secondary" onClick={() => go("/profiles")}>{t("home.myMeasurements")}</button>
              {isAdmin && <button className="btn btn-pink-outline" onClick={() => go("/admin")}>{t("home.adminDashboard")}</button>}
            </div>
          </div>
          <div className="home-hero-icons" aria-hidden="true">
            <TShirtIcon size={64} /><PantsIcon size={64} /><ShortsIcon size={56} /><SleevelessIcon size={56} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="section-title">{t("home.quickStart")}</h2>
          <div className="quick-access-grid">
            {CATEGORY_GROUPS.map(g => {
              const Icon = g.icon;
              return (
                <div key={g.value} className="quick-access-card"
                  onClick={() => { sessionStorage.setItem("pg_initGroup", g.value); go("/generator"); }}>
                  <div className="quick-access-icon"><Icon size={48} /></div>
                  <div className="quick-access-label">{t(g.labelKey)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="section-title">{t("home.howItWorks")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
            {[
              { num: "1", title: t("home.step1Title"), desc: t("home.step1Desc") },
              { num: "2", title: t("home.step2Title"), desc: t("home.step2Desc") },
              { num: "3", title: t("home.step3Title"), desc: t("home.step3Desc") },
              { num: "4", title: t("home.step4Title"), desc: t("home.step4Desc") },
            ].map(s => (
              <div key={s.num} style={{ textAlign: "center", padding: "10px 6px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--pink-100)", color: "var(--pink-600)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>{s.num}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-800)", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <MeasurementGuide />

        <PatternUsageGuide />

        <div className="grid-2">
          <div className="card">
            <h2 className="section-title">{t("home.recentlyUsed")}</h2>
            {recentPatterns.length === 0 ? (
              <div className="empty-state" style={{ padding: "20px 0" }}>
                <div style={{ marginBottom: 8 }}><TShirtIcon size={48} /></div>
                <div className="empty-state-text">{t("home.noPatterns")}</div>
                <div className="empty-state-sub">{t("home.noPatternsDesc")}</div>
                <button className="btn btn-primary btn-sm mt-3" onClick={() => go("/generator")}>{t("home.startNow")}</button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recentPatterns.map((p, i) => (
                  <div key={i} className="list-item" style={{ cursor: "pointer" }} onClick={() => { if (p.patternId) sessionStorage.setItem("pg_initPatternId", String(p.patternId)); go("/generator"); }}>
                    <div style={{ flexShrink: 0, width: 28 }}>{typeIcon(p.category)}</div>
                    <div className="list-item-content">
                      <div className="list-item-title">{(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}</div>
                      <div className="list-item-sub">{(p.category || "").replace(/_/g, " ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="section-title">{t("home.popularPatterns")}</h2>
            {popularPatterns.length === 0 ? (
              <div className="loading">{t("loading")}</div>
            ) : (() => {
              const totalUses = popularPatterns.reduce((s, p) => s + (p.useCount || 0), 0);
              return (
                <div style={{ display: "grid", gap: 8 }}>
                  {popularPatterns.map(p => {
                    const pct = totalUses > 0 ? Math.round((p.useCount / totalUses) * 100) : null;
                    return (
                      <div key={p.id} className="list-item" style={{ cursor: "pointer" }}
                        onClick={() => { sessionStorage.setItem("pg_initPatternId", String(p.id)); go("/generator"); }}>
                        <div style={{ flexShrink: 0, width: 28 }}>{typeIcon(p.category)}</div>
                        <div className="list-item-content">
                          <div className="list-item-title">{(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}</div>
                          <div className="list-item-sub">{(p.category || "").replace(/_/g, " ")}</div>
                        </div>
                        {pct !== null && (
                          <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: "var(--pink-600)", minWidth: 40, textAlign: "right" }}>
                            {pct}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountPage({ me, go, setMe }) {
  const t = useT();
  const isAdmin = me?.role === "ADMIN";
  const [showInfo, setShowInfo] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const infoKey = `pg_userinfo_${me?.username}`;
  const [localInfo, setLocalInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`pg_userinfo_${me?.username}`) || "{}"); } catch { return {}; }
  });
  const [editForm, setEditForm] = useState({});
  const [avatarSrc, setAvatarSrc] = useState(() => me?.username ? localStorage.getItem(`pg_avatar_${me.username}`) : null);
  const avatarInputRef = useRef(null);

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      localStorage.setItem(`pg_avatar_${me.username}`, dataUrl);
      setAvatarSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function logout() { clearToken(); setMe(null); go("/login"); }

  const [profiles, setProfiles] = useState([]);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const emptyFolder = { profileName: "", CHEST: "", SHOULDER_WIDTH: "", SHIRT_LENGTH: "", SLEEVE_LENGTH: "", WAIST: "", HIP: "", OUTSEAM: "" };
  const [folderForm, setFolderForm] = useState(emptyFolder);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [deletingPattern, setDeletingPattern] = useState(null);

  const FIELDS = [
    { code: "CHEST", label: "Chest (cm)" }, { code: "SHOULDER_WIDTH", label: "Shoulder Width (cm)" },
    { code: "SHIRT_LENGTH", label: "Shirt Length (cm)" }, { code: "SLEEVE_LENGTH", label: "Sleeve Length (cm)" },
    { code: "WAIST", label: "Waist (cm)" }, { code: "HIP", label: "Hip (cm)" }, { code: "OUTSEAM", label: "Outseam (cm)" },
  ];

  useEffect(() => {
    if (!getToken()) { go("/login"); return; }
    loadProfiles();
    api("/api/saved-patterns").then(setSavedPatterns).catch(() => {});
  }, [go]);

  async function loadProfiles() {
    try { setProfiles(await api("/api/profiles")); } catch (e) { setErr(e.message); }
  }

  function startEdit() {
    setEditForm({ fullName: localInfo.fullName || "", phone: localInfo.phone || "", nickname: localInfo.nickname || me?.username || "" });
    setEditMode(true);
  }

  function saveInfo() {
    localStorage.setItem(infoKey, JSON.stringify(editForm));
    setLocalInfo(editForm); setEditMode(false);
  }

  function startCreateFolder() {
    setEditingFolder(null); setFolderForm(emptyFolder);
    setShowCreateForm(true); setErr(null); setMsg(null);
  }

  function startEditFolder(p) {
    const m = p.measurements || {};
    setFolderForm({ profileName: p.profileName, CHEST: m.CHEST ?? "", SHOULDER_WIDTH: m.SHOULDER_WIDTH ?? "", SHIRT_LENGTH: m.SHIRT_LENGTH ?? "", SLEEVE_LENGTH: m.SLEEVE_LENGTH ?? "", WAIST: m.WAIST ?? "", HIP: m.HIP ?? "", OUTSEAM: m.OUTSEAM ?? "" });
    setEditingFolder(p.id); setShowCreateForm(true);
    setExpandedFolder(null); setErr(null); setMsg(null);
  }

  async function saveFolder() {
    setErr(null);
    if (!folderForm.profileName.trim()) { setErr("Folder name is required."); return; }
    const measurements = {};
    for (const f of FIELDS) { if (folderForm[f.code] !== "") measurements[f.code] = Number(folderForm[f.code]); }
    try {
      if (editingFolder) await api(`/api/profiles/${editingFolder}`, { method: "PUT", body: { profileName: folderForm.profileName.trim(), measurements } });
      else await api("/api/profiles", { method: "POST", body: { profileName: folderForm.profileName.trim(), measurements } });
      setShowCreateForm(false); setEditingFolder(null); await loadProfiles();
    } catch (e) { setErr(e.message); }
  }

  async function deleteFolder(id) {
    if (!confirm("Delete this folder?")) return;
    try { await api(`/api/profiles/${id}`, { method: "DELETE" }); if (expandedFolder === id) setExpandedFolder(null); await loadProfiles(); }
    catch (e) { setErr(e.message); }
  }

  async function deleteSavedPattern(id) {
    if (!confirm("Remove this saved pattern?")) return;
    setDeletingPattern(id);
    try { await api(`/api/saved-patterns/${id}`, { method: "DELETE" }); setSavedPatterns(p => p.filter(x => x.id !== id)); }
    catch (e) { setErr(e.message); }
    setDeletingPattern(null);
  }

  function getMeasSummary(snap) {
    try {
      const obj = JSON.parse(snap || "{}");
      if (obj.mode === "size") return `Size ${obj.clothingSize}${obj.bodyShape ? ` · ${obj.bodyShape}` : ""}`;
      const keys = ["CHEST","SHOULDER_WIDTH","SHIRT_LENGTH","SLEEVE_LENGTH","WAIST","HIP","OUTSEAM"];
      return keys.filter(k => obj[k]).map(k => `${k.replace(/_/g," ")}: ${obj[k]} cm`).join(" · ") || "—";
    } catch { return "—"; }
  }

  const nickname = localInfo.nickname || me?.username || "";

  return (
    <div>
      <Navbar me={me} go={go} setMe={setMe} />
      <div className="page-container">

        <div className="acct-header">
          <div className="avatar-upload-wrapper" onClick={() => avatarInputRef.current?.click()} title="Click to change photo">
            {avatarSrc
              ? <img src={avatarSrc} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", display: "block" }} alt="profile" />
              : <AvatarCircle username={me?.username} size={60} />}
            <div className="avatar-edit-badge">✎</div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onAvatarChange} />
          <div className="acct-header-right">
            <div className="acct-username">@{nickname}</div>
            <button className="acct-info-toggle" onClick={() => { setShowInfo(!showInfo); if (showInfo) setEditMode(false); }}>
              {showInfo ? t("account.hideInfo") : t("account.viewInfo")}
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }} onClick={logout}>{t("nav.logout")}</button>
        </div>

        {showInfo && (
          <div className="card" style={{ marginBottom: 20 }}>
            {editMode ? (
              <div className="form" style={{ maxWidth: 400 }}>
                <Field label={t("account.fullName")} placeholder="Add your full name" value={editForm.fullName || ""} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))} />
                <Field label={t("account.nickname")} placeholder="How should we call you?" value={editForm.nickname || ""} onChange={e => setEditForm(p => ({ ...p, nickname: e.target.value }))} />
                <Field label={t("account.phoneNumber")} placeholder={t("auth.phonePh")} value={editForm.phone || ""} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-primary btn-sm" onClick={saveInfo}>{t("save")}</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="info-rows">
                  <div className="info-row"><span className="info-label">{t("account.email")}</span><span className="info-value">{me?.email || <span className="info-placeholder">Add email</span>}</span></div>
                  <div className="info-row"><span className="info-label">{t("account.fullName")}</span><span className="info-value">{localInfo.fullName || <span className="info-placeholder">Add full name</span>}</span></div>
                  <div className="info-row"><span className="info-label">{t("account.nickname")}</span><span className="info-value">{localInfo.nickname || me?.username || <span className="info-placeholder">Add nickname</span>}</span></div>
                  <div className="info-row"><span className="info-label">{t("account.phoneNumber")}</span><span className="info-value">{localInfo.phone || <span className="info-placeholder">Add phone number</span>}</span></div>
                  {isAdmin && <div className="info-row"><span className="info-label">{t("account.role")}</span><span className="badge badge-pink">ADMIN</span></div>}
                </div>
                <button className="btn btn-secondary btn-sm mt-3" onClick={startEdit}>{t("edit")}</button>
              </div>
            )}
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 14 }}>{t("account.measurements")}</h2>
        {err && <Alert type="error">{err}</Alert>}
        {msg && <Alert type="success">{msg}</Alert>}

        {showCreateForm && (
          <div className="card mb-4">
            <h3 className="section-title">{editingFolder ? t("account.editFolderTitle") : t("account.newFolderTitle")}</h3>
            <div className="form" style={{ maxWidth: 520 }}>
              <Field label={t("account.folderName")} placeholder="e.g. My Measurements" value={folderForm.profileName} onChange={e => setFolderForm(p => ({ ...p, profileName: e.target.value }))} />
              {FIELDS.map(f => (
                <Field key={f.code} label={f.label} type="number" min="0" value={folderForm[f.code]} onChange={e => setFolderForm(p => ({ ...p, [f.code]: e.target.value }))} />
              ))}
              <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={saveFolder}>{editingFolder ? t("account.updateFolder") : t("account.createFolderBtn")}</button>
                <button className="btn btn-secondary" onClick={() => { setShowCreateForm(false); setEditingFolder(null); }}>{t("cancel")}</button>
              </div>
            </div>
          </div>
        )}

        <div className="folder-section">
          <div className="folder-add-card" onClick={startCreateFolder}><div className="folder-add-icon">+</div></div>
          {profiles.map(p => (
            <div key={p.id} className="folder-item">
              <div className="folder-name-row" onClick={() => setExpandedFolder(expandedFolder === p.id ? null : p.id)}>
                <span style={{ fontSize: 20 }}>📁</span>
                <span className="folder-name">{p.profileName}</span>
                <span style={{ marginLeft: "auto", color: "var(--gray-400)", fontSize: 12 }}>{expandedFolder === p.id ? "▲" : "▼"}</span>
              </div>
              {expandedFolder === p.id && (
                <div className="folder-expanded">
                  <div className="folder-measurements">
                    {FIELDS.map(f => (
                      <div key={f.code} className="folder-meas-row">
                        <span className="folder-meas-label">{f.label}</span>
                        <span className="folder-meas-value">
                          {p.measurements?.[f.code] != null ? `${p.measurements[f.code]} cm` : <span style={{ color: "var(--gray-300)", fontWeight: 400 }}>—</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn btn-secondary btn-sm" onClick={() => startEditFolder(p)}>{t("edit")}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteFolder(p.id)}>{t("delete")}</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { sessionStorage.setItem("pg_initProfile", String(p.id)); go("/generator"); }}>{t("account.useInGenerator")}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {profiles.length === 0 && !showCreateForm && (
            <div className="card"><div className="empty-state" style={{ padding: "24px 0" }}>
              <div style={{ marginBottom: 8 }}><PantsIcon size={48} /></div>
              <div className="empty-state-text">{t("account.noFolders")}</div>
              <div className="empty-state-sub">{t("account.createFirst")}</div>
            </div></div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "28px 0 14px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", margin: 0 }}>{t("account.savedPatterns")}</h2>
          {savedPatterns.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => go("/my-patterns")}>{t("account.viewAll")}</button>
          )}
        </div>

        {savedPatterns.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
              <div className="empty-state-text">{t("account.noSavedPatterns")}</div>
              <div className="empty-state-sub">{t("account.noSavedDesc")}</div>
              <button className="btn btn-primary btn-sm mt-3" onClick={() => go("/generator")}>{t("account.generatePattern")}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {savedPatterns.slice(0, 5).map(p => {
              const cat = CATEGORY_GROUPS.find(g => g.value === p.category);
              const Icon = cat?.icon || TShirtIcon;
              const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
              let pieces = [];
              try { pieces = JSON.parse(p.adjustedGeometryJson)?.pieces || []; } catch {}
              return (
                <div key={p.id} className="card" style={{ borderLeft: "4px solid var(--pink-300)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ color: "var(--pink-500)", flexShrink: 0 }}><Icon size={20} /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>{(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                          <span className="badge badge-pink" style={{ fontSize: 10, marginRight: 6 }}>{(p.category||"").replace(/_/g," ")}</span>
                          {fmt(p.createdAt)}
                          {pieces.length > 0 && <span style={{ marginLeft: 6 }}>· {pieces.length} piece{pieces.length !== 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => downloadPatternZip(p.adjustedGeometryJson, p.patternName)}>
                        {t("account.download")}
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => deleteSavedPattern(p.id)}
                        disabled={deletingPattern === p.id}>
                        {deletingPattern === p.id ? "…" : "✕"}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--gray-500)" }}>
                    {getMeasSummary(p.measurementsSnapshot)}
                  </div>
                </div>
              );
            })}
            {savedPatterns.length > 5 && (
              <button className="btn btn-secondary btn-sm" onClick={() => go("/my-patterns")}
                style={{ alignSelf: "flex-start" }}>
                {t("account.viewAll")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MeasurementsPage({ me, go, setMe }) {
  const t = useT();
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [vals, setVals] = useState({ CHEST: "", SHOULDER_WIDTH: "", SHIRT_LENGTH: "", SLEEVE_LENGTH: "", WAIST: "", HIP: "", OUTSEAM: "" });
  const FIELDS = [
    { code: "CHEST", label: "Chest (cm)" }, { code: "SHOULDER_WIDTH", label: "Shoulder Width (cm)" },
    { code: "SHIRT_LENGTH", label: "Shirt Length (cm)" }, { code: "SLEEVE_LENGTH", label: "Sleeve Length (cm)" },
    { code: "WAIST", label: "Waist (cm)" }, { code: "HIP", label: "Hip (cm)" }, { code: "OUTSEAM", label: "Outseam (cm)" },
  ];
  useEffect(() => { if (!getToken()) go("/login"); }, [go]);

  async function load() {
    setErr(null);
    try { const d = await api("/api/measurements/me"); const map = Object.fromEntries(d.map(m => [m.code, m.value])); setVals(p => ({ ...p, ...Object.fromEntries(Object.entries(map).map(([k,v]) => [k, v ?? ""])) })); setMsg("Saved measurements loaded."); }
    catch (e) { setErr(e.message); }
  }
  async function save() {
    setErr(null); setMsg(null);
    try { for (const [code, value] of Object.entries(vals)) { if (value !== "") await api("/api/measurements", { method: "POST", body: { code, value: Number(value) } }); } setMsg("Measurements saved."); }
    catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <Navbar me={me} go={go} setMe={setMe} />
      <div className="page-container">
        <div className="page-header">
          <div><h1 className="page-title">{t("meas.defaultTitle")}</h1><p className="page-description">{t("meas.defaultDesc")}</p></div>
          <div className="page-actions"><button className="btn btn-secondary" onClick={() => go("/account")}>{t("meas.backAccount")}</button></div>
        </div>
        {err && <Alert type="error">{err}</Alert>}
        {msg && <Alert type="success">{msg}</Alert>}
        <div className="card" style={{ maxWidth: 540 }}>
          <div className="form">
            {FIELDS.map(f => <Field key={f.code} label={f.label} type="number" min="0" value={vals[f.code]} onChange={e => setVals(p => ({ ...p, [f.code]: e.target.value }))} />)}
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={save}>{t("save")}</button>
              <button className="btn btn-secondary" onClick={load}>{t("meas.loadSaved")}</button>
              <button className="btn btn-secondary" onClick={() => setVals({ CHEST: "", SHOULDER_WIDTH: "", SHIRT_LENGTH: "", SLEEVE_LENGTH: "", WAIST: "", HIP: "", OUTSEAM: "" })}>{t("meas.clear")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilesPage({ me, go, setMe }) {
  const t = useT();
  const [profiles, setProfiles] = useState([]);
  const [err, setErr] = useState(null); const [msg, setMsg] = useState(null);
  const [editId, setEditId] = useState(null); const [showForm, setShowForm] = useState(false);
  const emptyForm = { profileName: "", CHEST: "", SHOULDER_WIDTH: "", SHIRT_LENGTH: "", SLEEVE_LENGTH: "", WAIST: "", HIP: "", OUTSEAM: "" };
  const [form, setForm] = useState(emptyForm);
  const FIELDS = [
    { code: "CHEST", label: "Chest (cm)" }, { code: "SHOULDER_WIDTH", label: "Shoulder Width (cm)" },
    { code: "SHIRT_LENGTH", label: "Shirt Length (cm)" }, { code: "SLEEVE_LENGTH", label: "Sleeve Length (cm)" },
    { code: "WAIST", label: "Waist (cm)" }, { code: "HIP", label: "Hip (cm)" }, { code: "OUTSEAM", label: "Outseam (cm)" },
  ];
  useEffect(() => { if (!getToken()) { go("/login"); return; } loadProfiles(); }, [go]);
  async function loadProfiles() { try { setProfiles(await api("/api/profiles")); } catch (e) { setErr(e.message); } }
  function startCreate() { setEditId(null); setForm(emptyForm); setShowForm(true); setErr(null); setMsg(null); }
  function startEdit(p) { setEditId(p.id); const m = p.measurements||{}; setForm({ profileName: p.profileName, CHEST: m.CHEST??"", SHOULDER_WIDTH: m.SHOULDER_WIDTH??"", SHIRT_LENGTH: m.SHIRT_LENGTH??"", SLEEVE_LENGTH: m.SLEEVE_LENGTH??"", WAIST: m.WAIST??"", HIP: m.HIP??"", OUTSEAM: m.OUTSEAM??""  }); setShowForm(true); setErr(null); setMsg(null); }
  function cancelForm() { setShowForm(false); setEditId(null); setForm(emptyForm); setErr(null); setMsg(null); }
  async function saveProfile() {
    setErr(null); setMsg(null);
    if (!form.profileName.trim()) { setErr("Profile name is required."); return; }
    const measurements = {}; for (const f of FIELDS) { if (form[f.code] !== "") measurements[f.code] = Number(form[f.code]); }
    try { if (editId) { await api(`/api/profiles/${editId}`, { method: "PUT", body: { profileName: form.profileName.trim(), measurements } }); setMsg("Folder updated."); } else { await api("/api/profiles", { method: "POST", body: { profileName: form.profileName.trim(), measurements } }); setMsg("Folder created."); } await loadProfiles(); cancelForm(); } catch (e) { setErr(e.message); }
  }
  async function deleteProfile(id) { if (!confirm("Delete this folder?")) return; setErr(null); try { await api(`/api/profiles/${id}`, { method: "DELETE" }); setMsg("Folder deleted."); await loadProfiles(); } catch (e) { setErr(e.message); } }
  const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <div><Navbar me={me} go={go} setMe={setMe} /><div className="page-container">
      <div className="page-header"><div><h1 className="page-title">{t("profiles.title")}</h1><p className="page-description">{t("profiles.desc")}</p></div><div className="page-actions"><button className="btn btn-primary" onClick={startCreate}>{t("account.newFolder")}</button></div></div>
      {err && <Alert type="error">{err}</Alert>}{msg && <Alert type="success">{msg}</Alert>}
      {showForm && <div className="card mb-4"><h2 className="section-title">{editId ? t("profiles.editFolder") : t("profiles.newFolderTitle")}</h2><div className="form" style={{ maxWidth: 540 }}><Field label={t("account.folderName")} placeholder="e.g. My Measurements" value={form.profileName} onChange={e => setForm(p => ({ ...p, profileName: e.target.value }))} />{FIELDS.map(f => <Field key={f.code} label={f.label} type="number" min="0" value={form[f.code]} onChange={e => setForm(p => ({ ...p, [f.code]: e.target.value }))} />)}<div className="flex gap-2 mt-2"><button className="btn btn-primary" onClick={saveProfile}>{editId ? t("account.updateFolder") : t("account.createFolderBtn")}</button><button className="btn btn-secondary" onClick={cancelForm}>{t("cancel")}</button></div></div></div>}
      {profiles.length === 0 && !showForm ? <div className="card"><div className="empty-state"><div className="empty-state-icon">📁</div><div className="empty-state-text">{t("profiles.noFolders")}</div><div className="empty-state-sub">{t("profiles.noFoldersDesc")}</div><button className="btn btn-primary mt-3" onClick={startCreate}>{t("profiles.createFirst")}</button></div></div>
      : <div className="grid-3">{profiles.map(p => <div className="profile-card" key={p.id}><div className="flex items-center gap-2 mb-2"><span style={{ fontSize: 20 }}>📁</span><div className="profile-card-name">{p.profileName}</div></div><div className="profile-card-date">{fmt(p.createdAt)}</div><div className="profile-card-measurements mt-2">{Object.entries(p.measurements||{}).map(([k,v]) => <span key={k} className="badge badge-pink" style={{ fontSize: 11 }}>{k}: {v}</span>)}{!Object.keys(p.measurements||{}).length && <span className="text-sm text-muted">{t("profiles.noMeasurements")}</span>}</div><div className="flex gap-2 mt-3"><button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>{t("edit")}</button><button className="btn btn-danger btn-sm" onClick={() => deleteProfile(p.id)}>{t("delete")}</button><button className="btn btn-primary btn-sm" onClick={() => go("/generator")}>{t("profiles.use")}</button></div></div>)}</div>}
    </div></div>
  );
}


function computeOffsetPolygon(piece, offsetDist) {
  const pts = piece.points || {}, segs = piece.segments || [];
  if (!segs.length || offsetDist <= 0) return null;
  const keys = segs.map(s => s.from);
  const n = keys.length;
  if (n < 3) return null;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[keys[i]], b = pts[keys[(i+1)%n]];
    if (a && b) area += (+a.x)*(+b.y) - (+b.x)*(+a.y);
  }
  const sign = area >= 0 ? 1 : -1;

  const segByFrom = {};
  segs.forEach(s => { segByFrom[s.from] = s; });
  const segByTo = {};
  segs.forEach(s => { segByTo[s.to] = s; });

  function edgeDirOut(fromKey, toKey) {
    const seg = segByFrom[fromKey];
    const f = pts[fromKey], t = pts[toKey];
    if (!f || !t) return { x: 0, y: 0 };
    let dx, dy;
    if (seg && seg.type === "curve" && seg.cp1) {
      dx = +seg.cp1.x - +f.x; dy = +seg.cp1.y - +f.y;
    } else {
      dx = +t.x - +f.x; dy = +t.y - +f.y;
    }
    const l = Math.sqrt(dx*dx+dy*dy)||1;
    return { x: sign*dy/l, y: sign*(-dx)/l };
  }
  function edgeDirIn(fromKey, toKey) {
    const seg = segByFrom[fromKey];
    const f = pts[fromKey], t = pts[toKey];
    if (!f || !t) return { x: 0, y: 0 };
    let dx, dy;
    if (seg && seg.type === "curve" && seg.cp2) {
      dx = +t.x - +seg.cp2.x; dy = +t.y - +seg.cp2.y;
    } else {
      dx = +t.x - +f.x; dy = +t.y - +f.y;
    }
    const l = Math.sqrt(dx*dx+dy*dy)||1;
    return { x: sign*dy/l, y: sign*(-dx)/l };
  }

  const offsets = {};
  for (let i = 0; i < n; i++) {
    const prevKey = keys[(i-1+n)%n], curKey = keys[i], nextKey = keys[(i+1)%n];
    const C = pts[curKey];
    if (!C) { offsets[curKey] = { dx:0, dy:0 }; continue; }
    const n1 = edgeDirIn(prevKey, curKey);   // normal of incoming edge at C
    const n2 = edgeDirOut(curKey, nextKey);  // normal of outgoing edge from C
    const bx = n1.x+n2.x, by = n1.y+n2.y, bl = Math.sqrt(bx*bx+by*by);
    let dx, dy;
    if (bl < 1e-6) {
      dx = n1.x*offsetDist; dy = n1.y*offsetDist;
    } else {
      const miterLen = offsetDist / (bl/2);
      if (miterLen > 4*offsetDist) {
        dx = n1.x*offsetDist; dy = n1.y*offsetDist;
      } else {
        dx = (bx/bl)*miterLen; dy = (by/bl)*miterLen;
      }
    }
    offsets[curKey] = { dx, dy };
  }

  const newPts = {};
  for (const k of keys) {
    const p = pts[k], o = offsets[k]||{dx:0,dy:0};
    newPts[k] = { x: +p.x+o.dx, y: +p.y+o.dy };
  }

  const CURVE_SAMPLES = 32;
  let sampleKeyIdx = 0;
  const newSegs = [];

  for (const seg of segs) {
    if (seg.type !== "curve") {
      newSegs.push(seg);
      continue;
    }
    const f = pts[seg.from], t = pts[seg.to];
    if (!f || !t || !seg.cp1 || !seg.cp2) { newSegs.push(seg); continue; }

    const p0x = +f.x,       p0y = +f.y;
    const p1x = +seg.cp1.x, p1y = +seg.cp1.y;
    const p2x = +seg.cp2.x, p2y = +seg.cp2.y;
    const p3x = +t.x,       p3y = +t.y;

    const samples = [];
    for (let si = 0; si <= CURVE_SAMPLES; si++) {
      if (si === 0) { samples.push({ x: newPts[seg.from].x, y: newPts[seg.from].y }); continue; }
      if (si === CURVE_SAMPLES) { samples.push({ x: newPts[seg.to].x, y: newPts[seg.to].y }); continue; }
      const u = si / CURVE_SAMPLES, v = 1 - u;
      const bx = v*v*v*p0x + 3*v*v*u*p1x + 3*v*u*u*p2x + u*u*u*p3x;
      const by = v*v*v*p0y + 3*v*v*u*p1y + 3*v*u*u*p2y + u*u*u*p3y;
      const tx = 3*(v*v*(p1x-p0x) + 2*v*u*(p2x-p1x) + u*u*(p3x-p2x));
      const ty = 3*(v*v*(p1y-p0y) + 2*v*u*(p2y-p1y) + u*u*(p3y-p2y));
      const tl = Math.sqrt(tx*tx+ty*ty)||1;
      const nx = sign * ty / tl;
      const ny = sign * (-tx) / tl;
      samples.push({ x: bx + nx*offsetDist, y: by + ny*offsetDist });
    }

    let prevKey = seg.from;
    for (let si = 1; si <= CURVE_SAMPLES; si++) {
      const isLast = si === CURVE_SAMPLES;
      let nextKey;
      if (isLast) {
        nextKey = seg.to;
      } else {
        nextKey = `_sa_${sampleKeyIdx++}`;
        newPts[nextKey] = samples[si];
      }
      newSegs.push({ type: "line", from: prevKey, to: nextKey });
      prevKey = nextKey;
    }
  }

  return { points: newPts, segments: newSegs };
}

function _buildPolyApprox(piece) {
  const pts = piece.points || {}, segs = piece.segments || [];
  const poly = [];
  segs.forEach(seg => {
    const f = pts[seg.from], t = pts[seg.to];
    if (!f || !t) return;
    if (seg.type === "line") {
      poly.push([+f.x, +f.y]);
    } else if (seg.type === "curve") {
      for (let i = 0; i < 16; i++) {
        const tt = i / 16, u = 1 - tt;
        poly.push([
          u*u*u*(+f.x) + 3*u*u*tt*(+seg.cp1.x) + 3*u*tt*tt*(+seg.cp2.x) + tt*tt*tt*(+t.x),
          u*u*u*(+f.y) + 3*u*u*tt*(+seg.cp1.y) + 3*u*tt*tt*(+seg.cp2.y) + tt*tt*tt*(+t.y)
        ]);
      }
    }
  });
  return poly;
}

function _ptInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function _drawPiecePDF(doc, piece, offsetX, offsetY, scale, seamAllowanceCm = 0) {
  const pts = piece.points || {}, segs = piece.segments || [];
  if (!segs.length) return;
  const firstPt = pts[segs[0].from];
  if (!firstPt) return;

  const linesArr = [];
  let cx = +firstPt.x, cy = +firstPt.y;
  segs.forEach(seg => {
    const f = pts[seg.from], t = pts[seg.to]; if (!f || !t) return;
    if (seg.type === "line") {
      linesArr.push([(+t.x - cx)*scale, (+t.y - cy)*scale]);
    } else if (seg.type === "curve") {
      linesArr.push([
        (+seg.cp1.x - cx)*scale, (+seg.cp1.y - cy)*scale,
        (+seg.cp2.x - cx)*scale, (+seg.cp2.y - cy)*scale,
        (+t.x - cx)*scale,       (+t.y - cy)*scale,
      ]);
    }
    cx = +t.x; cy = +t.y;
  });

  const startX = +firstPt.x * scale + offsetX;
  const startY = +firstPt.y * scale + offsetY;

  {
    const poly = _buildPolyApprox(piece);
    const allPtsList = Object.values(pts);
    const bMinX = Math.min(...allPtsList.map(p=>+p.x));
    const bMaxX = Math.max(...allPtsList.map(p=>+p.x));
    const bMinY = Math.min(...allPtsList.map(p=>+p.y));
    const bMaxY = Math.max(...allPtsList.map(p=>+p.y));
    const STEP = 5 / scale; // 5 mm on paper → cm in pattern coords
    doc.setFillColor(210, 100, 140);
    for (let dy = bMinY + STEP / 2; dy < bMaxY; dy += STEP) {
      for (let dx = bMinX + STEP / 2; dx < bMaxX; dx += STEP) {
        if (_ptInPoly(dx, dy, poly))
          doc.circle(dx * scale + offsetX, dy * scale + offsetY, 0.55, "F");
      }
    }
  }

  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(scale >= 10 ? 0.6 : 0.4);
  doc.lines(linesArr, startX, startY, [1, 1], "S", true);

  if (seamAllowanceCm > 0) {
    const offPiece = computeOffsetPolygon(piece, seamAllowanceCm);
    if (offPiece) {
      const { points: oPts, segments: oSegs } = offPiece;
      const fOff = oPts[oSegs[0].from];
      if (fOff) {
        const saArr = []; let ocx = +fOff.x, ocy = +fOff.y;
        oSegs.forEach(seg => {
          const f = oPts[seg.from], t = oPts[seg.to]; if (!f || !t) return;
          if (seg.type === "line") {
            saArr.push([(+t.x-ocx)*scale, (+t.y-ocy)*scale]);
          } else if (seg.type === "curve") {
            saArr.push([
              (+seg.cp1.x-ocx)*scale, (+seg.cp1.y-ocy)*scale,
              (+seg.cp2.x-ocx)*scale, (+seg.cp2.y-ocy)*scale,
              (+t.x-ocx)*scale,       (+t.y-ocy)*scale,
            ]);
          }
          ocx = +t.x; ocy = +t.y;
        });
        doc.setDrawColor(70, 130, 220);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([2.5, 1.5], 0);
        doc.lines(saArr, +fOff.x*scale+offsetX, +fOff.y*scale+offsetY, [1,1], "S", false);
        doc.setLineDashPattern([], 0);
      }
    }
  }

  {
    const allPtsList = Object.values(pts);
    const xs = allPtsList.map(p => +p.x), ys = allPtsList.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const midX = (minX + maxX) / 2;
    const gTop = minY + (maxY - minY) * 0.18;
    const gBot = maxY - (maxY - minY) * 0.18;
    const glx  = midX * scale + offsetX;
    const gly1 = gTop  * scale + offsetY;
    const gly2 = gBot  * scale + offsetY;
    const aw = 1.8, al = 3.2;
    doc.setDrawColor(50, 50, 50); doc.setLineWidth(0.55);
    doc.line(glx, gly1, glx, gly2);
    doc.line(glx-aw, gly1+al, glx, gly1); doc.line(glx+aw, gly1+al, glx, gly1);
    doc.line(glx-aw, gly2-al, glx, gly2); doc.line(glx+aw, gly2-al, glx, gly2);
    doc.setFontSize(5.5); doc.setTextColor(50, 50, 50);
    doc.text("GRAIN", glx + 2.2, (gly1+gly2)/2, { align: "left", angle: 90 });
  }

  segs.forEach(seg => {
    if (seg.type !== "line") return;
    const f = pts[seg.from], t = pts[seg.to]; if (!f || !t) return;
    const dx = +t.x - +f.x, dy = +t.y - +f.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 4) return; // skip very short segments
    const mx = (+f.x + +t.x) / 2 * scale + offsetX;
    const my = (+f.y + +t.y) / 2 * scale + offsetY;
    const ux = dx/len, uy = dy/len;
    const nx = -uy * 3.5, ny = ux * 3.5; // 3.5 mm half-notch
    doc.setDrawColor(233, 30, 99); doc.setLineWidth(0.7);
    doc.line(mx - nx, my - ny, mx + nx, my + ny);
  });
}

function _cropMarksPDF(doc, px, py, pw, ph) {
  const x2 = px + pw, y2 = py + ph, s = 3.5;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  [
    [px-s, py, px, py], [px, py-s, px, py],
    [x2, py, x2+s, py], [x2, py-s, x2, py],
    [px-s, y2, px, y2], [px, y2, px, y2+s],
    [x2, y2, x2+s, y2], [x2, y2, x2, y2+s],
  ].forEach(([x1,y1,x2_,y2_]) => doc.line(x1, y1, x2_, y2_));
}

async function downloadPatternZip(geometryJson, patternName, seamAllowanceCm = 0) {
  if (!window.JSZip || !window.jspdf) { alert("Required libraries not loaded. Try refreshing."); return; }
  let parsed;
  try { parsed = JSON.parse(geometryJson); } catch { alert("Cannot parse pattern geometry."); return; }
  const pieces = parsed.pieces || [];
  if (!pieces.length) { alert("No pattern pieces found."); return; }

  const { jsPDF } = window.jspdf;

  const A4W = 210, A4H = 297, MGN = 10;
  const PW = A4W - 2*MGN;   // 190 mm printable width
  const PH = A4H - 2*MGN;   // 277 mm printable height
  const OVL = 5;             // 5 mm overlap between tiles
  const STEP_W = PW - OVL;  // 185 mm horizontal advance
  const STEP_H = PH - OVL;  // 272 mm vertical advance
  const MM_PER_CM = 10;

  const zip = new JSZip();

  for (const piece of pieces) {
    const allPts = Object.values(piece.points || {});
    if (!allPts.length) continue;
    const xs = allPts.map(p => +p.x), ys = allPts.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bWexact = maxX - minX, bHexact = maxY - minY;
    const bW = bWexact % 1 === 0 ? bWexact : bWexact.toFixed(1);
    const bH = bHexact % 1 === 0 ? bHexact : bHexact.toFixed(1);
    const pW_mm = (maxX - minX) * MM_PER_CM;
    const pH_mm = (maxY - minY) * MM_PER_CM;
    const safeName = piece.name.replace(/[^\w\s-]/g, "_").trim().replace(/\s+/g, "_");

    const tMinX = minX - seamAllowanceCm, tMaxX = maxX + seamAllowanceCm;
    const tMinY = minY - seamAllowanceCm, tMaxY = maxY + seamAllowanceCm;

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    let isFirst = true;

    if (pW_mm <= PW && pH_mm <= PH) {
      const s = Math.min(PW / (maxX - minX), PH / (maxY - minY));
      const sw = (maxX - minX) * s, sh = (maxY - minY) * s;
      const offsetX = MGN + (PW - sw) / 2 - minX * s;
      const offsetY = MGN + (PH - sh) / 2 - minY * s;

      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8);
      doc.rect(MGN, MGN, PW, PH);

      { const k = doc.internal.scaleFactor;
        doc.internal.write(`q ${(MGN*k).toFixed(3)} ${((A4H-MGN-PH)*k).toFixed(3)} ${(PW*k).toFixed(3)} ${(PH*k).toFixed(3)} re W n`); }

      _drawPiecePDF(doc, piece, offsetX, offsetY, s, seamAllowanceCm);

      const saOffPx = seamAllowanceCm * s; // SA extent in mm at this scale
      doc.setDrawColor(194, 24, 91); doc.setTextColor(194, 24, 91); doc.setLineWidth(0.4);
      const hx1 = offsetX + minX * s, hx2 = offsetX + maxX * s;
      const hDimY = Math.min(offsetY + maxY * s + saOffPx + 6, MGN + PH - 5);
      doc.line(hx1, hDimY, hx2, hDimY);
      doc.line(hx1, hDimY-1.5, hx1, hDimY+1.5); doc.line(hx2, hDimY-1.5, hx2, hDimY+1.5);
      doc.setFontSize(7); doc.text(`${bW} cm`, (hx1+hx2)/2, hDimY+4, { align: "center" });
      const vy1 = offsetY + minY * s, vy2 = offsetY + maxY * s;
      const vDimX = Math.min(offsetX + maxX * s + saOffPx + 6, MGN + PW - 8);
      doc.line(vDimX, vy1, vDimX, vy2);
      doc.line(vDimX-1.5, vy1, vDimX+1.5, vy1); doc.line(vDimX-1.5, vy2, vDimX+1.5, vy2);
      doc.text(`${bH} cm`, vDimX + 5, (vy1+vy2)/2, { align: "center", angle: 90 });

      doc.internal.write('Q');

      const saNote = seamAllowanceCm > 0 ? `  |  SA: ${seamAllowanceCm} cm` : "";
      doc.setFontSize(6); doc.setTextColor(170, 170, 170);
      doc.text(`${patternName}  |  ${piece.name}  |  ${bW}×${bH} cm (pattern only${saNote})  |  Scale 1:${(MM_PER_CM/s).toFixed(2)}  |  Page 1 of 1`, MGN+1, A4H-3);

    } else {
      let totalPages = 0;
      { let ty = tMinY*MM_PER_CM; while (ty < tMaxY*MM_PER_CM) { let tx = tMinX*MM_PER_CM; while (tx < tMaxX*MM_PER_CM) { totalPages++; tx+=STEP_W; } ty+=STEP_H; } }

      let pageNum = 0, row = 0, tileY_mm = tMinY * MM_PER_CM;
      while (tileY_mm < tMaxY * MM_PER_CM) {
        let col = 0, tileX_mm = tMinX * MM_PER_CM;
        while (tileX_mm < tMaxX * MM_PER_CM) {
          pageNum++;
          if (!isFirst) doc.addPage(); isFirst = false;

          const offsetX = MGN - tileX_mm;
          const offsetY = MGN - tileY_mm;

          doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8);
          doc.rect(MGN, MGN, PW, PH);

          { const k = doc.internal.scaleFactor;
            doc.internal.write(`q ${(MGN*k).toFixed(3)} ${((A4H-MGN-PH)*k).toFixed(3)} ${(PW*k).toFixed(3)} ${(PH*k).toFixed(3)} re W n`); }

          doc.setDrawColor(100, 180, 255); doc.setLineWidth(0.4);
          doc.setLineDashPattern([2, 1.5], 0);
          if (col > 0) doc.line(MGN+OVL, MGN, MGN+OVL, MGN+PH);
          if (row > 0) doc.line(MGN, MGN+OVL, MGN+PW, MGN+OVL);
          doc.setLineDashPattern([], 0);

          _cropMarksPDF(doc, MGN, MGN, PW, PH);

          _drawPiecePDF(doc, piece, offsetX, offsetY, MM_PER_CM, seamAllowanceCm);

          {
            const rx = MGN, ry = MGN + PH - 8;
            doc.setDrawColor(0,0,0); doc.setLineWidth(0.5); doc.setLineDashPattern([],0);
            doc.rect(rx, ry, 100, 4);
            doc.setFillColor(0,0,0);
            for (let c=0; c<10; c++) {
              if (c%2===0) doc.setFillColor(0,0,0); else doc.setFillColor(255,255,255);
              doc.rect(rx + c*10, ry, 10, 4, "F");
            }
            for (let tick=0; tick<=100; tick+=10) {
              doc.setDrawColor(255,255,255); doc.setLineWidth(0.3);
              doc.line(rx+tick, ry, rx+tick, ry+4);
            }
            doc.setDrawColor(0,0,0); doc.setLineWidth(0.5);
            doc.rect(rx, ry, 100, 4);
            doc.setFontSize(5); doc.setTextColor(0,0,0);
            doc.text("← 10 cm — print at 100%, do NOT scale →", rx+50, ry-1, { align:"center" });
          }

          doc.internal.write('Q');

          const saNote = seamAllowanceCm > 0 ? `  SA:${seamAllowanceCm}cm` : "";
          doc.setFontSize(6); doc.setTextColor(170,170,170);
          doc.text(`${patternName}  |  ${piece.name}  |  ${bW}×${bH} cm (pattern)${saNote}  |  Page ${pageNum}/${totalPages} R${row+1}/C${col+1}  |  1:1  |  Cut C2+ at blue guide, butt to prev right edge`, MGN+1, A4H-3);

          tileX_mm += STEP_W; col++;
        }
        tileY_mm += STEP_H; row++;
      }
    }

    zip.file(`${safeName}.pdf`, doc.output("arraybuffer"));
  }

  zip.file("ASSEMBLY_GUIDE.txt",
`${patternName} — A4 Pattern Assembly Guide
${"=".repeat(50)}

Each PDF = one pattern piece. Multi-page PDFs tile the piece across A4 sheets at true 1:1 scale.

VERIFY YOUR PRINT SCALE FIRST:
  • Each page has a black-and-white "10 cm" ruler at the bottom-left.
  • Measure it with a real ruler after printing. It must be exactly 10 cm.
  • If not: your printer scaled the output. Set scale to 100% and reprint.
  • NEVER use "Fit to Page", "Shrink to Margins", or any auto-scale option.

PRINTING:
  • Print at exactly 100% (or "Actual Size") — no scaling.
  • Single-page PDFs are scaled to fill A4 (scale shown in footer, not 1:1).
  • Multi-page PDFs are always 1:1 (1 cm printed = 1 cm on garment).
  • Dimensions shown in footer (e.g. 47×60 cm) are PATTERN dimensions — seam
    allowance (blue dashed line) adds extra around the outside.

ASSEMBLING MULTI-PAGE PIECES (R = row top→down, C = column left→right):
  1. Trim EVERY page along the bold black border line (all 4 sides, removing the 10 mm white margin).
  2. For all pages EXCEPT the first column/row: cut along the BLUE guide line
     (5 mm from the trimmed left/top edge). Discard the thin 5 mm strip.
  3. Lay R1/C1 flat. Butt R1/C2 (cut edge) directly against R1/C1's right edge —
     the pattern lines must continue seamlessly. Tape from behind.
  4. Continue right across the row, then add rows below the same way.
  5. The assembled piece should match the dimensions in the footer exactly.
     Measure between the PINK solid lines — that distance equals bW × bH cm.

SEAM ALLOWANCE:
  • The PINK solid line with dotted fill = the sewing/stitch line (actual pattern edge).
  • The BLUE dashed line hugging the pattern shape = the fabric cutting line.
  • Dimensions (e.g. 47×60 cm) are measured between the pink lines only.
  • Cut your fabric along the BLUE dashed line (outside the pink).

PIECES:
${pieces.map(p => {
  const xs = Object.values(p.points||{}).map(q=>+q.x), ys = Object.values(p.points||{}).map(q=>+q.y);
  return `  • ${p.name}: ${Math.round(Math.max(...xs)-Math.min(...xs))} × ${Math.round(Math.max(...ys)-Math.min(...ys))} cm`;
}).join('\n')}
`);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${patternName.replace(/\s+/g, "_")}_A4_pattern.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function PatternPreview({ geometryJson, pieceMeasurements, downloadable = false, seamAllowanceCm = 0 }) {
  if (!geometryJson) return null;
  let parsed;
  try { parsed = JSON.parse(geometryJson); } catch { return <Alert type="error">Could not parse generated geometry.</Alert>; }
  const pieces = parsed.pieces || [];

  function downloadPiecePDF(piece) {
    if (!window.jspdf) { alert("jsPDF not loaded — try refreshing."); return; }
    const { jsPDF } = window.jspdf;
    const allPts = Object.values(piece.points || {});
    if (!allPts.length) return;
    const xs = allPts.map(p => +p.x), ys = allPts.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bWexact = maxX - minX, bHexact = maxY - minY;
    const bW = bWexact % 1 === 0 ? bWexact : bWexact.toFixed(1);
    const bH = bHexact % 1 === 0 ? bHexact : bHexact.toFixed(1);
    const A4W = 210, A4H = 297, MGN = 10, PW = 190, PH = 277;
    const s = Math.min(PW / (maxX - minX), PH / (maxY - minY));
    const sw = (maxX - minX) * s, sh = (maxY - minY) * s;
    const offsetX = MGN + (PW - sw) / 2 - minX * s;
    const offsetY = MGN + (PH - sh) / 2 - minY * s;
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8); doc.rect(MGN, MGN, PW, PH);
    { const k = doc.internal.scaleFactor;
      doc.internal.write(`q ${(MGN*k).toFixed(3)} ${((A4H-MGN-PH)*k).toFixed(3)} ${(PW*k).toFixed(3)} ${(PH*k).toFixed(3)} re W n`); }
    _drawPiecePDF(doc, piece, offsetX, offsetY, s, seamAllowanceCm);
    const saOffPx = seamAllowanceCm * s;
    doc.setDrawColor(194, 24, 91); doc.setTextColor(194, 24, 91); doc.setLineWidth(0.4);
    const hx1 = offsetX + minX * s, hx2 = offsetX + maxX * s;
    const hDimY = Math.min(offsetY + maxY * s + saOffPx + 6, MGN + PH - 5);
    doc.line(hx1, hDimY, hx2, hDimY);
    doc.line(hx1, hDimY-1.5, hx1, hDimY+1.5); doc.line(hx2, hDimY-1.5, hx2, hDimY+1.5);
    doc.setFontSize(7); doc.text(`${bW} cm`, (hx1+hx2)/2, hDimY+4, { align: "center" });
    const vy1 = offsetY + minY * s, vy2 = offsetY + maxY * s;
    const vDimX = Math.min(offsetX + maxX * s + saOffPx + 6, MGN + PW - 8);
    doc.line(vDimX, vy1, vDimX, vy2);
    doc.line(vDimX-1.5, vy1, vDimX+1.5, vy1); doc.line(vDimX-1.5, vy2, vDimX+1.5, vy2);
    doc.text(`${bH} cm`, vDimX + 5, (vy1 + vy2) / 2, { align: "center", angle: 90 });
    doc.internal.write('Q');
    doc.setFontSize(6); doc.setTextColor(170, 170, 170);
    const saNote = seamAllowanceCm > 0 ? `  |  SA: ${seamAllowanceCm} cm` : "";
    doc.text(`${piece.name}  |  ${bW}×${bH} cm (pattern only${saNote})  |  1:${(10/s).toFixed(2)}  |  Print at 100%`, MGN+1, A4H-3);
    doc.save(`${piece.name.replace(/[^\w\s-]/g,"_").trim()}.pdf`);
  }

  function buildPath(piece) {
    const points = piece.points || {}; const segments = piece.segments || [];
    if (!segments.length) return "";
    let d = "";
    segments.forEach((seg, i) => {
      const from = points[seg.from], to = points[seg.to]; if (!from || !to) return;
      if (i === 0) d += `M ${from.x} ${from.y} `;
      if (seg.type === "line") d += `L ${to.x} ${to.y} `;
      else if (seg.type === "curve") d += `C ${seg.cp1.x} ${seg.cp1.y}, ${seg.cp2.x} ${seg.cp2.y}, ${to.x} ${to.y} `;
    });
    return d + "Z";
  }

  function buildSeamAllowancePath(piece) {
    if (seamAllowanceCm <= 0) return "";
    const off = computeOffsetPolygon(piece, seamAllowanceCm);
    if (!off) return "";
    const { points: oPts, segments: oSegs } = off;
    let d = "";
    oSegs.forEach((seg, i) => {
      const from = oPts[seg.from], to = oPts[seg.to]; if (!from || !to) return;
      if (i === 0) d += `M ${from.x} ${from.y} `;
      if (seg.type === "line") d += `L ${to.x} ${to.y} `;
      else if (seg.type === "curve") d += `C ${seg.cp1.x} ${seg.cp1.y}, ${seg.cp2.x} ${seg.cp2.y}, ${to.x} ${to.y} `;
    });
    return d + "Z";
  }

  function renderGrainlineAndNotches(piece) {
    const pts = Object.values(piece.points || {});
    if (!pts.length) return null;
    const xs = pts.map(p => +p.x), ys = pts.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const midX = (minX + maxX) / 2;
    const gTop = minY + (maxY - minY) * 0.18;
    const gBot = maxY - (maxY - minY) * 0.18;
    const aw = (maxX - minX) * 0.04;
    const al = (maxY - minY) * 0.05;
    const segs = piece.segments || [], ptsMap = piece.points || {};
    const notches = [];
    segs.forEach(seg => {
      if (seg.type !== "line") return;
      const f = ptsMap[seg.from], t = ptsMap[seg.to]; if (!f || !t) return;
      const dx = +t.x - +f.x, dy = +t.y - +f.y, len = Math.sqrt(dx*dx+dy*dy);
      if (len < 4) return;
      const mx = (+f.x + +t.x)/2, my = (+f.y + +t.y)/2;
      const nx = -dy/len, ny = dx/len;
      const nlen = Math.min(len*0.08, 2.5);
      notches.push({ mx, my, nx: nx*nlen, ny: ny*nlen });
    });
    return (
      <g>
        <line x1={midX} y1={gTop} x2={midX} y2={gBot} stroke="#555" strokeWidth="0.7"/>
        <line x1={midX-aw} y1={gTop+al} x2={midX} y2={gTop} stroke="#555" strokeWidth="0.7"/>
        <line x1={midX+aw} y1={gTop+al} x2={midX} y2={gTop} stroke="#555" strokeWidth="0.7"/>
        <line x1={midX-aw} y1={gBot-al} x2={midX} y2={gBot} stroke="#555" strokeWidth="0.7"/>
        <line x1={midX+aw} y1={gBot-al} x2={midX} y2={gBot} stroke="#555" strokeWidth="0.7"/>
        <text x={midX+1.5} y={(gTop+gBot)/2} fill="#555" fontSize="2.6" textAnchor="middle"
              transform={`rotate(90 ${midX+1.5} ${(gTop+gBot)/2})`}>GRAIN</text>
        {notches.map((n, i) => (
          <line key={i} x1={n.mx-n.nx} y1={n.my-n.ny} x2={n.mx+n.nx} y2={n.my+n.ny}
                stroke="var(--pink-600)" strokeWidth="1.4"/>
        ))}
      </g>
    );
  }

  function renderBBoxDimensions(piece) {
    const pts = Object.values(piece.points || {});
    if (!pts.length) return null;
    const xs = pts.map(p => +p.x), ys = pts.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = Math.round(maxX - minX), h = Math.round(maxY - minY);
    const gap = 10, tk = 2.5;
    const dc = "rgba(194,24,91,0.55)", tc = "#c2185b";
    const hY = maxY + gap, vX = maxX + gap;
    const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
    return (
      <g key={piece.name + "-bbox"}>
        <line x1={minX} y1={maxY} x2={minX} y2={hY} stroke={dc} strokeWidth="0.5"/>
        <line x1={maxX} y1={maxY} x2={maxX} y2={hY} stroke={dc} strokeWidth="0.5"/>
        <line x1={minX} y1={hY} x2={maxX} y2={hY} stroke={dc} strokeWidth="0.8"/>
        <line x1={minX} y1={hY - tk} x2={minX} y2={hY + tk} stroke={dc} strokeWidth="0.8"/>
        <line x1={maxX} y1={hY - tk} x2={maxX} y2={hY + tk} stroke={dc} strokeWidth="0.8"/>
        <text x={midX} y={hY + 3.5} fill={tc} fontSize="4.2" textAnchor="middle" dominantBaseline="hanging">{w} cm</text>
        <line x1={maxX} y1={minY} x2={vX} y2={minY} stroke={dc} strokeWidth="0.5"/>
        <line x1={maxX} y1={maxY} x2={vX} y2={maxY} stroke={dc} strokeWidth="0.5"/>
        <line x1={vX} y1={minY} x2={vX} y2={maxY} stroke={dc} strokeWidth="0.8"/>
        <line x1={vX - tk} y1={minY} x2={vX + tk} y2={minY} stroke={dc} strokeWidth="0.8"/>
        <line x1={vX - tk} y1={maxY} x2={vX + tk} y2={maxY} stroke={dc} strokeWidth="0.8"/>
        <text x={vX + 3.5} y={midY} fill={tc} fontSize="4.2" textAnchor="middle" dominantBaseline="middle" transform={`rotate(90 ${vX + 3.5} ${midY})`}>{h} cm</text>
      </g>
    );
  }

  function getViewBox(piece) {
    const pts = Object.values(piece.points || {});
    if (!pts.length) return "-10 -5 120 160";
    const xs = pts.map(p => +p.x), ys = pts.map(p => +p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return `${minX - 10} ${minY - 8} ${(maxX - minX) + 32} ${(maxY - minY) + 26}`;
  }

  return (
    <div className="piece-grid">
      {pieces.map(piece => (
        <div className="piece-card" key={piece.name}>
          {downloadable && (
            <button className="piece-download-btn" onClick={() => downloadPiecePDF(piece)} title="Download PDF">⬇ PDF</button>
          )}
          <div className="piece-title">{piece.name}</div>
          <svg className="piece-svg" viewBox={getViewBox(piece)} preserveAspectRatio="xMidYMin meet">
            {buildSeamAllowancePath(piece) && (
              <path d={buildSeamAllowancePath(piece)} fill="none" stroke="rgba(70,130,220,0.6)"
                    strokeWidth="1" strokeDasharray="3,2"/>
            )}
            {buildPath(piece) && <path d={buildPath(piece)} fill="rgba(233,30,99,0.06)" stroke="var(--pink-500)" strokeWidth="1.6"/>}
            {renderGrainlineAndNotches(piece)}
            {renderBBoxDimensions(piece)}
          </svg>
        </div>
      ))}
    </div>
  );
}

function PieceMeasurements({ pieceMeasurements }) {
  if (!pieceMeasurements?.length) return null;
  return (
    <div className="piece-grid">
      {pieceMeasurements.map(piece => (
        <div className="piece-card" key={piece.pieceName+"-m"}>
          <div className="piece-title">{piece.pieceName} measurements</div>
          <div className="text-sm text-muted mb-2">Total: <b style={{ color: "var(--pink-600)" }}>{piece.totalLength} cm</b></div>
          <div className="measurement-list">
            {piece.edges.map(edge => (
              <div className="measurement-row" key={piece.pieceName+"-"+edge.label}>
                <span>{edge.label} ({edge.type})</span><b>{edge.length} cm</b>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getPatternIcon(patternName) {
  const n = (patternName || "").toLowerCase();
  if (n.includes("oversized long sleeve") || n.includes("long sleeve") || n.includes("longsleeve")) return LongSleeveIcon;
  if (n.includes("crop top"))        return CropTopIcon;
  if (n.includes("sleeveless"))      return SleevelessIcon;
  if (n.includes("t-shirt") || n.includes("tshirt")) return TShirtIcon;
  if (n.includes("v-neck") || n.includes("vneck") || n.includes("blouse")) return VNeckIcon;
  if (n.includes("hoodie"))          return HoodieIcon;
  if (n.includes("jogger"))          return JoggersIcon;
  if (n.includes("legging"))         return LeggingsIcon;
  if (n.includes("shorts"))          return ShortsIcon;
  if (n.includes("pants") || n.includes("trouser")) return PantsIcon;
  if (n.includes("mini skirt"))      return MiniSkirtIcon;
  if (n.includes("midi skirt"))      return MidiSkirtIcon;
  if (n.includes("maxi skirt"))      return MaxiSkirtIcon;
  if (n.includes("pleated"))         return PleatedSkirtIcon;
  if (n.includes("skirt"))           return SkirtIcon;
  if (n.includes("bomber"))          return BomberJacketIcon;
  if (n.includes("blazer"))          return BlazerIcon;
  if (n.includes("denim jacket"))    return DenimJacketIcon;
  if (n.includes("puffer jacket"))   return PufferJacketIcon;
  if (n.includes("jacket"))          return JacketIcon;
  if (n.includes("mini dress"))      return MiniDressIcon;
  if (n.includes("midi dress"))      return MidiDressIcon;
  if (n.includes("maxi dress"))      return MaxiDressIcon;
  if (n.includes("wrap dress"))      return WrapDressIcon;
  if (n.includes("dress"))           return DressIcon;
  if (n.includes("trench"))          return TrenchCoatIcon;
  if (n.includes("pea coat"))        return PeaCoatIcon;
  if (n.includes("puffer coat"))     return PufferCoatIcon;
  if (n.includes("coat"))            return CoatIcon;
  if (n.includes("boot"))            return BootsIcon;
  if (n.includes("sandal"))          return SandalsIcon;
  if (n.includes("heel"))            return HeelsIcon;
  if (n.includes("sneaker") || n.includes("shoe")) return FootwearIcon;
  if (n.includes("baseball cap"))    return BaseballCapIcon;
  if (n.includes("beanie"))          return BeanieIcon;
  if (n.includes("bucket hat"))      return BucketHatIcon;
  if (n.includes("wide brim"))       return WideBrimHatIcon;
  if (n.includes("bralette"))        return BraletteIcon;
  if (n.includes("sports bra"))      return SportsBraIcon;
  if (n.includes("boxer"))           return BoxersIcon;
  if (n.includes("brief") || n.includes("underwear")) return UnderwearIcon;
  if (n.includes("corset"))          return CorsetIcon;
  if (n.includes("shaping shorts"))  return ShapingShortsIcon;
  if (n.includes("full body"))       return FullBodyShaperIcon;
  if (n.includes("bodysuit") || n.includes("shapewear")) return ShapewearIcon;
  return null; // fall back to caller
}

function GeneratorPage({ me, go, setMe }) {
  const t = useT();
  function _slug(s) { return (s||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""); }
  function _groupSlug(cat) { const g = CATEGORY_GROUPS.find(x=>x.value===cat); return _slug(g?.label||cat); }
  function _stepHash(s, grp, pat) {
    const g = _groupSlug(grp||selectedGroup||"");
    const p = _slug((pat||selectedPattern)?.patternName||"");
    if (s==="subtype")      return `/generator/${g}`;
    if (s==="measurements") return `/generator/${g}/${p}`;
    if (s==="result")       return `/generator/${g}/${p}/result`;
    return "/generator";
  }
  function stepFromHash() {
    const parts = (window.location.hash||"").replace("#","").split("/").filter(Boolean);
    if (parts.length>=4 && parts[3]==="result") return "result";
    if (parts.length>=3) return "measurements";
    if (parts.length>=2) return "subtype";
    return "group";
  }
  const [step, setStep] = useState(stepFromHash);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [manualVals, setManualVals] = useState(() => Object.fromEntries(ALL_MEASUREMENT_FIELDS.map(f => [f.code, ""])));
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [savePrompt, setSavePrompt] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDone, setSaveDone] = useState(false);
  const [initPatternId, setInitPatternId] = useState(null);
  const [clothingSize, setClothingSize] = useState(() => localStorage.getItem(`pg_bodysize_${me?.username}`) || "M");
  const [bodyShape, setBodyShape] = useState(() => localStorage.getItem(`pg_bodyshape_${me?.username}`) || "rectangle");
  const [measMode, setMeasMode] = useState("size"); // "size" | "cm"
  const [seamAllowance, setSeamAllowance] = useState(1); // cm: 0 | 1 | 1.5
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"

  function goStep(s, grp, pat) {
    window.location.hash = `#${_stepHash(s, grp, pat)}`;
    setStep(s);
  }

  useEffect(() => {
    function onHash() {
      const h = window.location.hash;
      if (!h.startsWith("#/generator")) return; // let App handle non-generator routes
      const s = stepFromHash();
      setStep(s);
      if (s === "group") {
        setSelectedGroup(null); setSelectedPattern(null);
        setGenerated(null); setErr(null);
      } else if (s === "subtype") {
        setSelectedPattern(null); setGenerated(null); setErr(null);
      } else if (s === "measurements") {
        setGenerated(null); setErr(null);
      }
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const FIELDS = ALL_MEASUREMENT_FIELDS;

  useEffect(() => {
    if (!getToken()) { go("/login"); return; }
    api("/api/patterns").then(setPatterns).catch(() => {});
    api("/api/profiles").then(setProfiles).catch(() => {});

    const initGroup = sessionStorage.getItem("pg_initGroup");
    if (initGroup) {
      setSelectedGroup(initGroup); goStep("subtype", initGroup);
      sessionStorage.removeItem("pg_initGroup");
    }

    const pid = sessionStorage.getItem("pg_initPatternId");
    if (pid) { setInitPatternId(pid); sessionStorage.removeItem("pg_initPatternId"); }

    const initProfile = sessionStorage.getItem("pg_initProfile");
    if (initProfile) { setSelectedProfileId(initProfile); sessionStorage.removeItem("pg_initProfile"); }
  }, [go]);

  useEffect(() => {
    if (initPatternId && patterns.length > 0) {
      const match = patterns.find(p => p.id == initPatternId);
      if (match) { setSelectedPattern(match); goStep("measurements", match.category, match); }
      setInitPatternId(null);
    }
  }, [patterns, initPatternId]);

  const subtypePatterns = selectedGroup
    ? patterns.filter(p => p.category === selectedGroup)
    : patterns;

  function pickPattern(pattern) {
    setSelectedPattern(pattern);
    goStep("measurements", selectedGroup, pattern);
  }

  async function generate() {
    if (!selectedPattern) return;
    if (measMode === "cm" && useManual) {
      const { required } = getPatternFieldConfig(selectedPattern);
      const missing = required.filter(code => !manualVals[code]);
      if (missing.length > 0) {
        const labels = missing.map(c => ALL_MEASUREMENT_FIELDS.find(f => f.code === c)?.label || c);
        setErr(`Please fill in required fields: ${labels.join(", ")}`);
        return;
      }
    }
    setLoading(true); setErr(null);
    let tempProfileId = null;
    try {
      await api("/api/patterns/select", { method: "POST", body: { basePatternId: selectedPattern.id } });

      let profileIdToUse = measMode === "cm" && !useManual ? selectedProfileId : null;
      if (measMode === "size") {
        const derived = measurementsFromSize(clothingSize, bodyShape);
        const measurements = {};
        for (const f of FIELDS) { if (derived[f.code] !== undefined) measurements[f.code] = derived[f.code]; }
        const tp = await api("/api/profiles", { method: "POST", body: { profileName: `__tmp_${Date.now()}`, measurements } });
        tempProfileId = tp.id;
        profileIdToUse = tempProfileId;
      } else if (measMode === "cm" && useManual) {
        const measurements = {};
        for (const f of FIELDS) { if (manualVals[f.code] !== "") measurements[f.code] = Number(manualVals[f.code]); }
        const tp = await api("/api/profiles", { method: "POST", body: { profileName: `__tmp_${Date.now()}`, measurements } });
        tempProfileId = tp.id;
        profileIdToUse = tempProfileId;
      }

      const url = profileIdToUse ? `/api/patterns/generate?profileId=${profileIdToUse}` : "/api/patterns/generate";
      const data = await api(url);
      if (tempProfileId) api(`/api/profiles/${tempProfileId}`, { method: "DELETE" }).catch(() => {});

      try {
        const recentKey = `pg_recent_${me.username}`;
        const existing = JSON.parse(localStorage.getItem(recentKey) || "[]");
        const entry = { patternName: data.patternName, category: selectedPattern.category, patternId: selectedPattern.id };
        localStorage.setItem(recentKey, JSON.stringify([entry, ...existing.filter(e => e.patternId !== selectedPattern.id)].slice(0, 10)));
        api(`/api/patterns/${selectedPattern.id}/use`, { method: "POST" }).catch(() => {});
      } catch {}
      setSaveStatus(null);
      setGenerated(data);
      goStep("result");
    } catch (e) {
      if (tempProfileId) api(`/api/profiles/${tempProfileId}`, { method: "DELETE" }).catch(() => {});
      setErr(e.message);
    }
    finally { setLoading(false); }
  }

  async function saveManualMeasurements() {
    if (!saveName.trim()) return;
    const measurements = {};
    for (const f of FIELDS) { if (manualVals[f.code] !== "") measurements[f.code] = Number(manualVals[f.code]); }
    try {
      await api("/api/profiles", { method: "POST", body: { profileName: saveName.trim(), measurements } });
      setSaveDone(true); setSavePrompt(false);
      api("/api/profiles").then(setProfiles).catch(() => {});
    } catch (e) { setErr(e.message); }
  }

  function resetAll() {
    goStep("group"); setGenerated(null); setSelectedPattern(null);
    setSelectedGroup(null); setSelectedProfileId("");
    setUseManual(false); setErr(null); setSaveStatus(null);
    setManualVals(Object.fromEntries(ALL_MEASUREMENT_FIELDS.map(f => [f.code, ""])));
  }

  async function savePattern() {
    if (!generated) return;
    setSaveStatus("saving");
    try {
      let snap;
      if (measMode === "size") {
        snap = JSON.stringify({ mode: "size", clothingSize, bodyShape });
      } else {
        const profile = profiles.find(p => p.id == selectedProfileId);
        snap = JSON.stringify({ mode: "cm", ...(profile?.measurements || {}) });
      }
      await api("/api/saved-patterns", {
        method: "POST",
        body: {
          patternName: generated.patternName,
          category: generated.category || (selectedPattern?.category ?? "TOPS"),
          basePatternId: generated.basePatternId,
          adjustedGeometryJson: generated.adjustedGeometryJson,
          pieceMeasurementsJson: JSON.stringify(generated.pieceMeasurements || []),
          measurementsSnapshot: snap,
        }
      });
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }

  const selectedFolderMeas = selectedProfileId
    ? (profiles.find(p => p.id == selectedProfileId)?.measurements || {})
    : {};
  const folderValsForWarning = Object.fromEntries(
    ALL_MEASUREMENT_FIELDS.map(f => [f.code, selectedFolderMeas[f.code] ?? ""])
  );

  if (step === "result" && generated) {
    const saOptions = [{ v: 0, label: "None" }, { v: 1, label: "1 cm" }, { v: 1.5, label: "1.5 cm" }];
    return (
      <div className="gen-overlay">
        <Navbar me={me} go={go} setMe={setMe} />
        <div className="gen-result-topbar">
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--gray-800)" }}>{generated.patternName}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--pink-50)", borderRadius: 8, padding: "4px 10px", border: "1px solid var(--pink-200)" }}>
              <span style={{ fontSize: 12, color: "var(--gray-500)", whiteSpace: "nowrap" }}>Seam allowance:</span>
              {saOptions.map(opt => (
                <button key={opt.v}
                  className={`btn btn-sm ${seamAllowance === opt.v ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "3px 10px", fontSize: 12 }}
                  onClick={() => setSeamAllowance(opt.v)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={resetAll}>New Pattern</button>
            <button className="btn btn-primary btn-sm"
              onClick={() => downloadPatternZip(generated.adjustedGeometryJson, generated.patternName, seamAllowance)}>
              🖨 Print / ZIP
            </button>
            <button className="btn btn-sm"
              style={{ background: saveStatus === "saved" ? "#d1fae5" : "var(--pink-50)", color: saveStatus === "saved" ? "#065f46" : "var(--pink-700)", border: "1px solid", borderColor: saveStatus === "saved" ? "#6ee7b7" : "var(--pink-300)" }}
              onClick={savePattern}
              disabled={saveStatus === "saving" || saveStatus === "saved"}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "⚠ Retry" : "💾 Save"}
            </button>
            <button className="gen-close-btn" onClick={() => go("/home")}>✕</button>
          </div>
        </div>
        {saveStatus === "saved" && (
          <div style={{ background: "#d1fae5", borderBottom: "1px solid #6ee7b7", padding: "8px 24px", fontSize: 13, color: "#065f46", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Pattern saved to your library!
            <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => go("/my-patterns")}>View My Patterns →</button>
          </div>
        )}
        <div className="gen-result-body">
          <PatternPreview geometryJson={generated.adjustedGeometryJson} pieceMeasurements={generated.pieceMeasurements} downloadable={true} seamAllowanceCm={seamAllowance} />
        </div>
        <div style={{ padding: "0 24px 8px" }}>
          <PatternUsageGuide />
        </div>
        <div style={{ padding: "0 0 32px" }} />
      </div>
    );
  }

  const stepLabel = { group: t("gen.chooseType"), subtype: t("gen.chooseStyle"), measurements: t("gen.chooseMeasurements") }[step];

  return (
    <div className="gen-overlay">
      <Navbar me={me} go={go} setMe={setMe} />
      <div className="gen-header">
        <div className="gen-breadcrumb">
          <button className="gen-back" onClick={() => {
            setErr(null);
            if (step === "group") go("/home");
            else if (step === "subtype") goStep("group");
            else if (step === "measurements") goStep("subtype");
          }}>← Back</button>
          <span className="gen-step-label">{stepLabel}</span>
        </div>
        <button className="gen-close-btn" onClick={() => go("/home")}>✕</button>
      </div>

      {err && <div style={{ padding: "0 24px" }}><Alert type="error">{err}</Alert></div>}

      {step === "group" && (
        <div className="gen-step">
          <div className="gen-cards-grid">
            {CATEGORY_GROUPS.map(grp => {
              const Icon = grp.icon;
              return (
                <div key={grp.value} className="gen-cat-card"
                  onClick={() => { setSelectedGroup(grp.value); goStep("subtype", grp.value); }}>
                  <div className="gen-cat-icon"><Icon size={68} /></div>
                  <div className="gen-cat-label">{t(grp.labelKey)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === "subtype" && (
        <div className="gen-step">
          {subtypePatterns.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-text">No patterns in this category yet</div>
              <div className="empty-state-sub">Ask an admin to add patterns here</div>
            </div>
          ) : (
            <div className="gen-cards-grid">
              {subtypePatterns.map(p => {
                const Icon = getPatternIcon(p.patternName) || CATEGORY_GROUPS.find(g=>g.value===p.category)?.icon || TShirtIcon;
                return (
                  <div key={p.id} className="gen-cat-card" onClick={() => pickPattern(p)}>
                    <div className="gen-cat-icon"><Icon size={68} /></div>
                    <div className="gen-cat-label">{(() => { const k = "pname." + p.patternName; const tr = t(k); return tr === k ? p.patternName : tr; })()}</div>
                    {p.description && <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2, textAlign: "center" }}>{p.description}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === "measurements" && (
        <div className="gen-step">
          <div className="gen-measurements-container">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setErr(null); goStep("subtype"); }}>← Back</button>
              {selectedPattern && (() => { const grp = CATEGORY_GROUPS.find(g => g.value === selectedPattern.category); const Icon = getPatternIcon(selectedPattern.patternName) || grp?.icon || TShirtIcon; return (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, padding: "8px 12px", background: "var(--pink-50)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ flexShrink: 0 }}><Icon size={32} /></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{(() => { const k2="pname."+selectedPattern.patternName; const tr2=t(k2); return tr2===k2?selectedPattern.patternName:tr2; })()}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{grp ? t(grp.labelKey) : selectedPattern.category}</div>
                  </div>
                </div>
              ); })()}
            </div>

            <div className="gen-meas-toggle" style={{ marginBottom: 18 }}>
              <button className={`btn ${measMode === "size" ? "btn-primary" : "btn-secondary"} btn-sm`}
                onClick={() => setMeasMode("size")}>{t("gen.bySize")}</button>
              <button className={`btn ${measMode === "cm" ? "btn-primary" : "btn-secondary"} btn-sm`}
                onClick={() => setMeasMode("cm")}>{t("gen.byCm")}</button>
            </div>

            {measMode === "size" && (() => {
              const derived = measurementsFromSize(clothingSize, bodyShape);
              return (
                <div>
                  <div style={{ marginBottom: 14, padding: "12px 14px", background: "var(--pink-50)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>{t("gen.clothingSize")}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                      {CLOTHING_SIZES.map(sz => (
                        <button key={sz}
                          className={`btn ${clothingSize === sz ? "btn-primary" : "btn-secondary"} btn-sm`}
                          onClick={() => { setClothingSize(sz); localStorage.setItem(`pg_bodysize_${me?.username}`, sz); }}>
                          {sz}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>{t("gen.bodyShape")}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                      {BODY_SHAPES.map(bs => (
                        <button key={bs.value}
                          className={`btn ${bodyShape === bs.value ? "btn-primary" : "btn-secondary"} btn-sm`}
                          onClick={() => { setBodyShape(bs.value); localStorage.setItem(`pg_bodyshape_${me?.username}`, bs.value); }}>
                          {t(bs.labelKey)}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      {BODY_SHAPES.find(b => b.value === bodyShape)?.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}>{t("gen.derivedMeasurements")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                    {Object.entries(derived).map(([k, v]) => (
                      <span key={k} className="badge badge-pink">{k.replace(/_/g, " ")}: {v} cm</span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {measMode === "cm" && (
              <div>
                <div className="gen-meas-toggle" style={{ marginBottom: 14 }}>
                  <button className={`btn ${!useManual ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setUseManual(false)}>{t("gen.useSavedFolder")}</button>
                  <button className={`btn ${useManual ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setUseManual(true)}>{t("gen.enterManually")}</button>
                </div>

                {!useManual && (
                  <div>
                    <div className="field" style={{ maxWidth: 380 }}>
                      <label className="label">{t("gen.measurementFolder")}</label>
                      <select className="input" value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)}>
                        <option value="">{t("gen.useDefault")}</option>
                        {profiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
                      </select>
                    </div>
                    {selectedProfileId && profiles.find(p => p.id == selectedProfileId) && (() => {
                      const folder = profiles.find(p => p.id == selectedProfileId);
                      const meas = folder?.measurements || {};
                      const { required: reqCodes } = getPatternFieldConfig(selectedPattern);
                      const missing = reqCodes.filter(c => !meas[c]);
                      return (
                        <div>
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {Object.entries(meas).map(([k,v]) => (
                              <span key={k} className="badge badge-pink"
                                style={{ background: reqCodes.includes(k) ? "var(--pink-100)" : undefined }}>
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                          {missing.length > 0 && (
                            <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 12, color: "#b91c1c" }}>
                              <strong>{t("gen.missingFields")}</strong> {missing.map(c => ALL_MEASUREMENT_FIELDS.find(f => f.code===c)?.label || c).join(", ")}
                              <span style={{ color: "#6b7280", marginLeft: 6 }}>{t("gen.defaultsUsed")}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {selectedProfileId && <MeasurementWarnings vals={folderValsForWarning} />}
                  </div>
                )}

                {useManual && (() => {
                  const { required: reqCodes, optional: optCodes } = getPatternFieldConfig(selectedPattern);
                  const shownCodes = new Set([...reqCodes, ...optCodes]);
                  const reqFields = ALL_MEASUREMENT_FIELDS.filter(f => reqCodes.includes(f.code));
                  const optFields = ALL_MEASUREMENT_FIELDS.filter(f => optCodes.includes(f.code));
                  return (
                  <div>
                    <div className="form" style={{ maxWidth: 400 }}>
                      {reqFields.map(f => (
                        <div key={f.code} className="field">
                          <label className="label">
                            {f.label}
                            <span style={{ color: "#be123c", marginLeft: 4, fontWeight: 700 }}>*</span>
                          </label>
                          <input className="input" type="number" min="0"
                            value={manualVals[f.code]}
                            onChange={e => setManualVals(p => ({ ...p, [f.code]: e.target.value }))} />
                        </div>
                      ))}
                      {optFields.length > 0 && (
                        <div style={{ fontSize: 12, color: "var(--gray-400)", margin: "12px 0 4px", fontWeight: 600, letterSpacing: "0.03em" }}>
                          {t("gen.optionalDesc")}
                        </div>
                      )}
                      {optFields.map(f => (
                        <div key={f.code} className="field">
                          <label className="label">
                            {f.label}
                            <span style={{ color: "var(--gray-400)", fontSize: 11, marginLeft: 5 }}>(optional)</span>
                          </label>
                          <input className="input" type="number" min="0"
                            value={manualVals[f.code]}
                            onChange={e => setManualVals(p => ({ ...p, [f.code]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <MeasurementWarnings vals={manualVals} />
                    {!saveDone && (
                      <div style={{ marginTop: 14 }}>
                        {!savePrompt ? (
                          <button className="btn btn-pink-outline btn-sm" onClick={() => setSavePrompt(true)}>+ Save as folder</button>
                        ) : (
                          <div className="card" style={{ padding: 14, marginTop: 8, maxWidth: 400 }}>
                            <Field label="Folder name" placeholder="e.g. My Measurements" value={saveName} onChange={e => setSaveName(e.target.value)} />
                            <div className="flex gap-2 mt-2">
                              <button className="btn btn-primary btn-sm" onClick={saveManualMeasurements}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setSavePrompt(false)}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {saveDone && <div className="alert alert-success mt-2" style={{ maxWidth: 400 }}>Measurements saved!</div>}
                  </div>
                  );
                })()}
              </div>
            )}

            <div style={{ marginTop: 28 }}>
              <button className="btn btn-primary" style={{ fontSize: 16, padding: "13px 44px" }}
                disabled={loading || !selectedPattern} onClick={generate}>
                {loading ? t("gen.generating") : t("gen.generate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyPatternsPage({ me, go, setMe }) {
  const t = useT();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!getToken()) { go("/login"); return; }
    api("/api/saved-patterns").then(data => { setPatterns(data); setLoading(false); }).catch(e => { setErr(e.message); setLoading(false); });
  }, [go]);

  async function deletePattern(id) {
    if (!confirm("Remove this saved pattern?")) return;
    setDeleting(id);
    try {
      await api(`/api/saved-patterns/${id}`, { method: "DELETE" });
      setPatterns(p => p.filter(x => x.id !== id));
    } catch (e) { setErr(e.message); }
    setDeleting(null);
  }

  const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  function getMeasSummary(snap) {
    try {
      const obj = JSON.parse(snap || "{}");
      if (obj.mode === "size") return `Size ${obj.clothingSize}${obj.bodyShape ? ` · ${obj.bodyShape}` : ""}`;
      const keys = ["CHEST","SHOULDER_WIDTH","SHIRT_LENGTH","SLEEVE_LENGTH","WAIST","HIP","OUTSEAM"];
      return keys.filter(k => obj[k]).map(k => `${k.replace(/_/g," ")}: ${obj[k]} cm`).join(" · ") || "—";
    } catch { return "—"; }
  }

  const typeIcon = cat => { const g = CATEGORY_GROUPS.find(g => g.value === cat); if (!g) return null; const Icon = g.icon; return <Icon size={22} />; };

  return (
    <div>
      <Navbar me={me} go={go} setMe={setMe} />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t("patterns.title")}</h1>
            <p className="page-description">{t("patterns.desc")}</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => go("/generator")}>{t("gen.newPattern")}</button>
          </div>
        </div>

        {err && <Alert type="error">{err}</Alert>}
        {loading && <div className="loading">{t("loading")}</div>}

        {!loading && patterns.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--gray-700)", marginBottom: 8 }}>{t("patterns.noPatterns")}</div>
            <div style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 20 }}>{t("patterns.noDesc")}</div>
            <button className="btn btn-primary" onClick={() => go("/generator")}>{t("patterns.generatePattern")}</button>
          </div>
        )}

        {!loading && patterns.length > 0 && (
          <div style={{ display: "grid", gap: 16 }}>
            {patterns.map(p => {
              let geom = null;
              try { geom = JSON.parse(p.adjustedGeometryJson); } catch {}
              const pieces = geom?.pieces || [];
              return (
                <div key={p.id} className="card" style={{ borderLeft: "4px solid var(--pink-400)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ color: "var(--pink-500)" }}>{typeIcon(p.category)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-800)" }}>{(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>
                          <span className="badge badge-pink" style={{ fontSize: 11, marginRight: 8 }}>{(p.category||"").replace(/_/g," ")}</span>
                          {t("patterns.saved")} {fmt(p.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => downloadPatternZip(p.adjustedGeometryJson, p.patternName)}>
                        {t("patterns.downloadZip")}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deletePattern(p.id)} disabled={deleting === p.id}>
                        {deleting === p.id ? "…" : t("delete")}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--gray-500)", background: "var(--pink-50)", borderRadius: 6, padding: "8px 12px" }}>
                    <b style={{ color: "var(--gray-700)" }}>{t("patterns.measurementsUsed")}</b> {getMeasSummary(p.measurementsSnapshot)}
                  </div>

                  {pieces.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>{t("patterns.patternPieces")}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {pieces.map(piece => {
                          const pts = Object.values(piece.points || {});
                          const xs = pts.map(q => +q.x), ys = pts.map(q => +q.y);
                          const w = pts.length ? Math.round(Math.max(...xs)-Math.min(...xs)) : "?";
                          const h = pts.length ? Math.round(Math.max(...ys)-Math.min(...ys)) : "?";
                          return (
                            <div key={piece.name} style={{ background: "#fff", border: "1px solid var(--pink-200)", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
                              <div style={{ fontWeight: 600, color: "var(--pink-700)" }}>{piece.name}</div>
                              <div style={{ color: "var(--gray-500)" }}>{w}×{h} cm</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPage({ me, go, setMe }) {
  const t = useT();
  const [tab, setTab] = useState("patterns");
  if (me?.role !== "ADMIN") return (<div><Navbar me={me} go={go} setMe={setMe}/><div className="page-container"><Alert type="error">{t("admin.accessDenied")}</Alert></div></div>);
  return (
    <div><Navbar me={me} go={go} setMe={setMe} /><div className="page-container">
      <div className="page-header"><div><h1 className="page-title">{t("admin.title")}</h1><p className="page-description">{t("admin.desc")}</p></div></div>
      <div className="tabs">
        <button className={`tab ${tab==="stats"?"active":""}`} onClick={() => setTab("stats")}>{t("admin.stats")}</button>
        <button className={`tab ${tab==="patterns"?"active":""}`} onClick={() => setTab("patterns")}>{t("admin.patternsTab")}</button>
        <button className={`tab ${tab==="users"?"active":""}`} onClick={() => setTab("users")}>{t("admin.usersTab")}</button>
      </div>
      {tab==="stats" && <AdminStats />}
      {tab==="patterns" && <AdminPatterns />}
      {tab==="users" && <AdminUsers />}
    </div></div>
  );
}

function AdminStats() {
  const [patterns, setPatterns] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [popularPatterns, setPopularPatterns] = React.useState([]);

  React.useEffect(() => {
    api("/api/patterns").then(data => {
      setPatterns(data);
      setPopularPatterns([...data].sort((a, b) => (b.useCount||0) - (a.useCount||0)).slice(0, 8));
    }).catch(() => {});
    api("/api/admin/users").then(setUsers).catch(() => {});
  }, []);

  const catCounts = {};
  CATEGORY_GROUPS.forEach(g => { catCounts[g.value] = 0; });
  patterns.forEach(p => { if (p.category in catCounts) catCounts[p.category]++; });
  const maxCatCount = Math.max(...Object.values(catCounts), 1);
  const totalUses = popularPatterns.reduce((s, p) => s + (p.useCount || 0), 0);

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-number">{patterns.length}</div><div className="stat-label">Total Patterns</div></div>
        <div className="stat-card"><div className="stat-number">{users.length}</div><div className="stat-label">Registered Users</div></div>
        <div className="stat-card"><div className="stat-number">{CATEGORY_GROUPS.length}</div><div className="stat-label">Clothing Groups</div></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="section-title">Patterns by Category</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {CATEGORY_GROUPS.map(g => {
            const count = catCounts[g.value] || 0;
            const pct = Math.round((count / Math.max(patterns.length, 1)) * 100);
            const barW = Math.round((count / maxCatCount) * 100);
            const Icon = g.icon;
            return (
              <div key={g.value} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, flexShrink: 0, color: "var(--pink-400)" }}><Icon size={20}/></div>
                <div style={{ width: 100, flexShrink: 0, fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>{g.label}</div>
                <div style={{ flex: 1, background: "var(--pink-50)", borderRadius: 4, height: 16, overflow: "hidden" }}>
                  <div style={{ width: `${barW}%`, background: "var(--pink-400)", height: "100%", borderRadius: 4, minWidth: count > 0 ? 6 : 0, transition: "width 0.5s" }}/>
                </div>
                <div style={{ width: 70, textAlign: "right", fontSize: 13 }}>
                  <b style={{ color: "var(--pink-600)" }}>{count}</b>
                  <span style={{ color: "var(--gray-400)", marginLeft: 4 }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Popular Patterns</h2>
        <p style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 12 }}>Based on usage recorded in this browser. Sorted by total use count across all users on this device.</p>
        {popularPatterns.length === 0 ? <div className="loading">Loading…</div> : (
          <div style={{ display: "grid", gap: 8 }}>
            {popularPatterns.map((p, i) => {
              const pct = totalUses > 0 ? Math.round((p.useCount / totalUses) * 100) : null;
              const grp = CATEGORY_GROUPS.find(g => g.value === p.category);
              const Icon = grp?.icon || TShirtIcon;
              return (
                <div key={p.id} className="list-item">
                  <div style={{ flexShrink: 0, width: 26, color: "var(--pink-400)" }}><Icon size={20}/></div>
                  <div className="list-item-content">
                    <div className="list-item-title">{(() => { const k="pname."+p.patternName; const tr=t(k); return tr===k?p.patternName:tr; })()}</div>
                    <div className="list-item-sub"><span className="badge badge-pink">{p.category}</span></div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right", minWidth: 60 }}>
                    {pct !== null
                      ? <><div style={{ fontSize: 13, fontWeight: 700, color: "var(--pink-600)" }}>{pct}%</div><div style={{ fontSize: 11, color: "var(--gray-400)" }}>{p.useCount} uses</div></>
                      : <span className="badge badge-gray">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const ADMIN_GROUP_OPTIONS = CATEGORY_GROUPS.map(g => ({ label: g.label, value: g.value }));

function AdminPatterns() {
  const [err,setErr]=useState(null);const [msg,setMsg]=useState(null);const [patterns,setPatterns]=useState([]);const [editingId,setEditingId]=useState(null);const [showForm,setShowForm]=useState(false);
  const emptyForm={patternName:"",category:ADMIN_GROUP_OPTIONS[0]?.value||"TOPS",baseChest:"",baseShoulderWidth:"",baseShirtLength:"",baseSleeveLength:"",baseWaist:"",baseHip:"",baseOutseam:"",description:"",geometryJson:`{\n  "pieces": [\n    {\n      "name": "front",\n      "points": {\n        "A": { "x": 0, "y": 0 },\n        "B": { "x": 26, "y": 0 },\n        "C": { "x": 30, "y": 8 },\n        "D": { "x": 28, "y": 65 },\n        "E": { "x": 0, "y": 65 }\n      },\n      "segments": [\n        { "type": "line", "from": "A", "to": "B" },\n        { "type": "curve", "from": "B", "to": "C", "cp1": { "x": 28, "y": 1 }, "cp2": { "x": 30, "y": 5 } },\n        { "type": "line", "from": "C", "to": "D" },\n        { "type": "line", "from": "D", "to": "E" },\n        { "type": "line", "from": "E", "to": "A" }\n      ]\n    }\n  ]\n}`};
  const [form,setForm]=useState(emptyForm);
  useEffect(()=>{loadPatterns();},[]);
  async function loadPatterns(){try{setPatterns(await api("/api/patterns"));}catch(e){setErr(e.message);}}
  function onChange(e){setForm(p=>({...p,[e.target.name]:e.target.value}));}
  function startCreate(){setEditingId(null);setForm(emptyForm);setShowForm(true);setErr(null);setMsg(null);}
  function startEdit(p){setEditingId(p.id);setForm({patternName:p.patternName||"",category:p.category,baseChest:p.baseChest??"",baseShoulderWidth:p.baseShoulderWidth??"",baseShirtLength:p.baseShirtLength??"",baseSleeveLength:p.baseSleeveLength??"",baseWaist:p.baseWaist??"",baseHip:p.baseHip??"",baseOutseam:p.baseOutseam??"",description:p.description||"",geometryJson:p.geometryJson||emptyForm.geometryJson});setShowForm(true);setErr(null);setMsg(`Editing: ${p.patternName}`);}
  function cancelForm(){setShowForm(false);setEditingId(null);setForm(emptyForm);setErr(null);setMsg(null);}
  function buildBody(){return{patternName:form.patternName,category:form.category,baseChest:form.baseChest?Number(form.baseChest):null,baseShoulderWidth:form.baseShoulderWidth?Number(form.baseShoulderWidth):null,baseShirtLength:form.baseShirtLength?Number(form.baseShirtLength):null,baseSleeveLength:form.baseSleeveLength?Number(form.baseSleeveLength):null,baseWaist:form.baseWaist?Number(form.baseWaist):null,baseHip:form.baseHip?Number(form.baseHip):null,baseOutseam:form.baseOutseam?Number(form.baseOutseam):null,description:form.description,geometryJson:form.geometryJson};}
  async function savePattern(){setErr(null);setMsg(null);try{if(editingId){await api(`/api/admin/patterns/${editingId}`,{method:"PUT",body:buildBody()});setMsg("Pattern updated.");}else{await api("/api/admin/patterns",{method:"POST",body:buildBody()});setMsg("Pattern created.");}cancelForm();await loadPatterns();}catch(e){setErr(e.message);}}
  async function deletePattern(id,name){if(!confirm(`Delete pattern "${name}"?`))return;setErr(null);try{await api(`/api/admin/patterns/${id}`,{method:"DELETE"});setMsg("Pattern deleted.");if(editingId===id)cancelForm();await loadPatterns();}catch(e){setErr(e.message);}}
  return (
    <div>
      {err&&<Alert type="error">{err}</Alert>}{msg&&<Alert type="success">{msg}</Alert>}
      <div className="flex items-center gap-2 mb-3"><button className="btn btn-primary" onClick={startCreate}>+ New Pattern</button></div>
      {showForm&&<div className="card mb-4"><h2 className="section-title">{editingId?"Edit Pattern":"Create Pattern"}</h2><div className="grid-2"><div className="form"><Field label="Pattern Name" name="patternName" value={form.patternName} onChange={onChange}/><div className="field"><label className="label">Category</label><select className="input" name="category" value={form.category} onChange={onChange}>{ADMIN_GROUP_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div><Field label="Base Chest" name="baseChest" type="number" value={form.baseChest} onChange={onChange}/><Field label="Base Shoulder Width" name="baseShoulderWidth" type="number" value={form.baseShoulderWidth} onChange={onChange}/><Field label="Base Shirt Length" name="baseShirtLength" type="number" value={form.baseShirtLength} onChange={onChange}/><Field label="Base Sleeve Length" name="baseSleeveLength" type="number" value={form.baseSleeveLength} onChange={onChange}/><Field label="Base Waist" name="baseWaist" type="number" value={form.baseWaist} onChange={onChange}/><Field label="Base Hip" name="baseHip" type="number" value={form.baseHip} onChange={onChange}/><Field label="Base Outseam" name="baseOutseam" type="number" value={form.baseOutseam} onChange={onChange}/><Field label="Description" name="description" value={form.description} onChange={onChange}/></div><div className="field"><label className="label">Geometry JSON</label><textarea className="input" name="geometryJson" rows="20" value={form.geometryJson} onChange={onChange} style={{fontFamily:"monospace",fontSize:12,minHeight:400}}/></div></div><div className="flex gap-2 mt-3"><button className="btn btn-primary" onClick={savePattern}>{editingId?"Update":"Create"} Pattern</button><button className="btn btn-secondary" onClick={cancelForm}>Cancel</button></div></div>}
      <div className="card"><h2 className="section-title">All Patterns ({patterns.length})</h2>
        {patterns.length===0?<div className="empty-state"><div className="empty-state-text">No patterns yet</div></div>:
        <div style={{display:"grid",gap:8}}>{patterns.map(p=><div className="list-item" key={p.id}><div className="list-item-content"><div className="list-item-title">{p.patternName}</div><div className="list-item-sub flex items-center gap-2"><span className="badge badge-pink">{p.category.replace(/_/g," ")}</span>{p.description&&<span>{p.description}</span>}</div></div><div className="list-item-actions"><button className="btn btn-secondary btn-sm" onClick={()=>startEdit(p)}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>deletePattern(p.id,p.patternName)}>Delete</button></div></div>)}</div>}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [err,setErr]=useState(null);const [msg,setMsg]=useState(null);const [users,setUsers]=useState([]);const [editingId,setEditingId]=useState(null);const [showForm,setShowForm]=useState(false);
  const emptyForm={username:"",email:"",password:"",role:"USER",enabled:true};const [form,setForm]=useState(emptyForm);
  useEffect(()=>{loadUsers();},[]);
  async function loadUsers(){try{setUsers(await api("/api/admin/users"));}catch(e){setErr(e.message);}}
  function onChange(e){const val=e.target.type==="checkbox"?e.target.checked:e.target.value;setForm(p=>({...p,[e.target.name]:val}));}
  function startCreate(){setEditingId(null);setForm(emptyForm);setShowForm(true);setErr(null);setMsg(null);}
  function startEdit(u){setEditingId(u.id);setForm({username:u.username,email:u.email,password:"",role:u.role,enabled:u.enabled});setShowForm(true);setErr(null);setMsg(`Editing: ${u.username}`);}
  function cancelForm(){setShowForm(false);setEditingId(null);setForm(emptyForm);setErr(null);setMsg(null);}
  async function saveUser(){setErr(null);setMsg(null);try{const body={username:form.username,email:form.email,role:form.role,enabled:form.enabled};if(form.password)body.password=form.password;if(editingId){await api(`/api/admin/users/${editingId}`,{method:"PUT",body});setMsg("User updated.");}else{if(!form.password){setErr("Password is required.");return;}await api("/api/admin/users",{method:"POST",body:{...body,password:form.password}});setMsg("User created.");}cancelForm();await loadUsers();}catch(e){setErr(e.message);}}
  async function deleteUser(id,username){if(!confirm(`Delete user "${username}"?`))return;setErr(null);try{await api(`/api/admin/users/${id}`,{method:"DELETE"});setMsg("User deleted.");if(editingId===id)cancelForm();await loadUsers();}catch(e){setErr(e.message);}}
  const fmt=d=>d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
  return (
    <div>
      {err&&<Alert type="error">{err}</Alert>}{msg&&<Alert type="success">{msg}</Alert>}
      <div className="flex items-center gap-2 mb-3"><button className="btn btn-primary" onClick={startCreate}>+ New User</button></div>
      {showForm&&<div className="card mb-4"><h2 className="section-title">{editingId?"Edit User":"Create User"}</h2><div className="form" style={{maxWidth:480}}><Field label="Username" name="username" value={form.username} onChange={onChange}/><Field label="Email" name="email" type="email" value={form.email} onChange={onChange}/><Field label={editingId?"New Password (leave blank to keep)":"Password"} name="password" type="password" value={form.password} onChange={onChange}/><div className="field"><label className="label">Role</label><select className="input" name="role" value={form.role} onChange={onChange}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div><div className="flex items-center gap-2"><input type="checkbox" id="enabledCheck" name="enabled" checked={form.enabled} onChange={onChange}/><label htmlFor="enabledCheck" className="label" style={{margin:0}}>Account enabled</label></div><div className="flex gap-2 mt-2"><button className="btn btn-primary" onClick={saveUser}>{editingId?"Update":"Create"} User</button><button className="btn btn-secondary" onClick={cancelForm}>Cancel</button></div></div></div>}
      <div className="card"><h2 className="section-title">All Users ({users.length})</h2>
        {users.length===0?<div className="loading">Loading users…</div>:
        <div style={{display:"grid",gap:8}}>{users.map(u=><div className="list-item" key={u.id}><div className="list-item-content"><div className="list-item-title flex items-center gap-2">{u.username}<span className={`badge ${u.role==="ADMIN"?"badge-pink":"badge-gray"}`}>{u.role}</span>{!u.enabled&&<span className="badge badge-red">Disabled</span>}</div><div className="list-item-sub">{u.email} · Joined {fmt(u.createdAt)}</div></div><div className="list-item-actions"><button className="btn btn-secondary btn-sm" onClick={()=>startEdit(u)}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>deleteUser(u.id,u.username)}>Delete</button></div></div>)}</div>}
      </div>
    </div>
  );
}

function App() {
  const { route, go } = useHashRoute("/login");
  const [me, setMe] = useState(null);
  const [lang, setLangState] = useState(() => localStorage.getItem("pg_lang") || "en");
  function setLang(l) { localStorage.setItem("pg_lang", l); setLangState(l); }

  useEffect(() => {
    const token = getToken(); if (!token) return;
    api("/api/users/me").then(setMe).catch(() => { clearToken(); go("/login"); });
  }, []);

  const isAuth = !!getToken();
  const isAuthRoute = route === "/login" || route === "/signup" || route === "/";

  let content;
  if (!isAuth && !isAuthRoute) { go("/login"); return null; }
  else if (route === "/signup") content = <SignupPage go={go} setMe={setMe} />;
  else if (route === "/login" || route === "/") content = <LoginPage go={go} setMe={setMe} />;
  else if (!me) content = (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pink-50)" }}>
      <div style={{ textAlign: "center", color: "var(--gray-400)" }}>Loading…</div>
    </div>
  );
  else if (route === "/home") content = <HomePage me={me} go={go} setMe={setMe} />;
  else if (route === "/account") content = <AccountPage me={me} go={go} setMe={setMe} />;
  else if (route === "/measurements") content = <MeasurementsPage me={me} go={go} setMe={setMe} />;
  else if (route === "/profiles") content = <ProfilesPage me={me} go={go} setMe={setMe} />;
  else if (route === "/my-patterns") content = <MyPatternsPage me={me} go={go} setMe={setMe} />;
  else if (route === "/generator" || route.startsWith("/generator/")) content = <GeneratorPage me={me} go={go} setMe={setMe} />;
  else if (route === "/admin" || route === "/admin/patterns" || route === "/admin/users") content = <AdminPage me={me} go={go} setMe={setMe} />;
  else content = <HomePage me={me} go={go} setMe={setMe} />;

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {content}
    </LangContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);