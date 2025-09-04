import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import formidable from 'formidable';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const GAS_URL =
	'https://script.google.com/macros/s/AKfycbwpVg2QHsZAc5ijnW-FrgPnQEEe_CrqKpDc9JfPdeoObN3WHU48YCGtyYN9HGZcO8nx/exec';

// 設定基本路由
app.get('/', (req, res) => {
	res.send('Hello, Zeabur!');
});

// 處理 multipart/form-data → GAS
app.post('/api', (req, res) => {
	const form = formidable({ multiples: true });

	form.parse(req, async (err, fields, files) => {
		if (err) {
			console.error('❌ 表單解析錯誤', err.message);
			return res.status(400).send('表單解析失敗');
		}

		try {
			// 將 files 轉成 base64 陣列
			const transformedFiles = (Array.isArray(files.file) ? files.file : [files.file]).map(
				(f) => {
					const buffer = fs.readFileSync(f.filepath);
					return {
						name: f.originalFilename,
						blob: buffer.toString('base64'), // GAS 會用 base64Decode
					};
				}
			);

			// 組成 GAS 想要的格式
			const body = {
				do: fields.do,
				id: fields.id,
				files: transformedFiles,
			};

			const gasRes = await fetch(GAS_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const result = await gasRes.text(); // 可能是 text，不一定 json
			console.log('✅ GAS 回傳結果：', result);
			res.send(result);
		} catch (e) {
			console.error('❌ Proxy to GAS 失敗', e.message);
			res.status(500).send('Proxy 到 GAS 發生錯誤');
		}
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
