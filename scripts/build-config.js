/**
 * .env 파일을 읽어 config.js 를 생성합니다.
 * API 키가 브라우저 소스에 하드코딩되지 않고, .env → config.js 로만 주입됩니다.
 * 실행: node scripts/build-config.js
 * (프로젝트 루트에서 실행)
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'config.js');

function parseEnv(content) {
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });
  return env;
}

let env = {};
if (fs.existsSync(envPath)) {
  env = parseEnv(fs.readFileSync(envPath, 'utf8'));
} else {
  console.warn('.env 파일이 없습니다. .env.example 을 복사하여 .env 를 만들고 API 키를 입력하세요.');
}

// 배포(Cloudflare Pages 등)에서는 process.env 로 키 주입. 로컬은 .env 우선.
const openaiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

const configContent = `// SIMS Fashion AI - API 설정 (자동 생성, Git 제외)
// scripts/build-config.js 로 .env 에서 생성됩니다.
(function() {
  window.__SIMS_OPENAI_KEY__ = ${JSON.stringify(openaiKey)};
  window.__SIMS_GEMINI_KEY__ = ${JSON.stringify(geminiKey)};
})();
`;

fs.writeFileSync(outPath, configContent, 'utf8');
console.log('config.js 생성 완료:', outPath);
