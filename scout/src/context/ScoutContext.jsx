import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_PRICES,
  INITIAL_PRICE_LIST_ITEMS,
  INITIAL_PROMO_CODES,
  SECTORS,
  SECTOR_HEAD_USERS,
  FESTIVAL_LEADER_USER,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_MEMBERS,
  INITIAL_VISITATIONS,
  INITIAL_CURRICULUM,
  INITIAL_MEMORIES,
  INITIAL_MESSAGES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SECTOR_PROGRAMS,
  INITIAL_ROVERS_MEETING,
  INITIAL_FESTIVAL_PLAN,
  INITIAL_VISITATION_ASSIGNMENTS,
  INITIAL_SECTOR_MEETINGS,
  INITIAL_USER_ACCOUNTS,
} from '../data/initialData';

const ScoutContext = createContext();

export const calculateAutoScoutYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (8 = September)
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};

export const ScoutProvider = ({ children }) => {
  // Database of user accounts (credentials & roles, password: 12345 for all)
  const [userAccounts, setUserAccounts] = useState(() => {
    const saved = localStorage.getItem('scout_user_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('scout_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  // Current user role & profile state
  // Roles: 'admin', 'sector_head', 'sub_officer', 'leader', 'parent', 'child', 'guest'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('scout_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS[0]; // Admin by default
  });

  // Scout Year State (Auto-calculated every September or manually overridden by Admin)
  const [isAutoScoutYear, setIsAutoScoutYear] = useState(() => {
    return !localStorage.getItem('scout_year_override');
  });

  const [scoutYear, setScoutYearState] = useState(() => {
    const override = localStorage.getItem('scout_year_override');
    return override || calculateAutoScoutYear();
  });

  const updateScoutYear = (newYear, isAuto = false) => {
    if (isAuto || !newYear) {
      localStorage.removeItem('scout_year_override');
      const autoY = calculateAutoScoutYear();
      setScoutYearState(autoY);
      setIsAutoScoutYear(true);
      logActivity(`إعادة ضبط السنة الكشفية للتحديث التلقائي (${autoY})`);
    } else {
      localStorage.setItem('scout_year_override', newYear);
      setScoutYearState(newYear);
      setIsAutoScoutYear(false);
      logActivity(`تعديل السنة الكشفية يدويًا إلى: ${newYear}`);
    }
  };

  // State persistence
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('scout_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('scout_prices');
    return saved ? JSON.parse(saved) : DEFAULT_PRICES;
  });

  const [priceList, setPriceList] = useState(() => {
    const saved = localStorage.getItem('scout_price_list');
    return saved ? JSON.parse(saved) : INITIAL_PRICE_LIST_ITEMS;
  });

  const [promoCodes, setPromoCodes] = useState(() => {
    const saved = localStorage.getItem('scout_promo_codes');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
  });

  const [visitations, setVisitations] = useState(() => {
    const saved = localStorage.getItem('scout_visitations');
    return saved ? JSON.parse(saved) : INITIAL_VISITATIONS;
  });

  const [curriculum, setCurriculum] = useState(() => {
    const saved = localStorage.getItem('scout_curriculum');
    return saved ? JSON.parse(saved) : INITIAL_CURRICULUM;
  });

  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('scout_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('scout_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('scout_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [excuses, setExcuses] = useState(() => {
    const saved = localStorage.getItem('scout_excuses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ex1',
        leaderName: 'القائد مينا نصر',
        sector: 'scouts',
        sectorName: 'الكشاف',
        date: '2026-09-20',
        reason: 'ظروف سفر مفاجئة مع الأسرة',
        status: 'accepted', // 'pending', 'accepted', 'rejected'
        statusLabel: 'غائب بعذر',
      },
      {
        id: 'ex2',
        leaderName: 'الجوالة مارينا عاطف',
        sector: 'rovers',
        sectorName: 'الجوالة',
        date: '2026-09-22',
        reason: 'حضور محاضرة بالكلية',
        status: 'pending',
        statusLabel: 'قيد المراجعة',
      }
    ];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('scout_subscriptions');
    const todayStr = new Date().toISOString().substring(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
    const threeDaysAgoStr = new Date(Date.now() - 3 * 86400000).toISOString().substring(0, 10);

    return saved ? JSON.parse(saved) : [
      {
        id: 'sub-receipt-501',
        memberCode: '1004',
        memberName: 'جورج سامي رزق',
        sectorName: 'الكشاف المتقدم',
        date: todayStr,
        items: ['اشتراك سنوي', 'زي كشفي'],
        subtotal: 500,
        discountAmount: 70,
        total: 430,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-502',
        memberCode: '1002',
        memberName: 'كيرلس أسامة نجيب',
        sectorName: 'الكشاف',
        date: todayStr,
        items: ['حفلة الوعد الكبرى'],
        subtotal: 150,
        discountAmount: 0,
        total: 150,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-503',
        memberCode: '1006',
        memberName: 'يوسف كيرلس ملاك',
        sectorName: 'كشاف متقدم',
        date: todayStr,
        items: ['اشتراك سنوي', 'الوجبة الخشبية', 'اشتراك مهرجان الكرازة'],
        subtotal: 3500,
        discountAmount: 550,
        total: 2950,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-504',
        memberCode: '1001',
        memberName: 'ملاخى يوسف سامي',
        sectorName: 'الأشبال',
        date: todayStr,
        items: ['اشتراك سنوي كشفي', 'منديل حريري'],
        subtotal: 900,
        discountAmount: 180,
        total: 720,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-505',
        memberCode: '1003',
        memberName: 'دانيال مينا كامل',
        sectorName: 'الكشاف',
        date: yesterdayStr,
        items: ['اشتراك مهرجان الكرازة'],
        subtotal: 800,
        discountAmount: 0,
        total: 800,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-506',
        memberCode: '1005',
        memberName: 'بيشوي عاطف نصحي',
        sectorName: 'الجوالة',
        date: yesterdayStr,
        items: ['اشتراك سنوي كشفي'],
        subtotal: 350,
        discountAmount: 0,
        total: 350,
        officerName: 'مسؤول الاشتراكات',
      },
      {
        id: 'sub-receipt-507',
        memberCode: '1007',
        memberName: 'يستينا عماد مجدي',
        sectorName: 'المرشدات',
        date: threeDaysAgoStr,
        items: ['حفل الوعد والترقية', 'شارات'],
        subtotal: 600,
        discountAmount: 100,
        total: 500,
        officerName: 'مسؤول الاشتراكات',
      }
    ];
  });

  const [attendanceScanLogs, setAttendanceScanLogs] = useState(() => {
    const saved = localStorage.getItem('scout_attendance_scan_logs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });

  const [sectorPrograms, setSectorPrograms] = useState(() => {
    const saved = localStorage.getItem('scout_sector_programs');
    return saved ? JSON.parse(saved) : INITIAL_SECTOR_PROGRAMS;
  });

  const [roversMeeting, setRoversMeeting] = useState(() => {
    const saved = localStorage.getItem('scout_rovers_meeting');
    return saved ? JSON.parse(saved) : INITIAL_ROVERS_MEETING;
  });

  const [festivalPlan, setFestivalPlan] = useState(() => {
    const saved = localStorage.getItem('scout_festival_plan');
    return saved ? JSON.parse(saved) : INITIAL_FESTIVAL_PLAN;
  });

  const [visitationAssignments, setVisitationAssignments] = useState(() => {
    const saved = localStorage.getItem('scout_visitation_assignments');
    return saved ? JSON.parse(saved) : INITIAL_VISITATION_ASSIGNMENTS;
  });

  const [sectorMeetings, setSectorMeetings] = useState(() => {
    const saved = localStorage.getItem('scout_sector_meetings');
    return saved ? JSON.parse(saved) : INITIAL_SECTOR_MEETINGS;
  });

  useEffect(() => {
    localStorage.setItem('scout_attendance_scan_logs', JSON.stringify(attendanceScanLogs));
  }, [attendanceScanLogs]);

  useEffect(() => {
    localStorage.setItem('scout_sector_programs', JSON.stringify(sectorPrograms));
  }, [sectorPrograms]);

  useEffect(() => {
    localStorage.setItem('scout_rovers_meeting', JSON.stringify(roversMeeting));
  }, [roversMeeting]);

  useEffect(() => {
    localStorage.setItem('scout_festival_plan', JSON.stringify(festivalPlan));
  }, [festivalPlan]);

  useEffect(() => {
    localStorage.setItem('scout_visitation_assignments', JSON.stringify(visitationAssignments));
  }, [visitationAssignments]);

  useEffect(() => {
    localStorage.setItem('scout_sector_meetings', JSON.stringify(sectorMeetings));
  }, [sectorMeetings]);

  const updateSectorMeeting = (id, updatedData) => {
    setSectorMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    logActivity(`تحديث تفاصيل اجتماع القطاع (#${id})`);
  };

  const addSectorMeeting = (newMeeting) => {
    const created = {
      ...newMeeting,
      id: 'meet-' + Date.now(),
    };
    setSectorMeetings(prev => [created, ...prev]);
    logActivity(`إضافة خطة اجتماع لقطاع (${newMeeting.sectorName})`);
  };

  const deleteSectorMeeting = (id) => {
    setSectorMeetings(prev => prev.filter(m => m.id !== id));
    logActivity(`حذف خطة اجتماع قطاع (#${id})`);
  };

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('scout_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('scout_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('scout_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('scout_price_list', JSON.stringify(priceList));
  }, [priceList]);

  useEffect(() => {
    localStorage.setItem('scout_promo_codes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('scout_visitations', JSON.stringify(visitations));
  }, [visitations]);

  useEffect(() => {
    localStorage.setItem('scout_curriculum', JSON.stringify(curriculum));
  }, [curriculum]);

  useEffect(() => {
    localStorage.setItem('scout_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('scout_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('scout_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('scout_excuses', JSON.stringify(excuses));
  }, [excuses]);

  useEffect(() => {
    localStorage.setItem('scout_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Log Activity Helper
  const logActivity = (actionText) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: 'act_' + Date.now(),
      user: currentUser.name + ` (${currentUser.email || currentUser.role})`,
      role: getRoleTitle(currentUser.role),
      action: actionText,
      time: timestamp,
      ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case 'admin': return 'المدير العام';
      case 'festival_leader': return 'قائد المهرجان';
      case 'sector_head': return 'رئيس قطاع';
      case 'sub_officer': return 'مسؤول اشتراكات';
      case 'leader': return 'قائد / جوال';
      case 'parent': return 'ولي أمر';
      case 'child': return 'عضو كشاف';
      case 'guest': return 'زائر غير مسجل';
      default: return role;
    }
  };

  // Switch Role / Preset Users
  const switchUserRole = (roleType, customData = {}) => {
    let newUser = { role: roleType };

    if (roleType === 'guest') {
      newUser = {
        id: 'guest_user',
        name: 'زائر / غير مسجل',
        role: 'guest',
      };
    } else if (roleType === 'admin') {
      newUser = {
        id: 'admin_1',
        name: 'المدير العام (الأدمن)',
        email: 'admin@scout.org',
        role: 'admin',
        sector: 'all',
        sectorName: 'جميع القطاعات',
      };
    } else if (roleType === 'festival_leader') {
      newUser = FESTIVAL_LEADER_USER;
    } else if (roleType === 'sector_head') {
      const sec = customData.sector;
      const matchedHead = SECTOR_HEAD_USERS.find(h => h.sector === sec || h.id === customData.id);
      newUser = matchedHead || SECTOR_HEAD_USERS.find(h => h.sector === 'cubs') || SECTOR_HEAD_USERS[0];
    } else if (roleType === 'sub_officer') {
      newUser = {
        id: 'sub_1',
        name: 'مسؤول الاشتراكات الخادمة',
        email: 'sub@scout.org',
        role: 'sub_officer',
        sector: 'all',
        sectorName: 'الاشتراكات العامة',
      };
    } else if (roleType === 'leader') {
      newUser = {
        id: 'leader_1',
        name: 'القائد كيرلس جرجس',
        email: 'kerollos@scout.org',
        role: 'leader',
        sector: 'scouts',
        sectorName: 'الكشاف',
        sectorHead: 'رئيس قطاع الكشاف',
        phone: '01234567890',
      };
    } else if (roleType === 'parent') {
      newUser = {
        id: 'parent_1',
        name: 'أستاذ يوسف سامي',
        childName: 'ملاخى يوسف سامي',
        childCode: '1001',
        phone: '01011112222',
        role: 'parent',
      };
    } else if (roleType === 'child') {
      newUser = {
        id: 'm1',
        code: '1001',
        name: 'ملاخى يوسف سامي',
        grade: '4 ابتدائي',
        sector: 'cubs',
        sectorName: 'الأشبال',
        gender: 'ذكر',
        parentPhone: '01011112222',
        role: 'child',
      };
    }

    newUser = { ...newUser, ...customData };
    setCurrentUser(newUser);
    logActivity(`قام بتغيير الدخول إلى حساب: ${getRoleTitle(roleType)} (${newUser.name})`);
  };

  // Login by Email or Code with Password Verification (default password: 12345)
  const loginWithCredentials = (codeOrEmail, password) => {
    const term = (codeOrEmail || '').trim().toLowerCase();

    // 1. Direct match from userAccounts database
    const matched = userAccounts.find(u =>
      (u.email && u.email.toLowerCase() === term) ||
      (u.aliasEmail && u.aliasEmail.toLowerCase() === term) ||
      (u.code && u.code.toLowerCase() === term) ||
      (u.phone && u.phone === term) ||
      (u.name && u.name.toLowerCase() === term)
    );

    if (matched) {
      if (!password || password === matched.password || password === '12345') {
        setCurrentUser(matched);
        logActivity(`تم تسجيل الدخول بنجاح للحساب: ${matched.name} (${matched.email || matched.code})`);
        return { success: true, user: matched };
      } else {
        return { success: false, error: 'كلمة السر غير صحيحة! كلمة السر لجميع الحسابات هي: 12345' };
      }
    }

    // 2. Keyword/Role Fallback match with default 12345
    let roleType = null;
    let customData = {};

    if (term.includes('admin') || term === 'ادمن') roleType = 'admin';
    else if (term.includes('festival') || term.includes('مهرجان')) roleType = 'festival_leader';
    else if (term.includes('sub') || term.includes('اشتراكات')) roleType = 'sub_officer';
    else if (term.includes('sprouts') || term.includes('براعم')) { roleType = 'sector_head'; customData = { sector: 'sprouts' }; }
    else if (term.includes('cubs') || term.includes('أشبال') || term.includes('اشبال')) { roleType = 'sector_head'; customData = { sector: 'cubs' }; }
    else if (term.includes('blossom') || term.includes('زهرات')) { roleType = 'sector_head'; customData = { sector: 'blossoms' }; }
    else if (term.includes('scout') && !term.includes('senior')) { roleType = 'sector_head'; customData = { sector: 'scouts' }; }
    else if (term.includes('guide') || term.includes('مرشدات')) { roleType = 'sector_head'; customData = { sector: 'guides' }; }
    else if (term.includes('senior') || term.includes('متقدم')) { roleType = 'sector_head'; customData = { sector: 'senior_scouts' }; }
    else if (term.includes('ranger') || term.includes('رائدات')) { roleType = 'sector_head'; customData = { sector: 'rangers' }; }
    else if (term.includes('rover') || term.includes('جوالة')) { roleType = 'sector_head'; customData = { sector: 'rovers' }; }
    else if (term.includes('parent') || term.includes('ولي')) roleType = 'parent';
    else if (term.includes('child') || term.includes('كشاف')) roleType = 'child';

    if (roleType && (!password || password === '12345')) {
      switchUserRole(roleType, customData);
      return { success: true, user: currentUser };
    }

    return { success: false, error: 'تعذر العثور على الحساب! تأكد من البريد أو الكود (كلمة السر لجميع الحسابات هي: 12345)' };
  };

  // Logout Function
  const logoutUser = () => {
    const prevName = currentUser?.name || 'المستخدم';
    const guestUser = {
      id: 'guest_user',
      name: 'زائر / غير مسجل',
      role: 'guest',
    };
    setCurrentUser(guestUser);
    localStorage.removeItem('scout_current_user');
    logActivity(`قام بتسجيل الخروج من المنظومة (${prevName})`);
    return true;
  };

  // Automated Annual Progression Logic
  // Automatic update of grade and sector based on age/grade & gender
  const processYearlyProgression = () => {
    setMembers(prevMembers => {
      const updated = prevMembers.map(member => {
        let newGrade = member.grade;
        let newSector = member.sector;
        let newSectorName = member.sectorName;

        // Upgrade grade text
        if (member.grade === '3 ابتدائي') newGrade = '4 ابتدائي';
        else if (member.grade === '4 ابتدائي') newGrade = '5 ابتدائي';
        else if (member.grade === '5 ابتدائي') newGrade = '6 ابتدائي';
        else if (member.grade === '6 ابتدائي') {
          newGrade = '1 إعدادي';
          // Move from Cubs/Blossoms to Scouts/Guides
          if (member.gender === 'ذكر') {
            newSector = 'scouts';
            newSectorName = 'الكشاف';
          } else {
            newSector = 'guides';
            newSectorName = 'المرشدات';
          }
        }
        else if (member.grade === '1 إعدادي') newGrade = '2 إعدادي';
        else if (member.grade === '2 إعدادي') newGrade = '3 إعدادي';
        else if (member.grade === '3 إعدادي') {
          newGrade = '1 ثانوي';
          // Move to Senior Scouts / Rangers
          if (member.gender === 'ذكر') {
            newSector = 'senior_scouts';
            newSectorName = 'كشاف متقدم';
          } else {
            newSector = 'rangers';
            newSectorName = 'الرائدات';
          }
        }
        else if (member.grade === '1 ثانوي') newGrade = '2 ثانوي';
        else if (member.grade === '2 ثانوي') newGrade = '3 ثانوي';
        else if (member.grade === '3 ثانوي') {
          newGrade = '1 جامعة';
          // Move to Rovers
          newSector = 'rovers';
          newSectorName = 'الجوالة';
        }
        else if (member.grade === '1 جامعة') newGrade = '2 جامعة';
        else if (member.grade === '2 جامعة') newGrade = '3 جامعة';
        else if (member.grade === '3 جامعة') newGrade = '4 جامعة';
        else if (member.grade === '4 جامعة') newGrade = 'خريج';

        return {
          ...member,
          grade: newGrade,
          sector: newSector,
          sectorName: newSectorName,
        };
      });

      logActivity('قام بتشغيل عملية الترقية السنوية التلقائية للفرق والقطاعات');
      return updated;
    });
  };

  // Add Member
  const addMember = (newMemberData) => {
    // Sector mapping helper
    let sectorId = 'cubs';
    let sectorName = 'الأشبال';
    const g = newMemberData.grade || '';
    const isMale = newMemberData.gender === 'ذكر';

    if (g.includes('ابتدائي')) {
      sectorId = isMale ? 'cubs' : 'blossoms';
      sectorName = isMale ? 'الأشبال' : 'الزهرات';
    } else if (g.includes('إعدادي')) {
      sectorId = isMale ? 'scouts' : 'guides';
      sectorName = isMale ? 'الكشاف' : 'المرشدات';
    } else if (g.includes('ثانوي')) {
      sectorId = isMale ? 'senior_scouts' : 'rangers';
      sectorName = isMale ? 'كشاف متقدم' : 'الرائدات';
    } else {
      sectorId = 'rovers';
      sectorName = 'الجوالة';
    }

    const memberToSave = {
      id: 'm_' + Date.now(),
      code: newMemberData.code || String(Math.floor(1000 + Math.random() * 9000)),
      name: newMemberData.name,
      grade: newMemberData.grade,
      sector: sectorId,
      sectorName: sectorName,
      gender: newMemberData.gender,
      childPhone: newMemberData.childPhone || '',
      parentPhone: newMemberData.parentPhone,
      buildingNo: newMemberData.buildingNo || '',
      street: newMemberData.street || '',
      addressDetails: newMemberData.addressDetails || '',
      attendanceCount: 0,
      totalSessions: 0,
      isRegistered: true,
    };

    setMembers(prev => [memberToSave, ...prev]);
    logActivity(`قام بإضافة عضو جديد: ${memberToSave.name} (كود: ${memberToSave.code}) في قطاع ${sectorName}`);
    return memberToSave;
  };

  // Update Member Photo
  const updateMemberPhoto = (memberId, avatarUrl) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId || m.code === memberId) {
        return { ...m, avatarUrl };
      }
      return m;
    }));
    logActivity(`تحديث صورة الكارنيه الرقمي للعضو (#${memberId})`);
  };

  // Update Member Full Details (Admin, Sector Head, Sub Officer)
  const updateMemberDetails = (memberId, updatedFields) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId || m.code === memberId) {
        return { ...m, ...updatedFields };
      }
      return m;
    }));
    logActivity(`قام بتعديل بيانات العضو (#${memberId})`);
  };

  // Record Attendance (Manual or QR Code or Fingerprint Excel)
  const markAttendance = (codeList, date = new Date().toISOString().substring(0, 10)) => {
    setMembers(prev => prev.map(m => {
      if (codeList.includes(m.code)) {
        return {
          ...m,
          attendanceCount: m.attendanceCount + 1,
          totalSessions: m.totalSessions + 1,
          lastAttendanceDate: date,
        };
      }
      return {
        ...m,
        totalSessions: m.totalSessions + 1,
      };
    }));

    logActivity(`سجل غياب لـ ${codeList.length} كود بتاريخ ${date}`);
  };

  // Submit Excuse
  const submitExcuse = (excuseData) => {
    const newEx = {
      id: 'ex_' + Date.now(),
      leaderName: currentUser.name,
      sector: currentUser.sector || 'scouts',
      sectorName: currentUser.sectorName || 'الكشاف',
      date: excuseData.date,
      reason: excuseData.reason,
      status: 'pending',
      statusLabel: 'قيد المراجعة',
    };
    setExcuses(prev => [newEx, ...prev]);
    logActivity(`قدم عذر غياب ليوم ${excuseData.date}`);
  };

  // Update Excuse Status (By Sector Head)
  const updateExcuseStatus = (id, status) => {
    setExcuses(prev => prev.map(ex => {
      if (ex.id === id) {
        return {
          ...ex,
          status: status,
          statusLabel: status === 'accepted' ? 'غائب بعذر' : 'غياب بدون عذر',
        };
      }
      return ex;
    }));
    logActivity(`تعديل حالة العذر (${id}) إلى: ${status === 'accepted' ? 'قبول' : 'رفض'}`);
  };

  // Add Subscription Receipt
  const addSubscriptionReceipt = (receiptData) => {
    const newSub = {
      id: 'sub-receipt-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().substring(0, 10),
      officerName: currentUser.name,
      ...receiptData
    };
    setSubscriptions(prev => [newSub, ...prev]);
    logActivity(`إصدار إيصال اشتراك للكود ${receiptData.memberCode} بمبلغ إجمالي ${receiptData.total} ج.م`);
    return newSub;
  };

  // Add Message to Chat
  const addChatMessage = (roomId, text) => {
    const newMsg = {
      id: 'msg_' + Date.now(),
      roomId: roomId,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      date: 'اليوم',
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Add Visitation Log
  const addVisitation = (visitData) => {
    const newVisit = {
      id: 'vis_' + Date.now(),
      leaderName: currentUser.name,
      ...visitData
    };
    setVisitations(prev => [newVisit, ...prev]);
    logActivity(`تسجيل افتقاد جديد للعضو ${visitData.memberName} (${visitData.type})`);
  };

  // Update Prices (Admin)
  const updatePrices = (newPrices) => {
    setPrices(newPrices);
    logActivity('تحديث تسعيرة الاشتراكات والأدوات الكشفية');
  };

  // Price List CRUD Operations (Admin & Subscription/Finance Officers)
  const addPriceListItem = (newItem) => {
    const item = {
      id: 'item_' + Date.now(),
      title: newItem.title,
      price: Number(newItem.price),
      desc: newItem.desc || '',
      category: newItem.category || 'اشتراكات رئيسية',
      icon: newItem.icon || 'sell',
    };
    setPriceList(prev => [...prev, item]);
    logActivity(`إضافة بند جديد في لائحة الأسعار: "${item.title}" بسعر ${item.price} ج.م`);
    return item;
  };

  const updatePriceListItem = (id, updatedFields) => {
    setPriceList(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          price: updatedFields.price !== undefined ? Number(updatedFields.price) : item.price,
        };
      }
      return item;
    }));
    logActivity(`تعديل بيانات أو سعر البند (#${id}) في لائحة الأسعار والتحصيل`);
  };

  const deletePriceListItem = (id) => {
    const itemToDelete = priceList.find(i => i.id === id);
    setPriceList(prev => prev.filter(item => item.id !== id));
    if (itemToDelete) {
      logActivity(`حذف بند من لائحة الأسعار: "${itemToDelete.title}"`);
    }
  };

  // Create Promo Code (Admin)
  const addPromoCode = (code, discountPercent) => {
    const newCode = { code: code.toUpperCase(), discountPercent: Number(discountPercent), active: true };
    setPromoCodes(prev => [newCode, ...prev]);
    logActivity(`توليد كود خصم جديد (${code.toUpperCase()}) بنسبة ${discountPercent}%`);
  };

  const recordScanAttendance = (code, date = new Date().toISOString().substring(0, 10), isFestival = false) => {
    const found = members.find(m => m.code === code || m.id === code);
    if (!found) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dayLabelStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const newLog = {
      id: 'att_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      memberId: found.id,
      memberCode: found.code,
      memberName: found.name,
      grade: found.grade,
      sector: found.sector,
      sectorName: found.sectorName,
      date: date,
      dayLabel: dayLabelStr,
      time: timeStr,
      scannedBy: currentUser.name,
      isFestival: isFestival || currentUser.role === 'festival_leader',
    };

    setAttendanceScanLogs(prev => [newLog, ...prev]);

    // Also update member attendance count
    setMembers(prev => prev.map(m => {
      if (m.id === found.id) {
        return {
          ...m,
          attendanceCount: (m.attendanceCount || 0) + 1,
          totalSessions: (m.totalSessions || 0) + 1,
          lastAttendanceDate: date,
          lastAttendanceTime: timeStr,
        };
      }
      return m;
    }));

    logActivity(`تسجيل حضور ذكي (${isFestival || currentUser.role === 'festival_leader' ? 'مهرجان' : 'خدمة'}) للكشاف: ${found.name} (#${found.code}) الساعة ${timeStr}`);
    return newLog;
  };

  // Detailed Sector Programs CRUD
  const addSectorProgram = (newProg) => {
    const prog = {
      id: 'prog-' + Date.now(),
      status: 'pending',
      ...newProg
    };
    setSectorPrograms(prev => [prog, ...prev]);
    logActivity(`إضافة خطة يوم/معسكر جديد لقطاع ${newProg.sectorName || newProg.sector}`);
    return prog;
  };

  const updateSectorProgram = (id, updatedFields) => {
    setSectorPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    logActivity(`تعديل خطة اليوم الكشفي (#${id})`);
  };

  const deleteSectorProgram = (id) => {
    setSectorPrograms(prev => prev.filter(p => p.id !== id));
    logActivity(`حذف خطة يوم كشفي (#${id})`);
  };

  const approveSectorProgram = (id, status = 'approved') => {
    setSectorPrograms(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    logActivity(`تغيير حالة اعتماد اليوم الكشفي (#${id}) إلى ${status === 'approved' ? 'معتمد' : 'قيد المراجعة'}`);
  };

  // Rovers Standing Meeting & Occasional Events
  const updateRoversMeeting = (meetingData) => {
    setRoversMeeting(prev => ({ ...prev, ...meetingData }));
    logActivity('تحديث الميعاد والترتيبات الثابتة لاجتماع عشيرة الجوالة');
  };

  const addRoversOccasionalEvent = (eventData) => {
    const newEv = { id: 'rov-ev-' + Date.now(), ...eventData };
    setRoversMeeting(prev => ({
      ...prev,
      occasionalEvents: [...(prev.occasionalEvents || []), newEv]
    }));
    logActivity(`إضافة فاعلية استثنائية لعشيرة الجوالة: ${eventData.title}`);
  };

  // Festival Leader Plan
  const updateFestivalPlan = (planData) => {
    setFestivalPlan(prev => ({ ...prev, ...planData }));
    logActivity('تحديث خطة مهرجان الكرازة والأنشطة الكشفية');
  };

  const addFestivalChallenge = (chData) => {
    const newCh = { id: 'fest-ch-' + Date.now(), ...chData };
    setFestivalPlan(prev => ({
      ...prev,
      challenges: [...(prev.challenges || []), newCh]
    }));
    logActivity(`إضافة مسابقة/تحدي جديد بالمهرجان: ${chData.title}`);
  };

  const deleteFestivalChallenge = (id) => {
    setFestivalPlan(prev => ({
      ...prev,
      challenges: (prev.challenges || []).filter(c => c.id !== id)
    }));
    logActivity(`حذف تحدي من خطة المهرجان (#${id})`);
  };

  // Assign visitation task to Leader or Rover
  const assignVisitationTask = (taskData) => {
    const newTask = {
      id: 'assign-' + Date.now(),
      status: 'pending',
      completedDate: null,
      feedback: '',
      giftDelivered: false,
      ...taskData
    };
    setVisitationAssignments(prev => [newTask, ...prev]);
    logActivity(`توزيع وتكليف بافتقاد العضو ${taskData.memberName} للقائد/الجوال (${taskData.assignedToName})`);
    return newTask;
  };

  // Complete visitation task & update member data if phone/address updated
  const completeVisitationTask = (taskId, completionData) => {
    setVisitationAssignments(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed',
          completedDate: new Date().toISOString().substring(0, 10),
          feedback: completionData.feedback || t.feedback,
          visitationType: completionData.visitationType || t.visitationType,
          updatedChildPhone: completionData.updatedChildPhone || t.updatedChildPhone,
          updatedParentPhone: completionData.updatedParentPhone || t.updatedParentPhone,
          updatedAddress: completionData.updatedAddress || t.updatedAddress,
          giftDelivered: completionData.giftDelivered !== undefined ? completionData.giftDelivered : t.giftDelivered,
        };
      }
      return t;
    }));

    // Find assignment to add to main visitations stream
    const targetAssign = visitationAssignments.find(t => t.id === taskId);
    if (targetAssign) {
      addVisitation({
        memberId: targetAssign.memberId,
        memberName: targetAssign.memberName,
        sector: targetAssign.sector,
        sectorName: targetAssign.sectorName,
        type: completionData.visitationType || targetAssign.visitationType,
        date: new Date().toISOString().substring(0, 10),
        notes: completionData.feedback + (completionData.giftDelivered ? ' (تم تسليم الهدية 🎁)' : ''),
        leaderName: targetAssign.assignedToName,
      });

      // Update member lastVisitedDate & contact info
      setMembers(prev => prev.map(m => {
        if (m.id === targetAssign.memberId || m.code === targetAssign.memberCode) {
          return {
            ...m,
            lastVisitedDate: new Date().toISOString().substring(0, 10),
            childPhone: completionData.updatedChildPhone || m.childPhone,
            parentPhone: completionData.updatedParentPhone || m.parentPhone,
            addressDetails: completionData.updatedAddress || m.addressDetails,
          };
        }
        return m;
      }));
    }

    logActivity(`إنجاز مهمة الافتقاد وموافاة الفيدباك للعضو (#${taskId})`);
  };

  return (
    <ScoutContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchUserRole,
      userAccounts,
      loginWithCredentials,
      logoutUser,
      members,
      addMember,
      updateMemberPhoto,
      updateMemberDetails,
      processYearlyProgression,
      markAttendance,
      attendanceScanLogs,
      recordScanAttendance,
      excuses,
      submitExcuse,
      updateExcuseStatus,
      prices,
      updatePrices,
      priceList,
      addPriceListItem,
      updatePriceListItem,
      deletePriceListItem,
      promoCodes,
      addPromoCode,
      subscriptions,
      addSubscriptionReceipt,
      visitations,
      addVisitation,
      visitationAssignments,
      assignVisitationTask,
      completeVisitationTask,
      curriculum,
      memories,
      messages,
      addChatMessage,
      activityLogs,
      logActivity,
      scoutYear,
      isAutoScoutYear,
      updateScoutYear,
      sectorPrograms,
      addSectorProgram,
      updateSectorProgram,
      deleteSectorProgram,
      approveSectorProgram,
      roversMeeting,
      updateRoversMeeting,
      addRoversOccasionalEvent,
      festivalPlan,
      updateFestivalPlan,
      addFestivalChallenge,
      deleteFestivalChallenge,
      sectorMeetings,
      updateSectorMeeting,
      addSectorMeeting,
      deleteSectorMeeting,
      SECTORS,
      SECTOR_HEAD_USERS,
      FESTIVAL_LEADER_USER,
    }}>
      {children}
    </ScoutContext.Provider>
  );
};

export const useScout = () => useContext(ScoutContext);
