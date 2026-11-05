import React, { useState } from 'react';
import { Message, UserRole } from '../../types';
import { useNexora } from '../../context/NexoraContext';
import {
  Smile,
  Reply,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Crown,
  Shield,
  Zap,
  Terminal,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const {
    currentUser,
    toggleReaction,
    setReplyingTo,
    setEditingMessageId,
    editingMessageId,
    editMessage,
    deleteMessage,
    togglePinMessage,
    getCurrentUserRoleInActiveCommunity,
    setSelectedUserForProfile,
    allUsers,
    showToast,
  } = useNexora();

  const [editContent, setEditContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isAuthor = message.authorId === currentUser.id;
  const currentRole = getCurrentUserRoleInActiveCommunity();
  const canModerate = isAuthor || currentRole === 'owner' || currentRole === 'admin';
  const isEditing = editingMessageId === message.id;

  // Smart GIF & Image Embed Detector
  const gifTagMatch = message.content.match(/\[GIF:\s*(.*?)\]\s*(https?:\/\/[^\s]+)/i);
  const directImageMatch =
    !gifTagMatch &&
    message.content.match(
      /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*)?|https?:\/\/images\.unsplash\.com\/[^\s]+|https?:\/\/media\.giphy\.com\/[^\s]+)/i
    );

  const embedImageUrl = gifTagMatch
    ? gifTagMatch[2]
    : directImageMatch
    ? directImageMatch[0]
    : null;
  const embedTitle = gifTagMatch ? gifTagMatch[1] : null;

  // Clean the text displayed so it doesn't show raw "[GIF: ...]" code
  const textToDisplay = gifTagMatch
    ? message.content.replace(gifTagMatch[0], '').trim()
    : directImageMatch && message.content.trim() === directImageMatch[0]
    ? ''
    : message.content;

  const quickEmojis = ['💜', '🔥', '🚀', '⚡', '❤️', '👀'];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold tracking-wider">
            <Crown className="w-2.5 h-2.5 text-amber-400" />
            ARCHITECT
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded text-[10px] font-mono font-bold tracking-wider">
            <Shield className="w-2.5 h-2.5 text-violet-400" />
            LEAD
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-mono font-bold tracking-wider">
            <Zap className="w-2.5 h-2.5 text-cyan-400" />
            OVERSEER
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-slate-400 opacity-70">
            OPERATIVE
          </span>
        );
    }
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(message.content);
    showToast('Transmission text copied to clipboard', 'info');
  };

  const handleSaveEdit = () => {
    editMessage(message.id, editContent);
  };

  const renderFormattedContent = (text: string) => {
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isCodeLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = isCodeLang ? firstLine : '';
          const codeContent = isCodeLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={index}
              className="my-2 bg-[#090b14] rounded-2xl border border-violet-500/25 overflow-hidden font-mono text-xs shadow-inner"
            >
              <div className="bg-[#121424] px-3.5 py-1 text-[10px] text-violet-300 font-bold flex justify-between items-center border-b border-violet-500/15">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-violet-400" />
                  {lang ? lang.toUpperCase() : 'CODE BLOCK'}
                </span>
                <span className="text-[9px] text-slate-400">NEXORA FREQUENCY PROTOCOL</span>
              </div>
              <pre className="p-3 text-slate-200 overflow-x-auto whitespace-pre font-mono">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }
        return <span key={index}>{renderInlineFormatted(part)}</span>;
      });
    }

    return renderInlineFormatted(text);
  };

  const renderInlineFormatted = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, lineIndex) => {
      const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
      const parts = line.split(mentionRegex);

      return (
        <React.Fragment key={lineIndex}>
          {parts.map((segment, partIdx) => {
            if (segment.startsWith('@')) {
              return (
                <span
                  key={partIdx}
                  className="bg-violet-600/30 text-violet-200 font-semibold px-1.5 py-0.5 rounded border border-violet-500/30 cursor-pointer hover:bg-violet-600/50"
                >
                  {segment}
                </span>
              );
            }

            const boldParts = segment.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                return (
                  <strong key={bIdx} className="font-bold text-white">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }

              const codeParts = bPart.split(/(`.*?`)/g);
              return codeParts.map((cPart, cIdx) => {
                if (cPart.startsWith('`') && cPart.endsWith('`')) {
                  return (
                    <code
                      key={cIdx}
                      className="bg-[#0b0c16] text-purple-300 font-mono text-[12px] px-1.5 py-0.5 rounded border border-purple-500/20"
                    >
                      {cPart.slice(1, -1)}
                    </code>
                  );
                }
                return cPart;
              });
            });
          })}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowEmojiPicker(false);
      }}
      className={`relative group px-4 py-2.5 hover:bg-white/[0.03] transition-colors rounded-2xl ${
        message.pinned ? 'bg-violet-950/20 border-l-2 border-violet-400' : ''
      }`}
    >
      {/* Floating Action HUD on hover */}
      {isHovered && !isEditing && (
        <div className="absolute right-4 -top-3.5 bg-[#16182e] border border-violet-500/30 rounded-xl shadow-2xl flex items-center p-0.5 z-20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center px-1 border-r border-white/10 gap-0.5">
            {quickEmojis.slice(0, 3).map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(message.id, emoji)}
                className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5"
                title="Add Reaction"
              >
                <Smile className="w-4 h-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute right-0 top-8 bg-[#181a2e] border border-violet-500/30 rounded-xl p-2 shadow-2xl z-50 flex gap-1.5">
                  {quickEmojis.map((em) => (
                    <button
                      key={em}
                      onClick={() => {
                        toggleReaction(message.id, em);
                        setShowEmojiPicker(false);
                      }}
                      className="w-7 h-7 text-base hover:scale-125 transition flex items-center justify-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center px-1 gap-0.5 text-slate-400">
            <button
              onClick={() => setReplyingTo(message)}
              title="Quote & Reply"
              className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>

            {canModerate && (
              <button
                onClick={() => togglePinMessage(message.id)}
                title={message.pinned ? 'Unpin Transmission' : 'Pin to Frequency'}
                className={`p-1.5 hover:bg-white/5 rounded-lg transition ${
                  message.pinned ? 'text-amber-400' : 'hover:text-white'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setEditingMessageId(message.id);
                }}
                title="Edit Transmission"
                className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCopyText}
              title="Copy Transmission"
              className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {canModerate && (
              <button
                onClick={() => deleteMessage(message.id)}
                title="Purge Transmission"
                className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quoted Frequency Reply */}
      {message.replyTo && (
        <div className="flex items-center gap-2 mb-1.5 ml-11 text-xs text-slate-400">
          <div className="w-6 h-3 border-l-2 border-t-2 border-violet-500/40 rounded-tl -mt-1.5" />
          <span className="font-semibold text-violet-300">
            @{message.replyTo.authorName}
          </span>
          <span className="truncate max-w-md text-slate-400 italic font-mono text-[11px]">
            "{message.replyTo.content}"
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Hexagonal Operative Avatar Frame */}
        <button
          onClick={() => {
            const author = allUsers[message.authorId];
            if (author) setSelectedUserForProfile(author);
          }}
          className="shrink-0 relative focus:outline-none group/avatar"
        >
          <div className="w-9 h-9 hex-clip bg-gradient-to-tr from-violet-600 to-purple-600 p-0.5 shadow-md shadow-violet-600/30 group-hover/avatar:scale-105 transition-transform">
            <img
              src={message.authorAvatar}
              alt={message.authorName}
              className="w-full h-full object-cover hex-clip"
            />
          </div>
        </button>

        {/* Message Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const author = allUsers[message.authorId];
                if (author) setSelectedUserForProfile(author);
              }}
              className="font-bold text-xs text-white hover:underline focus:outline-none"
            >
              {message.authorName}
            </button>

            {getRoleBadge(message.authorRole)}

            <span className="text-[10px] text-slate-400 font-mono">
              {message.timestamp}
            </span>

            {message.pinned && (
              <span className="flex items-center gap-1 text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono border border-amber-500/20">
                <Pin className="w-2.5 h-2.5" />
                PINNED
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[#0a0b16] border border-violet-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                rows={3}
                autoFocus
              />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">
                  esc to <button onClick={() => setEditingMessageId(null)} className="text-violet-400 underline">cancel</button> • enter to
                </span>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg shadow text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {textToDisplay && (
                <div className="text-xs text-slate-200 mt-1 leading-relaxed break-words">
                  {renderFormattedContent(textToDisplay)}
                  {message.editedAt && (
                    <span className="text-[9px] text-slate-500 ml-1.5 italic font-mono">
                      (edited)
                    </span>
                  )}
                </div>
              )}

              {/* Rich GIF / Image Embed Preview */}
              {embedImageUrl && (
                <div className="mt-2 inline-block rounded-2xl overflow-hidden border border-violet-500/25 bg-[#080914] shadow-lg max-w-sm group/embed">
                  <div className="relative">
                    <img
                      src={embedImageUrl}
                      alt={embedTitle || 'GIF'}
                      className="max-h-64 w-auto object-cover rounded-2xl"
                      loading="lazy"
                    />
                    {embedTitle && (
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-white/90 border border-white/10">
                        GIF • {embedTitle}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative max-w-sm rounded-xl overflow-hidden border border-violet-500/20 bg-[#0a0b16]"
                >
                  {att.type === 'image' ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="max-h-56 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="p-2.5 flex items-center gap-2.5">
                      <div className="p-1.5 bg-violet-600/20 rounded-lg text-violet-400">
                        📄
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{att.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{att.size || 'File'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.reactions.map((reaction) => {
                const hasReacted = reaction.users.includes(currentUser.id);
                return (
                  <button
                    key={reaction.emoji}
                    onClick={() => toggleReaction(message.id, reaction.emoji)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold transition border ${
                      hasReacted
                        ? 'bg-violet-600/30 border-violet-400 text-violet-200 shadow-sm'
                        : 'bg-[#15172b]/80 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="font-mono text-[10px]">{reaction.count}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="px-2 py-0.5 rounded-lg text-xs bg-[#15172b]/40 border border-dashed border-white/10 text-slate-400 hover:text-white transition font-mono"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
