import fs from 'fs';

const html = fs.readFileSync('server/sample.html', 'utf-8');

// Find win_result div or ball classes
const numMatches = [...html.matchAll(/<span class="ball_645[^"]*">(\d+)<\/span>/g)];
console.log('Ball matches:', numMatches.map(m => m[1]));

// Find win_result section
const idx = html.indexOf('class="win_result"');
if (idx !== -1) {
  console.log('--- Win Result Snippet ---');
  console.log(html.substring(idx, idx + 1000));
} else {
  console.log('win_result not found, searching num...');
  const idx2 = html.indexOf('num win');
  if (idx2 !== -1) {
    console.log(html.substring(idx2, idx2 + 1000));
  } else {
    console.log('num win not found, searching num bonus...');
    const idx3 = html.indexOf('class="num');
    if (idx3 !== -1) console.log(html.substring(idx3, idx3 + 1000));
  }
}
