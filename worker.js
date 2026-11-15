// Serves the static app from /public and a tiny JSON API backed by D1.
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
const num = v => (Number.isFinite(+v) ? +v : 0);

const COLS = ["id", "location", "stakes", "date", "buyin", "reloads", "cashout", "hours", "notes", "kind", "game",
  "start_time", "end_time", "table_size", "limit_type", "pause_seconds", "finish_pos", "players", "format", "events"];
const NUMS = new Set(["id", "buyin", "reloads", "cashout", "hours", "table_size", "limit_type", "pause_seconds", "finish_pos", "players"]);
const sessionStmt = (env, x) => env.DB.prepare(`INSERT OR REPLACE INTO sessions (${COLS.join(",")}) VALUES (${COLS.map(() => "?").join(",")})`)
  .bind(...COLS.map(c => NUMS.has(c) ? num(x[c]) : String(x[c] ?? (c === "kind" ? "cash" : ""))));
const locStmt = (env, l) => env.DB.prepare("INSERT OR REPLACE INTO locations (id, name, stakes, default_buyin) VALUES (?,?,?,?)")
  .bind(num(l.id), String(l.name), String(l.stakes || ""), num(l.buyin));
const setStmt = (env, k, v) => env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)").bind(String(k), String(v));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    const [, , kind, id] = url.pathname.split("/");
    try {
      if (req.method === "GET" && kind === "data") {
        const [l, s, st] = await env.DB.batch([
          env.DB.prepare("SELECT id, name, stakes, default_buyin AS buyin FROM locations ORDER BY name"),
          env.DB.prepare("SELECT * FROM sessions ORDER BY date, id"),
          env.DB.prepare("SELECT key, value FROM settings"),
        ]);
        return json({ locs: l.results, sessions: s.results, settings: Object.fromEntries(st.results.map(r => [r.key, r.value])) });
      }
      if (req.method === "PUT" && kind === "sessions") { await sessionStmt(env, await req.json()).run(); return json({ ok: true }); }
      if (req.method === "PUT" && kind === "locations") { await locStmt(env, await req.json()).run(); return json({ ok: true }); }
      if (req.method === "PUT" && kind === "settings") { const b = await req.json(); await setStmt(env, b.key, b.value).run(); return json({ ok: true }); }
      if (req.method === "POST" && kind === "import") {
        const b = await req.json();
        const stmts = [
          ...(b.locs || []).map(l => locStmt(env, l)),
          ...(b.sessions || []).map(x => sessionStmt(env, x)),
          ...Object.entries(b.settings || {}).map(([k, v]) => setStmt(env, k, v)),
        ];
        if (stmts.length) await env.DB.batch(stmts);
        return json({ ok: true, sessions: (b.sessions || []).length });
      }
      if (req.method === "DELETE" && (kind === "sessions" || kind === "locations")) {
        await env.DB.prepare(`DELETE FROM ${kind} WHERE id = ?`).bind(num(id)).run();
        return json({ ok: true });
      }
      return json({ error: "Not found" }, 404);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};
