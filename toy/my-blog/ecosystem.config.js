module.exports = {
  apps: [{
    name: "nexus-blog",
    script: "./node_modules/next/dist/bin/next",
    args: "start --host 0.0.0.0 -p 3000",
    cwd: __dirname,
    env: {
      NODE_ENV: "production",
    },
  }]
};
