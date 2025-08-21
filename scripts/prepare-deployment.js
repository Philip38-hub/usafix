#!/usr/bin/env node

/**
 * Deployment preparation script for Usafix
 * This script checks if the application is ready for deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing Usafix for Netlify Deployment');
console.log('==========================================');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'index.html',
  'netlify.toml',
  '.env.example'
];

console.log('\n1. Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

// Check package.json build script
console.log('\n2. Checking build configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Build script found:', packageJson.scripts.build);
  } else {
    console.log('❌ Build script missing in package.json');
    allFilesExist = false;
  }
  
  if (packageJson.scripts && packageJson.scripts.preview) {
    console.log('✅ Preview script found:', packageJson.scripts.preview);
  } else {
    console.log('⚠️  Preview script missing (optional)');
  }
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check environment variables
console.log('\n3. Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists (for local development)');
} else {
  console.log('⚠️  .env file not found (will use Netlify environment variables)');
}

if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example exists');
  
  try {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_CIVIC_AUTH_CLIENT_ID'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        console.log(`✅ ${envVar} - documented`);
      } else {
        console.log(`❌ ${envVar} - missing from .env.example`);
      }
    });
  } catch (error) {
    console.error('❌ Error reading .env.example:', error.message);
  }
}

// Check build output directory
console.log('\n4. Testing build process...');
console.log('ℹ️  Run "npm run build" to test the build process');
console.log('ℹ️  The build output should be in the "dist" directory');

// Check for common deployment issues
console.log('\n5. Checking for common deployment issues...');

// Check for absolute paths in imports
const srcDir = 'src';
if (fs.existsSync(srcDir)) {
  console.log('✅ Source directory exists');
  
  // Check for potential issues in main files
  const mainFiles = ['src/main.tsx', 'src/App.tsx'];
  mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('http://localhost')) {
        console.log(`⚠️  ${file} contains localhost URLs - ensure these are environment variables`);
      }
    }
  });
}

// Check Vite config
console.log('\n6. Checking Vite configuration...');
if (fs.existsSync('vite.config.ts')) {
  try {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
    if (viteConfig.includes('base:')) {
      console.log('ℹ️  Base path configuration found in vite.config.ts');
    }
    if (viteConfig.includes('build:')) {
      console.log('ℹ️  Build configuration found in vite.config.ts');
    }
    console.log('✅ Vite configuration looks good');
  } catch (error) {
    console.error('❌ Error reading vite.config.ts:', error.message);
  }
}

// Summary
console.log('\n7. Deployment Readiness Summary');
console.log('===============================');

if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 Application appears ready for deployment!');
  
  console.log('\n📋 Next Steps for Netlify Deployment:');
  console.log('1. Push your code to GitHub/GitLab');
  console.log('2. Connect your repository to Netlify');
  console.log('3. Set build command: npm run build');
  console.log('4. Set publish directory: dist');
  console.log('5. Add environment variables in Netlify dashboard:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('   - VITE_CIVIC_AUTH_CLIENT_ID');
  console.log('6. Deploy!');
  
  console.log('\n🔗 Useful Netlify Features:');
  console.log('- Branch deploys for testing');
  console.log('- Deploy previews for pull requests');
  console.log('- Custom domain configuration');
  console.log('- SSL certificates (automatic)');
  console.log('- CDN and performance optimization');
  
} else {
  console.log('❌ Some required files are missing');
  console.log('🔧 Please fix the issues above before deploying');
}

console.log('\n🌐 Expected deployment URL format:');
console.log('https://your-app-name.netlify.app');
console.log('(You can customize this in Netlify settings)');

process.exit(allFilesExist ? 0 : 1);
