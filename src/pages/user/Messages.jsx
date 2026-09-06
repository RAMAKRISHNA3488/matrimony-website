import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import {
  Send,
  Search,
  CheckCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Lock,
  X,
  Smile,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  Compass,
  Phone,
  Download,
  Play,
  Volume2,
  RotateCcw,
  Trash2,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import '../../styles/messages.css';

const QUICK_SUGGESTIONS = [
  "Namaskaram! 🙏",
  "Would love to connect with your family 📞",
  "Liked your bio-data and education details 📄",
  "Horoscope preferences seem aligned ✨",
  "Shared your profile with my parents 👨‍👩‍👧",
  "Are you open to a phone conversation this weekend? 📱",
  "Looking forward to knowing more about your family 🌸",
  "Please check our family bio-data details 📋",
  "Wishing you and your family a wonderful day ☀️",
  "Let us plan a family meet at your convenience 🤝",
  "Glad to connect! When is a good time to speak? ⏰",
  "Our family values and traditions align well 🪔"
];

const EMOJI_CATEGORIES = {
  matrimony: {
    label: "Traditions and Blessings",
    emojis: [
      "🙏", "💐", "💍", "✨", "🪔", "🌸", "❤️", "🕊️",
      "💌", "🤝", "🌺", "💖", "👰", "🤵", "🕉️", "🎉",
      "🌻", "🌹", "🌷", "🏵️", "🌼", "🌿", "🍀", "💫",
      "💒", "🤴", "👸", "🎊", "🎇", "🎆", "🧧", "🎀",
      "🌟", "💘", "💝", "💓", "💞", "💕", "❣️", "👑"
    ]
  },
  smiles: {
    label: "Smileys and Feelings",
    emojis: [
      "😊", "😄", "😃", "🥰", "🤗", "😇", "😌", "😍",
      "🤩", "🙂", "😉", "🥳", "🙌", "👍", "👏", "⭐",
      "😁", "😆", "😋", "😚", "😘", "😙", "😎", "😏",
      "🤭", "🤫", "🤔", "🫡", "✌️", "👌", "🫶", "👐",
      "🤲", "💪", "💖", "💗", "💓", "✨", "💫", "🎯"
    ]
  },
  family: {
    label: "Family and Lifestyle",
    emojis: [
      "👨‍👩‍👧", "🏠", "🌟", "💫", "☕", "📖", "🎁", "🎊",
      "🌴", "🚗", "💼", "🎓", "📱", "✈️", "🌅", "🍰",
      "🏡", "🏢", "🧳", "🍲", "🍛", "🫖", "🍫", "🍓",
      "🍎", "🧁", "🎂", "🎈", "🪄", "🎼", "🎹", "🎻",
      "📸", "🎥", "🎬", "🎨", "🏆", "🥇", "🌿", "🏖️"
    ]
  }
};

function generateSmartReply(userMessage, attachmentPayload, activeConv) {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();
  const profession = activeConv?.participantProfession || 'Professional';

  // 1. If attachment was sent:
  if (attachmentPayload) {
    switch (attachmentPayload.type) {
      case 'image':
        return [
          "Thank you for sharing the photo! Looks lovely and traditional. 📸 Will show it to my parents as well.",
          "Received your photo! Appreciate you sharing it with us. You look wonderful. 😊",
          "Thank you for sharing! My family and I enjoyed seeing your photo. 🌸"
        ];
      case 'document':
        return [
          `Thank you for sharing your bio-data document (${attachmentPayload.name || 'PDF'})! 📄 My parents and I are reviewing the details now.`,
          "Received your document! Everything mentioned in your bio-data matches our expectations. 📋",
          "Thank you! I saved your bio-data. My family is very happy with your background and qualifications. 📄"
        ];
      case 'horoscope':
        return [
          "Thank you for sharing the Vedic Kundali match! ✨ 32/36 Gunas alignment is very auspicious. Our family astrologer confirmed the same.",
          "Received the Horoscope report! Gothram and Nakshatram compatibility look completely aligned with zero Dosham. 🪔",
          "Auspicious match! Our family is delighted with the Kundali compatibility score. 🙏"
        ];
      case 'contact':
        return [
          `Thank you for sharing your family contact details (${attachmentPayload.phone || 'verified phone'})! 📞 My father/parents will call this weekend.`,
          "Received your contact number! We will reach out over the weekend for a pleasant family discussion. 🤝",
          "Thank you! I noted down your number. Let us arrange a family phone call soon. 📱"
        ];
      case 'audio':
        return [
          "Namaskaram! Heard your voice note. 🎙️ Very glad to hear your warm and polite voice.",
          "Thank you for the audio message! It sounds wonderful. Looking forward to speaking directly soon. 📞"
        ];
      default:
        break;
    }
  }

  // 2. Check for Greetings / Namaskaram
  if (
    lower.includes('namaskaram') ||
    lower.includes('namaste') ||
    lower.includes('hello') ||
    lower.includes('hi ') ||
    lower === 'hi' ||
    lower.includes('hey') ||
    lower.includes('good morning') ||
    lower.includes('good evening') ||
    lower.includes('good afternoon') ||
    text.includes('🙏')
  ) {
    return [
      "Namaskaram! 🙏 Thank you for reaching out. It is a pleasure to connect with you.",
      "Namaste! 🙏 Glad to connect with you on TeluguBandham. How has your day been?",
      "Namaskaram! Thank you for the greeting. Hope you and your family are doing well! 🌸"
    ];
  }

  // 3. Check for Family / Parents
  if (
    lower.includes('family') ||
    lower.includes('parent') ||
    lower.includes('father') ||
    lower.includes('mother') ||
    lower.includes('mom') ||
    lower.includes('dad') ||
    lower.includes('peddalu') ||
    lower.includes('home') ||
    lower.includes('illu') ||
    text.includes('👨‍👩‍👧')
  ) {
    return [
      "Thank you! I discussed your profile with my parents as well. They were very happy with your family values. 👨‍👩‍👧",
      "Family values are our utmost priority. My parents would be glad to initiate a conversation with yours. 🏡",
      "I shared your bio-data with my family this morning. They appreciated your family roots and culture. 🌸"
    ];
  }

  // 4. Check for Horoscope / Kundali / Gothram / Nakshatram / Rasi / Match
  if (
    lower.includes('horoscope') ||
    lower.includes('kundali') ||
    lower.includes('gothram') ||
    lower.includes('nakshatra') ||
    lower.includes('rasi') ||
    lower.includes('match') ||
    lower.includes('dosham') ||
    lower.includes('guna') ||
    text.includes('✨') ||
    text.includes('🪔')
  ) {
    return [
      "Yes! Our family astrologer reviewed the horoscope and found great compatibility with zero Dosham. ✨",
      "Horoscope alignment is very promising! 32/36 Gunas match according to Vedic standards. 🪔",
      "I agree, our Gothram and astrological aspects match nicely. My family is very positive about this. 🙏"
    ];
  }

  // 5. Check for Bio-data / Education / Career / Profession / Job / Work / Salary
  if (
    lower.includes('bio-data') ||
    lower.includes('biodata') ||
    lower.includes('education') ||
    lower.includes('career') ||
    lower.includes('job') ||
    lower.includes('work') ||
    lower.includes('profession') ||
    lower.includes('salary') ||
    lower.includes('company') ||
    lower.includes('study') ||
    lower.includes('degree') ||
    lower.includes('tech') ||
    lower.includes('engineer') ||
    lower.includes('manager') ||
    lower.includes('doctor') ||
    text.includes('📄') ||
    text.includes('📋')
  ) {
    return [
      "Thank you! I went through your education and career journey. It is truly impressive and inspiring. 💼",
      `Appreciate your kind words! As a ${profession}, I value continuous growth and balanced family life. Your career profile aligns well too. 🎓`,
      "Thank you! I reviewed your bio-data details as well. Everything looks very balanced and promising. 📄"
    ];
  }

  // 6. Check for Call / Phone / Speak / Talk / Weekend / Number / Contact
  if (
    lower.includes('phone') ||
    lower.includes('call') ||
    lower.includes('number') ||
    lower.includes('speak') ||
    lower.includes('talk') ||
    lower.includes('weekend') ||
    lower.includes('saturday') ||
    lower.includes('sunday') ||
    lower.includes('evening') ||
    lower.includes('time') ||
    lower.includes('whatsapp') ||
    text.includes('📞') ||
    text.includes('📱')
  ) {
    return [
      "Yes, absolutely! A phone conversation this weekend around 11:00 AM or 6:00 PM would be ideal. 📞",
      "Sure! My father and I would be glad to talk over a voice call. Let us fix a convenient time this Saturday. 📱",
      "Sounds wonderful! Please feel free to share a good time window, and we can arrange the call. 🤝"
    ];
  }

  // 7. Check for Meeting / Meet / Location / Hyderabad / Bangalore / USA / City
  if (
    lower.includes('meet') ||
    lower.includes('visit') ||
    lower.includes('hyderabad') ||
    lower.includes('bangalore') ||
    lower.includes('vizag') ||
    lower.includes('vijayawada') ||
    lower.includes('usa') ||
    lower.includes('place') ||
    lower.includes('location') ||
    lower.includes('residence') ||
    text.includes('🏠') ||
    text.includes('☕')
  ) {
    return [
      "We would be delighted to host a family meeting at our residence in Hyderabad / AP at your convenience! 🌸",
      "Yes, meeting in person with our families will be a great next step. Let us plan when you are in town. ☕",
      "A family meet sounds perfect. We can coordinate the dates once both parents speak on phone. 🤝"
    ];
  }

  // 8. Check for Pure Emojis or Expressive Emojis
  if (
    text.includes('😊') ||
    text.includes('😄') ||
    text.includes('😃') ||
    text.includes('🥰') ||
    text.includes('❤️') ||
    text.includes('💖') ||
    text.includes('💐') ||
    text.includes('🌸') ||
    text.includes('🌺') ||
    text.includes('💍') ||
    text.includes('🎉')
  ) {
    return [
      "Thank you for the warm smile and wishes! 😊 Wishing you a peaceful and wonderful day ahead.",
      "Appreciate your thoughtful gestures! 🙏 Feeling very positive about our conversation.",
      "Thank you! 💐 Wishing you and your family happiness and prosperity."
    ];
  }

  if (
    text.includes('👍') ||
    text.includes('🤝') ||
    text.includes('👏') ||
    text.includes('🙌') ||
    text.includes('👌')
  ) {
    return [
      "Glad we are aligned! 🤝 Let us take the next step together with family blessings.",
      "Sounds great! 👍 Looking forward to taking our discussion forward.",
      "Wonderful! 🤝 Appreciate your clear and positive response."
    ];
  }

  // 9. Questions ("how are you", "what about", "where", "?")
  if (lower.includes('how are you') || lower.includes('how r u') || lower.includes('how do you do')) {
    return [
      "I am doing very well, thank you for asking! 😊 How are you and how is everything at home?",
      "All good here, thank you! Work and family life are keeping me well. How has your week been?"
    ];
  }

  if (text.includes('?')) {
    return [
      "That is a very thoughtful question! Yes, my family and I are fully supportive and aligned on this. 😊",
      "Regarding that, we believe in open communication and mutual understanding between both families. Let us discuss more on call. 📞",
      `Good question! I am currently working as ${profession}. I can share more specific details when we speak. 🌸`
    ];
  }

  // 10. Default smart personalized response
  return [
    "Thank you for your message! I appreciate you sharing your thoughts. Looking forward to discussing this further with our families. 🌸",
    "Thank you! That sounds very reasonable. I will discuss this with my parents this evening and update you. 🙏",
    `Glad to hear from you! As a ${profession}, I appreciate your clear and respectful communication. Let us stay in touch. 😊`,
    "Thank you! Everything looks positive from our side. Looking forward to connecting more. ✨"
  ];
}

export default function Messages() {
  const { user } = useAuth();
  const { conversations, sendMessage, clearChatHistory, deleteConversation, showToast, checkProfileCompleteness, openOrCreateChat } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeConvId, setActiveConvId] = useState(() => (conversations[0] ? conversations[0].id : null));
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // WhatsApp-style action bar states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('matrimony');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  // Header options & confirmation states
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const attachMenuRef = useRef(null);
  const attachBtnRef = useRef(null);
  const docInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const icebreakersRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const deletedConvsRef = useRef(new Set());

  // Sync active conversation with URL query param or first available conversation
  useEffect(() => {
    const targetChat = searchParams.get('chat') || searchParams.get('conv') || searchParams.get('participant');
    if (targetChat) {
      if (deletedConvsRef.current.has(targetChat) || deletedConvsRef.current.has(targetChat.toLowerCase())) {
        return;
      }
      const match = conversations.find(
        (c) =>
          c.id === targetChat ||
          c.participantId === targetChat ||
          String(c.participantId).toLowerCase() === targetChat.toLowerCase() ||
          c.participantName?.toLowerCase() === targetChat.toLowerCase()
      );
      if (match) {
        setActiveConvId(match.id);
        setShowMobileChat(true);
        return;
      }

      // If user navigated directly via URL and conversation doesn't exist yet, resolve profile and create
      try {
        const foundProfile = mockDb.getProfileById(targetChat) ||
          (mockDb.getProfiles() || []).find(p =>
            p.id === targetChat ||
            String(p.id).toLowerCase() === targetChat.toLowerCase() ||
            p.name?.toLowerCase() === targetChat.toLowerCase()
          );
        if (foundProfile) {
          const newConv = openOrCreateChat ? openOrCreateChat(foundProfile) : null;
          if (newConv) {
            setActiveConvId(newConv.id);
            setShowMobileChat(true);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not auto-resolve chat candidate target", err);
      }
    }

    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    } else if (activeConvId && !conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(conversations[0] ? conversations[0].id : null);
    }
  }, [searchParams, conversations, activeConvId, openOrCreateChat]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiBtnRef.current?.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(e.target) &&
        !attachBtnRef.current?.contains(e.target)
      ) {
        setShowAttachMenu(false);
      }
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target)
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmClear = React.useCallback(() => {
    if (!activeConv) return;
    clearChatHistory(activeConv.id);
    setShowClearConfirm(false);
  }, [activeConv, clearChatHistory]);

  const handleConfirmDelete = React.useCallback(() => {
    if (!activeConv) return;
    const currentId = activeConv.id;
    deletedConvsRef.current.add(currentId);
    if (activeConv.participantId) {
      deletedConvsRef.current.add(String(activeConv.participantId).toLowerCase());
    }
    const remaining = conversations.filter((c) => c.id !== currentId);
    deleteConversation(currentId);
    setShowDeleteConfirm(false);
    if (remaining.length > 0) {
      const nextId = remaining[0].id;
      setActiveConvId(nextId);
      navigate(`/messages?chat=${nextId}`, { replace: true });
    } else {
      setActiveConvId(null);
      setShowMobileChat(false);
      navigate('/messages', { replace: true });
    }
  }, [activeConv, conversations, deleteConversation, navigate]);

  // Keyboard shortcut listener for confirmation dialogs & modal actions (Enter to confirm, Escape to cancel)
  useEffect(() => {
    const handleModalKeyDown = (e) => {
      if (showDeleteConfirm) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmDelete();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setShowDeleteConfirm(false);
        }
      } else if (showClearConfirm) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmClear();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setShowClearConfirm(false);
        }
      } else if (viewingPhoto && e.key === 'Escape') {
        e.preventDefault();
        setViewingPhoto(null);
      }
    };

    if (showDeleteConfirm || showClearConfirm || viewingPhoto) {
      window.addEventListener('keydown', handleModalKeyDown);
    }
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [showDeleteConfirm, showClearConfirm, viewingPhoto, handleConfirmClear, handleConfirmDelete]);

  // Voice recording timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Isolated container scroll: scrolls only the chat messages box without moving the outer page
  const scrollToBottom = (smooth = false) => {
    if (chatScrollRef.current) {
      if (smooth) {
        chatScrollRef.current.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
  };

  // Instant isolated scroll when selecting another conversation
  useEffect(() => {
    scrollToBottom(false);
  }, [activeConvId]);

  // Smooth isolated scroll when a new message is sent or received
  useEffect(() => {
    if (activeConv?.messages?.length) {
      scrollToBottom(true);
    }
  }, [activeConv?.messages?.length]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !pendingAttachment) || !activeConv) return;

    if (checkProfileCompleteness && !checkProfileCompleteness('message', activeConv.participantName || 'Member')) {
      return;
    }

    const messageText = inputText.trim();
    const attachmentPayload = pendingAttachment ? { ...pendingAttachment } : null;
    const currentUserId = user?.id || 'TB-USER-01';
    const partnerId = activeConv.participantId || 'candidate';

    // 1. Send outgoing message from current user (Right side)
    sendMessage(activeConv.id, messageText, currentUserId, attachmentPayload);
    setInputText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    // 2. Simulate smart, context-aware received message from candidate (Left side) after 1.4s
    setTimeout(() => {
      const candidateReplies = generateSmartReply(messageText, attachmentPayload, activeConv);
      const randomReply = Array.isArray(candidateReplies)
        ? candidateReplies[Math.floor(Math.random() * candidateReplies.length)]
        : candidateReplies;
      sendMessage(activeConv.id, randomReply, partnerId);
    }, 1400);
  };

  const handleQuickChip = (chipText) => {
    setInputText((prev) => (prev ? `${prev} ${chipText}` : chipText));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    let previewUrl = null;
    if (type === 'image') {
      previewUrl = URL.createObjectURL(file);
    }

    setPendingAttachment({
      type,
      name: file.name,
      size: sizeFormatted,
      previewUrl
    });

    setShowAttachMenu(false);
    showToast(`Attached ${file.name}`, 'info');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAttachHoroscope = () => {
    setPendingAttachment({
      type: 'horoscope',
      name: 'Vedic Kundali and Gothram Match Report',
      details: '32/36 Gunas Vedic Compatibility Score Verified'
    });
    setShowAttachMenu(false);
    showToast("Attached Vedic Kundali Match Card", "info");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAttachContact = () => {
    setPendingAttachment({
      type: 'contact',
      name: 'Direct Family Contact Details',
      phone: user?.phone ? `+91 ${user.phone}` : '+91 98765 43210 (Verified)'
    });
    setShowAttachMenu(false);
    showToast("Attached Verified Family Contact Details", "info");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    showToast("Voice recording started...", "info");
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    showToast("Voice note discarded", "info");
  };

  const handleSendRecording = () => {
    if (checkProfileCompleteness && !checkProfileCompleteness('message', activeConv?.participantName || 'Member')) {
      setIsRecording(false);
      setRecordingTime(0);
      return;
    }

    const seconds = recordingTime || 4;
    const formattedDuration = `0:${seconds < 10 ? '0' : ''}${seconds}`;

    setIsRecording(false);
    setRecordingTime(0);

    const currentUserId = user?.id || 'TB-USER-01';
    const partnerId = activeConv.participantId || 'candidate';

    sendMessage(activeConv.id, '', currentUserId, {
      type: 'audio',
      name: 'Voice Note',
      duration: formattedDuration
    });

    setTimeout(() => {
      const candidateReplies = generateSmartReply('', { type: 'audio', duration: formattedDuration }, activeConv);
      const randomReply = Array.isArray(candidateReplies)
        ? candidateReplies[Math.floor(Math.random() * candidateReplies.length)]
        : candidateReplies;
      sendMessage(activeConv.id, randomReply, partnerId);
    }, 1400);
  };

  const filteredConversations = conversations.filter((c) =>
    (c.participantName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If user has no active conversations, display the rich empty state
  if (conversations.length === 0) {
    return (
      <div className="container-wide messages-page-wrapper">
        <div className="messages-empty-state-box animate-fade-in">
          <div className="messages-empty-icon-ring">
            <MessageCircle size={36} strokeWidth={1.75} />
          </div>
          <h2 className="messages-empty-title">No Messages Yet</h2>
          <p className="messages-empty-desc">
            Your conversations will appear here automatically when you express interest or connect with verified Telugu brides and grooms.
          </p>
          <div className="messages-empty-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/discover')}
            >
              <Search size={16} />
              <span>Discover All Profiles</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide messages-page-wrapper">
      <div className="messages-container animate-fade-in">
        {/* Left Conversations Sidebar */}
        <div className={`conversations-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
          <div className="conversations-header">
            <div className="conversations-header-title-row">
              <h2 className="conversations-header-title">Messages and Chats</h2>
              <span className="conversations-count-badge">
                {conversations.length} {conversations.length === 1 ? 'Chat' : 'Chats'}
              </span>
            </div>

            <div className="conversations-search">
              <Search size={15} className="conversations-search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="conversations-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <ul className="conversations-list">
            {filteredConversations.length === 0 ? (
              <li style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {searchQuery
                  ? `No matches found for "${searchQuery}"`
                  : "No active conversations yet. Visit member profiles to start chatting!"}
              </li>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const avatar =
                  conv.participantPhoto ||
                  (conv.participantGender === 'male'
                    ? '/assets/profiles/groom_varma.jpg'
                    : '/assets/profiles/bride_sravani.jpg');

                return (
                  <li
                    key={conv.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setShowMobileChat(true);
                      navigate(`/messages?chat=${conv.id}`, { replace: true });
                    }}
                  >
                    <div
                      className="conv-avatar-wrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhoto({
                          photo: avatar,
                          name: conv.participantName,
                          profession: conv.participantProfession
                        });
                      }}
                      title="Click to view full profile photo"
                    >
                      <img
                        src={avatar}
                        alt={conv.participantName}
                        className="conv-avatar-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/profiles/bride_sravani.jpg';
                        }}
                      />
                      {conv.isOnline && <span className="conv-online-dot" />}
                    </div>

                    <div className="conv-info">
                      <div className="conv-top-row">
                        <span className="conv-name">{conv.participantName}</span>
                        <span className="conv-time">{conv.lastMessageTime || 'Just now'}</span>
                      </div>
                      <div className="conv-snippet">{conv.lastMessage}</div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Right Active Chat Window */}
        <div className={`chat-window ${!showMobileChat ? 'mobile-hidden' : ''}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-user">
                  <button
                    type="button"
                    className="chat-back-btn"
                    onClick={() => setShowMobileChat(false)}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <img
                    src={
                      activeConv.participantPhoto ||
                      (activeConv.participantGender === 'male'
                        ? '/assets/profiles/groom_varma.jpg'
                        : '/assets/profiles/bride_sravani.jpg')
                    }
                    alt={activeConv.participantName}
                    className="chat-header-avatar"
                    onClick={() => setViewingPhoto({
                      photo: activeConv.participantPhoto || (activeConv.participantGender === 'male' ? '/assets/profiles/groom_varma.jpg' : '/assets/profiles/bride_sravani.jpg'),
                      name: activeConv.participantName,
                      profession: activeConv.participantProfession
                    })}
                    title="Click to view full profile photo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/profiles/bride_sravani.jpg';
                    }}
                  />

                  <div className="chat-header-details">
                    <div className="chat-header-name-row">
                      <h3 className="chat-header-name">{activeConv.participantName}</h3>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                    <div className="chat-header-meta">
                      {activeConv.participantProfession || 'Professional'} • {activeConv.isOnline ? 'Online now' : 'Active recently'}
                    </div>
                  </div>
                </div>

                <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  <Link
                    to={`/profile/${activeConv.participantId}`}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={14} />
                    <span>Bio-Data</span>
                  </Link>

                  {/* 3-Dots More Options Menu */}
                  <div className="chat-options-menu-wrapper" ref={optionsMenuRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`chat-header-options-btn ${showOptionsMenu ? 'active' : ''}`}
                      onClick={() => setShowOptionsMenu((prev) => !prev)}
                      title="Chat and Profile Options"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showOptionsMenu && (
                      <div className="chat-options-popover animate-scale-up">
                        <button
                          type="button"
                          className="chat-popover-item"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            setShowClearConfirm(true);
                          }}
                        >
                          <RotateCcw size={15} className="popover-icon clear" />
                          <span>Clear Chat History</span>
                        </button>

                        <button
                          type="button"
                          className="chat-popover-item danger"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 size={15} className="popover-icon delete" />
                          <span>Delete Profile / Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Encrypted Security Notice Banner */}
              <div className="chat-security-banner">
                <Lock size={13} />
                <span>End-to-End Encrypted Matrimonial Chat · Privacy Protected</span>
              </div>

              {/* Messages Body with WhatsApp Style Separated Bubbles */}
              <div className="chat-messages-scroll" ref={chatScrollRef}>
                {(!activeConv.messages || activeConv.messages.length === 0) ? (
                  <div
                    className="chat-empty-thread-notice animate-fade-in"
                    style={{
                      margin: 'auto',
                      textAlign: 'center',
                      padding: '2.5rem 1.5rem',
                      maxWidth: '380px'
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(144, 27, 44, 0.08)',
                        color: 'var(--primary-800, #7A1428)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.85rem'
                      }}
                    >
                      <RotateCcw size={22} />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #29252A)', margin: '0 0 0.35rem' }}>
                      Chat History Cleared
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #6B6368)', margin: 0, lineHeight: 1.5 }}>
                      Messages have been cleared. Send a greeting or pick a suggestion below to restart conversation with {activeConv.participantName}.
                    </p>
                  </div>
                ) : (
                  activeConv.messages.map((msg) => {
                  const partnerId = activeConv.participantId;
                  const isCandidate =
                    msg.senderId === partnerId ||
                    msg.senderId === 'candidate' ||
                    msg.senderId === 'TB-1007' ||
                    msg.senderId === 'TB-1005';

                  const isMe = !isCandidate;

                  return (
                    <div
                      key={msg.id}
                      className={`message-bubble-wrapper ${isMe ? 'sent' : 'received'}`}
                    >
                      <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                        {/* Render Rich Attachment if present */}
                        {msg.attachment && (
                          <div className={`msg-attachment-box ${msg.attachment.type}`}>
                            {msg.attachment.type === 'document' && (
                              <div className="msg-doc-preview">
                                <div className="msg-doc-icon-frame">
                                  <FileText size={20} />
                                </div>
                                <div className="msg-doc-meta">
                                  <span className="msg-doc-name">{msg.attachment.name || 'BioData.pdf'}</span>
                                  <span className="msg-doc-size">{msg.attachment.size || 'PDF Document'}</span>
                                </div>
                                <button
                                  type="button"
                                  className="msg-doc-action-btn"
                                  onClick={() => showToast(`Opening ${msg.attachment.name || 'Bio-Data Document'}`, 'info')}
                                  title="View Document"
                                  aria-label="View Document"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            )}

                            {msg.attachment.type === 'image' && (
                              <div className="msg-img-preview">
                                <img
                                  src={msg.attachment.previewUrl || '/assets/profiles/bride_sravani.jpg'}
                                  alt={msg.attachment.name || 'Shared Photo'}
                                  className="msg-img-thumbnail"
                                />
                                {msg.attachment.name && (
                                  <div className="msg-img-caption">{msg.attachment.name}</div>
                                )}
                              </div>
                            )}

                            {msg.attachment.type === 'horoscope' && (
                              <div className="msg-horoscope-preview">
                                <div className="msg-horoscope-title-row">
                                  <Compass size={17} />
                                  <span>{msg.attachment.name || 'Vedic Horoscope Match'}</span>
                                </div>
                                <p className="msg-horoscope-desc">
                                  {msg.attachment.details || '32/36 Gunas Vedic Compatibility Score Verified'}
                                </p>
                              </div>
                            )}

                            {msg.attachment.type === 'contact' && (
                              <div className="msg-contact-preview">
                                <div className="msg-contact-title-row">
                                  <Phone size={16} />
                                  <span>{msg.attachment.name || 'Family Contact Details'}</span>
                                </div>
                                <p className="msg-contact-phone">
                                  {msg.attachment.phone || '+91 98765 43210'}
                                </p>
                              </div>
                            )}

                            {msg.attachment.type === 'audio' && (
                              <div className="msg-audio-preview">
                                <button
                                  type="button"
                                  className="msg-audio-play-btn"
                                  onClick={() => showToast("Playing audio note...", "info")}
                                  aria-label="Play Voice Note"
                                >
                                  <Play size={13} fill="currentColor" />
                                </button>
                                <div className="msg-audio-waveform">
                                  <span className="wave-bar w-1"></span>
                                  <span className="wave-bar w-2"></span>
                                  <span className="wave-bar w-3"></span>
                                  <span className="wave-bar w-4"></span>
                                  <span className="wave-bar w-5"></span>
                                  <span className="wave-bar w-3"></span>
                                  <span className="wave-bar w-2"></span>
                                  <span className="wave-bar w-4"></span>
                                  <span className="wave-bar w-5"></span>
                                  <span className="wave-bar w-2"></span>
                                </div>
                                <span className="msg-audio-time">{msg.attachment.duration || '0:06'}</span>
                                <Volume2 size={14} className="msg-audio-icon" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message Text Content */}
                        {msg.text && <div className="msg-text-body">{msg.text}</div>}
                      </div>
                      <div className="message-time-stamp">
                        <span>{msg.time || 'Just now'}</span>
                        {isMe && <CheckCheck size={13} color="#E8C872" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                }))}
              </div>

              {/* Quick Suggestions Bar with Left/Right Arrows & Fast Smooth Keyboard Navigation */}
              <div
                className="chat-icebreakers-wrapper"
                tabIndex={0}
                role="region"
                aria-label="Quick suggestion messages. Use Left and Right arrow keys to scroll."
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (icebreakersRef.current) {
                      if (e.repeat) {
                        icebreakersRef.current.scrollLeft -= 35;
                      } else {
                        icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                      }
                    }
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (icebreakersRef.current) {
                      if (e.repeat) {
                        icebreakersRef.current.scrollLeft += 35;
                      } else {
                        icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                      }
                    }
                  }
                }}
              >
                <button
                  type="button"
                  className="icebreaker-scroll-arrow left"
                  onClick={() => {
                    if (icebreakersRef.current) {
                      icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft -= 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                        }
                      }
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft += 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                        }
                      }
                    }
                  }}
                  title="Scroll suggestions left (Left Arrow key)"
                  aria-label="Scroll suggestions left"
                >
                  <ChevronLeft size={16} />
                </button>

                <div
                  className="chat-icebreakers-bar"
                  ref={icebreakersRef}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft -= 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                        }
                      }
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft += 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                        }
                      }
                    }
                  }}
                >
                  {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="chat-icebreaker-chip"
                      onClick={() => handleQuickChip(suggestion)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          if (icebreakersRef.current) {
                            if (e.repeat) {
                              icebreakersRef.current.scrollLeft -= 35;
                            } else {
                              icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                              const prev = e.currentTarget.previousElementSibling;
                              if (prev && prev.focus) prev.focus();
                            }
                          }
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          if (icebreakersRef.current) {
                            if (e.repeat) {
                              icebreakersRef.current.scrollLeft += 35;
                            } else {
                              icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                              const next = e.currentTarget.nextElementSibling;
                              if (next && next.focus) next.focus();
                            }
                          }
                        }
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="icebreaker-scroll-arrow right"
                  onClick={() => {
                    if (icebreakersRef.current) {
                      icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft -= 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: -240, behavior: 'smooth' });
                        }
                      }
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      if (icebreakersRef.current) {
                        if (e.repeat) {
                          icebreakersRef.current.scrollLeft += 35;
                        } else {
                          icebreakersRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                        }
                      }
                    }
                  }}
                  title="Scroll suggestions right (Right Arrow key)"
                  aria-label="Scroll suggestions right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* WhatsApp Style Messaging Input Bar Container */}
              <div className="chat-input-bar-container">
                {/* Pending Attachment Preview Strip */}
                {pendingAttachment && (
                  <div className="chat-pending-attachment-strip animate-slide-up">
                    <div className="pending-attachment-pill">
                      {pendingAttachment.type === 'document' && <FileText size={15} className="pending-att-icon doc" />}
                      {pendingAttachment.type === 'image' && <ImageIcon size={15} className="pending-att-icon img" />}
                      {pendingAttachment.type === 'horoscope' && <Compass size={15} className="pending-att-icon astro" />}
                      {pendingAttachment.type === 'contact' && <Phone size={15} className="pending-att-icon phone" />}
                      <span className="pending-att-name">{pendingAttachment.name}</span>
                      {pendingAttachment.size && <span className="pending-att-size">({pendingAttachment.size})</span>}
                      <button
                        type="button"
                        className="pending-att-remove-btn"
                        onClick={() => setPendingAttachment(null)}
                        title="Remove attachment"
                        aria-label="Remove attachment"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="chat-emoji-picker-popover animate-scale-up" ref={emojiPickerRef}>
                    <div className="emoji-picker-header">
                      <span className="emoji-picker-title">Matrimonial Emojis and Expressions</span>
                      <button
                        type="button"
                        className="emoji-picker-close-btn"
                        onClick={() => setShowEmojiPicker(false)}
                        aria-label="Close emoji picker"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="emoji-picker-tabs">
                      {Object.entries(EMOJI_CATEGORIES).map(([catKey, cat]) => (
                        <button
                          key={catKey}
                          type="button"
                          className={`emoji-tab-btn ${activeEmojiTab === catKey ? 'active' : ''}`}
                          onClick={() => setActiveEmojiTab(catKey)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="emoji-picker-grid">
                      {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="emoji-item-btn"
                          onClick={() => handleInsertEmoji(emoji)}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachment Options Popover */}
                {showAttachMenu && (
                  <div className="chat-attach-menu-popover animate-scale-up" ref={attachMenuRef}>
                    <div className="attach-menu-item" onClick={() => docInputRef.current?.click()}>
                      <div className="attach-menu-icon-frame doc-gradient">
                        <FileText size={17} color="#FFFFFF" />
                      </div>
                      <div className="attach-menu-text">
                        <span className="attach-menu-label">Bio-Data / Document</span>
                        <span className="attach-menu-hint">Share PDF, Word Bio-Data</span>
                      </div>
                    </div>

                    <div className="attach-menu-item" onClick={() => imgInputRef.current?.click()}>
                      <div className="attach-menu-icon-frame img-gradient">
                        <ImageIcon size={17} color="#FFFFFF" />
                      </div>
                      <div className="attach-menu-text">
                        <span className="attach-menu-label">Photos and Gallery</span>
                        <span className="attach-menu-hint">Family and candidate photos</span>
                      </div>
                    </div>

                    <div className="attach-menu-item" onClick={handleAttachHoroscope}>
                      <div className="attach-menu-icon-frame astro-gradient">
                        <Compass size={17} color="#FFFFFF" />
                      </div>
                      <div className="attach-menu-text">
                        <span className="attach-menu-label">Kundali and Horoscope</span>
                        <span className="attach-menu-hint">Vedic astrological chart</span>
                      </div>
                    </div>

                    <div className="attach-menu-item" onClick={handleAttachContact}>
                      <div className="attach-menu-icon-frame contact-gradient">
                        <Phone size={17} color="#FFFFFF" />
                      </div>
                      <div className="attach-menu-text">
                        <span className="attach-menu-label">Contact Details</span>
                        <span className="attach-menu-hint">Verified phone and details</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden File Inputs for real document/image uploads */}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'document')}
                />
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'image')}
                />

                {/* Voice Recording Mode or Standard Input Form */}
                {isRecording ? (
                  <div className="chat-voice-recording-bar animate-fade-in">
                    <div className="recording-indicator">
                      <span className="recording-dot"></span>
                      <span className="recording-label">Recording Voice Note... 0:0{recordingTime}</span>
                    </div>
                    <div className="recording-actions">
                      <button
                        type="button"
                        className="recording-cancel-btn"
                        onClick={handleCancelRecording}
                        title="Cancel recording"
                      >
                        <X size={15} />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        className="recording-send-btn"
                        onClick={handleSendRecording}
                        title="Send voice note"
                      >
                        <Send size={14} />
                        <span>Send Voice Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="chat-input-bar" onSubmit={handleSend}>
                    {/* Left Action Icons: Emojis and Attachments */}
                    <div className="chat-input-left-actions">
                      <button
                        ref={emojiBtnRef}
                        type="button"
                        className={`chat-action-icon-btn ${showEmojiPicker ? 'active' : ''}`}
                        onClick={() => {
                          setShowEmojiPicker((prev) => !prev);
                          setShowAttachMenu(false);
                        }}
                        title="Insert Emojis"
                        aria-label="Insert Emojis"
                      >
                        <Smile size={20} />
                      </button>

                      <button
                        ref={attachBtnRef}
                        type="button"
                        className={`chat-action-icon-btn ${showAttachMenu ? 'active' : ''}`}
                        onClick={() => {
                          setShowAttachMenu((prev) => !prev);
                          setShowEmojiPicker(false);
                        }}
                        title="Share Files, Bio-Data or Photos"
                        aria-label="Attach File"
                      >
                        <Paperclip size={20} />
                      </button>
                    </div>

                    {/* Main Message Text Input Field */}
                    <input
                      ref={inputRef}
                      type="text"
                      className="chat-input-field"
                      placeholder="Type a polite matrimonial message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />

                    {/* Right Action Icons: Mic or Send Button */}
                    <div className="chat-input-right-actions">
                      {!inputText.trim() && !pendingAttachment ? (
                        <button
                          type="button"
                          className="chat-action-icon-btn mic-btn"
                          onClick={handleStartRecording}
                          title="Record Voice Note"
                          aria-label="Record Voice Note"
                        >
                          <Mic size={20} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="chat-send-btn"
                          title="Send Message"
                          aria-label="Send Message"
                        >
                          <Send size={15} />
                          <span>Send</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              <div className="messages-empty-icon-ring" style={{ margin: '0 auto 1rem' }}>
                <MessageCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Select a conversation to start chatting
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Express interest to verified profiles to begin real-time messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Profile Photo Lightbox Modal */}
      {viewingPhoto && (
        <div
          className="profile-photo-lightbox-backdrop animate-fade-in"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="profile-photo-lightbox-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-user-info">
                <h4 className="lightbox-name">{viewingPhoto.name}</h4>
                {viewingPhoto.profession && (
                  <span className="lightbox-profession">{viewingPhoto.profession}</span>
                )}
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setViewingPhoto(null)}
                aria-label="Close profile photo"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-image-container">
              <img
                src={viewingPhoto.photo}
                alt={viewingPhoto.name}
                className="lightbox-full-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/profiles/bride_sravani.jpg';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat History Confirmation Modal */}
      {showClearConfirm && activeConv && (
        <div
          className="chat-confirm-backdrop animate-fade-in"
          onClick={() => setShowClearConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-chat-title"
        >
          <div className="chat-confirm-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="chat-confirm-header">
              <div className="chat-confirm-icon-box clear">
                <RotateCcw size={20} />
              </div>
              <h4 id="clear-chat-title" className="chat-confirm-title">Clear Chat History?</h4>
            </div>
            <div className="chat-confirm-body">
              Are you sure you want to clear all messages with <strong>{activeConv.participantName}</strong>? The profile will remain in your active conversations list.
            </div>
            <div className="chat-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmClear}
                autoFocus
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile / Conversation Confirmation Modal */}
      {showDeleteConfirm && activeConv && (
        <div
          className="chat-confirm-backdrop animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-conv-title"
        >
          <div className="chat-confirm-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="chat-confirm-header">
              <div className="chat-confirm-icon-box delete">
                <Trash2 size={20} />
              </div>
              <h4 id="delete-conv-title" className="chat-confirm-title">Delete Profile / Chat?</h4>
            </div>
            <div className="chat-confirm-body">
              Are you sure you want to delete the conversation and remove <strong>{activeConv.participantName}</strong> from your messaging inbox? The profile will be reset so you can reconnect fresh later if you choose.
            </div>
            <div className="chat-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}
                autoFocus
              >
                Delete Profile / Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
