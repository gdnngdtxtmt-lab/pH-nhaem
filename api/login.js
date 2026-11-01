// POST /api/login  { username, password }  ->  { token, user, exp }
const { send, checkEnv, sign, safeEqual, readBody, SESSION_HOURS } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Chỉ nhận POST.' });
  if (!checkEnv(res)) return;
  const b = await readBody(req);
  const okUser = safeEqual(String(b.username || '').trim(), process.env.ADMIN_USER);
  const okPass = safeEqual(String(b.password || ''), process.env.ADMIN_PASS);
  if (!(okUser && okPass)) {
    await new Promise((r) => setTimeout(r, 1200)); // làm chậm việc đoán mật khẩu
    return send(res, 401, { error: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  send(res, 200, { token: sign({ u: process.env.ADMIN_USER, exp }), user: process.env.ADMIN_USER, exp });
};
