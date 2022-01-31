module.exports = ({ env }) => ( {
    //...
    settings: {
      cors: {
        enabled: true, 
        // headers: '*',
        origin: [env('API_URL'), env('APP_URL')],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      },
    },
  });