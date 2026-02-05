import { Router, type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';

const router = Router();

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

function isValidId(id: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(id);
}

function resolveCandidatePaths(id: string, ext?: string): string[] {
	const baseDirs = [
		path.resolve(process.cwd(), 'src/assets/images'),
		path.resolve(process.cwd(), 'src/assets/image'), // support singular folder if used
	];

	const exts = ext ? [ext] : ALLOWED_EXTENSIONS;
	const candidates: string[] = [];

	for (const base of baseDirs) {
		for (const e of exts) {
			candidates.push(path.join(base, `${id}.${e}`));
		}
	}

	return candidates;
}

async function findExistingFile(paths: string[]): Promise<string | null> {
	for (const p of paths) {
		try {
			await fs.promises.access(p, fs.constants.R_OK);
			return p;
		} catch {}
	}
	return null;
}

function contentTypeFor(ext: string): string {
	switch (ext.toLowerCase()) {
		case 'png':
			return 'image/png';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'gif':
			return 'image/gif';
		case 'webp':
			return 'image/webp';
		case 'svg':
			return 'image/svg+xml';
		default:
			return 'application/octet-stream';
	}
}

router.get('/:id', async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const { ext } = req.query as { ext?: string };

	if (!isValidId(id)) {
		return res.status(400).json({ error: 'Invalid image id' });
	}

	const normalizedExt = ext?.toString().toLowerCase();
	if (normalizedExt && !ALLOWED_EXTENSIONS.includes(normalizedExt)) {
		return res.status(400).json({
			error: 'Unsupported extension',
			allowed: ALLOWED_EXTENSIONS,
		});
	}

	const candidates = resolveCandidatePaths(id, normalizedExt);
	const filePath = await findExistingFile(candidates);

	if (!filePath) {
		return res.status(404).json({
			error: 'Image not found',
			id,
			tried: candidates.map((p) => path.relative(process.cwd(), p)),
		});
	}

	const extname = path.extname(filePath).replace('.', '');
	res.setHeader('Content-Type', contentTypeFor(extname));
	return res.sendFile(filePath);
});

export default router;

