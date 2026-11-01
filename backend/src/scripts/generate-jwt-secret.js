import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate a cryptographically strong 512-bit JWT secret
export const generateSecureSecret = (bytes = 64) => {
  return crypto.randomBytes(bytes).toString('hex');
};

const updateEnvFile = (envFilePath, newSecret) => {
  if (!fs.existsSync(envFilePath)) {
    console.log(`⚠️ .env file not found at: ${envFilePath}`);
    return false;
  }

  let content = fs.readFileSync(envFilePath, 'utf8');
  if (content.includes('JWT_SECRET=')) {
    content = content.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${newSecret}`);
  } else {
    content += `\nJWT_SECRET=${newSecret}\n`;
  }

  fs.writeFileSync(envFilePath, content, 'utf8');
  console.log(`✅ Updated JWT_SECRET in: ${envFilePath}`);
  return true;
};

const run = () => {
  const secret = generateSecureSecret(64);
  console.log('='.repeat(70));
  console.log('🔐 GENERATED SECURE CRYPTOGRAPHIC JWT SECRET (512-bit):');
  console.log(secret);
  console.log('='.repeat(70));

  // If --update or -u flag passed, update .env automatically
  const shouldUpdate = process.argv.includes('--update') || process.argv.includes('-u');
  
  if (shouldUpdate) {
    const backendEnv = path.resolve(__dirname, '../../.env');
    const rootEnv = path.resolve(__dirname, '../../../.env');
    updateEnvFile(backendEnv, secret);
    updateEnvFile(rootEnv, secret);
    console.log('🚀 Environment files successfully updated with secure key!');
  } else {
    console.log('\n💡 Tip: Run `npm run jwt:update` to automatically write this to your .env file,');
    console.log('   or copy the generated secret above into your JWT_SECRET variable.');
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
