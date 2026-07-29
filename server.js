const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许大payload（Base64附件可能较大）
app.use(express.json({ limit: '100mb' }));
app.use(express.static(__dirname, { index: false }));

// 数据存储目录
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const ADMIN_PWD_FILE = path.join(DATA_DIR, 'admin_pwd.txt');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* ========== API 路由 ========== */

// 获取全部数据
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(raw));
    } else {
      res.json(null);
    }
  } catch (e) {
    console.error('GET /api/data error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 保存全部数据
app.post('/api/data', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body), 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    console.error('POST /api/data error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 获取管理员密码
app.get('/api/admin-pwd', (req, res) => {
  try {
    const pwd = fs.existsSync(ADMIN_PWD_FILE)
      ? fs.readFileSync(ADMIN_PWD_FILE, 'utf-8').trim()
      : 'admin123';
    res.json({ password: pwd });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 设置管理员密码
app.post('/api/admin-pwd', (req, res) => {
  try {
    fs.writeFileSync(ADMIN_PWD_FILE, req.body.password || 'admin123', 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'motherboard-pm-agent.html'));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  主板项目管理平台已启动');
  console.log(`  地址: http://localhost:${PORT}`);
  console.log('  按 Ctrl+C 停止服务');
  console.log('========================================');
});
