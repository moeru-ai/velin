import { parseMarkdownPrompt, renderMarkdown } from "../src/md";

// Usage example
(async () => {
  try {
    // Parse Markdown with Vue syntax as prompt template
    console.log('\n--- PARSING MARKDOWN AS PROMPT TEMPLATE ---');
    const template = await parseMarkdownPrompt('assets/Markdown.md');
    console.log('Default data:', template.data);
    
    // Render with default data
    console.log('\nRendered with default data:');
    console.log(template.render());
    
    // Render with custom data
    console.log('\nRendered with custom data:');
    console.log(template.render({ 
      language: 'TypeScript', 
      userQuestion: 'How do I create an interface?' 
    }));

    // Original render (HTML output)
    console.log('\n--- ORIGINAL MARKDOWN TO HTML RENDER ---');
    const htmlMD = await renderMarkdown('assets/Markdown.md');
    console.log('Markdown HTML Render result:\n', htmlMD);
  } catch (error) {
    console.error('Failed to parse markdown prompt:', error);
  }
})();
