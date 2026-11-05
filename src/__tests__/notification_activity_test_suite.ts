/**
 * NEXORA — NOTIFICATION & ACTIVITY CENTER AUTOMATED QA TEST SUITE
 * 
 * Verifies:
 * 1. Notification Types & Schema: Ingestion of all 9 required notification types
 * 2. Real-Time Delivery: Listener updates & dispatch
 * 3. Read / Unread States: Transitions & markAllAsRead
 * 4. Deletion & Retention: Delete single item & clear all
 * 5. Deduplication Engine: Burst suppression for identical notification signatures
 * 6. User Preferences & Muting: Community muting, conversation muting, category toggles
 * 7. Browser Notification Integration: Permission state handling without auto-prompting
 * 8. Listener Cleanup: Safe teardown on logout
 * 9. Security & Access Control: Isolation of notification ownership & anti-impersonation
 */

import fs from 'fs';
import path from 'path';
import { notificationService } from '../services/notificationService';
import {
  NexoraNotification,
  NotificationType,
  NotificationCategory,
  NotificationPreferences,
  User,
} from '../types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failCount++;
  }
}

async function runNotificationSuite() {
  console.log('======================================================================');
  console.log('🔔 NEXORA NOTIFICATION & ACTIVITY CENTER QA SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();
  const firestoreRules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
  const serviceSource = fs.readFileSync(path.join(rootDir, 'src/services/notificationService.ts'), 'utf8');
  const contextSource = fs.readFileSync(path.join(rootDir, 'src/context/NexoraContext.tsx'), 'utf8');
  const popoverSource = fs.readFileSync(path.join(rootDir, 'src/components/notifications/NotificationCenterPopover.tsx'), 'utf8');
  const settingsModalSource = fs.readFileSync(path.join(rootDir, 'src/components/modals/NotificationSettingsModal.tsx'), 'utf8');

  const recipientId = 'usr_qa_recipient_88';
  const senderId = 'usr_qa_sender_77';

  // ---------------------------------------------------------------------------
  // TEST 1: Verification of All 9 Notification Types
  // ---------------------------------------------------------------------------
  console.log('[1/9] Testing Ingestion & Typing for All 9 Required Notification Types');

  const typesToTest: { type: NotificationType; expectedCategory: NotificationCategory; title: string }[] = [
    { type: 'dm_message', expectedCategory: 'direct', title: 'New direct message from @elena_r' },
    { type: 'friend_request', expectedCategory: 'direct', title: 'Operative Network Request' },
    { type: 'friend_accept', expectedCategory: 'direct', title: 'Operative Connection Accepted' },
    { type: 'community_invite', expectedCategory: 'community', title: 'Invitation to NEXORA HQ' },
    { type: 'announcement', expectedCategory: 'community', title: 'Announcement in NEXORA HQ' },
    { type: 'mention', expectedCategory: 'mentions', title: '@elena_r mentioned you in #general-chat' },
    { type: 'call_voice', expectedCategory: 'calls', title: 'Incoming Secure Audio Link' },
    { type: 'call_video', expectedCategory: 'calls', title: 'Incoming Video Link' },
    { type: 'moderation_action', expectedCategory: 'system', title: 'Security & Safety Notice' },
  ];

  for (const item of typesToTest) {
    const notif = await notificationService.sendNotification({
      recipientId: `${recipientId}_${item.type}`,
      senderId,
      senderName: 'Elena Rostova',
      type: item.type,
      title: item.title,
      body: `Testing payload delivery for notification type: ${item.type}`,
      targetCommunityId: 'comm_hq',
      targetChannelId: 'chan_general',
      targetConversationId: 'dm_123',
    });

    assert(Boolean(notif), `Notification generated successfully for type: ${item.type}`);
    assert(notif?.type === item.type, `Notification accurately preserved type: ${item.type}`);
    assert(notif?.category === item.expectedCategory, `Category automatically routed to: ${item.expectedCategory}`);
    assert(notif?.isRead === false, `Initial read state is strictly false for ${item.type}`);
    assert(typeof notif?.createdAt === 'string', `ISO timestamp recorded on ${item.type}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Real-Time Listener Delivery & Feed Hydration
  // ---------------------------------------------------------------------------
  console.log('\n[2/9] Testing Real-Time Notification Stream & Feed Hydration');

  let receivedNotifications: NexoraNotification[] = [];
  const testStreamRecipient = 'usr_stream_test_01';

  const unsubListener = notificationService.listenToNotifications(
    testStreamRecipient,
    (notifications) => {
      receivedNotifications = notifications;
    }
  );

  const testNotif = await notificationService.sendNotification({
    recipientId: testStreamRecipient,
    senderId,
    senderName: 'Marcus Vance',
    type: 'dm_message',
    title: 'Mission Coordinates Received',
    body: 'Proceed to relay point delta immediately.',
  });

  assert(Boolean(testNotif), 'Stream test notification created');
  assert(
    receivedNotifications.some((n) => n.id === testNotif?.id),
    'Real-time listener callback triggered with new notification'
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Read and Unread State Transitions & Mark All Read
  // ---------------------------------------------------------------------------
  console.log('\n[3/9] Testing Read/Unread State Transitions & Batch Mark As Read');

  if (testNotif) {
    await notificationService.markAsRead(testStreamRecipient, testNotif.id);
    const target = receivedNotifications.find((n) => n.id === testNotif.id);
    assert(
      target?.isRead === true,
      'markAsRead correctly toggled isRead to true'
    );
  }

  // Create two unread items
  const notifA = await notificationService.sendNotification({
    recipientId: testStreamRecipient,
    senderId,
    senderName: 'Operative Alpha',
    type: 'mention',
    title: 'Ping A',
    body: 'Transmission Alpha',
  });
  const notifB = await notificationService.sendNotification({
    recipientId: testStreamRecipient,
    senderId,
    senderName: 'Operative Beta',
    type: 'announcement',
    title: 'Ping B',
    body: 'Transmission Beta',
  });

  await notificationService.markAllAsRead(testStreamRecipient);
  const allRead = receivedNotifications.every((n) => n.isRead === true);
  assert(allRead, 'markAllAsRead successfully transitions all notifications to isRead: true');

  // ---------------------------------------------------------------------------
  // TEST 4: Single Notification Deletion & Clear All
  // ---------------------------------------------------------------------------
  console.log('\n[4/9] Testing Single Notification Deletion & Clear All');

  if (notifA) {
    await notificationService.deleteNotification(testStreamRecipient, notifA.id);
    assert(
      !receivedNotifications.some((n) => n.id === notifA.id),
      'deleteNotification expunged item from notification feed'
    );
  }

  await notificationService.clearAllNotifications(testStreamRecipient);
  assert(
    receivedNotifications.length === 0,
    'clearAllNotifications cleared the entire notification feed'
  );

  // ---------------------------------------------------------------------------
  // TEST 5: Deduplication Engine (Burst Suppression)
  // ---------------------------------------------------------------------------
  console.log('\n[5/9] Testing Deduplication Engine & Rapid Burst Suppression');

  const dedupeRecipient = 'usr_dedupe_test';
  const payload = {
    recipientId: dedupeRecipient,
    senderId,
    senderName: 'Elena',
    type: 'dm_message' as NotificationType,
    title: 'Repeated Transmission',
    body: 'Identical transmission text for burst test',
  };

  const firstDispatch = await notificationService.sendNotification(payload);
  const duplicateDispatch = await notificationService.sendNotification(payload);

  assert(Boolean(firstDispatch), 'Initial notification passes deduplication check');
  assert(
    duplicateDispatch === null,
    'Duplicate identical notification safely dropped by deduplication cache'
  );

  // ---------------------------------------------------------------------------
  // TEST 6: User Preferences (Muting & Category Toggles)
  // ---------------------------------------------------------------------------
  console.log('\n[6/9] Testing User Preferences, Muting & Category Suppressions');

  const prefsUser = 'usr_prefs_tester';
  const defaultPrefs = notificationService.getPreferences(prefsUser);
  assert(defaultPrefs.soundEnabled === true, 'Default soundEnabled is true');
  assert(defaultPrefs.desktopEnabled === false, 'Default desktopEnabled is false (opt-in required)');

  // Test Community Muting
  const communityToMute = 'comm_noise_101';
  const isMutedNow = notificationService.toggleMuteCommunity(prefsUser, communityToMute);
  assert(isMutedNow === true, 'Community successfully muted');
  const updatedPrefs = notificationService.getPreferences(prefsUser);
  assert(
    Boolean(updatedPrefs.mutedCommunities[communityToMute]),
    'Muted community recorded in user preferences map'
  );

  // Test Unmuting Community
  const isUnmuted = notificationService.toggleMuteCommunity(prefsUser, communityToMute);
  assert(isUnmuted === false, 'Community successfully unmuted');

  // Test Conversation Muting
  const convToMute = 'dm_thread_999';
  const isConvMuted = notificationService.toggleMuteConversation(prefsUser, convToMute);
  assert(isConvMuted === true, 'Conversation successfully muted');

  // Test Category Preference Updates
  notificationService.savePreferences(prefsUser, {
    categories: {
      ...defaultPrefs.categories,
      mentions: false, // User muted mentions
    },
  });
  const modifiedPrefs = notificationService.getPreferences(prefsUser);
  assert(modifiedPrefs.categories.mentions === false, 'Category preference updated: mentions disabled');

  // ---------------------------------------------------------------------------
  // TEST 7: Desktop & Browser Notifications (Consent Guard)
  // ---------------------------------------------------------------------------
  console.log('\n[7/9] Testing Browser Notification Consent Guards');

  const permStatus = notificationService.getBrowserPermissionStatus();
  assert(
    typeof permStatus === 'string',
    `getBrowserPermissionStatus returned valid status string: "${permStatus}"`
  );

  assert(
    serviceSource.includes('requestBrowserPermission(): Promise') &&
      settingsModalSource.includes('requestDesktopNotificationPermission'),
    'Browser notification permission request requires explicit user action trigger'
  );

  // ---------------------------------------------------------------------------
  // TEST 8: Listener Cleanup & Memory Safety
  // ---------------------------------------------------------------------------
  console.log('\n[8/9] Testing Real-Time Listener Teardown & Cleanup');

  const cleanupUser = 'usr_cleanup_test';
  let cleanupCallCount = 0;
  const unsubCleanup = notificationService.listenToNotifications(cleanupUser, () => {
    cleanupCallCount++;
  });

  assert(cleanupCallCount >= 1, 'Listener initialized and triggered callback');
  unsubCleanup(); // Execute teardown

  // Verify NexoraContext unbinds on user change/logout
  assert(
    contextSource.includes('const unsubscribe = notificationService.listenToNotifications(currentUser.id') &&
      contextSource.includes('return () => {') &&
      contextSource.includes('unsubscribe();'),
    'NexoraContext cleans up notification listeners upon logout or user identity switch'
  );

  // ---------------------------------------------------------------------------
  // TEST 9: Firestore Security Rules & Access Isolation
  // ---------------------------------------------------------------------------
  console.log('\n[9/9] Testing Firestore Security Rules & Anti-Impersonation ACLs');

  assert(
    firestoreRules.includes('match /notifications/{notificationId}'),
    'Firestore Security Rules declare explicit match rule for /notifications/{notificationId}'
  );
  assert(
    firestoreRules.includes('allow read: if isSignedIn() && resource.data.recipientId == request.auth.uid;'),
    'Security rules strictly isolate read access: users can only read their own notifications'
  );
  assert(
    firestoreRules.includes('allow delete: if isSignedIn() && resource.data.recipientId == request.auth.uid;'),
    'Security rules strictly isolate delete access: users can only delete their own notifications'
  );
  assert(
    firestoreRules.includes('(request.resource.data.type != \'moderation_action\' || isPlatformModerator())'),
    'Security rules strictly block non-moderators from forging moderation_action notifications'
  );
  assert(
    firestoreRules.includes('match /users/{userId}/preferences/{docId}'),
    'Security rules protect user notification preferences subcollection'
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`📊 NOTIFICATION & ACTIVITY CENTER QA COMPLETED`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('======================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runNotificationSuite().catch((err) => {
  console.error('Fatal error running notification suite:', err);
  process.exit(1);
});
