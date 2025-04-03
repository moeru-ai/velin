document.addEventListener('DOMContentLoaded', () => {
  const examples = [
    { name: 'Vue SFC Example', url: 'index.html', description: 'Demonstrates using Vue SFC components in the browser' },
    { name: 'Markdown Example', url: 'markdown.html', description: 'Demonstrates using Markdown with Vue functionality in the browser' }
  ];

  const list = document.getElementById('example-list');
  
  examples.forEach(example => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = example.url;
    link.textContent = example.name;
    
    item.appendChild(link);
    item.appendChild(document.createTextNode(` - ${example.description}`));
    
    list.appendChild(item);
  });
}); 
