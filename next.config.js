
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === 'development',
      runtimeCaching,
})

module.exports = withPWA({
   reactStrictMode: true,
   
});
