module.exports = ({ env }) => ( {
  //...
  settings: {
    cors: {
      enabled: true, 
      // headers: '*',
      origin: [env('API_URL'), env('APP_URL')],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    },
    // security : {
    //   config: {
    //     contentSecurityPolicy: {
    //       useDefaults: true,
    //       directives: {
    //         "connect-src": ["'self'", "https:"],
    //         "img-src": ["'self'", "data:", "blob:", `${env('CDN_BASE_URL')}`],
    //         "media-src": ["'self'", "data:", "blob:", `${env('CDN_BASE_URL')}`],
    //         upgradeInsecureRequests: null,
    //       },
    //     },
    //   },
    // },
  },
});