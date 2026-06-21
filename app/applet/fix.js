const fs = require('fs');
let code = fs.readFileSync('src/pages/Calculator.tsx', 'utf8');

code = code.replace(/Заявка пока п[\s\S]*?<div key=\{item\.id\}/, 'Заявка пока пуста</p>\n                 </div>\n               ) : (\n                 <div className="space-y-4">\n                    {items.map(item => (\n                      <div key={item.id}');

code = code.replace(/<\/div>lack text-gray-900">[\s\S]*?<div className="flex justify-end pt-8/, '</div>\n                    ))}\n                    <div className="flex justify-end pt-8');

code = code.replace(/<\/Card>-500\/20"[\s\S]*?<\/Card>/, '</Card>');

fs.writeFileSync('src/pages/Calculator.tsx', code);
