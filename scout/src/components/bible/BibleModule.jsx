import React, { useState } from 'react';

export const BibleModule = () => {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'audio', 'pdf', 'video', 'quiz'
  
  // Interactive Quiz state
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const quizQuestions = [
    {
      id: 'q1',
      question: 'كم عدد أسفار العهد الجديد في الكتاب المقدس؟',
      options: ['27 سفر', '39 سفر', '66 سفر', '46 سفر'],
      correctAnswer: 0,
    },
    {
      id: 'q2',
      question: 'ما هو السفر الذي يسمى سفر تاريخ الكنيسة الأولى والخدمة الكشفية والتبشير؟',
      options: ['سفر الرؤيا', 'سفر أعمال الرسل', 'رسالة رومية', 'إنجيل متى'],
      correctAnswer: 1,
    },
    {
      id: 'q3',
      question: 'من هو التلميذ الذي ركض أولاً إلى القبر الفارغ مع بطرس الرسول؟',
      options: ['يعقوب بن زبدي', 'يوحنا الحبيب', 'توما', 'أندرواس'],
      correctAnswer: 1,
    }
  ];

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score += 10;
      }
    });
    setQuizScore(score);
  };

  const bibleResources = [
    {
      id: 'b1',
      title: 'دراسة وتأملات في سفر أعمال الرسل (العهد الجديد)',
      type: 'pdf',
      categoryName: 'ملف PDF',
      size: '5.2 MB',
      date: '2026-09-01',
      description: 'شرح وتأملات روحية للقطاعات الكشفية مع أسئلة مسابقة وتدريبات أسبوعية.',
      icon: 'fa-solid fa-file-pdf text-[#8b0000]',
    },
    {
      id: 'b2',
      title: 'تسجيل صوتي: دراسات الكتاب المقدس ومفهوم الأمانة في الخدمة',
      type: 'audio',
      categoryName: 'تسجيل صوتي Audio',
      size: '18 MB',
      date: '2026-09-10',
      description: 'محاضرة روحية بصوت القمص يوحنا عن حياة التكريس والأمانة في الكشافة.',
      icon: 'fa-solid fa-file-audio text-[#7e5713]',
    },
    {
      id: 'b3',
      title: 'فيديو توضيحي: خريطة رحلات ماربولس الرسول والتبشير',
      type: 'video',
      categoryName: 'فيديو شرح',
      size: '80 MB',
      date: '2026-09-15',
      description: 'شرح تفاعلي بالرسوم المتحركة لرحلات القديس بولس الرسول التبشيرية.',
      icon: 'fa-solid fa-circle-play text-[#8b0000]',
    }
  ];

  const filteredResources = activeCategory === 'all'
    ? bibleResources
    : bibleResources.filter(r => r.type === activeCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">menu_book</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">المكتبة الروحية والتأملات والمسابقات</h1>
            </div>
            <p className="text-xs text-[#5a403c] mt-1 font-bold">
              تسجيلات صوتية، ملفات PDF، فيديوهات شرح، ومسابقات تفاعلية
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-xs font-bold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition ${activeCategory === 'all' ? 'bg-[#8b0000] text-white font-black shadow' : 'text-[#5a403c] hover:bg-[#e5e2dd]'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveCategory('pdf')}
            className={`px-3 py-1.5 rounded-xl transition ${activeCategory === 'pdf' ? 'bg-[#8b0000] text-white font-black shadow' : 'text-[#5a403c] hover:bg-[#e5e2dd]'}`}
          >
            PDF
          </button>
          <button
            onClick={() => setActiveCategory('audio')}
            className={`px-3 py-1.5 rounded-xl transition ${activeCategory === 'audio' ? 'bg-[#8b0000] text-white font-black shadow' : 'text-[#5a403c] hover:bg-[#e5e2dd]'}`}
          >
            صوتيات
          </button>
          <button
            onClick={() => setActiveCategory('video')}
            className={`px-3 py-1.5 rounded-xl transition ${activeCategory === 'video' ? 'bg-[#8b0000] text-white font-black shadow' : 'text-[#5a403c] hover:bg-[#e5e2dd]'}`}
          >
            فيديوهات
          </button>
          <button
            onClick={() => setActiveCategory('quiz')}
            className={`px-3 py-1.5 rounded-xl transition ${activeCategory === 'quiz' ? 'bg-[#8b0000] text-white font-black shadow' : 'text-[#5a403c] hover:bg-[#e5e2dd]'}`}
          >
            مسابقات
          </button>
        </div>
      </div>

      {activeCategory !== 'quiz' ? (
        /* Resources List matching Website Theme */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm hover:border-[#8b0000] transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffddb1] text-[#7e5713] flex items-center justify-center text-lg shadow-sm">
                    <i className={res.icon}></i>
                  </div>
                  <span className="text-[10px] bg-[#f6f3ee] border border-[#e5e2dd] text-[#7e5713] px-2.5 py-1 rounded-full font-bold">
                    {res.categoryName} ({res.size})
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#1c1c19] leading-snug">{res.title}</h3>
                <p className="text-xs text-[#5a403c] leading-relaxed">{res.description}</p>
              </div>

              {/* Action Media Preview / Download */}
              <div className="pt-3 border-t border-[#f0ede9] flex items-center justify-between">
                <span className="text-[11px] text-[#8e706b] font-bold"><i className="fa-regular fa-calendar ml-1"></i>{res.date}</span>
                <button
                  onClick={() => alert(`جاري قراءة أو فتح ملف (${res.title})...`)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <i className="fa-solid fa-circle-play"></i>
                  <span>عرض المحتوى</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Competition Quiz Engine matching Website Theme */
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-[#e5e2dd] shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-amber-300 flex items-center justify-center mx-auto text-2xl shadow-lg">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h3 className="text-lg font-black text-[#610000]">مسابقة الكتاب المقدس الأسبوعية الكشفية</h3>
            <p className="text-xs text-[#5a403c]">أجب عن الأسئلة واحصل على النقاط التنافسية لقطاعك!</p>
          </div>

          <form onSubmit={handleQuizSubmit} className="space-y-6">
            {quizQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                <h4 className="text-xs font-extrabold text-[#610000] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#8b0000] text-white flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  {q.question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        selectedAnswers[q.id] === optIdx
                          ? 'bg-[#ffddb1] text-[#291800] border-[#7e5713] font-black shadow-sm'
                          : 'bg-white border-[#e5e2dd] text-[#5a403c] hover:bg-[#f6f3ee]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={selectedAnswers[q.id] === optIdx}
                        onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                        className="accent-[#8b0000]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-lg transition"
            >
              إرسال الإجابات وحساب النتيجة
            </button>
          </form>

          {quizScore !== null && (
            <div className="p-6 rounded-2xl bg-[#ffddb1] border border-[#7e5713]/30 text-center space-y-2 animate-in fade-in">
              <span className="text-3xl font-black text-[#8b0000] font-mono block">{quizScore} / 30 نقطة</span>
              <p className="text-xs font-bold text-[#291800]">
                {quizScore === 30 ? 'ممتاز! إجابة كاملة 100%' : 'أحسنت! إجابات جيدة جداً، واصل القراءة والمتابعة.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
