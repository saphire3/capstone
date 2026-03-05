console.log("APP JSX LOADED");

const { useEffect, useMemo, useState } = React;


function useHashRoute(defaultRoute = "/login") {
  const [hash, setHash] = useState(() => window.location.hash || `#${defaultRoute}`);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || `#${defaultRoute}`);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [defaultRoute]);

  const route = useMemo(() => hash.replace("#", ""), [hash]);
  return { route, go: (r) => (window.location.hash = `#${r}`) };
}

const TOKEN_KEY = "pg_token";

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = Bearer ${token};

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // try parse json
  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = (data && (data.message  data.error))  Request failed (${res.status});
    throw new Error(msg);
  }
  return data;
}

function Field({ label, ...props }) {
  return (
    <div>
      <div className="label">{label}</div>
      <input className="input" {...props} />
    </div>
  );
}

function LoginPage({ go }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { login, password },
      });
      saveToken(data.token);
      go("/account");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">Log in</h1>
        <p className="p">Enter your username/email and password.</p>

        {err && <div className="error">{err}</div>}

        <form className="form" onSubmit={onSubmit}>
          <Field
            label="Username or Email"
            placeholder="e.g. narine / narine@mail.com"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
          />
          <Field
            label="Password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="hr"></div>

        <div className="row">
          <div className="small">Don’t have an account?</div>
          <a className="link" href="#/signup" onClick={(e) => { e.preventDefault(); go("/signup"); }}>
            Sign up
          </a>
        </div>

        <div className="small" style={{ marginTop: 10 }}>
          Test admin (seeded): <b>admin</b> / <b>admin123</b>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ go }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await api("/api/auth/signup", {
        method: "POST",
        body: { username, email, password },
      });
      saveToken(data.token);
      go("/account");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">Sign up</h1>
        <p className="p">Create a user account. Admins can’t sign up.</p>

        {err && <div className="error">{err}</div>}

        <form className="form" onSubmit={onSubmit}>
          <Field
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Field
            label="Email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Field
            label="Password"
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="hr"></div>

        <div className="row">
          <a className="link" href="#/login" onClick={(e) => { e.preventDefault(); go("/login"); }}>
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}

function AccountPage({ go }) {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      go("/login");
      return;
    }

    (async () => {
      try {
        const data = await api("/api/users/me");
        setMe(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [go]);

  function logout() {
    clearToken();
    go("/login");
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">Account</h1>
        <p className="p">Your profile information.</p>

        {err && <div className="error">{err}</div>}

        {!me ? (
          <div className="small">Loading...</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="kv"><span>ID</span><b>{me.userId}</b></div>
            <div className="kv"><span>Username</span><b>{me.username}</b></div>
            <div className="kv"><span>Email</span><b>{me.email}</b></div>
            <div className="kv"><span>Role</span><b>{me.role}</b></div>
            <div className="kv"><span>Active</span><b>{String(me.active)}</b></div>
            <div className="kv"><span>Created</span><b>{me.createdAt}</b></div>

            <button className="btn secondary" onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { route, go } = useHashRoute("/login");

  if (route === "/signup") return <SignupPage go={go} />;
  if (route === "/account") return <AccountPage go={go} />;
  return <LoginPage go={go} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);