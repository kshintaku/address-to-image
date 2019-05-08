
const app = require('./app');

const server = app.listen(app.get('port'), () => {
    console.log(`Address-To-Image Example is running (${app.get('port')} port) (${app.get('env')} mode)`);
});


export = server;
