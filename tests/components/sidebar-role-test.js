/**
 * Simple verification script for role-based navigation
 * Run this to verify each role shows correct navigation items count
 */

const { getNavigationForRole } = require('../../../src/lib/config/navigation.ts');

const roles = ['superadmin', 'admin_head', 'admin_officer', 'household_head', 'security_officer'];
const expectedCounts = {
  superadmin: 5,       // Dashboard, Village List, Users, Payments, Reports
  admin_head: 8,       // Dashboard, Household Approvals, Active Households, Fees Management, Payment Status, Rules, Announcements, Construction Permits
  admin_officer: 7,    // Dashboard, Household Records, Sticker Requests, Active Stickers, Construction Permits, Manual Payments, Resident Inquiries
  household_head: 8,   // Dashboard, Members, Visitor Management, Active Guest Passes, Sticker Requests, Service Requests, Announcements & Rules, Fee Status
  security_officer: 9  // Dashboard, Sticker Validation, Guest Registration, Guest Approval Status, Guest Pass Scan/Entry Log, Delivery Logging, Construction Worker Entry, Incident Report, Shift History/Logs
};

console.log('🔍 Verifying role-based navigation configuration...\n');

let allPassed = true;

roles.forEach(role => {
  try {
    const navigationItems = getNavigationForRole(role);
    const actualCount = navigationItems.length;
    const expectedCount = expectedCounts[role];

    if (actualCount === expectedCount) {
      console.log(`✅ ${role}: ${actualCount} items (correct)`);

      // Show navigation items for verification
      console.log(`   Items: ${navigationItems.map(item => item.label).join(', ')}`);

      // Check for badge on superadmin payments
      if (role === 'superadmin') {
        const paymentsItem = navigationItems.find(item => item.id === 'superadmin-payments');
        if (paymentsItem && paymentsItem.badge) {
          console.log(`   ✅ Payments badge: ${paymentsItem.badge}`);
        } else {
          console.log(`   ❌ Missing payments badge`);
          allPassed = false;
        }
      }
    } else {
      console.log(`❌ ${role}: ${actualCount} items (expected ${expectedCount})`);
      allPassed = false;
    }

    console.log(''); // Empty line for readability

  } catch (error) {
    console.log(`❌ ${role}: Error - ${error.message}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('🎉 All role-based navigation configurations are correct!');
  process.exit(0);
} else {
  console.log('❌ Some role configurations need fixing.');
  process.exit(1);
}