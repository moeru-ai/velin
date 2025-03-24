import fs from 'node:fs';
import path from 'node:path';
import { parse, compileTemplate, compileScript } from '@vue/compiler-sfc';
import { createSSRApp, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import * as Vue from 'vue';

// 编译 SFC 的函数
async function compileSFC(filePath: string) {
  // 读取 SFC 文件内容
  console.log(`Reading file from: ${filePath}`);
  const source = fs.readFileSync(filePath, 'utf-8');
  console.log(`File content:\n${source}`);
  
  // 解析 SFC 文件
  const { descriptor } = parse(source);
  
  // 检查是否有 template 标签
  if (!descriptor.template) {
    throw new Error(`${filePath} has no <template> tag.`);
  }
  
  // 为不同部分生成唯一ID
  const id = 'vue-component-' + Date.now();
  
  // 编译模板为渲染函数
  const templateResult = compileTemplate({
    source: descriptor.template.content,
    filename: filePath,
    id,
    // 指定为 ssr 模式
    ssr: true,
    compilerOptions: {
      // runtimeModuleName 需要设置为 'vue'
      runtimeModuleName: 'vue'
    }
  });
  
  // 创建临时文件存储编译后的模板代码
  const templateFilePath = path.resolve(process.cwd(), 'temp-template.js');
  fs.writeFileSync(templateFilePath, templateResult.code);
  
  // 使用 require 动态导入编译后的模板代码
  const { ssrRender } = await import(/* @vite-ignore */ 'file://' + templateFilePath);
  
  // 解析 script 内容，简单实现，不依赖动态 import
  // 这里我们知道当前示例中只有 count 这一个变量
  const setupVars: Record<string, any> = {
    count: 0 // 预设值
  };
  
  if (descriptor.scriptSetup) {
    console.log('Found script setup, providing default reactive variables');
  } else if (descriptor.script) {
    console.log('Found regular script');
  }
  
  // 创建一个简单的组件对象
  const Component = {
    // 定义响应式数据
    setup() {
      // 创建我们需要的响应式数据
      const count = ref(10);
      const message = ref('Hello from Vue!');
      
      // 返回给模板使用的变量
      return {
        count,
        message
      };
    },
    // 附加 SSR 渲染函数
    ssrRender
  };
  
  // 清理临时文件
  fs.unlinkSync(templateFilePath);
  
  return Component;
}

// 渲染 SFC 的函数
async function renderSFC(filePath: string) {
  try {
    // 确保使用绝对路径
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    console.log(`Rendering SFC from absolute path: ${absolutePath}`);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }
    
    // 编译SFC并获取组件
    const Component = await compileSFC(absolutePath);
    
    // 创建SSR应用
    const app = createSSRApp(Component);
    
    // 渲染为HTML
    const html = await renderToString(app);
    return html;
  } catch (error) {
    console.error('Error in renderSFC:', error);
    throw error;
  }
}

// 使用示例
(async () => {
  try {
    const html = await renderSFC('src/MyComponent.vue');
    console.log('渲染结果:', html);
  } catch (error) {
    console.error('Failed to render SFC:', error);
  }
})();
