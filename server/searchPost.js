import fs from 'fs';

const html = fs.readFileSync('server/samplePost.html', 'utf-8');

// Search for common lottery keywords
const keywords = ['ball_', 'drwNo', 'win', '당첨번호', '추첨', '보너스'];
keywords.forEach(kw => {
  const count = (html.match(new RegExp(kw, 'g')) || []).length;
  console.log(`Keyword '${kw}': ${count} occurrences`);
});

// Print around '당첨번호'
const idx = html.indexOf('당첨번호');
if (idx !== -1) {
  console.log('--- Around 당첨번호 ---');
  console.log(html.substring(idx - 100, idx + 800));
}
