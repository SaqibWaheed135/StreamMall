import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Search, Trash2, Image, Play, X, Mic, Users, Plus, UserPlus, Settings, Crown, Shield, UserMinus, Check, Globe, Lock, Copy, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import LanguageSwitcher from './LanguageSwitcher';

// Group List Component
const GroupList = ({ groups, selectedGroup, onSelectGroup, onCreateGroup, onJoinGroup, searchQuery, setSearchQuery }) => {
  const { t } = useTranslation();
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#ff99b3] bg-[#FFC0CB]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {t('messaging.groups')}
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={onJoinGroup} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors" title={t('messaging.joinGroup')}>
              <UserPlus className="w-5 h-5" />
            </button>
            <button onClick={onCreateGroup} className="p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-full transition-colors text-white" title={t('messaging.createGroup')}>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={t('messaging.searchGroups')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#ff99b3] rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-gray-700">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{t('messaging.noGroupsYet')}</p>
            <p className="text-sm">{t('messaging.createOrJoinGroup')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredGroups.map((group) => (
              <button
                key={group._id}
                onClick={() => onSelectGroup(group)}
                className={`w-full p-4 text-left hover:bg-[#ffb3c6] transition-colors ${selectedGroup?._id === group._id ? 'bg-[#ffb3c6]' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={group.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random&color=fff&size=200&bold=true`}
                      alt={group.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {group.type === 'public' ? (
                      <Globe className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full p-0.5" />
                    ) : (
                      <Lock className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full p-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{group.name}</h3>
                      {group.conversation?.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(group.conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{group.members.length} {t('messaging.members')}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Create Group Modal
const CreateGroupModal = ({ show, onClose, onCreateGroup }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('private');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await onCreateGroup({ name: name.trim(), description: description.trim(), type });
    setCreating(false);
    setName('');
    setDescription('');
    setType('private');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('messaging.createNewGroup')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#ffb3c6] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('messaging.groupName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('messaging.enterGroupName')}
              maxLength={100}
              className="w-full px-4 py-2 bg-white border border-[#ff99b3] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('messaging.descriptionOptional')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('messaging.whatsGroupAbout')}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-[#ff99b3] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('messaging.groupType')}</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setType('private')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${type === 'private' ? 'border-[#ff99b3] bg-[#ffb3c6]' : 'border-[#ff99b3] hover:bg-[#ffb3c6]'}`}
              >
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">{t('messaging.private')}</div>
                    <div className="text-sm text-gray-700">{t('messaging.onlyInvitedMembers')}</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('public')}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${type === 'public' ? 'border-[#ff99b3] bg-[#ffb3c6]' : 'border-[#ff99b3] hover:bg-[#ffb3c6]'}`}
              >
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">{t('messaging.public')}</div>
                    <div className="text-sm text-gray-700">{t('messaging.anyoneCanJoin')}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-black transition-colors">
              {t('messaging.cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:bg-[#ffb3c6] disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              {creating ? t('messaging.creating') : t('messaging.createGroup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Group Info Modal
const GroupInfoModal = ({ show, group, currentUserId, onClose, onUpdateGroup, onLeaveGroup, onDeleteGroup }) => {
  const { t } = useTranslation();
  const [showMembers, setShowMembers] = useState(true);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);

  if (!show || !group) return null;

  const isAdmin = group.admin._id === currentUserId;
  const isModerator = group.moderators?.some(m => m._id === currentUserId) || isAdmin;

  const copyInviteCode = () => {
    if (group.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setInviteCodeCopied(true);
      setTimeout(() => setInviteCodeCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#FFC0CB] p-6 border-b border-[#ff99b3] z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('messaging.groupInfo')}</h3>
            <button onClick={onClose} className="p-2 hover:bg-[#ffb3c6] rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <img
              src={group.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random&color=fff&size=200&bold=true`}
              alt={group.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold">{group.name}</h2>
            {group.description && <p className="text-gray-700 mt-2">{group.description}</p>}
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-700">
              <span className="flex items-center">
                {group.type === 'public' ? <Globe className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                {group.type === 'public' ? t('messaging.public') : t('messaging.private')}
              </span>
              <span>•</span>
              <span>{group.members.length} {t('messaging.members')}</span>
            </div>
          </div>
          {group.type === 'public' && group.inviteCode && (
            <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">{t('messaging.inviteCode')}</p>
                  <p className="text-gray-700 text-sm font-mono">{group.inviteCode}</p>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {inviteCodeCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('messaging.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('messaging.copy')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          <div>
            <button onClick={() => setShowMembers(!showMembers)} className="flex items-center justify-between w-full mb-3">
              <h4 className="font-semibold">{t('messaging.membersCount', { count: group.members.length })}</h4>
              <span className="text-gray-400">{showMembers ? '−' : '+'}</span>
            </button>
            {showMembers && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {group.members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-2 hover:bg-[#ffb3c6] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.username)}&background=random&color=fff&size=200&bold=true`}
                        alt={member.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{member.user.username}</p>
                        <div className="flex items-center space-x-2">
                          {member.role === 'admin' && (
                            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center">
                              <Crown className="w-3 h-3 mr-1" />
                              {t('messaging.admin')}
                            </span>
                          )}
                          {member.role === 'moderator' && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              {t('messaging.moderator')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isModerator && member.user._id !== currentUserId && member.role !== 'admin' && (
                      <button
                        onClick={() => onUpdateGroup('remove-member', member.user._id)}
                        className="p-2 hover:bg-red-600 rounded-full transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {group.pendingRequests?.length > 0 && isModerator && (
            <div>
              <h4 className="font-semibold mb-3">{t('messaging.pendingRequests', { count: group.pendingRequests.length })}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {group.pendingRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-2 bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user.username)}&background=random&color=fff&size=200&bold=true`}
                        alt={request.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{request.user.username}</p>
                        <p className="text-xs text-gray-700">{new Date(request.requestedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUpdateGroup('approve-request', request.user._id)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateGroup('reject-request', request.user._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-[#ff99b3] pt-4 space-y-2">
            {!isAdmin && (
              <button
                onClick={onLeaveGroup}
                className="w-full p-3 text-left text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t('messaging.leaveGroup')}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onDeleteGroup}
                className="w-full p-3 text-left text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                {t('messaging.deleteGroup')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Join Group Modal
const JoinGroupModal = ({ show, onClose, onJoinGroup }) => {
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    await onJoinGroup(inviteCode.trim());
    setJoining(false);
    setInviteCode('');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('messaging.joinGroup')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#ffb3c6] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('messaging.inviteCode')}</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-[#ff99b3] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
              placeholder={t('messaging.enterInviteCode')}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-black transition-colors">
              {t('messaging.cancel')}
            </button>
            <button
              type="submit"
              disabled={!inviteCode.trim() || joining}
              className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:bg-[#ffb3c6] disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              {joining ? t('messaging.joining') : t('messaging.joinGroup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const MessagingScreen = ({ conversationId: propConversationId }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dm');
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [signedUrls, setSignedUrls] = useState({});
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, message: null, canDeleteForEveryone: false });
  const [mediaModal, setMediaModal] = useState({ show: false, files: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const selectedGroupRef = useRef(null);

  const API_CONFIG = useMemo(() => ({
    baseUrl: API_BASE_URL,
    getHeaders: () => {
      const token = localStorage.getItem('token');
      return {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json'
      };
    }
  }), []);

  const getAuthHeaders = () => API_CONFIG.getHeaders();

  const fetchSignedUrl = useCallback(async (messageId, key) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/messages/file/${encodeURIComponent(key)}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSignedUrls(prev => ({ ...prev, [messageId]: data.url }));
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    }
  }, [API_CONFIG]);

  // Initialize socket connection once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Only create socket if it doesn't exist
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io('https://streammall-backend-73a4b072d5eb.herokuapp.com', {
        withCredentials: true,
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected', socketRef.current.id);
        // Rejoin rooms after connection
        if (selectedConversationRef.current) {
          socketRef.current.emit('join-conversation', { 
            conversationId: selectedConversationRef.current._id 
          });
        }
        if (selectedGroupRef.current) {
          socketRef.current.emit('join-group', { 
            groupId: selectedGroupRef.current._id 
          });
        }
      });
      
      // Handle successful room join
      socketRef.current.on('joined-conversation', (data) => {
        console.log('Successfully joined conversation:', data.conversationId);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('reconnect', () => {
        console.log('Socket reconnected');
        // Rejoin conversation/group rooms after reconnection
        if (selectedConversationRef.current) {
          socketRef.current.emit('join-conversation', { 
            conversationId: selectedConversationRef.current._id 
          });
        }
        if (selectedGroupRef.current) {
          socketRef.current.emit('join-group', { 
            groupId: selectedGroupRef.current._id 
          });
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Handle new messages - update both messages list and conversation list
      socketRef.current.on('new-message', (data) => {
        console.log('Received new message:', data);
        const { message, conversation } = data;
        
        // Normalize conversation ID for comparison
        const conversationId = conversation?._id?.toString() || conversation?._id || message?.conversation?.toString() || message?.conversation;
        const messageConversationId = message?.conversation?.toString() || message?.conversation || conversationId;
        
        // Always update conversation list with new message
        setConversations(prev => {
          const updated = prev.map(conv => {
            const convId = conv._id?.toString() || conv._id;
            return convId === conversationId 
              ? { ...conv, lastMessage: message, updatedAt: new Date() }
              : conv;
          });
          // If conversation not in list, add it
          if (!updated.find(c => {
            const cId = c._id?.toString() || c._id;
            return cId === conversationId;
          })) {
            return [{ ...conversation, lastMessage: message }, ...updated];
          }
          // Sort by updatedAt
          return updated.sort((a, b) => 
            new Date(b.updatedAt || b.lastMessage?.createdAt || 0) - 
            new Date(a.updatedAt || a.lastMessage?.createdAt || 0)
          );
        });

        // Add to messages if it's for the currently selected conversation
        // Use ref to get latest selectedConversation value
        const currentConv = selectedConversationRef.current;
        if (currentConv) {
          const selectedConvId = currentConv._id?.toString() || currentConv._id;
          console.log('Socket message - Comparing conversation IDs:', messageConversationId, '===', selectedConvId);
          
          if (messageConversationId === selectedConvId) {
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(m => {
                const mId = m._id?.toString() || m._id;
                const msgId = message._id?.toString() || message._id;
                return mId === msgId;
              });
              
              if (!exists) {
                console.log('Adding new message from socket to current conversation');
                const newMessages = [...prev, message];
                // Auto-scroll after state update
                setTimeout(() => scrollToBottom(), 100);
                return newMessages;
              } else {
                console.log('Message already exists, skipping');
              }
              return prev;
            });
          } else {
            console.log('Message is for different conversation, not adding to messages');
          }
        } else {
          console.log('No conversation selected, message will only update conversation list');
        }

        // Fetch signed URL for media messages
        if (message.key && ['image', 'video', 'audio'].includes(message.type)) {
          fetchSignedUrl(message._id, message.key);
        }
      });

      // Handle new group messages
      socketRef.current.on('new-group-message', (data) => {
        const { message, groupId } = data;
        
        // Update groups list
        setGroups(prev => prev.map(group => {
          if (group._id === groupId && group.conversation) {
            return {
              ...group,
              conversation: {
                ...group.conversation,
                lastMessage: message
              }
            };
          }
          return group;
        }));

        // Add to messages if it's for the currently selected group
        // Use ref to get latest selectedGroup value
        const currentGroup = selectedGroupRef.current;
        const groupIdStr = groupId?.toString() || groupId;
        
        if (currentGroup) {
          const currentGroupId = currentGroup._id?.toString() || currentGroup._id;
          console.log('Group message - Comparing:', groupIdStr, 'with', currentGroupId);
          
          if (groupIdStr === currentGroupId) {
            setMessages(prev => {
              if (!prev.some(m => {
                const mId = m._id?.toString() || m._id;
                const msgId = message._id?.toString() || message._id;
                return mId === msgId;
              })) {
                console.log('Adding message to current group');
                const newMessages = [...prev, message];
                setTimeout(() => scrollToBottom(), 100);
                return newMessages;
              }
              return prev;
            });
          }
        }

        // Fetch signed URL for media messages
        if (message.key && ['image', 'video', 'audio'].includes(message.type)) {
          fetchSignedUrl(message._id, message.key);
        }
      });

      // Handle typing indicators for DMs
      socketRef.current.on('user-typing', (data) => {
        const { userId, username, conversationId } = data;
        const currentConv = selectedConversationRef.current;
        if (currentConv) {
          const convId = currentConv._id?.toString() || currentConv._id;
          const dataConvId = conversationId?.toString() || conversationId;
          if (convId === dataConvId) {
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.userId !== userId);
              return [...filtered, { userId, username }];
            });
          }
        }
      });

      socketRef.current.on('user-stopped-typing', (data) => {
        const { userId, conversationId } = data;
        const currentConv = selectedConversationRef.current;
        if (currentConv) {
          const convId = currentConv._id?.toString() || currentConv._id;
          const dataConvId = conversationId?.toString() || conversationId;
          if (convId === dataConvId) {
            setTypingUsers(prev => prev.filter(u => u.userId !== userId));
          }
        }
      });

      // Handle typing indicators for groups
      socketRef.current.on('group-user-typing', (data) => {
        const { userId, username, groupId } = data;
        const currentGroup = selectedGroupRef.current;
        if (currentGroup) {
          const currentGroupId = currentGroup._id?.toString() || currentGroup._id;
          const dataGroupId = groupId?.toString() || groupId;
          if (currentGroupId === dataGroupId) {
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.userId !== userId);
              return [...filtered, { userId, username }];
            });
          }
        }
      });

      socketRef.current.on('group-user-stopped-typing', (data) => {
        const { userId, groupId } = data;
        const currentGroup = selectedGroupRef.current;
        if (currentGroup) {
          const currentGroupId = currentGroup._id?.toString() || currentGroup._id;
          const dataGroupId = groupId?.toString() || groupId;
          if (currentGroupId === dataGroupId) {
            setTypingUsers(prev => prev.filter(u => u.userId !== userId));
          }
        }
      });

      // Handle message deletion
      socketRef.current.on('message-deleted-everyone', (data) => {
        const { messageId } = data;
        setMessages(prev => prev.map(msg =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, content: 'This message was deleted', key: null, fileType: null, fileName: null }
            : msg
        ));
      });
    }

    return () => {
      // Don't disconnect on cleanup, keep connection alive
      // Only disconnect when component unmounts completely
    };
  }, [fetchSignedUrl]);

  // Update refs when selected conversation/group changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  // Clear typing indicators when switching conversations
  useEffect(() => {
    setTypingUsers([]);
  }, [selectedConversation, selectedGroup]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (propConversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === propConversationId);
      if (conversation) selectConversation(conversation);
    }
  }, [propConversationId, conversations]);

  useEffect(() => {
    if (selectedConversation || selectedGroup) {
      setMessages([]); // Clear previous messages
    }
  }, [selectedConversation, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.key && !signedUrls[message._id] && ['image', 'video', 'audio'].includes(message.type)) {
        fetchSignedUrl(message._id, message.key);
      }
    });
  }, [messages, signedUrls, fetchSignedUrl]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.baseUrl}/messages/conversations`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/groups/my-groups`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const selectConversation = async (conversation) => {
    if (!conversation?._id) {
      console.error("Conversation has no ID:", conversation);
      return;
    }
    
    // Leave previous conversation room
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('leave-conversation', { conversationId: selectedConversation._id });
    }
    
    setSelectedConversation(conversation);
    setSelectedGroup(null);
    setMessages([]);
    setTypingUsers([]); // Clear typing indicators
    
    // Join new conversation room
    if (socketRef.current && socketRef.current.connected) {
      console.log('Joining conversation:', conversation._id);
      socketRef.current.emit('join-conversation', { conversationId: conversation._id });
    } else {
      console.warn('Socket not connected, cannot join conversation');
    }
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/messages/conversations/${conversation._id}/messages`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const messages = await response.json();
        setMessages(messages);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectGroup = async (group) => {
    console.log('Selecting group:', group._id, 'Conversation ID:', group.conversation?._id);
    
    // Leave previous group room
    if (socketRef.current && selectedGroup) {
      socketRef.current.emit('leave-group', { groupId: selectedGroup._id });
    }
    
    setSelectedGroup(group);
    setSelectedConversation(null);
    setMessages([]);
    setTypingUsers([]); // Clear typing indicators
    
    // Join new group room
    if (socketRef.current && socketRef.current.connected) {
      console.log('Joining group:', group._id);
      socketRef.current.emit('join-group', { groupId: group._id });
    } else {
      console.warn('Socket not connected, cannot join group');
    }
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/messages/conversations/${group.conversation._id}/messages`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const msgs = await response.json();
        console.log('Loaded group messages:', msgs.length);
        setMessages(msgs);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };
  
  const createGroup = async (groupData) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/groups/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(groupData)
      });
      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [newGroup, ...prev]);
        setShowCreateGroupModal(false);
        selectGroup(newGroup);
      } else {
        const error = await response.json();
        alert(error.msg || t('messaging.errors.failedToCreateGroup'));
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(t('messaging.errors.failedToCreateGroup'));
    }
  };

  const joinGroup = async (inviteCode) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/groups/join-by-code`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteCode })
      });
      if (response.ok) {
        const joinedGroup = await response.json();
        setGroups(prev => [joinedGroup, ...prev]);
        setShowJoinGroupModal(false);
        selectGroup(joinedGroup);
      } else {
        const error = await response.json();
        alert(error.msg || t('messaging.errors.failedToJoinGroup'));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert(t('messaging.errors.failedToJoinGroup'));
    }
  };

  const sendMessage = async (e, messageData = null) => {
    e?.preventDefault();
    const content = messageData?.content || newMessage.trim();
    const type = messageData?.type || 'text';
    const key = messageData?.key;
    const fileType = messageData?.fileType;
    const fileName = messageData?.fileName;

    if ((type === 'text' && !content) || sending) return;
    if (!selectedConversation && !selectedGroup) return;

    setSending(true);
    if (!messageData) setNewMessage('');

    try {
      const conversationId = selectedGroup ? selectedGroup.conversation._id : selectedConversation._id;
      const response = await fetch(`${API_CONFIG.baseUrl}/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, type, key, fileType, fileName })
      });
      if (response.ok) {
        const message = await response.json();
        // Optimistically add message immediately
        setMessages(prev => {
          const newMessages = [...prev];
          if (!newMessages.some(m => {
            const mId = m._id?.toString() || m._id;
            const msgId = message._id?.toString() || message._id;
            return mId === msgId;
          })) {
            newMessages.push(message);
            setTimeout(() => scrollToBottom(), 100);
          }
          return newMessages;
        });
        
        // Update conversation list
        setConversations(prev => {
          const convId = conversationId?.toString() || conversationId;
          return prev.map(conv => {
            const cId = conv._id?.toString() || conv._id;
            return cId === convId 
              ? { ...conv, lastMessage: message, updatedAt: new Date() }
              : conv;
          }).sort((a, b) => 
            new Date(b.updatedAt || b.lastMessage?.createdAt || 0) - 
            new Date(a.updatedAt || a.lastMessage?.createdAt || 0)
          );
        });
        
        if (message.key && ['image', 'video', 'audio'].includes(message.type)) {
          fetchSignedUrl(message._id, message.key);
        }
      } else {
        if (!messageData) setNewMessage(content);
        const error = await response.json();
        alert(error.msg || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (!messageData) setNewMessage(content);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (socketRef.current && (selectedConversation || selectedGroup)) {
      // Start typing indicator
      if (!isTyping) {
        setIsTyping(true);
        if (selectedGroup) {
          socketRef.current.emit('group-typing-start', { groupId: selectedGroup._id });
        } else if (selectedConversation) {
          socketRef.current.emit('typing-start', { conversationId: selectedConversation._id });
        }
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (selectedGroup) {
          socketRef.current.emit('group-typing-stop', { groupId: selectedGroup._id });
        } else if (selectedConversation) {
          socketRef.current.emit('typing-stop', { conversationId: selectedConversation._id });
        }
      }, 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendAudioMessage = async () => {
    if (!audioBlob) return;
    if (!selectedConversation && !selectedGroup) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const fileName = `voice_message_${Date.now()}.webm`;
      const fileType = 'audio/webm';
      const signedUrlResponse = await fetch(`${API_CONFIG.baseUrl}/messages/media/signed-url`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType })
      });
      if (!signedUrlResponse.ok) throw new Error('Failed to get signed URL');
      const { uploadUrl, key } = await signedUrlResponse.json();
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: audioBlob
      });
      if (!uploadResponse.ok) throw new Error('Failed to upload audio');
      await sendMessage(null, { type: 'audio', key, fileType, fileName });
      setUploadProgress(100);
      alert('✅ Voice message sent!');
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('❌ Failed to send voice message');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingDuration(0);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (files.length > 0) {
      setMediaModal({ show: true, files });
    } else {
      alert('Only images and videos allowed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (files.length > 0) {
      setMediaModal({ show: true, files });
    } else {
      alert('Only images and videos allowed');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const uploadFiles = async () => {
    if (!mediaModal.files.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const totalFiles = mediaModal.files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = mediaModal.files[i];
        setUploadProgress(Math.round((i / totalFiles) * 100));
        const signedUrlResponse = await fetch(`${API_CONFIG.baseUrl}/messages/media/signed-url`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type })
        });
        if (!signedUrlResponse.ok) throw new Error('Failed to get signed URL');
        const { uploadUrl, key } = await signedUrlResponse.json();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!uploadResponse.ok) throw new Error(`Failed to upload ${file.name}`);
        const messageType = file.type.startsWith('image/') ? 'image' : 'video';
        await sendMessage(null, { type: messageType, key, fileType: file.type, fileName: file.name });
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      alert('✅ Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setMediaModal({ show: false, files: [] });
    }
  };

  const showDeleteModal = (message) => {
    const canDeleteForEveryone = message.sender._id === (currentUser?.id || currentUser?._id);
    setDeleteModal({ show: true, message, canDeleteForEveryone });
  };

  const deleteMessage = async (type) => {
    if (!deleteModal.message) return;
    try {
      const endpoint = type === 'everyone'
        ? `${API_CONFIG.baseUrl}/messages/${deleteModal.message._id}/everyone`
        : `${API_CONFIG.baseUrl}/messages/${deleteModal.message._id}/me`;
      const response = await fetch(endpoint, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        if (type === 'everyone') {
          setMessages(prev => prev.map(msg =>
            msg._id === deleteModal.message._id
              ? { ...msg, isDeleted: true, content: 'This message was deleted', key: null, fileType: null, fileName: null }
              : msg
          ));
        } else {
          setMessages(prev => prev.filter(msg => msg._id !== deleteModal.message._id));
        }
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete message');
    } finally {
      setDeleteModal({ show: false, message: null, canDeleteForEveryone: false });
    }
  };

  const handleGroupAction = async (action, userId) => {
    if (!selectedGroup) return;
    try {
      let endpoint = '';
      let method = 'POST';
      switch (action) {
        case 'remove-member':
          endpoint = `${API_CONFIG.baseUrl}/groups/${selectedGroup._id}/members/${userId}`;
          method = 'DELETE';
          break;
        case 'approve-request':
          endpoint = `${API_CONFIG.baseUrl}/groups/${selectedGroup._id}/requests/${userId}/approve`;
          break;
        case 'reject-request':
          endpoint = `${API_CONFIG.baseUrl}/groups/${selectedGroup._id}/requests/${userId}/reject`;
          break;
      }
      const response = await fetch(endpoint, { method, headers: getAuthHeaders() });
      if (response.ok) {
        fetchGroups();
        const updatedGroup = await fetch(`${API_CONFIG.baseUrl}/groups/${selectedGroup._id}`, {
          headers: getAuthHeaders()
        });
        if (updatedGroup.ok) {
          const data = await updatedGroup.json();
          setSelectedGroup(data);
        }
      }
    } catch (error) {
      console.error('Error performing group action:', error);
    }
  };

  const leaveGroup = async () => {
    if (!selectedGroup || !currentUser) return;
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/groups/${selectedGroup._id}/members/${currentUser.id || currentUser._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setGroups(prev => prev.filter(g => g._id !== selectedGroup._id));
        setSelectedGroup(null);
        setShowGroupInfoModal(false);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;
    if (!confirm('Delete this group? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/groups/${selectedGroup._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setGroups(prev => prev.filter(g => g._id !== selectedGroup._id));
        setSelectedGroup(null);
        setShowGroupInfoModal(false);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <Image className="w-4 h-4" />;
    if (type === 'video') return <Play className="w-4 h-4" />;
    if (type === 'audio') return <Mic className="w-4 h-4" />;
    return <Image className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants || !currentUser) return null;
    return conversation.participants.find(p => p._id !== (currentUser.id || currentUser._id));
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const Message = React.memo(({ message, isOwn, showAvatar }) => {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'} group`}>
        {!isOwn && showAvatar && (
          <img
            src={message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.username)}&background=random&color=fff&size=200&bold=true`}
            alt={message.sender.username}
            className="w-6 h-6 rounded-full object-cover mr-2 mt-auto"
          />
        )}
        {!isOwn && !showAvatar && <div className="w-8" />}
        <div className="relative">
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn ? 'bg-[#FF2B55] text-white' : 'bg-gray-800 text-white'}`}>
            {message.isDeleted ? (
              <p className="text-sm italic text-gray-400">{message.content}</p>
            ) : (
              <>
                {!isOwn && selectedGroup && showAvatar && (
                  <p className="text-xs text-[#FF2B55]font-semibold mb-1">{message.sender.username}</p>
                )}
                {message.type === 'text' && <p className="text-sm">{message.content}</p>}
                {message.type === 'image' && signedUrls[message._id] && (
                  <div>
                    <img src={signedUrls[message._id]} alt={message.fileName} className="max-w-full h-auto rounded-lg mb-2" />
                    {message.fileName && <p className="text-xs text-gray-400">{message.fileName}</p>}
                  </div>
                )}
                {message.type === 'video' && signedUrls[message._id] && (
                  <div>
                    <video controls muted playsInline className="max-w-full h-auto rounded-lg mb-2">
                      <source src={signedUrls[message._id]} type={message.fileType || 'video/mp4'} />
                    </video>
                    {message.fileName && <p className="text-xs text-gray-400">{message.fileName}</p>}
                  </div>
                )}
                {message.type === 'audio' && signedUrls[message._id] && (
                  <div>
                    <audio controls className="w-full mb-2">
                      <source src={signedUrls[message._id]} type={message.fileType || 'audio/webm'} />
                    </audio>
                    {message.fileName && <p className="text-xs text-gray-400">{message.fileName}</p>}
                  </div>
                )}
                <p className={`text-xs mt-1 ${isOwn ? 'text-[#FF2B55]' : 'text-gray-400'}`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </>
            )}
          </div>
          {!message.isDeleted && (
            <button
              onClick={() => showDeleteModal(message)}
              className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>{t('messaging.loadingMessages')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen bg-[#FFC0CB] text-black flex relative overflow-hidden">
      {dragActive && (
        <div className="absolute inset-0 bg-pink-600/20 z-50 flex items-center justify-center">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg">{t('messaging.dropFilesToUpload')}</div>
        </div>
      )}
      <div className={`w-full md:w-1/3 border-r border-[#ff99b3] flex flex-col h-full ${selectedConversation || selectedGroup ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#ff99b3]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2 flex-1">
              <button
                onClick={() => setActiveTab('dm')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${activeTab === 'dm' ? 'bg-[#FF2B55] text-white' : 'bg-[#FFC0CB] text-gray-700 hover:bg-[#ffb3c6]'}`}
              >
                {t('messaging.directMessages')}
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${activeTab === 'groups' ? 'bg-[#FF2B55] text-white' : 'bg-[#FFC0CB] text-gray-700 hover:bg-[#ffb3c6]'}`}
              >
                {t('messaging.groups')}
              </button>
            </div>
            <div className="ml-2">
              <LanguageSwitcher variant="light" className="!bg-white/20 !border-white/30" />
            </div>
          </div>
        </div>
        {activeTab === 'dm' ? (
          <>
            <div className="p-4 border-b border-[#ff99b3]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder={t('messaging.searchConversations')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#ff99b3] rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-4">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-700">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-lg">{t('messaging.noConversations')}</p>
                  <p className="text-sm">{t('messaging.startFollowingMessage')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    if (!otherParticipant) return null;
                    return (
                      <button
                        key={conversation._id}
                        onClick={() => selectConversation(conversation)}
                        className={`w-full p-4 text-left hover:bg-[#ffb3c6] transition-colors ${selectedConversation?._id === conversation._id ? 'bg-[#FFC0CB]' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=random&color=fff&size=200&bold=true`}
                            alt={otherParticipant.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">{otherParticipant.username}</h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-700">
                                  {formatMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-700 truncate">
                                {conversation.lastMessage.sender === (currentUser?.id || currentUser?._id) ? t('messaging.you') : ''}
                                {conversation.lastMessage.type !== 'text' ? (
                                  <span className="flex items-center">
                                    {getFileIcon(conversation.lastMessage.type)}
                                    <span className="ml-1">{conversation.lastMessage.fileName || conversation.lastMessage.type}</span>
                                  </span>
                                ) : (
                                  conversation.lastMessage.content
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <GroupList
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={selectGroup}
            onCreateGroup={() => setShowCreateGroupModal(true)}
            onJoinGroup={() => setShowJoinGroupModal(true)}
            searchQuery={groupSearchQuery}
            setSearchQuery={setGroupSearchQuery}
          />
        )}
      </div>
      <div
        className={`flex-1 flex flex-col h-full ${selectedConversation || selectedGroup ? 'flex' : 'hidden md:flex'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedConversation || selectedGroup ? (
          <>
            <div className="p-4 border-b border-[#ff99b3] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setSelectedGroup(null);
                  }}
                  className="md:hidden p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {selectedGroup ? (
                  <>
                    <img
                      src={selectedGroup.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGroup.name)}&background=random&color=fff&size=200&bold=true`}
                      alt={selectedGroup.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold">{selectedGroup.name}</h2>
                      <p className="text-xs text-gray-700">{selectedGroup.members.length} members</p>
                    </div>
                  </>
                ) : (
                  (() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    return otherParticipant ? (
                      <>
                        <img
                          src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=random&color=fff&size=200&bold=true`}
                          alt={otherParticipant.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h2 className="font-semibold">{otherParticipant.username}</h2>
                          <p className="text-xs text-gray-700">Active now</p>
                        </div>
                      </>
                    ) : null;
                  })()
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <LanguageSwitcher variant="light" className="!bg-white/20 !border-white/30" />
                
                {selectedGroup && (
                  <button onClick={() => setShowGroupInfoModal(true)} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                )}
                {!selectedGroup && (
                  <>
                    <button className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-700">
                  <p>{t('messaging.startConversation')}</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender._id === (currentUser?.id || currentUser?._id);
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender._id !== message.sender._id);
                  return (
                    <Message
                      key={message._id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })
              )}
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-gray-700 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>{t('messaging.isTyping', { username: typingUsers[0].username })}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#ff99b3] bg-white/70 backdrop-blur-sm sticky bottom-0 z-10">
              <div className="flex items-center space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder={t('messaging.typeMessage')}
                    disabled={sending || recording}
                    className="w-full px-4 py-2 pr-12 bg-white border border-[#ff99b3] rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#ffb3c6] rounded-full transition-colors">
                    <Smile className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {recording ? (
                  <button onClick={stopRecording} className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={sending || newMessage.trim()}
                    className="p-2 bg-white border border-[#ff99b3] hover:bg-[#ffb3c6] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                  >
                    <Mic className="w-5 h-5 text-pink-700" />
                  </button>
                )}
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending || recording}
                  className="p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:bg-[#ffb3c6] disabled:cursor-not-allowed rounded-full transition-colors text-white"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              {recording && (
                <div className="mt-2 text-center text-sm text-gray-700">
                  Recording... {formatDuration(recordingDuration)}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-700">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-20 h-20 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl font-semibold mb-2">{t('messaging.selectConversation')}</p>
              <p className="text-sm">{t('messaging.chooseFromConversations')}</p>
            </div>
          </div>
        )}
      </div>
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('messaging.deleteMessage')}</h3>
            <p className="text-gray-700 mb-6">{t('messaging.chooseDeleteOption')}</p>
            <div className="space-y-3">
              <button onClick={() => deleteMessage('me')} className="w-full p-3 text-left hover:bg-[#ffb3c6] rounded-lg transition-colors">
                <div className="font-medium">{t('messaging.deleteForMe')}</div>
                <div className="text-sm text-gray-700">{t('messaging.deleteForMeDescription')}</div>
              </button>
              {deleteModal.canDeleteForEveryone && (
                <button onClick={() => deleteMessage('everyone')} className="w-full p-3 text-left hover:bg-[#ffb3c6] rounded-lg transition-colors">
                  <div className="font-medium">{t('messaging.deleteForEveryone')}</div>
                  <div className="text-sm text-gray-700">{t('messaging.deleteForEveryoneDescription')}</div>
                </button>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, message: null, canDeleteForEveryone: false })}
                className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
              >
                {t('messaging.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {mediaModal.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('messaging.sendMedia')}</h3>
              <button onClick={() => setMediaModal({ show: false, files: [] })} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {mediaModal.files.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg">
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-[#ff99b3]">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-lg border border-[#ff99b3] flex items-center justify-center">
                        <Play className="w-6 h-6 text-pink-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-700">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newFiles = mediaModal.files.filter((_, i) => i !== index);
                      setMediaModal({ ...mediaModal, files: newFiles });
                    }}
                    className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setMediaModal({ show: false, files: [] })} className="px-4 py-2 text-gray-700 hover:text-black transition-colors">
                {t('messaging.cancel')}
              </button>
              <button
                onClick={uploadFiles}
                disabled={uploading || mediaModal.files.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:bg-[#ffb3c6] disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 text-white"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('messaging.uploading', { progress: uploadProgress })}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{mediaModal.files.length === 1 ? t('messaging.sendFiles', { count: mediaModal.files.length }) : t('messaging.sendFilesPlural', { count: mediaModal.files.length })}</span>
                  </>
                )}
              </button>
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="bg-white rounded-full h-2 border border-[#ff99b3]">
                  <div className="bg-pink-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-sm text-gray-700 mt-2 text-center">{t('messaging.uploadingFiles', { progress: uploadProgress })}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {audioUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#FFC0CB] border border-[#ff99b3] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Voice Message</h3>
              <button onClick={cancelRecording} className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/webm" />
              </audio>
              <p className="text-sm text-gray-700 mt-2">Duration: {formatDuration(recordingDuration)}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelRecording} className="px-4 py-2 text-gray-700 hover:text-black transition-colors">
                Cancel
              </button>
              <button
                onClick={sendAudioMessage}
                disabled={uploading}
                className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 disabled:bg-[#ffb3c6] disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 text-white"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Voice Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <CreateGroupModal show={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)} onCreateGroup={createGroup} />
      <GroupInfoModal
        show={showGroupInfoModal}
        group={selectedGroup}
        currentUserId={currentUser?.id || currentUser?._id}
        onClose={() => setShowGroupInfoModal(false)}
        onUpdateGroup={handleGroupAction}
        onLeaveGroup={leaveGroup}
        onDeleteGroup={deleteGroup}
      />
      <JoinGroupModal show={showJoinGroupModal} onClose={() => setShowJoinGroupModal(false)} onJoinGroup={joinGroup} />
    </div>
  );
};

export default MessagingScreen;