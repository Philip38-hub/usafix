#!/usr/bin/env node

/**
 * Deployment status checker for Usafix
 * Verifies that the build output is ready for deployment
 */

import fs from 'fs';
import path from 'path';

console.log('📊 Usafix Deployment Status Check');
console.log('=================================');

// Check if build directory exists
const buildDir = 'dist';
console.log('\n1. Checking build output...');

if (fs.existsSync(buildDir)) {
  console.log(`✅ Build directory "${buildDir}" exists`);
  
  // Check build contents
  const buildContents = fs.readdirSync(buildDir);
  console.log(`📁 Build contents (${buildContents.length} items):`);
  
  buildContents.forEach(item => {
    const itemPath = path.join(buildDir, item);
    const stats = fs.statSync(itemPath);
    const size = stats.isFile() ? `(${(stats.size / 1024).toFixed(1)} KB)` : '(directory)';
    console.log(`   - ${item} ${size}`);
  });
  
  // Check for essential files
  const essentialFiles = ['index.html', 'assets'];
  let allEssentialPresent = true;
  
  console.log('\n2. Checking essential files...');
  essentialFiles.forEach(file => {
    if (buildContents.includes(file)) {
      console.log(`✅ ${file} - present`);
    } else {
      console.log(`❌ ${file} - missing`);
      allEssentialPresent = false;
    }
  });
  
  // Check index.html content
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    console.log('\n3. Checking index.html...');
    if (indexContent.includes('<title>')) {
      console.log('✅ Title tag found');
    }
    if (indexContent.includes('script')) {
      console.log('✅ JavaScript bundles linked');
    }
    if (indexContent.includes('stylesheet') || indexContent.includes('.css')) {
      console.log('✅ CSS stylesheets linked');
    }
    if (indexContent.includes('Usafix')) {
      console.log('✅ App name "Usafix" found');
    }
  }
  
  // Check assets directory
  const assetsPath = path.join(buildDir, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    console.log(`\n4. Checking assets (${assets.length} files)...`);
    
    const jsFiles = assets.filter(f => f.endsWith('.js'));
    const cssFiles = assets.filter(f => f.endsWith('.css'));
    
    console.log(`✅ JavaScript files: ${jsFiles.length}`);
    console.log(`✅ CSS files: ${cssFiles.length}`);
    
    // Check file sizes
    let totalSize = 0;
    assets.forEach(asset => {
      const assetPath = path.join(assetsPath, asset);
      const stats = fs.statSync(assetPath);
      totalSize += stats.size;
    });
    
    console.log(`📊 Total assets size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }
  
  if (allEssentialPresent) {
    console.log('\n✅ Build output is ready for deployment!');
  } else {
    console.log('\n❌ Build output is missing essential files');
  }
  
} else {
  console.log(`❌ Build directory "${buildDir}" not found`);
  console.log('💡 Run "npm run build" to create the build output');
}

// Check deployment configuration
console.log('\n5. Checking deployment configuration...');

if (fs.existsSync('netlify.toml')) {
  console.log('✅ netlify.toml configuration file exists');
  
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  if (netlifyConfig.includes('publish = "dist"')) {
    console.log('✅ Publish directory correctly set to "dist"');
  }
  if (netlifyConfig.includes('command = "npm run build"')) {
    console.log('✅ Build command correctly set');
  }
  if (netlifyConfig.includes('from = "/*"')) {
    console.log('✅ SPA routing redirect configured');
  }
} else {
  console.log('❌ netlify.toml configuration file missing');
}

// Final summary
console.log('\n6. Deployment Summary');
console.log('====================');

const deploymentReady = fs.existsSync(buildDir) && fs.existsSync('netlify.toml');

if (deploymentReady) {
  console.log('🚀 Status: READY FOR DEPLOYMENT');
  console.log('\n📋 Next steps:');
  console.log('1. Push code to GitHub: git push origin main');
  console.log('2. Connect repository to Netlify');
  console.log('3. Configure environment variables');
  console.log('4. Deploy!');
  
  console.log('\n🌐 Expected deployment:');
  console.log('- Build command: npm run build');
  console.log('- Publish directory: dist');
  console.log('- Node version: 18');
  
} else {
  console.log('⚠️  Status: NOT READY');
  console.log('\n🔧 Required actions:');
  if (!fs.existsSync(buildDir)) {
    console.log('- Run: npm run build');
  }
  if (!fs.existsSync('netlify.toml')) {
    console.log('- Create netlify.toml configuration');
  }
}

console.log('\n📚 For detailed instructions, see DEPLOYMENT.md');

process.exit(deploymentReady ? 0 : 1);
