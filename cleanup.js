const isWindows = process.platform === 'win32';

const kill = (process) => {
    console.log(`Attempting to kill process with PID: ${process.pid}`);
    if (isWindows) {
        const { spawn } = require('child_process');
        // used taskkill for Windows to terminate the process tree
        const taskKill = spawn('taskkill', ['/PID', process.pid, '/T', '/F']);
        taskKill.on('close', (code) => {
            if (code === 0) {
                console.log('Process killed successfully on Windows.');
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
