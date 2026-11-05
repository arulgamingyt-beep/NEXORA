/**
 * NEXORA CALL SIGNALING SERVICE
 * 
 * Provides robust real-time signaling over Cloud Firestore with automatic
 * BroadcastChannel and localStorage fallback for zero-cost, multi-tab testing.
 */

import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { CallSession, CallParticipant, CallType, CallScope } from '../types';
import { SignalingPacket } from '../utils/webrtcVoice';

export class CallSignalingService {
  private activeBroadcastChannels: Map<string, BroadcastChannel> = new Map();

  private getBroadcastChannel(name: string): BroadcastChannel | null {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!this.activeBroadcastChannels.has(name)) {
      try {
        const bc = new BroadcastChannel(name);
        this.activeBroadcastChannels.set(name, bc);
      } catch {
        return null;
      }
    }
    return this.activeBroadcastChannels.get(name) || null;
  }

  /**
   * Initiates a new 1:1, Group, or Channel Call
   */
  async initiateCall(params: {
    type: CallType;
    scope: CallScope;
    targetId: string;
    targetName?: string;
    callerId: string;
    callerName: string;
    callerAvatar: string;
    participantIds: string[];
  }): Promise<CallSession> {
    const callId = `call_${params.callerId}_${Date.now()}`;
    const newCall: CallSession = {
      id: callId,
      type: params.type,
      scope: params.scope,
      targetId: params.targetId,
      targetName: params.targetName,
      callerId: params.callerId,
      callerName: params.callerName,
      callerAvatar: params.callerAvatar,
      participantIds: params.participantIds,
      status: 'ringing',
      createdAt: new Date().toISOString(),
    };

    // 1. Write to Firestore
    try {
      await setDoc(doc(db, 'calls', callId), {
        ...newCall,
        serverCreatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[CallSignaling] Firestore call creation warning, using local signaling fallback:', err);
    }

    // 2. Broadcast via local channels for instant local peer testing
    const bc = this.getBroadcastChannel('nexora_global_calls');
    bc?.postMessage({ type: 'incoming_call', call: newCall });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nexora_active_call_signal', JSON.stringify({ type: 'incoming_call', call: newCall, ts: Date.now() }));
    }

    return newCall;
  }

  /**
   * Listens for incoming calls directed to the current operative
   */
  listenToIncomingCalls(
    userId: string,
    callback: (call: CallSession | null) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    try {
      const q = query(
        collection(db, 'calls'),
        where('participantIds', 'array-contains', userId),
        where('status', '==', 'ringing')
      );
      unsubFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as CallSession;
          // Only notify if user is NOT the caller
          if (docData.callerId !== userId) {
            callback(docData);
            return;
          }
        }
        callback(null);
      }, (err) => {
        console.warn('[CallSignaling] Incoming call listener notice:', err);
      });
    } catch (err) {
      console.warn('[CallSignaling] Firestore subscription skipped:', err);
    }

    // Local signaling channel listener
    const bc = this.getBroadcastChannel('nexora_global_calls');
    const handleBroadcast = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === 'incoming_call') {
        const call = data.call as CallSession;
        if (call.participantIds.includes(userId) && call.callerId !== userId && call.status === 'ringing') {
          callback(call);
        }
      } else if (data?.type === 'call_ended' || data?.type === 'call_declined') {
        callback(null);
      }
    };

    if (bc) {
      bc.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'nexora_active_call_signal' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.type === 'incoming_call') {
            const call = parsed.call as CallSession;
            if (call.participantIds.includes(userId) && call.callerId !== userId && call.status === 'ringing') {
              callback(call);
            }
          } else if (parsed.type === 'call_ended' || parsed.type === 'call_declined') {
            callback(null);
          }
        } catch {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      unsubFirestore?.();
      bc?.removeEventListener('message', handleBroadcast);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }

  /**
   * Listens to state updates on an active call session
   */
  listenToCallSession(
    callId: string,
    callback: (call: CallSession | null) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    try {
      unsubFirestore = onSnapshot(doc(db, 'calls', callId), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as CallSession);
        } else {
          callback(null);
        }
      }, () => {});
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_${callId}`);
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.call) {
        callback(event.data.call);
      }
    };
    bc?.addEventListener('message', handleBroadcast);

    return () => {
      unsubFirestore?.();
      bc?.removeEventListener('message', handleBroadcast);
    };
  }

  /**
   * Accepts an incoming call
   */
  async acceptCall(callId: string, userId: string): Promise<void> {
    const updates = {
      status: 'connected' as const,
      startedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'calls', callId), updates);
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_${callId}`);
    bc?.postMessage({ type: 'call_accepted', callId, userId, updates });

    const globalBc = this.getBroadcastChannel('nexora_global_calls');
    globalBc?.postMessage({ type: 'call_accepted', callId, userId });
  }

  /**
   * Declines an incoming call
   */
  async declineCall(callId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'declined',
        endedAt: new Date().toISOString(),
      });
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_${callId}`);
    bc?.postMessage({ type: 'call_declined', callId, userId });

    const globalBc = this.getBroadcastChannel('nexora_global_calls');
    globalBc?.postMessage({ type: 'call_declined', callId, userId });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nexora_active_call_signal', JSON.stringify({ type: 'call_declined', callId, ts: Date.now() }));
    }
  }

  /**
   * Ends an active call
   */
  async endCall(callId: string, durationSeconds: number = 0): Promise<void> {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'ended',
        endedAt: new Date().toISOString(),
        durationSeconds,
      });
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_${callId}`);
    bc?.postMessage({ type: 'call_ended', callId, durationSeconds });

    const globalBc = this.getBroadcastChannel('nexora_global_calls');
    globalBc?.postMessage({ type: 'call_ended', callId });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nexora_active_call_signal', JSON.stringify({ type: 'call_ended', callId, ts: Date.now() }));
    }
  }

  /**
   * Dispatches SDP Offer/Answer or ICE Candidate to call peers
   */
  async sendSignal(callId: string, signal: SignalingPacket): Promise<void> {
    // 1. Write to Firestore subcollection
    try {
      const signalId = `sig_${signal.fromUserId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'calls', callId, 'signaling', signalId), {
        ...signal,
        createdAt: new Date().toISOString(),
      });
    } catch {}

    // 2. Broadcast via local channel
    const bc = this.getBroadcastChannel(`nexora_call_signals_${callId}`);
    bc?.postMessage(signal);

    if (typeof window !== 'undefined') {
      const key = `nexora_call_sig_${callId}_${Date.now()}`;
      window.localStorage.setItem(key, JSON.stringify(signal));
      setTimeout(() => window.localStorage.removeItem(key), 1200);
    }
  }

  /**
   * Listens for SDP/ICE signals in the call
   */
  listenToSignals(
    callId: string,
    currentUserId: string,
    callback: (signal: SignalingPacket) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    try {
      const q = query(collection(db, 'calls', callId, 'signaling'));
      unsubFirestore = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as SignalingPacket;
            if (data.fromUserId !== currentUserId) {
              if (!data.targetUserId || data.targetUserId === currentUserId) {
                callback(data);
              }
            }
          }
        });
      }, () => {});
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_signals_${callId}`);
    const handleBroadcast = (event: MessageEvent) => {
      const signal = event.data as SignalingPacket;
      if (signal && signal.fromUserId !== currentUserId) {
        if (!signal.targetUserId || signal.targetUserId === currentUserId) {
          callback(signal);
        }
      }
    };
    bc?.addEventListener('message', handleBroadcast);

    const handleStorage = (event: StorageEvent) => {
      if (event.key?.startsWith(`nexora_call_sig_${callId}_`) && event.newValue) {
        try {
          const signal = JSON.parse(event.newValue) as SignalingPacket;
          if (signal && signal.fromUserId !== currentUserId) {
            if (!signal.targetUserId || signal.targetUserId === currentUserId) {
              callback(signal);
            }
          }
        } catch {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      unsubFirestore?.();
      bc?.removeEventListener('message', handleBroadcast);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }

  /**
   * Updates or registers participant telemetry (mute, camera, screen share)
   */
  async updateParticipant(callId: string, participant: CallParticipant): Promise<void> {
    try {
      await setDoc(doc(db, 'calls', callId, 'participants', participant.userId), {
        ...participant,
        joinedAt: participant.joinedAt || new Date().toISOString(),
      });
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_participants_${callId}`);
    bc?.postMessage({ type: 'participant_update', participant });
  }

  /**
   * Listens to active participants in the call
   */
  listenToParticipants(
    callId: string,
    callback: (participants: CallParticipant[]) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    try {
      unsubFirestore = onSnapshot(collection(db, 'calls', callId, 'participants'), (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as CallParticipant);
        callback(list);
      }, () => {});
    } catch {}

    const bc = this.getBroadcastChannel(`nexora_call_participants_${callId}`);
    const participantsMap = new Map<string, CallParticipant>();

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'participant_update') {
        const p = event.data.participant as CallParticipant;
        participantsMap.set(p.userId, p);
        callback(Array.from(participantsMap.values()));
      }
    };
    bc?.addEventListener('message', handleBroadcast);

    return () => {
      unsubFirestore?.();
      bc?.removeEventListener('message', handleBroadcast);
    };
  }
}

export const callSignalingService = new CallSignalingService();

