#!/usr/bin/env node

/**
 * Utility script to create coming soon pages
 * Usage: node scripts/create-coming-soon-page.js <route-name> <feature-name> [icon] [estimated-date]
 *
 * Example:
 * node scripts/create-coming-soon-page.js incident-report "Incident Report" report "Q1 2025"
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const [,, routeName, featureName, icon = 'construction', estimatedDate] = process.argv;

if (!routeName || !featureName) {
  console.log('Usage: node scripts/create-coming-soon-page.js <route-name> <feature-name> [icon] [estimated-date]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/create-coming-soon-page.js incident-report "Incident Report" report "Q1 2025"');
  console.log('  node scripts/create-coming-soon-page.js fee-status "Fee Status" receipt');
  console.log('  node scripts/create-coming-soon-page.js service-requests "Service Requests"');
  process.exit(1);
}

// Generate page content
const generatePageContent = (routeName, featureName, icon, estimatedDate) => {
  const titleCase = featureName;
  const description = `${featureName} feature coming soon`;
  const detailedDescription = `Comprehensive ${featureName.toLowerCase()} management system. This feature will provide advanced capabilities for managing and organizing ${featureName.toLowerCase()} activities.`;

  const estimatedDateProp = estimatedDate ? `\n      estimatedDate="${estimatedDate}"` : '';

  return `import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${titleCase} - VillageManager',
  description: '${description}',
}

export default function ${featureName.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <ComingSoon
      featureName="${featureName}"
      description="${detailedDescription}"
      icon="${icon}"${estimatedDateProp}
    />
  )
}`;
};

// Create directory and file
const appDir = path.join(process.cwd(), 'src', 'app');
const routeDir = path.join(appDir, routeName);
const pageFile = path.join(routeDir, 'page.tsx');

try {
  // Create directory if it doesn't exist
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
    console.log(`✅ Created directory: ${routeDir}`);
  }

  // Check if page already exists
  if (fs.existsSync(pageFile)) {
    console.log(`❌ Page already exists: ${pageFile}`);
    console.log('   Use a different route name or delete the existing file.');
    process.exit(1);
  }

  // Generate and write page content
  const content = generatePageContent(routeName, featureName, icon, estimatedDate);
  fs.writeFileSync(pageFile, content);

  console.log(`🎉 Successfully created coming soon page!`);
  console.log(`   Route: /${routeName}`);
  console.log(`   Feature: ${featureName}`);
  console.log(`   File: ${pageFile}`);
  console.log(`   Icon: ${icon}`);
  if (estimatedDate) {
    console.log(`   Estimated: ${estimatedDate}`);
  }

  console.log(`\n📋 Next steps:`);
  console.log(`   1. Add route to navigation configuration if needed`);
  console.log(`   2. Test the page: npm run dev`);
  console.log(`   3. Navigate to: http://localhost:3000/${routeName}`);

} catch (error) {
  console.error(`❌ Error creating page: ${error.message}`);
  process.exit(1);
}

// Additional Material Icons suggestions
console.log(`\n💡 Popular Material Icons for different features:`);
console.log(`   Users/People: group, people, person, account_circle`);
console.log(`   Payments/Fees: payment, receipt, request_quote, payments`);
console.log(`   Reports: assessment, analytics, bar_chart, insert_chart`);
console.log(`   Security: security, verified_user, shield, lock`);
console.log(`   Construction: engineering, construction, build, home_work`);
console.log(`   Visitors: person_add, how_to_reg, badge, qr_code_scanner`);
console.log(`   Management: folder, inventory, manage_accounts, admin_panel_settings`);
console.log(`   Announcements: campaign, notifications, announcement, info`);
console.log(`   See more at: https://fonts.google.com/icons`);