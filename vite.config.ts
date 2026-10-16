import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function uraProxyPlugin(): Plugin {
  return {
    name: 'ura-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ura/invoke', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const service = urlObj.searchParams.get('service') || 'PMI_Resi_Developer_Sales';
          const refPeriod = urlObj.searchParams.get('refPeriod') || '0826';
          const accessKey = (req.headers['accesskey'] as string) || urlObj.searchParams.get('accessKey') || '';
          const token = (req.headers['token'] as string) || urlObj.searchParams.get('token') || '';

          const targetUrl = `https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=${encodeURIComponent(service)}&refPeriod=${encodeURIComponent(refPeriod)}`;

          const upstream = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'AccessKey': accessKey,
              'Token': token,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          const data = await upstream.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = upstream.status;
          res.end(data);
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({Status: 'Error', Message: err.message || 'Failed to proxy request'}));
        }
      });

      server.middlewares.use('/api/ura/token', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const accessKey = (req.headers['accesskey'] as string) || urlObj.searchParams.get('accessKey') || '';

          const targetUrl = `https://eservice.ura.gov.sg/uraDataService/insertNewToken.action`;
          const upstream = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'AccessKey': accessKey,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          const data = await upstream.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = upstream.status;
          res.end(data);
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({Status: 'Error', Message: err.message || 'Failed to request token'}));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), uraProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

