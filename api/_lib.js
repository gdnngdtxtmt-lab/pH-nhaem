// Thư viện dùng chung cho các API quản trị (không phải một đường dẫn công khai).
const crypto = require('crypto');

const ENV_REQUIRED = ['ADMIN_USER', 'ADMIN_PASS', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'];
const DATA_PATH = 'data/content.json';
const SESSION_HOURS = 8;

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

function missingEnv() {
  return ENV_REQUIRED.filter((k) => !process.env[k]);
}

function checkEnv(res) {
  const miss = missingEnv();
  if (miss.length) { send(res, 500, { error: 'Chưa cấu hình trên Vercel các biến: ' + miss.join(', ') }); return false; }
  return true;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}

function verify(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
  const [body, mac] = token.split('.');
  const good = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(body).digest('base64url');
  if (!safeEqual(mac, good)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!p.exp || Date.now() > p.exp) return null;
    return p;
  } catch (e) { return null; }
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  if (x.length !== y.length) { crypto.timingSafeEqual(x, x); return false; }
  return crypto.timingSafeEqual(x, y);
}

// Trả về phiên đăng nhập, hoặc tự trả lỗi 401 rồi trả về null.
function requireAuth(req, res) {
  if (!checkEnv(res)) return null;
  const h = req.headers['authorization'] || '';
  const s = verify(h.replace(/^Bearer\s+/i, ''));
  if (!s) { send(res, 401, { error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' }); return null; }
  return s;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) { return {}; }
}

// ---- GitHub ----
function ghUrl(path) {
  const enc = path.split('/').map(encodeURIComponent).join('/');
  return 'https://api.github.com/repos/' + encodeURIComponent(process.env.GITHUB_OWNER) + '/' +
    encodeURIComponent(process.env.GITHUB_REPO) + '/contents/' + enc;
}
function branch() { return process.env.GITHUB_BRANCH || 'main'; }

async function gh(path, method, body) {
  const r = await fetch(ghUrl(path) + (method === 'GET' ? '?ref=' + encodeURIComponent(branch()) : ''), {
    method,
    headers: {
      Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ph-nha-em-admin',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(Object.assign({ branch: branch() }, body)) : undefined,
  });
  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch (e) {}
  if (!r.ok) { const e = new Error(j.message || ('GitHub ' + r.status)); e.status = r.status; throw e; }
  return j;
}

async function getSha(path) {
  try { return (await gh(path, 'GET')).sha; } catch (e) { if (e.status === 404) return null; throw e; }
}

function ghError(res, e) {
  const map = {
    401: 'Mã GITHUB_TOKEN trên Vercel sai hoặc đã hết hạn.',
    403: 'Mã GITHUB_TOKEN chưa có quyền ghi (Contents: Read and write).',
    404: 'Không tìm thấy kho hoặc nhánh. Kiểm tra GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH trên Vercel.',
    409: 'Dữ liệu vừa thay đổi. Vui lòng thử lại.',
    422: 'GitHub từ chối yêu cầu: ' + e.message,
  };
  send(res, e.status && e.status < 500 ? 502 : 500, { error: map[e.status] || ('Lỗi GitHub: ' + e.message) });
}

module.exports = { send, checkEnv, sign, verify, safeEqual, requireAuth, readBody, gh, getSha, ghError, DATA_PATH, SESSION_HOURS };
