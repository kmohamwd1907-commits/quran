const express = require('express'), multer = require('multer'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const KEY = process.env.ADMIN_KEY || '';           // اختياري: مفتاح يحمي الرفع والحذف
const UP = path.join(__dirname, 'uploads');
const DB = path.join(__dirname, 'data', 'reciters.json');

['img', 'audio'].forEach(d => fs.mkdirSync(path.join(UP, d), { recursive: true }));
fs.mkdirSync(path.dirname(DB), { recursive: true });

const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch (e) { return null } };
const save = l => fs.writeFileSync(DB, JSON.stringify(l, null, 1));
if (!load()) save([{ id: 'minshawi', name: 'محمد صديق المنشاوي' }, { id: 'ebada', name: 'محمد عبادة' }]);

const IMG_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const pad = n => String(n).padStart(3, '0');
const idOk = s => /^[a-z0-9_-]{1,40}$/i.test(s);
const numOf = name => { const m = String(name).match(/\d+/), n = m && +m[0]; return n >= 1 && n <= 114 ? n : 0 };
const imgOf = id => {
  try {
    const f = fs.readdirSync(path.join(UP, 'img')).find(x => path.parse(x).name === id);
    return f ? 'uploads/img/' + f + '?v=' + Math.floor(fs.statSync(path.join(UP, 'img', f)).mtimeMs) : '';
  } catch (e) { return '' }
};
const filesOf = id => {
  try { return fs.readdirSync(path.join(UP, 'audio', id)).map(numOf).filter(Boolean).sort((a, b) => a - b) }
  catch (e) { return [] }
};

const auth = (req, res, next) =>
  KEY && req.get('x-admin-key') !== KEY ? res.status(401).json({ error: 'unauthorized' }) : next();
const exists = (req, res, next) =>
  (!idOk(req.params.id) || !(load() || []).some(r => r.id === req.params.id))
    ? res.status(404).json({ error: 'not found' }) : next();

const imgUp = multer({
  storage: multer.diskStorage({
    destination: path.join(UP, 'img'),
    filename: (req, f, cb) => cb(null, req.params.id + IMG_EXT[f.mimetype])
  }),
  fileFilter: (req, f, cb) => cb(null, !!IMG_EXT[f.mimetype]),
  limits: { fileSize: 8 * 1024 * 1024 }
});
const audioUp = multer({
  storage: multer.diskStorage({
    destination: (req, f, cb) => { const d = path.join(UP, 'audio', req.params.id); fs.mkdirSync(d, { recursive: true }); cb(null, d) },
    filename: (req, f, cb) => cb(null, pad(numOf(f.originalname)) + '.mp3')
  }),
  fileFilter: (req, f, cb) => cb(null, /^audio\//.test(f.mimetype) && !!numOf(f.originalname)),
  limits: { fileSize: 500 * 1024 * 1024 }
});
const adhanUp = multer({
  storage: multer.diskStorage({ destination: UP, filename: (req, f, cb) => cb(null, 'adhan.mp3') }),
  fileFilter: (req, f, cb) => cb(null, /^audio\//.test(f.mimetype)),
  limits: { fileSize: 30 * 1024 * 1024 }
});

const app = express();
app.use(express.json());

/* القرّاء */
app.get('/api/reciters', (req, res) =>
  res.json(load().map(r => ({ id: r.id, name: r.name, img: imgOf(r.id), files: filesOf(r.id) }))));

app.post('/api/reciters', auth, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 80);
  if (!name) return res.status(400).json({ error: 'name required' });
  const l = load();
  const id = idOk(req.body.id || '') ? req.body.id : 'r' + Date.now().toString(36);
  if (l.some(r => r.id === id)) return res.status(409).json({ error: 'exists' });
  l.push({ id, name }); save(l);
  res.json({ id, name });
});

app.delete('/api/reciters/:id', auth, exists, (req, res) => {
  const id = req.params.id;
  save(load().filter(r => r.id !== id));
  fs.rmSync(path.join(UP, 'audio', id), { recursive: true, force: true });
  fs.readdirSync(path.join(UP, 'img')).filter(f => path.parse(f).name === id)
    .forEach(f => fs.unlinkSync(path.join(UP, 'img', f)));
  res.json({ ok: true });
});

/* صورة القارئ */
app.post('/api/reciters/:id/image', auth, exists, imgUp.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'صورة jpg/png/webp فقط' });
  fs.readdirSync(path.join(UP, 'img'))
    .filter(f => path.parse(f).name === req.params.id && f !== req.file.filename)
    .forEach(f => fs.unlinkSync(path.join(UP, 'img', f)));
  res.json({ ok: true });
});

/* ملفات السور (اسم الملف يحتوي رقم السورة: 001.mp3 ... 114.mp3) */
app.post('/api/reciters/:id/audio', auth, exists, audioUp.array('files', 200), (req, res) =>
  (req.files && req.files.length) ? res.json({ saved: req.files.length }) : res.status(400).json({ error: 'ملف صوت برقم سورة 1-114' }));

/* الأذان */
app.post('/api/adhan', auth, adhanUp.single('file'), (req, res) =>
  req.file ? res.json({ ok: true }) : res.status(400).json({ error: 'ملف صوت فقط' }));

app.use('/uploads', express.static(UP));
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => res.status(400).json({ error: err.message }));

app.listen(PORT, () => console.log('نور يعمل على http://localhost:' + PORT));
