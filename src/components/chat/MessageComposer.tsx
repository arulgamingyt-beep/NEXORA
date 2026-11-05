import React, { useState, useRef, useEffect } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Send,
  Paperclip,
  Smile,
  Image,
  Mic,
  X,
  Sparkles,
  Code,
  FileText,
  Volume2,
} from 'lucide-react';
import { Attachment } from '../../types';

interface MessageComposerProps {
  placeholder: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ placeholder }) => {
  const { sendMessage, replyingTo, setReplyingTo, currentUser, showToast } = useNexora();

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    sendMessage(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && replyingTo) {
      setReplyingTo(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB security ceiling

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File "${file.name}" exceeds security limit of 5 MB.`, 'warning');
        return;
      }

      const isImage = file.type.startsWith('image/');
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const newAtt: Attachment = {
            id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name: file.name,
            url: (uploadEvent.target?.result as string) || URL.createObjectURL(file),
            type: 'image',
            size: sizeStr,
          };
          setAttachments((prev) => [...prev, newAtt]);
          showToast(`Attached image "${file.name}"`, 'info');
        };
        reader.readAsDataURL(file);
      } else {
        const newAtt: Attachment = {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: file.name,
          url: URL.createObjectURL(file),
          type: 'file',
          size: sizeStr,
        };
        setAttachments((prev) => [...prev, newAtt]);
        showToast(`Attached file "${file.name}"`, 'info');
      }
    });

    // Reset input
    e.target.value = '';
  };

  // Emojis categories
  const emojiLibrary = [
    { cat: 'NEXORA', emojis: ['⚡', '💜', '🔮', '🚀', '✨', '🛡️', '👑', '🔥'] },
    { cat: 'SMILEYS', emojis: ['😀', '😂', '😎', '🥳', '🤔', '👀', '🙌', '💯'] },
    { cat: 'TECH & WORK', emojis: ['💻', '🤖', '📊', '🌐', '📡', '⚙️', '🎧', '🎮'] },
  ];

  // Curated Animated GIFs
  const gifLibrary = [
    { title: 'Celebrate', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZudXptZ25ldmd3aTR2aXB0czdtZHFnbHBoanlyeWpyNnJvOG50MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/artj92V8o75VPL7AeQ/giphy.gif' },
    { title: 'Cyber Hacker', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JpZm9id3dwaTZiNmZscDNuc3V3Njh2ZTRoaWZ1M3NpdWVwbHBoZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YQitE4YNQNahy/giphy.gif' },
    { title: 'GG Well Played', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzR2bTJ2dzdwZ2J6aXphcmE0eTNydXZ5NXoxNnRxOHlsazl5bjNlMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g9582DNuQppxC/giphy.gif' },
    { title: 'Synthwave Chill', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZpdWZobDF3N3ZydXZnbjFlcWh4Zmx0dWZ3cWZ1N2pqZmd2bXRsayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lI4bYmcsPJX9Go/giphy.gif' },
    { title: 'Mind Blown', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FwMHZocG9qZXZ0YWp6eHRxZXQzZzNkcTJqYmppd2dtanZhcWJucSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif' },
    { title: 'Cyber Vibe', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2J1a3VycTJuNXppNm4ycW1mNHc5NWlyc202NmpzZHRxNnJ6NDdtNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DhstvI3CHHTBQ/giphy.gif' },
  ];

  const handleAddSampleAttachment = (type: 'image' | 'code') => {
    if (type === 'image') {
      const newAtt: Attachment = {
        id: 'att_' + Date.now(),
        name: 'nexora_architecture_preview.png',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        size: '1.4 MB',
      };
      setAttachments((prev) => [...prev, newAtt]);
      showToast('Sample image attached to draft', 'info');
    } else {
      const newAtt: Attachment = {
        id: 'att_' + Date.now(),
        name: 'firestore_security_rules.ts',
        url: '#',
        type: 'file',
        size: '24 KB',
      };
      setAttachments((prev) => [...prev, newAtt]);
      showToast('Sample code file attached to draft', 'info');
    }
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 4) {
          handleStopAndSendVoice();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopAndSendVoice = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    sendMessage('🎙️ [Voice Audio Note - 0:04s] Sent high-definition audio clip');
    showToast('Voice note sent to channel', 'success');
  };

  const handleCancelVoice = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  return (
    <div className="p-4 pt-1 bg-[#0f1122] border-t border-[#1a1c2e] relative">
      {/* Replying To Banner */}
      {replyingTo && (
        <div className="bg-[#141628] px-3 py-1.5 rounded-t-xl border-x border-t border-violet-500/20 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="text-violet-400 font-bold">Replying to @{replyingTo.authorName}:</span>
            <span className="truncate italic text-slate-400 max-w-sm">
              "{replyingTo.content.slice(0, 80)}"
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="bg-[#121424] p-2.5 rounded-t-xl border-x border-t border-violet-500/20 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group bg-[#181a2e] rounded-lg p-1.5 border border-violet-500/30 flex items-center gap-2"
            >
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                <FileText className="w-6 h-6 text-violet-400 ml-1" />
              )}
              <div className="text-xs text-white max-w-[120px] truncate">
                <p className="truncate font-medium">{att.name}</p>
                <p className="text-[10px] text-slate-400">{att.size}</p>
              </div>
              <button
                onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                className="p-1 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div
        className={`bg-[#141628] rounded-2xl border border-violet-500/20 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-lg ${
          replyingTo || attachments.length > 0 ? 'rounded-t-none border-t-0' : ''
        }`}
      >
        {isRecordingVoice ? (
          <div className="p-3 flex items-center justify-between text-xs text-white animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold text-rose-400">Recording Voice Note... 0:0{recordingSeconds}s</span>
              <div className="flex items-center gap-1">
                {[12, 24, 16, 28, 14, 22, 30, 18].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-violet-400 rounded-full animate-bounce"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelVoice}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStopAndSendVoice}
                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-md"
              >
                Send Voice
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end p-2 gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.txt,.ts,.js,.json,.doc,.docx"
              className="hidden"
            />

            {/* Attachment Button */}
            <div className="relative group/att">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Media or File (or hover for samples)"
                className="p-2 text-violet-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Quick sample upload tooltip / helper */}
              <div className="absolute left-0 bottom-11 hidden group-hover/att:flex flex-col bg-[#181a2e] border border-violet-500/30 rounded-xl p-1.5 shadow-xl text-xs z-30 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-left text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                  Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleAttachment('image')}
                  className="px-2.5 py-1.5 text-left text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                >
                  <Image className="w-3.5 h-3.5 text-emerald-400" />
                  Sample Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleAttachment('code')}
                  className="px-2.5 py-1.5 text-left text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  Sample Source Code
                </button>
              </div>
            </div>

            {/* Multiline Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 resize-none max-h-44 focus:outline-none py-2 px-1 leading-relaxed"
            />

            {/* Quick Picker Buttons */}
            <div className="flex items-center gap-1 pb-0.5 text-slate-400">
              {/* Voice Note Simulator */}
              <button
                type="button"
                onClick={handleStartVoiceRecording}
                title="Record Voice Note"
                className="p-2 hover:bg-white/5 hover:text-violet-300 rounded-xl transition"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* GIF Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGifPicker((prev) => !prev);
                    setShowEmojiPicker(false);
                  }}
                  className={`px-2 py-1 text-xs font-bold rounded-lg border transition ${
                    showGifPicker
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'hover:bg-white/5 hover:text-white border-white/10'
                  }`}
                >
                  GIF
                </button>

                {/* GIF Picker Popover */}
                {showGifPicker && (
                  <div className="absolute right-0 bottom-12 w-72 bg-[#181a2e] border border-violet-500/30 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-violet-300">
                      <span>Trending GIFs</span>
                      <button onClick={() => setShowGifPicker(false)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {gifLibrary.map((g, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const gifAtt: Attachment = {
                              id: 'gif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                              name: `${g.title}.gif`,
                              url: g.url,
                              type: 'image',
                              size: 'GIF',
                            };
                            sendMessage('', [gifAtt]);
                            setShowGifPicker(false);
                          }}
                          className="cursor-pointer group relative rounded-lg overflow-hidden border border-violet-500/20 hover:border-violet-400 transition"
                        >
                          <img
                            src={g.url}
                            alt={g.title}
                            className="w-full h-20 object-cover group-hover:scale-110 transition-transform"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white">
                            {g.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker((prev) => !prev);
                    setShowGifPicker(false);
                  }}
                  title="Emoji & Reactions"
                  className={`p-2 rounded-xl transition ${
                    showEmojiPicker
                      ? 'text-violet-400 bg-white/5'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Emoji Library Popover */}
                {showEmojiPicker && (
                  <div className="absolute right-0 bottom-12 w-64 bg-[#181a2e] border border-violet-500/30 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-violet-300">
                      <span>Nexora Emoji Vault</span>
                      <button onClick={() => setShowEmojiPicker(false)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-3 max-h-56 overflow-y-auto pr-1">
                      {emojiLibrary.map((cat) => (
                        <div key={cat.cat} className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400">
                            {cat.cat}
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {cat.emojis.map((em) => (
                              <button
                                key={em}
                                onClick={() => {
                                  setText((prev) => prev + em);
                                  setShowEmojiPicker(false);
                                }}
                                className="w-10 h-10 text-xl flex items-center justify-center hover:bg-white/10 rounded-xl hover:scale-125 transition"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() && attachments.length === 0}
                title="Send Message (Enter)"
                className={`p-2 rounded-xl transition-all ${
                  text.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/40 hover:scale-105'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
