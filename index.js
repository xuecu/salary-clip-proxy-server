import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import formidable from 'formidable';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // ✅ 讓你可以接收 JSON

const PORT = process.env.PORT || 3000;
const GAS_URL =
	'https://script.google.com/macros/s/AKfycbwpVg2QHsZAc5ijnW-FrgPnQEEe_CrqKpDc9JfPdeoObN3WHU48YCGtyYN9HGZcO8nx/exec';

// 基本測試路由
app.get('/', (req, res) => {
	res.send('Hello, Zeabur!');
});

// ✅ 支援 JSON 與 FormData 的 POST 請求
app.post('/api', async (req, res) => {
	const contentType = req.headers['content-type'] || '';

	if (contentType.includes('multipart/form-data')) {
		// ✅ 若是表單上傳（含檔案）
		const form = formidable({ multiples: true });

		form.parse(req, async (err, fields, files) => {
			if (err) {
				console.error('❌ 表單解析錯誤', err.message);
				return res.status(400).send('表單解析失敗');
			}

			try {
				const transformedFiles = (
					Array.isArray(files.file) ? files.file : [files.file]
				).map((f) => {
					const buffer = fs.readFileSync(f.filepath);
					return {
						name: f.originalFilename,
						blob: buffer.toString('base64'), // ✅ 傳 base64 給 GAS
					};
				});

				const body = {
					do: fields.do,
					id: fields.id,
					files: transformedFiles,
				};

				await proxyToGAS(body, res);
			} catch (e) {
				console.error('❌ multipart 處理錯誤', e.message);
				res.status(500).send('處理檔案上傳失敗');
			}
		});
	} else {
		// ✅ 若是 application/json
		try {
			const body = req.body;
			await proxyToGAS(body, res);
		} catch (e) {
			console.error('❌ JSON 處理錯誤', e.message);
			res.status(500).send('JSON 請求處理失敗');
		}
	}
});

// ✅ 共用的 proxy 函式
async function proxyToGAS(body, res) {
	try {
		const gasRes = await fetch(GAS_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});

		const text = await gasRes.text();
		console.log('✅ GAS 回傳結果：', text);
		res.send(text);
	} catch (e) {
		console.error('❌ Proxy to GAS 失敗', e.message);
		res.status(500).send('Proxy 到 GAS 發生錯誤');
	}
}

app.listen(PORT, () => {
	console.log(`🚀 Server is running on port ${PORT}`);
});
