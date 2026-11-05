/**
 * NEXORA WEBRTC REAL-TIME VOICE, VIDEO & MEDIA MESH ENGINE
 * 
 * Implements complete peer-to-peer real-time communication:
 * - Audio & Video MediaStream management (Microphone, Camera, Screen Sharing)
 * - Free-tier public Google STUN servers (₹0 / $0 Cost)
 * - Dual-layer signaling (Cloud Firestore + BroadcastChannel + localStorage)
 * - Web Audio API AnalyserNode for real-time speech amplitude & green ring detection
 * - Web Audio synthesized ringtones (Incoming & Outgoing, zero external asset dependency)
 * - Automatic track replacement (Screen share <-> Camera)
 * - Hardware mute/camera/deafen track controls
 */

import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

export interface VoicePeerUser {
  userId: string;
  displayName: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
}

export interface SignalingPacket {
  type: 'offer' | 'answer' | 'ice-candidate' | 'peer-join' | 'peer-leave' | 'peer-state';
  channelId: string;
  fromUserId: string;
  targetUserId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  userProfile?: VoicePeerUser;
}

export const GOOGLE_STUN_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCVoiceEngine {
  private channelId: string | null = null;
  private currentUserId: string | null = null;
  private userProfile: VoicePeerUser | null = null;

  public localStream: MediaStream | null = null;
  public localScreenStream: MediaStream | null = null;
  public remoteStreams: Map<string, MediaStream> = new Map();

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private ringtoneInterval: any = null;

  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private activeUsers: Map<string, VoicePeerUser> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private firestoreUnsub: (() => void) | null = null;

  public isMuted: boolean = false;
  public isDeafened: boolean = false;
  public isSpeaking: boolean = false;
  public isCameraOn: boolean = false;
  public isScreenSharing: boolean = false;

  private onUsersChanged?: (users: VoicePeerUser[]) => void;
  private onSpeakingChanged?: (isSpeaking: boolean) => void;
  private onConnectionStateChanged?: (state: string) => void;
  private onRemoteStreamChanged?: (userId: string, stream: MediaStream | null) => void;
  private onLocalStreamChanged?: (stream: MediaStream | null) => void;

  /**
   * Initializes engine callbacks
   */
  public init(callbacks: {
    onUsersChanged?: (users: VoicePeerUser[]) => void;
    onSpeakingChanged?: (isSpeaking: boolean) => void;
    onConnectionStateChanged?: (state: string) => void;
    onRemoteStreamChanged?: (userId: string, stream: MediaStream | null) => void;
    onLocalStreamChanged?: (stream: MediaStream | null) => void;
  }) {
    this.onUsersChanged = callbacks.onUsersChanged;
    this.onSpeakingChanged = callbacks.onSpeakingChanged;
    this.onConnectionStateChanged = callbacks.onConnectionStateChanged;
    this.onRemoteStreamChanged = callbacks.onRemoteStreamChanged;
    this.onLocalStreamChanged = callbacks.onLocalStreamChanged;
  }

  /**
   * Captures microphone audio stream or creates a safe synthesized audio fallback
   */
  public async getLocalAudioStream(): Promise<MediaStream> {
    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      return this.localStream;
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (this.localStream) {
          stream.getAudioTracks().forEach((track) => this.localStream!.addTrack(track));
        } else {
          this.localStream = stream;
        }

        this.setupSpeechDetector(this.localStream);
        this.onLocalStreamChanged?.(this.localStream);
        return this.localStream;
      } catch (err) {
        console.warn('[WebRTC] Microphone access denied or absent. Initializing safe synthesized fallback:', err);
      }
    }

    // Synthesized Audio Oscillator fallback (prevents connection crashes)
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const osc = this.audioContext.createOscillator();
        const dst = this.audioContext.createMediaStreamDestination();
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.0001; // Silent baseline
        osc.connect(gain);
        gain.connect(dst);
        osc.start();

        if (this.localStream) {
          dst.stream.getAudioTracks().forEach((t) => this.localStream!.addTrack(t));
        } else {
          this.localStream = dst.stream;
        }
        this.onLocalStreamChanged?.(this.localStream);
        return this.localStream;
      } catch (e) {
        console.warn('[WebRTC] AudioContext fallback initialization:', e);
      }
    }

    if (!this.localStream) {
      this.localStream = new MediaStream();
    }
    this.onLocalStreamChanged?.(this.localStream);
    return this.localStream;
  }

  /**
   * Captures or toggles local camera video stream
   */
  public async startVideo(): Promise<MediaStream> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        const newVideoTrack = videoStream.getVideoTracks()[0];
        if (newVideoTrack) {
          // Remove old video track if exists
          if (this.localStream) {
            this.localStream.getVideoTracks().forEach((t) => {
              t.stop();
              this.localStream!.removeTrack(t);
            });
            this.localStream.addTrack(newVideoTrack);
          } else {
            this.localStream = videoStream;
          }

          this.isCameraOn = true;
          this.replaceTrackOnPeers('video', newVideoTrack);
          this.onLocalStreamChanged?.(this.localStream);
          this.broadcastState();
          return this.localStream;
        }
      } catch (err) {
        console.warn('[WebRTC] Camera access denied or not present:', err);
      }
    }

    // Fallback minimal video track (transparent canvas stream)
    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#101222';
          ctx.fillRect(0, 0, 640, 480);
        }
        const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(10) : new MediaStream();
        const canvasTrack = canvasStream.getVideoTracks()[0];
        if (canvasTrack) {
          if (this.localStream) {
            this.localStream.addTrack(canvasTrack);
          } else {
            this.localStream = canvasStream;
          }
          this.isCameraOn = true;
          this.replaceTrackOnPeers('video', canvasTrack);
        }
      } catch {}
    }

    if (this.localStream && this.localStream.getVideoTracks().length > 0) {
      this.isCameraOn = true;
    }

    this.onLocalStreamChanged?.(this.localStream);
    this.broadcastState();
    return this.localStream || new MediaStream();
  }

  /**
   * Toggles camera on/off
   */
  public async toggleCamera(forceState?: boolean): Promise<boolean> {
    const nextState = forceState !== undefined ? forceState : !this.isCameraOn;

    if (nextState) {
      await this.startVideo();
    } else {
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          this.localStream!.removeTrack(track);
        });
      }
      this.isCameraOn = false;
      this.broadcastState();
      this.onLocalStreamChanged?.(this.localStream);
    }

    return this.isCameraOn;
  }

  /**
   * Starts screen sharing via getDisplayMedia
   */
  public async startScreenShare(): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      console.warn('[WebRTC] Screen sharing not supported in this environment.');
      return null;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) return null;

      this.localScreenStream = screenStream;
      this.isScreenSharing = true;

      // Replace video track on all peer senders
      this.replaceTrackOnPeers('video', screenTrack);

      // Restore camera when user clicks browser native "Stop Sharing" button
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      this.broadcastState();
      return screenStream;
    } catch (err) {
      console.warn('[WebRTC] Screen sharing permission cancelled or denied:', err);
      return null;
    }
  }

  /**
   * Stops screen sharing and restores camera video if camera was active
   */
  public async stopScreenShare(): Promise<void> {
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop());
      this.localScreenStream = null;
    }

    this.isScreenSharing = false;

    // Restore camera if camera is supposed to be on
    if (this.isCameraOn) {
      await this.startVideo();
    } else if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        this.replaceTrackOnPeers('video', videoTrack);
      }
    }

    this.broadcastState();
  }

  /**
   * Replaces an active track across all peer connections seamlessly
   */
  public replaceTrackOnPeers(kind: 'audio' | 'video', newTrack: MediaStreamTrack) {
    this.peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === kind);
      if (sender) {
        sender.replaceTrack(newTrack).catch((err) => {
          console.warn(`[WebRTC] replaceTrack (${kind}) error:`, err);
        });
      } else {
        pc.addTrack(newTrack, this.localStream || new MediaStream());
      }
    });
  }

  /**
   * Speech amplitude detector that drives real isSpeaking detection
   */
  private setupSpeechDetector(stream: MediaStream) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || this.isMuted) {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            this.onSpeakingChanged?.(false);
          }
          this.animFrameId = requestAnimationFrame(checkVolume);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const nowSpeaking = average > 18; // Speaking threshold

        if (nowSpeaking !== this.isSpeaking) {
          this.isSpeaking = nowSpeaking;
          this.onSpeakingChanged?.(nowSpeaking);
          this.broadcastState();
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('[WebRTC] Voice level detector setup:', err);
    }
  }

  /**
   * Joins a voice/video channel and broadcasts discovery packet
   */
  public async joinChannel(
    channelId: string,
    user: { id: string; displayName: string; avatar: string },
    options: { video?: boolean } = {}
  ): Promise<boolean> {
    this.channelId = channelId;
    this.currentUserId = user.id;
    this.userProfile = {
      userId: user.id,
      displayName: user.displayName,
      avatar: user.avatar,
      isSpeaking: false,
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      isCameraOn: this.isCameraOn,
      isScreenSharing: this.isScreenSharing,
    };

    this.activeUsers.set(user.id, this.userProfile);
    this.notifyUsersChanged();

    // Prepare audio stream
    await this.getLocalAudioStream();

    // If video requested, prepare video stream
    if (options.video) {
      await this.startVideo();
    }

    this.setupSignaling();

    // Broadcast join announcement
    this.sendSignalingPacket({
      type: 'peer-join',
      channelId,
      fromUserId: user.id,
      userProfile: this.userProfile,
    });

    this.onConnectionStateChanged?.('connected');
    return true;
  }

  /**
   * Sets up dual signaling pipeline:
   * 1. Cloud Firestore realtime signaling documents for physical multi-device cross-network calling
   * 2. BroadcastChannel + localStorage for local instant multi-tab simulation
   */
  private setupSignaling() {
    // Layer 1: Local Tab-to-Tab loopback
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(`nexora_voice_${this.channelId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleSignalingPacket(event.data);
        };
      } catch (err) {
        console.warn('[WebRTC] BroadcastChannel warning:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith('nexora_voice_signal_') && event.newValue) {
          try {
            const packet = JSON.parse(event.newValue);
            this.handleSignalingPacket(packet);
          } catch {}
        }
      });
    }

    // Layer 2: Cloud Firestore Real-time Signaling for physical devices across the internet
    try {
      if (db && this.channelId) {
        const cleanCallId = this.channelId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
        const signalsRef = collection(db, 'calls', cleanCallId, 'signaling');
        this.firestoreUnsub = onSnapshot(signalsRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data() as SignalingPacket;
              if (data && data.fromUserId !== this.currentUserId) {
                this.handleSignalingPacket(data);
                // Ephemeral signal cleanup
                deleteDoc(change.doc.ref).catch(() => {});
              }
            }
          });
        }, (err) => {
          console.debug('[WebRTC] Firestore signaling standby:', err?.message);
        });
      }
    } catch (err) {
      console.debug('[WebRTC] Firestore signaling init notice:', err);
    }
  }

  /**
   * Transmits signaling packet to peers across network and local tabs
   */
  public sendSignalingPacket(packet: SignalingPacket) {
    // 1. Broadcast locally for multi-tab testing
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch {}
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const signalKey = `nexora_voice_signal_${this.channelId}_${Date.now()}`;
        window.localStorage.setItem(signalKey, JSON.stringify(packet));
        setTimeout(() => window.localStorage.removeItem(signalKey), 1500);
      } catch {}
    }

    // 2. Transmit to Cloud Firestore for physical cross-device delivery
    try {
      if (db && this.channelId) {
        const cleanCallId = this.channelId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
        const signalsRef = collection(db, 'calls', cleanCallId, 'signaling');
        addDoc(signalsRef, {
          ...packet,
          createdAt: Date.now(),
        }).catch(() => {});
      }
    } catch {}
  }

  /**
   * Processes incoming signaling packet from another peer
   */
  public async handleSignalingPacket(packet: SignalingPacket) {
    if (!this.channelId || packet.channelId !== this.channelId) return;
    if (packet.fromUserId === this.currentUserId) return;

    switch (packet.type) {
      case 'peer-join': {
        if (packet.userProfile) {
          this.activeUsers.set(packet.fromUserId, packet.userProfile);
          this.notifyUsersChanged();

          this.sendSignalingPacket({
            type: 'peer-state',
            channelId: this.channelId,
            fromUserId: this.currentUserId!,
            targetUserId: packet.fromUserId,
            userProfile: this.userProfile!,
          });

          // Lexically higher ID initiates Offer
          if (this.currentUserId! > packet.fromUserId) {
            await this.initiatePeerConnection(packet.fromUserId);
          }
        }
        break;
      }

      case 'peer-state': {
        if (packet.userProfile && (!packet.targetUserId || packet.targetUserId === this.currentUserId)) {
          this.activeUsers.set(packet.fromUserId, packet.userProfile);
          this.notifyUsersChanged();
        }
        break;
      }

      case 'peer-leave': {
        this.activeUsers.delete(packet.fromUserId);
        const pc = this.peerConnections.get(packet.fromUserId);
        if (pc) {
          pc.close();
          this.peerConnections.delete(packet.fromUserId);
        }
        this.remoteStreams.delete(packet.fromUserId);
        this.onRemoteStreamChanged?.(packet.fromUserId, null);
        this.notifyUsersChanged();
        break;
      }

      case 'offer': {
        if (packet.targetUserId === this.currentUserId && packet.sdp) {
          await this.handleOffer(packet.fromUserId, packet.sdp);
        }
        break;
      }

      case 'answer': {
        if (packet.targetUserId === this.currentUserId && packet.sdp) {
          await this.handleAnswer(packet.fromUserId, packet.sdp);
        }
        break;
      }

      case 'ice-candidate': {
        if (packet.targetUserId === this.currentUserId && packet.candidate) {
          await this.handleIceCandidate(packet.fromUserId, packet.candidate);
        }
        break;
      }
    }
  }

  /**
   * Creates an RTCPeerConnection with Google STUN configuration
   */
  public createPeerConnection(targetUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(GOOGLE_STUN_CONFIG);

    // Attach local stream tracks (Audio and Video)
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingPacket({
          type: 'ice-candidate',
          channelId: this.channelId!,
          fromUserId: this.currentUserId!,
          targetUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Remote audio & video track handler
    pc.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);
      this.remoteStreams.set(targetUserId, stream);
      this.onRemoteStreamChanged?.(targetUserId, stream);

      // Play audio automatically if not video element
      if (typeof document !== 'undefined' && event.track.kind === 'audio') {
        let remoteAudio = document.getElementById(`audio_peer_${targetUserId}`) as HTMLAudioElement;
        if (!remoteAudio) {
          remoteAudio = document.createElement('audio');
          remoteAudio.id = `audio_peer_${targetUserId}`;
          remoteAudio.autoplay = true;
          document.body.appendChild(remoteAudio);
        }
        remoteAudio.srcObject = stream;
        remoteAudio.muted = this.isDeafened;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peerConnections.delete(targetUserId);
        this.remoteStreams.delete(targetUserId);
        this.onRemoteStreamChanged?.(targetUserId, null);
      }
    };

    this.peerConnections.set(targetUserId, pc);
    return pc;
  }

  /**
   * Initiates WebRTC SDP Offer
   */
  private async initiatePeerConnection(targetUserId: string) {
    try {
      const pc = this.createPeerConnection(targetUserId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      this.sendSignalingPacket({
        type: 'offer',
        channelId: this.channelId!,
        fromUserId: this.currentUserId!,
        targetUserId,
        sdp: offer,
      });
    } catch (err) {
      console.warn('[WebRTC] initiatePeerConnection error:', err);
    }
  }

  private async handleOffer(fromUserId: string, offer: RTCSessionDescriptionInit) {
    try {
      const pc = this.createPeerConnection(fromUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendSignalingPacket({
        type: 'answer',
        channelId: this.channelId!,
        fromUserId: this.currentUserId!,
        targetUserId: fromUserId,
        sdp: answer,
      });
    } catch (err) {
      console.warn('[WebRTC] handleOffer error:', err);
    }
  }

  private async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
    try {
      const pc = this.peerConnections.get(fromUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn('[WebRTC] handleAnswer error:', err);
    }
  }

  private async handleIceCandidate(fromUserId: string, candidate: RTCIceCandidateInit) {
    try {
      const pc = this.peerConnections.get(fromUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn('[WebRTC] handleIceCandidate error:', err);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (this.userProfile) {
      this.userProfile.isMuted = muted;
    }
    this.broadcastState();
  }

  public setDeafen(deafened: boolean) {
    this.isDeafened = deafened;
    if (deafened) {
      this.setMute(true);
    }
    if (typeof document !== 'undefined') {
      const audios = document.querySelectorAll('audio[id^="audio_peer_"]');
      audios.forEach((audio) => {
        (audio as HTMLAudioElement).muted = deafened;
      });
    }
    if (this.userProfile) {
      this.userProfile.isDeafened = deafened;
    }
    this.broadcastState();
  }

  /**
   * Broadcasts operative state updates (mute, deafen, speaking, camera, screen share)
   */
  public broadcastState() {
    if (!this.channelId || !this.userProfile) return;
    this.userProfile.isSpeaking = this.isSpeaking;
    this.userProfile.isMuted = this.isMuted;
    this.userProfile.isDeafened = this.isDeafened;
    this.userProfile.isCameraOn = this.isCameraOn;
    this.userProfile.isScreenSharing = this.isScreenSharing;

    this.activeUsers.set(this.userProfile.userId, { ...this.userProfile });
    this.notifyUsersChanged();

    this.sendSignalingPacket({
      type: 'peer-state',
      channelId: this.channelId,
      fromUserId: this.currentUserId!,
      userProfile: this.userProfile,
    });
  }

  private notifyUsersChanged() {
    this.onUsersChanged?.(Array.from(this.activeUsers.values()));
  }

  /**
   * Web Audio API synthesized Ringtone Generator (Zero external audio asset cost)
   */
  public startRingtone(type: 'incoming' | 'outgoing' = 'incoming') {
    this.stopRingtone();
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = () => {
        if (ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'incoming') {
          // Cyberpunk dual-tone chime (440Hz & 554Hz)
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554, ctx.currentTime + 0.15);
        } else {
          // Outgoing pulse tone (425Hz)
          osc.frequency.setValueAtTime(425, ctx.currentTime);
        }

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      };

      playTone();
      this.ringtoneInterval = setInterval(playTone, type === 'incoming' ? 2200 : 3000);
    } catch {}
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  /**
   * Enumerates audio and video devices available on the system
   */
  public async enumerateDevices(): Promise<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter((d) => d.kind === 'audioinput'),
        videoInputs: devices.filter((d) => d.kind === 'videoinput'),
        audioOutputs: devices.filter((d) => d.kind === 'audiooutput'),
      };
    } catch {
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }

  /**
   * Leaves channel and cleans up all audio/video tracks and peer connections
   */
  public leaveChannel() {
    this.stopRingtone();

    if (this.channelId && this.currentUserId) {
      this.sendSignalingPacket({
        type: 'peer-leave',
        channelId: this.channelId,
        fromUserId: this.currentUserId,
      });
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop());
      this.localScreenStream = null;
    }

    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.activeUsers.clear();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }

    if (typeof document !== 'undefined') {
      const audios = document.querySelectorAll('audio[id^="audio_peer_"]');
      audios.forEach((a) => a.remove());
    }

    this.channelId = null;
    this.currentUserId = null;
    this.userProfile = null;
    this.isCameraOn = false;
    this.isScreenSharing = false;
    this.onConnectionStateChanged?.('disconnected');
    this.notifyUsersChanged();
    this.onLocalStreamChanged?.(null);
  }
}

export const webrtcVoiceService = new WebRTCVoiceEngine();
