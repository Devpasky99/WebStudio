'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_WHATSAPP_MESSAGE = 'Hola, me interesa cotizar una pagina web.';

loadEnv(path.join(ROOT_DIR, '.env'));

const config = {
    contactPhone: normalizePhone(process.env.CONTACT_PHONE || ''),
    companyEmail: String(process.env.COMPANY_EMAIL || '').trim(),
    mapsUrl: String(process.env.GOOGLE_MAPS_URL || '').trim(),
    mapsEmbedUrl: String(process.env.GOOGLE_MAPS_EMBED_URL || '').trim(),
    whatsappMessage: String(process.env.WHATSAPP_MESSAGE || DEFAULT_WHATSAPP_MESSAGE).trim()
};

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 60;

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now - record.start > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { start: now, count: 1 });
        return true;
    }
    record.count++;
    return record.count <= RATE_LIMIT_MAX;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap) {
        if (now - record.start > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(ip);
        }
    }
}, 300000);

function securityHeaders() {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.google.com https://maps.google.com; connect-src 'self' https://api.web3forms.com"
    };
}

const server = http.createServer((req, res) => {
    if (IS_PRODUCTION) {
        const proto = req.headers['x-forwarded-proto'];
        if (proto && proto !== 'https') {
            res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
            res.end();
            return;
        }
    }

    const clientIp = req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
        sendJson(res, 429, { success: false, message: 'Demasiadas peticiones. Intenta de nuevo en un minuto.' });
        return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname === '/api/contact') {
        handleContactRedirect(res);
        return;
    }

    if (requestUrl.pathname === '/api/company-info') {
        handleCompanyInfo(res);
        return;
    }

    serveStaticFile(requestUrl.pathname, res);
});

server.listen(PORT, () => {
    console.log(`WebStudio listo en http://localhost:${PORT}`);
});

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();
        value = value.replace(/^['"]|['"]$/g, '');

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function handleContactRedirect(res) {
    const validationError = validateContactConfig();
    if (validationError) {
        sendJson(res, 500, { success: false, message: validationError });
        return;
    }

    const url = new URL(`https://wa.me/${config.contactPhone}`);
    url.searchParams.set('text', config.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE);

    res.writeHead(302, {
        Location: url.toString(),
        'Cache-Control': 'no-store'
    });
    res.end();
}

function handleCompanyInfo(res) {
    const validationError = validateCompanyConfig();
    if (validationError) {
        sendJson(res, 500, { success: false, message: validationError });
        return;
    }

    sendJson(res, 200, {
        success: true,
        data: {
            email: config.companyEmail,
            mapsUrl: config.mapsUrl,
            mapsEmbedUrl: config.mapsEmbedUrl || buildMapsEmbedUrl(config.mapsUrl)
        }
    });
}

function validateContactConfig() {
    if (!/^\d{8,15}$/.test(config.contactPhone)) {
        return IS_PRODUCTION ? 'Error de configuracion del servidor.' : 'La variable CONTACT_PHONE no esta configurada correctamente.';
    }
    return null;
}

function validateCompanyConfig() {
    if (!isValidEmail(config.companyEmail)) {
        return IS_PRODUCTION ? 'Error de configuracion del servidor.' : 'La variable COMPANY_EMAIL no esta configurada correctamente.';
    }

    if (!isValidGoogleMapsUrl(config.mapsUrl)) {
        return IS_PRODUCTION ? 'Error de configuracion del servidor.' : 'La variable GOOGLE_MAPS_URL no esta configurada correctamente.';
    }

    if (config.mapsEmbedUrl && !isValidGoogleMapsUrl(config.mapsEmbedUrl)) {
        return IS_PRODUCTION ? 'Error de configuracion del servidor.' : 'La variable GOOGLE_MAPS_EMBED_URL no esta configurada correctamente.';
    }

    return null;
}

function serveStaticFile(pathname, res) {
    const safePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
    const filePath = path.normalize(path.join(ROOT_DIR, safePath));

    if (!filePath.startsWith(ROOT_DIR)) {
        sendJson(res, 403, { success: false, message: 'Acceso no permitido.' });
        return;
    }

    if (isPrivateFile(filePath)) {
        sendJson(res, 404, { success: false, message: 'Recurso no encontrado.' });
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            sendJson(res, 404, { success: false, message: 'Recurso no encontrado.' });
            return;
        }

        res.writeHead(200, {
            'Content-Type': getContentType(filePath),
            ...securityHeaders()
        });
        res.end(data);
    });
}

function isPrivateFile(filePath) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const parts = relativePath.split(path.sep);
    const privateFiles = new Set([
        '.env',
        '.env.example',
        '.gitignore',
        'package.json',
        'server.js',
        'DEPLOYMENT.md'
    ]);

    return parts.some((part) => part.startsWith('.')) || privateFiles.has(path.basename(filePath));
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...securityHeaders()
    });
    res.end(JSON.stringify(payload));
}

function normalizePhone(value) {
    return String(value).replace(/[^\d]/g, '');
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidGoogleMapsUrl(value) {
    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        return url.protocol === 'https:' && (
            host === 'maps.app.goo.gl' ||
            host === 'www.google.com' ||
            host === 'google.com' ||
            host === 'maps.google.com'
        );
    } catch (error) {
        return false;
    }
}

function buildMapsEmbedUrl(mapsUrl) {
    const embedUrl = new URL('https://www.google.com/maps');
    embedUrl.searchParams.set('q', mapsUrl);
    embedUrl.searchParams.set('output', 'embed');
    return embedUrl.toString();
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon'
    };

    return types[ext] || 'application/octet-stream';
}
