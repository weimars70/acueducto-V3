module.exports = {
    apps: [
        {
            name: 'acueducto-backend',
            script: 'dist/main.js',
            cwd: './backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3030
            }
        },
        {
            name: 'acueducto-frontend',
            script: 'serve',
            env: {
                PM2_SERVE_PATH: './dist',
                PM2_SERVE_PORT: 5175,
                PM2_SERVE_SPA: 'true',
                PM2_SERVE_HOMEPAGE: '/index.html'
            }
        },
        {
            name: 'acueducto-realtime',
            script: 'backend/src/realtime-server.mjs',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3007
            }
        }
    ]
};
