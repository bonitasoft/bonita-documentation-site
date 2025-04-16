#!/usr/bin/env node

// Context: This script is used to remove specific HTML files from a site built to check external links
// Bonita dependencies pages are generated and include broken links. As we cannot change the content of these pages, this is valid to ignore them.
//
// The script would be useless if the "dependencies" pages were all stored in a dedicated directory.
// If so, we could use the htmltest IgnoreDirs option to ignore the directory. See https://github.com/wjdp/htmltest#wrench-configuration

const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const { glob } = require('glob');

// Define the directory we'll be working with
const SITE_DIR = 'build/site';

// Main function
async function main() {
  console.log("Removing specific generated pages listing Bonita dependencies from the bonita directory and subdirectories...");
  console.log(`Site directory: ${SITE_DIR}`);

  // Check if the directory exists
  if (!fs.existsSync(SITE_DIR)) {
    console.error(`Error: ${SITE_DIR} directory does not exist.`);
    process.exit(1);
  }

  // Define files to remove
  const filesToRemove = [
    "bonita-data-repository-dependencies.html",
    "bonita-engine-dependencies.html",
    "bonita-ui-designer-dependencies.html",
    "bonita-runtime-dependencies.html",
    "bonita-web-dependencies.html",
    "dependencies-index.html",
    "portal-js-dependencies.html",
  ];

  // For each file pattern, find and delete matching files
  for (const file of filesToRemove) {
    console.log(`Looking for ${file} files...`);

    try {
      // Use glob to find all matching files
      const files = await glob(`${SITE_DIR}/bonita/**/${file}`);
      let filesNumber = files.length ?? 0;

      if (filesNumber === 0) {
        console.log(`  No files found`);
      } else {
        console.log(`  Found ${filesNumber} files:`);
        // Delete each file found
        for (const filePath of files) {
          console.log(`  Deleting: ${filePath}`);
          fs.unlinkSync(filePath);
          console.log(`  Deleted: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`Error while processing ${file}: ${error.message}`);
    }
  }

  console.log("Removal completed.");
}

// Run the main function
main().catch(error => {
  console.error(`An error occurred: ${error.message}`);
  process.exit(1);
});
