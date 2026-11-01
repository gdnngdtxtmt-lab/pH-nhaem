// POST /api/delete-file { path } -> { ok }   (chỉ xóa được tệp trong thư mục uploads/)
const { send, requireAuth, readBody, gh, getSha, ghError } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Chỉ nhận POST.' });
  if (!requireAuth(req, res)) return;
  const b = await readBody(req);
  const path = String(b.path || '');
  if (!/^uploads\/(anh|bai-tap|tai-lieu)\/[\w\-./]+$/.test(path) || path.includes('..')) return send(res, 400, { error: 'Đường dẫn tệp không hợp lệ.' });
  try {
    const sha = await getSha(path);
    if (sha) await gh(path, 'DELETE', { message: 'Admin: xóa tệp ' + path, sha });
    send(res, 200, { ok: true });
  } catch (e) { ghError(res, e); }
};
