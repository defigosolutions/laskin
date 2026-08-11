const fs = require('fs');
const content = fs.readFileSync('clean_db.sql', 'utf8');
const lines = content.split('\n');
let output = '';
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();
  const copyMatch = line.match(/^COPY\s+(\S+)\s+\(([^)]+)\)\s+FROM\s+stdin;/i);

  if (copyMatch) {
    const table = copyMatch[1];
    const columns = copyMatch[2].split(',').map(c => c.trim());
    const rows = [];
    i++;
    while (i < lines.length && lines[i].trim() !== '\\.') {
      if (lines[i].trim()) rows.push(lines[i]);
      i++;
    }
    if (rows.length > 0) {
      for (const row of rows) {
        const vals = row.split('\t').map(v => {
          // Strip carriage returns just in case
          let cleanV = v.replace(/\r$/, '');
          if (cleanV === '\\N') return 'NULL';
          
          const escaped = cleanV.replace(/\\/g, '\\\\').replace(/'/g, "''");
          return "'" + escaped + "'";
        });
        output += 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + vals.join(', ') + ');\n';
      }
    }
  } else {
    // Aggressive filtering
    if (
      line.startsWith('SET ') || 
      line.startsWith('SELECT pg_catalog.') ||
      line.startsWith('--') ||
      line === ''
    ) {
      // skip completely
    } else {
      output += line + '\n';
    }
  }
  i++;
}

output = output.replace(/^\s*[\r\n]/gm, '');
output = output.trim();

fs.writeFileSync('import_ready.sql', output);
const kb = Math.round(output.length / 1024);
const lineCount = output.split('\n').length;
console.log('Done! Lines: ' + lineCount + ', Size: ' + kb + 'KB');
console.log('File saved as: import_ready.sql');
