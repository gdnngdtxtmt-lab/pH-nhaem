// GET  /api/content            -> { data }       (đọc data/content.json mới nhất từ GitHub)
// POST /api/content { data, message } -> { ok }  (ghi data/content.json)
const { send, requireAuth, readBody, gh, getSha, ghError, DATA_PATH } = require('./_lib');

const KEYS = ['thong_bao', 'anh', 'bai_tap', 'tai_lieu'];

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      let data = { cap_nhat: '', thong_bao: [], anh: [], bai_tap: [], tai_lieu: [] };
      try {
        const f = await gh(DATA_PATH, 'GET');
        data = JSON.parse(Buffer.from(f.content, 'base64').toString('utf8'));
      } catch (e) { if (e.status !== 404) throw e; }
      KEYS.forEach((k) => { if (!Array.isArray(data[k])) data[k] = []; });
      return send(res, 200, { data });
    }
    if (req.method === 'POST') {
      const b = await readBody(req);
      const d = b.data;
      if (!d || typeof d !== 'object' || !KEYS.every((k) => Array.isArray(d[k]))) return send(res, 400, { error: 'Dữ liệu không hợp lệ.' });
      d.cap_nhat = new Date().toISOString();
      const text = JSON.stringify(d, null, 2) + '\n';
      if (Buffer.byteLength(text) > 900 * 1024) return send(res, 413, { error: 'Dữ liệu quá lớn.' });
      const sha = await getSha(DATA_PATH);
      await gh(DATA_PATH, 'PUT', {
        message: String(b.message || 'Admin: cập nhật nội dung').slice(0, 200),
        content: Buffer.from(text, 'utf8').toString('base64'),
        ...(sha ? { sha } : {}),
      });
      return send(res, 200, { ok: true });
    }
    send(res, 405, { error: 'Phương thức không hỗ trợ.' });
  } catch (e) { ghError(res, e); }
};
