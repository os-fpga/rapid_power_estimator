const os = require('os');
const platform = os.platform();

const kill = (process) => {
    console.log(`Attempting to kill process with PID: ${process.pid}`);
    const { spawn } = require('child_process');
    if (platform === 'win32') {
        // used taskkill for Windows to terminate the process tree
        const taskKill = spawn('taskkill', ['/PID', process.pid, '/T', '/F']);
        taskKill.on('close', (code) => {
            if (code === 0) {
                console.log('Process killed successfully on Windows.');
            } else {
                console.error(`taskkill failed with exit code: ${code}`);
            }
        });
    } else if (platform === 'darwin' || platform === 'linux') {
        const taskKill = spawn('kill', ['-9', process.pid]);
        taskKill.on('close', (code) => {
            if (code === 0) {
                console.log('Process killed successfully on Unix.');
            } else {
                console.error(`taskkill failed with exit code: ${code}`);
            }
        });
    } else {
        try {
            process.kill('SIGINT');
            console.log('SIGINT sent to process');
        } catch (error) {
            console.error(`Failed to send SIGINT: ${error.message}`);
        }
    }
};

module.exports = { kill };
