const fs = require('fs');
const path = require('path');
const https = require('https');

const modelDir = path.join(__dirname, 'node_modules', '@huggingface', 'transformers', '.cache', 'Xenova', 'all-MiniLM-L6-v2', 'onnx');
const modelPath = path.join(modelDir, 'model.onnx');
const url = 'https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx';

if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

console.log('Downloading model file (approx 90MB)... Please wait.');

const file = fs.createWriteStream(modelPath);

https.get(url, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Handle redirect
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download complete! You can now restart your NestJS server.');
      });
    }).on('error', (err) => {
      fs.unlinkSync(modelPath);
      console.error('Error downloading:', err.message);
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete! You can now restart your NestJS server.');
    });
  }
}).on('error', (err) => {
  fs.unlinkSync(modelPath);
  console.error('Error downloading:', err.message);
});
