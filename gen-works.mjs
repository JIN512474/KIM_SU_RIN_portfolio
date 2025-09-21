// gen-works.mjs
// Photos/{album}/{n}.jpg 구조를 스캔해서 works.json 생성
// - 1.jpg, 01.jpg, 1 .jpg, 1.JPG, 1.JPEG 등 숫자 기반 파일명을 인식
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'Photos'); // 대/소문자 주의 (Photos)
const OUT_FILE = path.join(ROOT, 'works.json');

const JPG_RE = /^\s*(\d+)\s*\.jpe?g$/i; // 숫자 + (선택)공백 + .jpg/.jpeg

async function main() {
  const exists = async (p) => !!(await fs.stat(p).catch(() => null));
  if (!(await exists(PHOTOS_DIR))) {
    console.error(`❌ Photos 폴더가 없습니다: ${PHOTOS_DIR}`);
    process.exit(1);
  }

  const out = {};
  const albums = await fs.readdir(PHOTOS_DIR, { withFileTypes: true });

  for (const dirent of albums) {
    if (!dirent.isDirectory()) continue;

    const albumId = dirent.name.trim();
    if (!/^\d+$/.test(albumId)) continue; // 숫자 폴더만

    const albumPath = path.join(PHOTOS_DIR, dirent.name);
    const files = await fs.readdir(albumPath, { withFileTypes: true });

    let maxNum = 0;
    for (const f of files) {
      if (!f.isFile()) continue;
      const m = f.name.match(JPG_RE);
      if (!m) continue;
      const num = parseInt(m[1], 10);
      if (!Number.isNaN(num)) {
        if (num > maxNum) maxNum = num;
      }
    }

    out[albumId] = maxNum; // 0이면 이미지 없는 폴더
  }

  // 숫자 키 오름차순 정렬
  const sorted = Object.fromEntries(
    Object.entries(out).sort((a, b) => Number(a[0]) - Number(b[0]))
  );

  await fs.writeFile(OUT_FILE, JSON.stringify(sorted, null, 2));
  console.log('✅ works.json 생성 완료');
  console.log(sorted);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
