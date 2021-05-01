const cluster = require('cluster');
const os = require('os');


//Initialize a cluster process to make optimum use of memory and create child processes 
if (cluster.isMaster) {
    const cpus = os.cpus().length;
    console.log(`Forking for ${cpus} CPU's`);
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
        cluster.on('exit', (worker, code, signal) => {
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.log(`Worker ${worker.id} crashed.    'Starting a new worker'.....`)
                cluster.fork();
            }
        })
    }
} else {
    require('./app.js');
}