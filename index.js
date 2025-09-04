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
			headers: {
				...req.headers, // 保留原始 header
			},
			body: req, // 保留原始 stream（重點！）
		});

		const resultText = await gasRes.text(); // 可能是 text，不一定是 json
		console.log('✅ GAS 回傳結果：', resultText);
		res.send(resultText);
	} catch (err) {
		console.error(`❌ Proxy to GAS 失敗`, err.message);
		res.status(500).send('Proxy 到 GAS 發生錯誤');
	}
});
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
