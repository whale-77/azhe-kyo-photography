import http from 'node:http';
import fs from 'node:fs';

const videoPath = 'C:\\Users\\23950\\Downloads\\QQ2026917-195127.mp4';

http.createServer((request, response) => {
  if (request.url !== '/video.mp4') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<video controls autoplay muted style="width:100vw;height:100vh;background:#111"><source src="/video.mp4" type="video/mp4"></video>');
    return;
  }
  const stat = fs.statSync(videoPath);
  const range = request.headers.range;
  if (!range) {
    response.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'video/mp4' });
    fs.createReadStream(videoPath).pipe(response);
    return;
  }
  const [startText, endText] = range.replace('bytes=', '').split('-');
  const start = Number(startText);
  const end = endText ? Number(endText) : stat.size - 1;
  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'video/mp4',
  });
  fs.createReadStream(videoPath, { start, end }).pipe(response);
}).listen(8765, '127.0.0.1');
