import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ENV_FILE = path.join(__dirname, '../../.env');

export function getOrGenerateJWTSecret(): string {
    const envSecret = process.env.JWT_SECRET;
    
    if (envSecret && envSecret !== 'votre_cle_secrete_super_secure') {
        return envSecret;
    }

    // Générer une nouvelle clé
    const newSecret = crypto.randomBytes(32).toString('hex');
    
    // Sauvegarder dans .env
    try {
        let envContent = '';
        if (fs.existsSync(ENV_FILE)) {
            envContent = fs.readFileSync(ENV_FILE, 'utf-8');
            // Remplacer ou ajouter JWT_SECRET
            if (envContent.includes('JWT_SECRET=')) {
                envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET="${newSecret}"`);
            } else {
                envContent += `\nJWT_SECRET="${newSecret}"`;
            }
        } else {
            envContent = `JWT_SECRET="${newSecret}"`;
        }
        fs.writeFileSync(ENV_FILE, envContent);
        console.log('✓ JWT_SECRET généré et sauvegardé dans .env');
    } catch (error) {
        console.warn('⚠ Impossible de sauvegarder JWT_SECRET dans .env:', error);
    }
    
    return newSecret;
}
