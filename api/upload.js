// POST /api/upload { folder: 'anh'|'bai-tap'|'tai-lieu', name, content (base64) } -> { path }
const { send, requireAuth, readBody, gh, ghError } = require('./_lib');

const FOLDERS = ['anh', 'bai-tap', 'tai-lieu'];
const EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'mp4', 'txt'];
const MAX_BYTES = 3.2 * 1024 * 1024; // giới hạn của Vercel cho mỗi lần gửi khoảng 4,5 MB (đã tính phần mã hóa)

function slug(s) {
  return String(s || 'tep').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'tep';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Chỉ nhận POST.' });
  if (!requireAuth(req, res)) return;
  const b = await readBody(req);
  if (!FOLDERS.includes(b.folder)) return send(res, 400, { error: 'Thư mục không hợp lệ.' });
  const name = String(b.name || 'tep');
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (!EXT.includes(ext)) return send(res, 400, { error: 'Định dạng .' + ext + ' không được phép.' });
  const content = String(b.content || '');
  if (!content || Buffer.byteLength(content, 'base64') > MAX_BYTES) return send(res, 413, { error: 'Tệp quá lớn (tối đa khoảng 3 MB). Hãy đưa lên Google Drive rồi dán đường dẫn.' });
  const path = 'uploads/' + b.folder + '/' + new Date().getFullYear() + '/' +
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '-' + slug(name.replace(/\.[^.]+$/, '')) + '.' + ext;
  try {
    await gh(path, 'PUT', { message: 'Admin: tải lên ' + name.slice(0, 80), content });
    send(res, 200, { path });
  } catch (e) { ghError(res, e); }
};
