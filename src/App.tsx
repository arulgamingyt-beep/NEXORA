import React, { useEffect } from 'react';
import { NexoraProvider, useNexora } from './context/NexoraContext';
import { TopHubHeader } from './components/navigation/TopHubHeader';
import { CommunityRail } from './components/navigation/CommunityRail';
import { ChannelSidebar } from './components/sidebar/ChannelSidebar';
import { DirectMessagesSidebar } from './components/sidebar/DirectMessagesSidebar';
import { ChatArea } from './components/chat/ChatArea';
import { MemberList } from './components/members/MemberList';
import { UserProfileModal } from './components/members/UserProfileModal';
import { InviteModal } from './components/modals/InviteModal';
import { JoinInviteModal } from './components/modals/JoinInviteModal';
import { CreateCommunityModal } from './components/modals/CreateCommunityModal';
import { CreateChannelModal } from './components/modals/CreateChannelModal';
import { CommunitySettingsModal } from './components/modals/CommunitySettingsModal';
import { UserSettingsModal } from './components/modals/UserSettingsModal';
import { QuickSwitcherModal } from './components/modals/QuickSwitcherModal';
import { CreateGroupDMModal } from './components/modals/CreateGroupDMModal';
import { IncomingCallModal } from './components/modals/IncomingCallModal';
import { ActiveCallRoom } from './components/calling/ActiveCallRoom';
import { AuthScreen } from './components/auth/AuthScreen';
import { CyberBootLoader } from './components/auth/CyberBootLoader';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

const NexoraApp: React.FC = () => {
  const {
    activeCommunityId,
    activeModal,
    selectedUserForProfile,
    toast,
    openModal,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    isAuthenticated,
    isAuthLoading,
  } = useNexora();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  // Handle URL invitation parameter (?invite=CODE) on load
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('invite');
      if (inviteCode) {
        openModal('join_invite', { code: inviteCode.trim() });
        // Clean up URL without triggering navigation or refresh
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {}
      }
    }
  }, [isAuthenticated, openModal]);

  // Loading Screen while session persistence verifies credentials
  if (isAuthLoading) {
    return <CyberBootLoader />;
  }

  // Gateway Access Screen if unauthenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070810] text-slate-100 select-none">
      {/* 1. Slim NEXORA Command Deck (40px) */}
      <TopHubHeader />

      {/* 2. Main 4-Column Discord App Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Column 1: Discord Community Server Rail (72px) */}
        <CommunityRail />

        {/* Column 2: Channel Sidebar or Direct Messages Sidebar (240px) */}
        <div
          className={`${
            isMobileSidebarOpen
              ? 'fixed inset-y-0 left-[72px] z-40 flex shadow-2xl'
              : 'hidden md:flex'
          } shrink-0`}
        >
          {activeCommunityId ? <ChannelSidebar /> : <DirectMessagesSidebar />}
        </div>

        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={toggleMobileSidebar}
            className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm"
          />
        )}

        {/* Column 3: Central Transmission Stream / Chat Area (Flex-1) */}
        <ChatArea />

        {/* Column 4: Operatives Deck / Member List (240px) */}
        <MemberList />
      </div>

      {/* Interactive Modals */}
      {selectedUserForProfile && <UserProfileModal />}
      {activeModal === 'invite' && <InviteModal />}
      {activeModal === 'join_invite' && <JoinInviteModal />}
      {activeModal === 'create_community' && <CreateCommunityModal />}
      {activeModal === 'create_channel' && <CreateChannelModal />}
      {activeModal === 'community_settings' && <CommunitySettingsModal />}
      {activeModal === 'user_settings' && <UserSettingsModal />}
      {activeModal === 'search' && <QuickSwitcherModal />}
      {activeModal === 'create_group_dm' && <CreateGroupDMModal />}

      {/* Real-Time Communications HUD */}
      <IncomingCallModal />
      <ActiveCallRoom />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#141628] border border-violet-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-violet-400 shrink-0" />
          )}
          <span className="text-xs font-semibold font-mono">{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <NexoraProvider>
        <NexoraApp />
      </NexoraProvider>
    </ErrorBoundary>
  );
}
