import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Executes a Python script with Biopython to perform deterministic calculations.
 * @param {string} task - The task to perform (e.g., 'melting_temp', 'codon_optimize', 'primer_design').
 * @param {Object} data - The data required for the task.
 * @returns {Promise<Object>} - The result of the calculation.
 */
export async function runBioTask(task, data) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'bio_worker.py'),
      task,
      JSON.stringify(data)
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${output}`));
      }
    });
  });
}
