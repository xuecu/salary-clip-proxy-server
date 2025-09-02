import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GAS_URL =
	'https://script.google.com/macros/s/AKfycbwpVg2QHsZAc5ijnW-FrgPnQEEe_CrqKpDc9JfPdeoObN3WHU48YCGtyYN9HGZcO8nx/exec';
// 設定基本路由
app.get('/', (req, res) => {
	res.send('Hello, Zeabur!');
});

// POST → Proxy → doGet(GAS)
app.post('/api', async (req, res) => {
	try {
		const gasRes = await fetch(GAS_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req.body),
		});
		const result = await gasRes.json();
		console.log('✅ GAS 回傳結果：', result);
		res.json(result); // ⬅️ 回傳給前端
	} catch (err) {
		res.status(500).send('連接 GAS 失敗');
		console.error(`❌ 連接 GAS 失敗`, err.message);
	}
});
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
