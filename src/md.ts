import fs from 'node:fs';
import path from 'node:path';
import { parse, compileTemplate, compileScript } from '@vue/compiler-sfc';
import { createSSRApp, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import * as Vue from 'vue';
import { reactive } from 'vue';

/**
 * Compiles a Markdown file with Vue components into an executable component
 * This preserves the original Markdown content while parsing Vue code
 */
export async function compileMarkdown(filePath: string) {
  // Read Markdown file content
  console.log(`Reading file from: ${filePath}`);
  const source = fs.readFileSync(filePath, 'utf-8');
  // console.log(`File content:\n${source}`);
  
  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source);

  console.log(descriptor)
  
  // Process the Markdown content, preserving it as is
  let templateContent = '';
  if (descriptor.template) {
    templateContent = descriptor.template.content;
  } else {
    // If no template tag, treat the markdown content as template
    // Replace custom v-if directives with proper Vue syntax
    templateContent = source.replace(/<v-if="([^"]+)">/g, '<div v-if="$1">');
    templateContent = templateContent.replace(/<\/v-if>/g, '</div>');
  }
  
  // Generate unique ID for different parts
  const id = 'vue-component-' + Date.now();
  
  // Compile template to render function
  const templateResult = compileTemplate({
    source: templateContent,
    filename: filePath,
    id,
    ssr: true,
    compilerOptions: {
      runtimeModuleName: 'vue'
    }
  });
  
  // Store compiled template code in temp file
  const templateFilePath = path.resolve(process.cwd(), 'temp-template.js');
  fs.writeFileSync(templateFilePath, templateResult.code);
  
  // Dynamically import compiled template code
  const { ssrRender } = await import(/* @vite-ignore */ 'file://' + templateFilePath);

  // Parse script content
  let setupScript = '';
  if (descriptor.scriptSetup) {
    // Compile <script setup> content
    const scriptResult = compileScript(descriptor, {
      id,
      inlineTemplate: false,
    });
    setupScript = scriptResult.content;
  } else if (descriptor.script) {
    setupScript = descriptor.script.content;
  }

  // Create component with parsed setup and SSR render function
  const Component = {
    Vue,
    ssrRender,
  };
  
  // Cleanup temp file
  fs.unlinkSync(templateFilePath);
  
  return Component;
}

// Render Markdown to HTML string
export async function renderMarkdown(filePath: string) {
  try {
    // Ensure absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    console.log(`Rendering Markdown from absolute path: ${absolutePath}`);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }
    
    // Compile Markdown and get component
    const Component = await compileMarkdown(absolutePath);
    
    // Create SSR app
    const app = createSSRApp(Component);
    
    // Render to HTML
    const html = await renderToString(app);
    return html;
  } catch (error) {
    console.error('Error in renderMarkdown:', error);
    throw error;
  }
}

/**
 * Parses a Markdown file with Vue template syntax for use as a prompt
 * Preserves the Markdown content as raw text while allowing Vue reactivity
 */
export async function parseMarkdownPrompt(filePath: string): Promise<{ 
  content: string;
  data: Record<string, any>;
  render: (data?: Record<string, any>) => string; 
}> {
  // Read Markdown file content
  console.log(`Reading file from: ${filePath}`);
  const source = fs.readFileSync(filePath, 'utf-8');
  
  // Parse Markdown file as if it were a Vue SFC
  const { descriptor } = parse(source);
  
  // Extract reactive data from script
  let reactiveData: Record<string, any> = {};
  
  // Parse script content to extract variables
  if (descriptor.scriptSetup) {
    try {
      // For simplicity, parse variables directly using regex
      // This is a simplified approach - a proper implementation would need a more robust parser
      const scriptContent = descriptor.scriptSetup.content;
      
      // Get variables with default values
      const varRegex = /const\s+(\w+)\s*=\s*ref\s*\(\s*(.+?)\s*\)\s*;/g;
      let match;
      
      while ((match = varRegex.exec(scriptContent)) !== null) {
        const varName = match[1];
        let varValue = match[2];
        
        // Handle string values
        if (/^['"].*['"]$/.test(varValue)) {
          // String value
          varValue = varValue.substring(1, varValue.length - 1);
        } 
        // Handle boolean values
        else if (varValue === 'true') {
          varValue = true;
        } 
        else if (varValue === 'false') {
          varValue = false;
        }
        // Handle numeric values
        else if (!isNaN(Number(varValue))) {
          varValue = Number(varValue);
        }
        
        reactiveData[varName] = varValue;
      }
    } catch (error) {
      console.warn('Error parsing script variables:', error);
    }
  } else if (descriptor.script) {
    // Handle standard script tag if needed
    console.warn('Standard script tags not fully supported in markdown prompt templates');
  }
  
  // Process the Markdown content
  let content = source;
  
  // Remove script tag and its content from the template
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Create render function that replaces Vue template syntax with values
  const render = (data: Record<string, any> = {}) => {
    // Combine default data with provided data
    const mergedData = { ...reactiveData, ...data };
    
    // Replace template variables {{ var }} with their values
    let result = content;
    
    // Handle v-if directives (simplified approach)
    result = result.replace(/<div v-if="([^"]+)">([\s\S]*?)<\/div>/g, (match, condition, content) => {
      const conditionResult = evaluateCondition(condition, mergedData);
      return conditionResult ? content : '';
    });
    
    // Replace template variables
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variable) => {
      const value = evaluateExpression(variable.trim(), mergedData);
      return value !== undefined ? String(value) : match;
    });
    
    return result;
  };
  
  return {
    content,
    data: reactiveData,
    render
  };
}

/**
 * Simple expression evaluator for handling variables in templates
 */
function evaluateExpression(expression: string, data: Record<string, any>): any {
  try {
    // Handle simple property access
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
      return data[expression];
    }
    
    // For more complex expressions, use Function constructor
    // This has security implications in production environments
    const func = new Function(...Object.keys(data), `return ${expression};`);
    return func(...Object.values(data));
  } catch (error) {
    console.warn(`Error evaluating expression "${expression}":`, error);
    return undefined;
  }
}

/**
 * Simple condition evaluator for v-if directives
 */
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    const func = new Function(...Object.keys(data), `return Boolean(${condition});`);
    return func(...Object.values(data));
  } catch (error) {
    console.warn(`Error evaluating condition "${condition}":`, error);
    return false;
  }
}

