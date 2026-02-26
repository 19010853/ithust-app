module.exports = {
    apps: [
        {
            name: 'notification-service',
            script: './build/src/app.js',
            instances: 5,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '200M',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
