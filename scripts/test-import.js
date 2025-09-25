#!/usr/bin/env node

/**
 * Test script for importing tournament data
 * Run with: node scripts/test-import.js
 */

const fs = require('fs').promises;
const path = require('path');

const JSON_DIR = '/Users/tjmcgovern/golfgod_x_convex/top100_2015_2025_20250924_201118';
const API_URL = 'http://localhost:3001/api/import-json-files';

async function testImport() {
  try {
    console.log('🔍 Testing import pipeline...');
    console.log(`Directory: ${JSON_DIR}`);

    // Check if directory exists
    try {
      await fs.access(JSON_DIR);
      console.log('✅ Directory exists');
    } catch {
      console.error('❌ Directory not found:', JSON_DIR);
      return;
    }

    // List JSON files
    const files = await fs.readdir(JSON_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${jsonFiles.length} JSON files`);

    // Test with first file only
    const testFile = jsonFiles.find(f => f.includes('Scottie_Scheffler')) || jsonFiles[0];
    console.log(`\n📋 Testing with: ${testFile}`);

    // Read and parse the test file
    const filePath = path.join(JSON_DIR, testFile);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Display file structure
    console.log('\n📊 File structure:');
    console.log('- Player ID:', data.player_id);
    console.log('- Years:', data.years?.map(y => y.year).join(', '));
    console.log('- Total tournaments:', data.years?.reduce((sum, y) => sum + y.tournaments.length, 0));

    // Test the API endpoint
    console.log('\n🚀 Testing API endpoint...');
    console.log('Endpoint:', API_URL);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: JSON_DIR,
          batchSize: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:');
      console.log('- Success:', result.success);
      console.log('- Players parsed:', result.parsedFiles);
      console.log('- Total files:', result.totalFiles);

      if (result.players && result.players.length > 0) {
        const player = result.players[0];
        console.log('\n👤 First player:');
        console.log('- Name:', player.playerName);
        console.log('- ID:', player.player_id);
        console.log('- Years:', player.years.length);
      }

    } catch (apiError) {
      console.error('❌ API Error:', apiError.message);
      console.log('\nMake sure the Next.js dev server is running (npm run dev)');
    }

    console.log('\n✅ Test complete!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3001/admin/import-json-pipeline');
    console.log('2. Click "Import All Players" to import all 100 players');
    console.log('3. Monitor the progress in the import log');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testImport();