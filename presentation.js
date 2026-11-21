// presentation/presentation.js - Bộ điều khiển Keynote Obsidian Cinema (11 Slides + Tranh minh họa đa lớp)
window.PresentationApp = (() => {
  let isInitialized = false;
  let isActiveState = true;
  let currentSlideIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let hudIdleTimer = null;

  // Đồng hồ sân khấu 15 phút (12:00 - 15:00 xanh tối ưu, >= 14:15 cảnh báo đỏ)
  let elapsedSeconds = 0;
  let timerRunning = false;
  let timerInterval = null;

  const SHORT_THESIS = {
    "r3-1": "Chiếm hữu tư nhân tư bản chủ nghĩa tạo ra năm khuyết tật cố hữu mà thị trường tự do không tự chữa lành.",
    "r1-1b": "Kinh tế thị trường là phương tiện chung; định hướng xã hội chủ nghĩa quyết định mục tiêu vì con người.",
    "r2-role": "Đảng định hướng chiến lược; Nhà nước thể chế hóa pháp luật, điều tiết vĩ mô và phòng vệ hội nhập.",
    "r2-b1": "Kinh tế nhà nước giữ vai trò chủ đạo ổn định vĩ mô; kinh tế tư nhân là động lực quan trọng giải phóng sức sản xuất.",
    "r2-b4": "Nhà nước điều tiết vĩ mô và phân phối lại thành quả thông qua mạng lưới an sinh toàn dân.",
    "r2-b5": "Gắn tăng trưởng với công bằng và bảo vệ sinh thái ngay từ đầu, không đợi kinh tế phát triển cao mới chia.",
    "r3-table": "Đối chiếu trực diện sáu tiêu chí bản chất giữa hai mô hình kinh tế thị trường.",
    "r3-3a": "Nhìn thẳng bốn điểm nghẽn thực tiễn trong thời kỳ quá độ để đánh giá khách quan.",
    "r3-3b": "Hoàn thiện đồng bộ thể chế pháp luật, minh bạch nguồn lực và siết chặt kỷ cương quản lý.",
    "r3-verdict": "Đã khắc phục một phần căn bản giới hạn chủ nghĩa tư bản, nhưng chưa hoàn toàn và cần tiếp tục hoàn thiện.",
  };

  // Tranh minh họa vector đa lớp phong phú cho từng slide
  const SLIDE_VISUALS = {
    "r3-1": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <defs>
            <linearGradient id="skyDanger" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4c0519" stop-opacity="0.65"/>
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1"/>
            </linearGradient>
            <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fb7185"/>
              <stop offset="100%" stop-color="#881337"/>
            </linearGradient>
          </defs>
          <rect x="14" y="12" width="432" height="246" rx="18" fill="url(#skyDanger)" stroke="rgba(251,113,133,0.28)"/>
          <!-- Mặt đất & dòng chảy chênh lệch -->
          <path d="M14 218 Q135 196 230 218 T446 212 L446 258 L14 258 Z" fill="rgba(244,63,94,0.16)"/>
          <!-- Tòa tháp độc quyền & ống khói ô nhiễm -->
          <g class="svg-float">
            <rect x="186" y="56" width="88" height="162" rx="8" fill="url(#towerGrad)" stroke="#fda4af" stroke-width="1.5"/>
            <rect x="202" y="74" width="16" height="18" rx="3" fill="#ffe4e6" fill-opacity="0.85"/>
            <rect x="242" y="74" width="16" height="18" rx="3" fill="#ffe4e6" fill-opacity="0.85"/>
            <rect x="202" y="106" width="16" height="18" rx="3" fill="#ffe4e6" fill-opacity="0.85"/>
            <rect x="242" y="106" width="16" height="18" rx="3" fill="#ffe4e6" fill-opacity="0.85"/>
            <circle cx="230" cy="40" r="18" fill="#fbbf24" stroke="#fef3c7" stroke-width="2"/>
            <text x="230" y="45" text-anchor="middle" fill="#78350f" font-size="15" font-weight="900">$</text>
            <!-- Khói thải môi trường -->
            <circle cx="154" cy="76" r="14" fill="rgba(148,163,184,0.28)"/>
            <circle cx="136" cy="56" r="18" fill="rgba(148,163,184,0.2)"/>
            <rect x="148" y="92" width="16" height="126" rx="4" fill="#475569"/>
          </g>
          <!-- 5 nhãn giới hạn trực quan -->
          <rect x="26" y="28" width="136" height="30" rx="15" fill="rgba(15,23,42,0.85)" stroke="#fb7185"/>
          <text x="94" y="47" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">Lợi ích thiểu số</text>

          <rect x="298" y="28" width="136" height="30" rx="15" fill="rgba(15,23,42,0.85)" stroke="#fb7185"/>
          <text x="366" y="47" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">Tư hữu tư liệu SX</text>

          <rect x="24" y="132" width="136" height="30" rx="15" fill="rgba(15,23,42,0.85)" stroke="#fb7185"/>
          <text x="92" y="151" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">Ô nhiễm môi trường</text>

          <rect x="298" y="106" width="136" height="30" rx="15" fill="rgba(15,23,42,0.85)" stroke="#fb7185"/>
          <text x="366" y="125" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">Khủng hoảng chu kỳ</text>

          <rect x="298" y="176" width="136" height="30" rx="15" fill="rgba(15,23,42,0.85)" stroke="#fb7185"/>
          <text x="366" y="195" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">Phân hóa giàu nghèo</text>

          <text x="230" y="242" text-anchor="middle" fill="#fecdd3" font-size="11.5" font-weight="800">Mâu thuẫn cố hữu từ chiếm hữu tư nhân tư bản chủ nghĩa</text>
        </svg>
      `,
      metrics: [
        { val: "5 Giới hạn", lbl: "Khuyết tật cố hữu", color: "#fb7185" },
        { val: "Tư hữu", lbl: "Nguồn gốc mâu thuẫn", color: "#f43f5e" },
        { val: "Bối cảnh", lbl: "Đặt ra câu hỏi trọng tâm", color: "#fbbf24" },
      ],
    },
    "r1-1b": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <defs>
            <linearGradient id="bridgeSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0c4a6e" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#064e3b" stop-opacity="0.45"/>
            </linearGradient>
          </defs>
          <rect x="14" y="12" width="432" height="246" rx="18" fill="url(#bridgeSky)" stroke="rgba(56,189,248,0.3)"/>
          <!-- Mặt trời định hướng & Ngôi sao vàng -->
          <circle cx="230" cy="78" r="34" fill="rgba(245,158,11,0.22)" stroke="#fbbf24" stroke-width="2"/>
          <polygon points="230,54 236,71 254,71 240,82 245,99 230,89 215,99 220,82 206,71 224,71" fill="#fbbf24"/>
          <!-- Nhịp cầu kết nối hai trụ cột -->
          <path class="svg-draw-line" d="M44 176 Q230 112 416 176" stroke="#34d399" stroke-width="4" fill="none"/>
          <line x1="44" y1="178" x2="416" y2="178" stroke="#f8fafc" stroke-width="3"/>
          <line x1="130" y1="150" x2="130" y2="178" stroke="#94a3b8" stroke-width="2"/>
          <line x1="230" y1="144" x2="230" y2="178" stroke="#94a3b8" stroke-width="2"/>
          <line x1="330" y1="150" x2="330" y2="178" stroke="#94a3b8" stroke-width="2"/>

          <rect x="34" y="186" width="174" height="54" rx="12" fill="rgba(14,165,233,0.22)" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="121" y="209" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="800">QUY LUẬT THỊ TRƯỜNG</text>
          <text x="121" y="227" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="600">Giá trị • Cung cầu • Cạnh tranh</text>

          <rect x="252" y="186" width="174" height="54" rx="12" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="1.8"/>
          <text x="339" y="209" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="800">ĐỊNH HƯỚNG XÃ HỘI</text>
          <text x="339" y="227" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="600">Dân giàu, nước mạnh, công bằng</text>
        </svg>
      `,
      metrics: [
        { val: "2 Yếu tố", lbl: "Thị trường + Định hướng", color: "#38bdf8" },
        { val: "Điều 51", lbl: "Hiến pháp năm 2013", color: "#10b981" },
        { val: "Đại hội XIII", lbl: "Mô hình kinh tế tổng quát", color: "#fbbf24" },
      ],
    },
    "r2-role": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(15,23,42,0.55)" stroke="rgba(245,158,11,0.28)"/>
          <g class="svg-float">
            <!-- Khối bên trái: Đảng Cộng sản Việt Nam -->
            <rect x="28" y="26" width="192" height="218" rx="14" fill="rgba(245,158,11,0.14)" stroke="#f59e0b" stroke-width="2"/>
            <circle cx="124" cy="56" r="18" fill="#b91c1c" stroke="#fbbf24" stroke-width="2"/>
            <polygon points="124,44 127,52 136,52 129,57 131,66 124,61 117,66 119,57 112,52 121,52" fill="#fbbf24"/>
            <text x="124" y="92" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="900">ĐẢNG CỘNG SẢN VIỆT NAM</text>
            <line x1="46" y1="103" x2="202" y2="103" stroke="rgba(245,158,11,0.35)"/>
            <text x="42" y="127" fill="#fef3c7" font-size="11.5" font-weight="700">• Đề ra cương lĩnh, chiến lược</text>
            <text x="42" y="153" fill="#fef3c7" font-size="11.5" font-weight="700">• Giữ vững định hướng mục tiêu</text>
            <text x="42" y="179" fill="#fef3c7" font-size="11.5" font-weight="700">• Lãnh đạo thể chế hóa pháp luật</text>
            <text x="42" y="205" fill="#fef3c7" font-size="11.5" font-weight="700">• Chống tham nhũng, tiêu cực</text>

            <!-- Khối bên phải: Nhà nước pháp quyền xã hội chủ nghĩa -->
            <rect x="240" y="26" width="192" height="218" rx="14" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="336" cy="56" r="18" fill="#0369a1" stroke="#7dd3fc" stroke-width="2"/>
            <path d="M326 62 L346 62 M336 45 L336 62 M328 50 L344 50" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
            <text x="336" y="92" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="900">NHÀ NƯỚC PHÁP QUYỀN</text>
            <line x1="258" y1="103" x2="414" y2="103" stroke="rgba(56,189,248,0.35)"/>
            <text x="254" y="127" fill="#e0f2fe" font-size="11.5" font-weight="700">• Hoàn thiện hệ thống pháp luật</text>
            <text x="254" y="153" fill="#e0f2fe" font-size="11.5" font-weight="700">• Giữ ổn định kinh tế vĩ mô</text>
            <text x="254" y="179" fill="#e0f2fe" font-size="11.5" font-weight="700">• Đa phương hóa hội nhập</text>
            <text x="254" y="205" fill="#e0f2fe" font-size="11.5" font-weight="700">• Phòng vệ thị trường nội địa</text>
          </g>
          <path class="svg-draw-line" d="M220 135 L240 135" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
        </svg>
      `,
      metrics: [
        { val: "Đảng lãnh đạo", lbl: "Giữ định hướng chiến lược", color: "#fbbf24" },
        { val: "Nhà nước", lbl: "Điều tiết vĩ mô & pháp luật", color: "#38bdf8" },
        { val: "Phòng vệ", lbl: "Bảo vệ doanh nghiệp nội", color: "#10b981" },
      ],
    },
    "r2-b1": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <defs>
            <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.03"/>
            </linearGradient>
          </defs>
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(6,78,59,0.28)" stroke="rgba(16,185,129,0.3)"/>
          <!-- Minh họa hạ tầng hiện đại ở nền -->
          <rect x="268" y="54" width="26" height="84" rx="4" fill="rgba(56,189,248,0.2)" stroke="#38bdf8"/>
          <rect x="302" y="38" width="32" height="100" rx="4" fill="rgba(16,185,129,0.22)" stroke="#34d399"/>
          <rect x="342" y="66" width="28" height="72" rx="4" fill="rgba(245,158,11,0.2)" stroke="#fbbf24"/>
          <text x="318" y="154" text-anchor="middle" fill="#a7f3d0" font-size="10.5" font-weight="700">Hạ tầng &amp; Doanh nghiệp phát triển</text>

          <!-- Biểu đồ giảm nghèo ngoạn mục -->
          <line x1="56" y1="214" x2="408" y2="214" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
          <path d="M68,66 C155,82 245,162 392,202 L392,214 L68,214 Z" fill="url(#areaGreen)"/>
          <path class="svg-draw-line" d="M68,66 C155,82 245,162 392,202" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>

          <circle cx="68" cy="66" r="7" fill="#fb7185" stroke="#ffffff" stroke-width="2"/>
          <rect x="82" y="42" width="126" height="30" rx="8" fill="rgba(244,63,94,0.25)" stroke="#fb7185"/>
          <text x="145" y="61" text-anchor="middle" fill="#fda4af" font-size="12.5" font-weight="800">Trên 58% (1993)</text>

          <circle cx="392" cy="202" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
          <rect x="276" y="164" width="128" height="30" rx="8" fill="rgba(16,185,129,0.28)" stroke="#10b981"/>
          <text x="340" y="183" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="900">Dưới 3% Hiện nay</text>

          <text x="230" y="242" text-anchor="middle" fill="#d1fae5" font-size="11.5" font-weight="700">Thành tựu giảm nghèo gắn với đa dạng hóa sở hữu tại Việt Nam</text>
        </svg>
      `,
      metrics: [
        { val: ">58% → <3%", lbl: "Giảm tỷ lệ hộ nghèo", color: "#10b981" },
        { val: "Nhà nước", lbl: "Chủ đạo hạ tầng chiến lược", color: "#38bdf8" },
        { val: "Tư nhân", lbl: "Động lực tăng trưởng", color: "#fbbf24" },
      ],
    },
    "r2-b4": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(12,74,110,0.3)" stroke="rgba(56,189,248,0.28)"/>
          <!-- Vòng tròn Bảo hiểm y tế + Biểu tượng lá chắn y tế -->
          <circle cx="148" cy="135" r="82" stroke="rgba(255,255,255,0.12)" stroke-width="16"/>
          <circle cx="148" cy="135" r="82" stroke="#10b981" stroke-width="16" stroke-linecap="round"
            stroke-dasharray="480 516" transform="rotate(-90 148 135)" class="svg-draw-line"/>
          <path d="M148 86 L168 95 V113 C168 126 159 136 148 140 C137 136 128 126 128 113 V95 Z" fill="rgba(16,185,129,0.28)" stroke="#6ee7b7" stroke-width="2"/>
          <path d="M148 103 V121 M139 112 H157" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          <text x="148" y="164" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="900">&gt;93%</text>
          <text x="148" y="182" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="800">BẢO HIỂM Y TẾ</text>

          <g class="svg-float">
            <rect x="258" y="38" width="170" height="54" rx="12" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="1.8"/>
            <text x="343" y="61" text-anchor="middle" fill="#38bdf8" font-size="11.5" font-weight="800">ĐIỀU TIẾT VĨ MÔ</text>
            <text x="343" y="79" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Kiểm soát lạm phát</text>

            <rect x="258" y="108" width="170" height="54" rx="12" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="1.8"/>
            <text x="343" y="131" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="800">BÌNH ỔN GIÁ CẢ</text>
            <text x="343" y="149" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Điện, y tế, giáo dục</text>

            <rect x="258" y="178" width="170" height="54" rx="12" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="1.8"/>
            <text x="343" y="201" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="800">ĐA KÊNH PHÂN PHỐI</text>
            <text x="343" y="219" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">Lao động và phúc lợi</text>
          </g>
        </svg>
      `,
      metrics: [
        { val: ">93%", lbl: "Dân số có bảo hiểm y tế", color: "#10b981" },
        { val: "Bình ổn", lbl: "Mặt hàng thiết yếu", color: "#38bdf8" },
        { val: "An sinh", lbl: "Phân phối lại công bằng", color: "#fbbf24" },
      ],
    },
    "r2-b5": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(6,78,59,0.32)" stroke="rgba(52,211,153,0.3)"/>
          <!-- Đồi xanh & tua-bin điện gió minh họa phát triển bền vững -->
          <path d="M14 212 Q145 168 265 204 T446 192 L446 258 L14 258 Z" fill="rgba(16,185,129,0.26)"/>
          <!-- Tua-bin gió bên trái -->
          <line x1="78" y1="112" x2="78" y2="196" stroke="#e2e8f0" stroke-width="3"/>
          <path d="M78 112 L62 88 M78 112 L102 108 M78 112 L72 136" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
          <!-- Cây xanh bên phải -->
          <rect x="378" y="162" width="8" height="36" fill="#92400e"/>
          <circle cx="382" cy="146" r="24" fill="#10b981" fill-opacity="0.85"/>
          <circle cx="366" cy="156" r="16" fill="#34d399" fill-opacity="0.85"/>
          <circle cx="398" cy="156" r="16" fill="#059669" fill-opacity="0.9"/>

          <!-- Tâm điểm Cam kết Net Zero 2050 -->
          <circle cx="230" cy="122" r="76" stroke="#34d399" stroke-width="2" stroke-dasharray="7 5" class="svg-spin-slow"/>
          <circle cx="230" cy="122" r="58" fill="rgba(6,95,70,0.85)" stroke="#6ee7b7" stroke-width="2.5"/>
          <text x="230" y="114" text-anchor="middle" fill="#a7f3d0" font-size="11.5" font-weight="800">CAM KẾT COP26</text>
          <text x="230" y="138" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="900">NET ZERO 2050</text>

          <rect x="115" y="216" width="230" height="30" rx="15" fill="rgba(15,23,42,0.82)" stroke="#34d399"/>
          <text x="230" y="235" text-anchor="middle" fill="#ecfdf5" font-size="11" font-weight="800">Luật Bảo vệ môi trường 2020 &amp; Kinh tế tuần hoàn</text>
        </svg>
      `,
      metrics: [
        { val: "Net Zero", lbl: "Phát thải ròng 2050", color: "#10b981" },
        { val: "Luật 2020", lbl: "Bảo vệ môi trường", color: "#38bdf8" },
        { val: "Ngay từ đầu", lbl: "Tăng trưởng + Công bằng", color: "#a78bfa" },
      ],
    },
    "r3-3a": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(76,5,25,0.32)" stroke="rgba(251,113,133,0.28)"/>
          <g class="svg-float">
            <rect x="28" y="26" width="194" height="102" rx="14" fill="rgba(15,23,42,0.75)" stroke="#fb7185" stroke-width="1.8"/>
            <text x="44" y="52" fill="#fda4af" font-size="11" font-weight="800">YẾU TỐ XÃ HỘI CHỦ NGHĨA</text>
            <text x="44" y="75" fill="#ffffff" font-size="13.5" font-weight="800">Hợp tác xã còn yếu</text>
            <text x="44" y="97" fill="#cbd5e1" font-size="11.5">Hàng giả, đa cấp, ô nhiễm</text>

            <rect x="238" y="26" width="194" height="102" rx="14" fill="rgba(15,23,42,0.75)" stroke="#fb7185" stroke-width="1.8"/>
            <text x="254" y="52" fill="#fda4af" font-size="11" font-weight="800">KINH TẾ SỐ CÔNG NGHỆ 4.0</text>
            <text x="254" y="75" fill="#ffffff" font-size="13.5" font-weight="800">Thể chế chưa theo kịp</text>
            <text x="254" y="97" fill="#cbd5e1" font-size="11.5">Quản lý thuế nền tảng số</text>

            <rect x="28" y="142" width="194" height="102" rx="14" fill="rgba(15,23,42,0.75)" stroke="#fb7185" stroke-width="1.8"/>
            <text x="44" y="168" fill="#fda4af" font-size="11" font-weight="800">TIẾP CẬN NGUỒN LỰC</text>
            <text x="44" y="191" fill="#ffffff" font-size="13.5" font-weight="800">Chưa thật bình đẳng</text>
            <text x="44" y="213" fill="#cbd5e1" font-size="11.5">Khó vốn; thất thoát vốn công</text>

            <rect x="238" y="142" width="194" height="102" rx="14" fill="rgba(15,23,42,0.75)" stroke="#fb7185" stroke-width="1.8"/>
            <text x="254" y="168" fill="#fda4af" font-size="11" font-weight="800">XÃ HỘI VÀ QUẢN LÝ</text>
            <text x="254" y="191" fill="#ffffff" font-size="13.5" font-weight="800">Phân hóa &amp; Lợi ích nhóm</text>
            <text x="254" y="213" fill="#cbd5e1" font-size="11.5">Chênh lệch thành thị – nông thôn</text>
          </g>
        </svg>
      `,
      metrics: [
        { val: "4 Hạn chế", lbl: "Bất cập thực tiễn hiện nay", color: "#fb7185" },
        { val: "Kinh tế số", lbl: "Áp lực quản lý thuế 4.0", color: "#f43f5e" },
        { val: "Quá độ", lbl: "Cần tiếp tục hoàn thiện", color: "#fbbf24" },
      ],
    },
    "r3-3b": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(12,74,110,0.32)" stroke="rgba(56,189,248,0.28)"/>
          <rect x="34" y="24" width="392" height="40" rx="12" fill="rgba(56,189,248,0.24)" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="230" y="49" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="900">BỐN NHÓM GIẢI PHÁP KHẮC PHỤC ĐỒNG BỘ</text>

          <g class="svg-float">
            <rect x="36" y="82" width="88" height="158" rx="12" fill="rgba(15,23,42,0.75)" stroke="#38bdf8" stroke-width="1.8"/>
            <circle cx="80" cy="112" r="15" fill="rgba(56,189,248,0.25)"/>
            <text x="80" y="117" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="900">I</text>
            <text x="80" y="148" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">Giám sát</text>
            <text x="80" y="166" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">thị trường</text>
            <text x="80" y="186" text-anchor="middle" fill="#bae6fd" font-size="11" font-weight="700">Đổi mới</text>
            <text x="80" y="202" text-anchor="middle" fill="#bae6fd" font-size="11" font-weight="700">hợp tác xã</text>

            <rect x="136" y="82" width="88" height="158" rx="12" fill="rgba(15,23,42,0.75)" stroke="#10b981" stroke-width="1.8"/>
            <circle cx="180" cy="112" r="15" fill="rgba(16,185,129,0.25)"/>
            <text x="180" y="117" text-anchor="middle" fill="#10b981" font-size="14" font-weight="900">II</text>
            <text x="180" y="148" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">Pháp luật</text>
            <text x="180" y="166" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">&amp; Thuế số</text>
            <text x="180" y="186" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Kinh tế</text>
            <text x="180" y="202" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">nền tảng 4.0</text>

            <rect x="236" y="82" width="88" height="158" rx="12" fill="rgba(15,23,42,0.75)" stroke="#f59e0b" stroke-width="1.8"/>
            <circle cx="280" cy="112" r="15" fill="rgba(245,158,11,0.25)"/>
            <text x="280" y="117" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="900">III</text>
            <text x="280" y="148" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">Bình đẳng</text>
            <text x="280" y="166" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">nguồn lực</text>
            <text x="280" y="186" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="700">Minh bạch</text>
            <text x="280" y="202" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="700">vốn công</text>

            <rect x="336" y="82" width="88" height="158" rx="12" fill="rgba(15,23,42,0.75)" stroke="#a78bfa" stroke-width="1.8"/>
            <circle cx="380" cy="112" r="15" fill="rgba(167,139,250,0.25)"/>
            <text x="380" y="117" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="900">IV</text>
            <text x="380" y="148" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">An sinh</text>
            <text x="380" y="166" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">bền vững</text>
            <text x="380" y="186" text-anchor="middle" fill="#ddd6fe" font-size="11" font-weight="700">Chống tham</text>
            <text x="380" y="202" text-anchor="middle" fill="#ddd6fe" font-size="11" font-weight="700">nhũng triệt để</text>
          </g>
        </svg>
      `,
      metrics: [
        { val: "4 Giải pháp", lbl: "Khắc phục trực diện", color: "#38bdf8" },
        { val: "Minh bạch", lbl: "Quản trị nguồn lực", color: "#10b981" },
        { val: "Kỷ cương", lbl: "Chống lợi ích nhóm", color: "#fbbf24" },
      ],
    },
    "r3-verdict": {
      svg: `
        <svg viewBox="0 0 460 270" fill="none">
          <rect x="14" y="12" width="432" height="246" rx="18" fill="rgba(120,53,15,0.26)" stroke="rgba(245,158,11,0.34)"/>
          <!-- Trục cán cân biện chứng -->
          <line x1="230" y1="32" x2="230" y2="212" stroke="#f59e0b" stroke-width="3"/>
          <polygon points="206,216 254,216 244,202 216,202" fill="#f59e0b"/>
          <line class="svg-draw-line" x1="74" y1="74" x2="386" y2="56" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
          <circle cx="230" cy="65" r="8" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>

          <!-- Đĩa cân bên trái: Thành tựu khắc phục một phần -->
          <g class="svg-float">
            <rect x="26" y="96" width="186" height="96" rx="14" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="2"/>
            <text x="119" y="122" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="900">✓ ĐÃ KHẮC PHỤC</text>
            <text x="119" y="146" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="900">Một phần căn bản</text>
            <text x="119" y="168" text-anchor="middle" fill="#d1fae5" font-size="11">Đa sở hữu • Điều tiết • An sinh</text>

            <!-- Đĩa cân bên phải: Tiếp tục hoàn thiện -->
            <rect x="248" y="80" width="186" height="96" rx="14" fill="rgba(245,158,11,0.22)" stroke="#f59e0b" stroke-width="2"/>
            <text x="341" y="106" text-anchor="middle" fill="#fde68a" font-size="11.5" font-weight="900">⟳ CHƯA HOÀN TOÀN</text>
            <text x="341" y="130" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="900">Tiếp tục hoàn thiện</text>
            <text x="341" y="152" text-anchor="middle" fill="#fef3c7" font-size="11">Kiểm chứng qua thực tiễn</text>
          </g>

          <text x="230" y="242" text-anchor="middle" fill="#fde68a" font-size="11.5" font-weight="800">Đánh giá khách quan, biện chứng trong thời kỳ quá độ lên chủ nghĩa xã hội</text>
        </svg>
      `,
      metrics: [
        { val: "Một phần", lbl: "Đã khắc phục căn bản", color: "#10b981" },
        { val: "Chưa xong", lbl: "Chưa giải quyết hoàn toàn", color: "#fbbf24" },
        { val: "Thực tiễn", lbl: "Tiếp tục hoàn thiện thể chế", color: "#38bdf8" },
      ],
    },
  };

  function getSlides() {
    return (window.PresentationData && window.PresentationData.slides) || [];
  }

  function getRoomNames() {
    return (window.PresentationData && window.PresentationData.roomNames) || {};
  }

  function getStageFromIndex(idx) {
    if (idx === 0) return 0;
    if (idx === 1) return 1;
    if (idx === 2 || idx === 3) return 2;
    if (idx >= 4 && idx <= 7) return 3;
    return 4;
  }

  function updateStepperGlider(activeStage) {
    const glider = document.getElementById("stepper-glider");
    const pills = document.querySelectorAll(".step-pill");
    let activePill = null;

    pills.forEach((pill) => {
      const st = parseInt(pill.getAttribute("data-step-stage"), 10);
      const isMatch = st === activeStage;
      pill.classList.toggle("active", isMatch);
      if (isMatch) activePill = pill;
    });

    if (glider && activePill) {
      glider.style.width = `${activePill.offsetWidth}px`;
      glider.style.transform = `translateX(${activePill.offsetLeft}px)`;
    }
  }

  // Slide Mở đầu với tranh minh họa đường chân trời phát triển bền vững
  function buildIntroSceneMarkup(slide, animClass) {
    return `
      <article class="slide-scene intro-hero-scene is-current ${animClass}">
        <div class="intro-orbital-backdrop" aria-hidden="true">
          <svg viewBox="0 0 920 620" fill="none">
            <defs>
              <radialGradient id="introCoreAura" cx="50%" cy="46%" r="50%">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.34"/>
                <stop offset="55%" stop-color="#10b981" stop-opacity="0.14"/>
                <stop offset="100%" stop-color="#050811" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="460" cy="285" r="300" fill="url(#introCoreAura)" class="orbit-aura-pulse"/>
            <g class="orbit-ring-outer">
              <circle cx="460" cy="285" r="275" stroke="rgba(245,158,11,0.26)" stroke-width="1.5" stroke-dasharray="12 10"/>
              <circle cx="460" cy="10" r="6" fill="#fbbf24"/>
              <circle cx="735" cy="285" r="5" fill="#38bdf8"/>
              <circle cx="185" cy="285" r="5" fill="#10b981"/>
            </g>
            <!-- Đường chân trời kiến trúc hiện đại & ngôi sao dẫn lối ở nền -->
            <g opacity="0.24">
              <rect x="130" y="450" width="44" height="140" rx="6" fill="#38bdf8"/>
              <rect x="186" y="410" width="54" height="180" rx="6" fill="#10b981"/>
              <rect x="254" y="470" width="40" height="120" rx="6" fill="#f59e0b"/>
              <rect x="626" y="460" width="46" height="130" rx="6" fill="#f59e0b"/>
              <rect x="684" y="405" width="56" height="185" rx="6" fill="#10b981"/>
              <rect x="752" y="445" width="42" height="145" rx="6" fill="#38bdf8"/>
              <path d="M80 590 Q460 540 840 590" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
            </g>
          </svg>
        </div>

        <div class="intro-center-content">
          <div class="intro-course-ribbon">
            <span class="ribbon-pulse-dot"></span>
            <span>Kinh tế chính trị Mác - Lênin • Lớp SS008.R12</span>
          </div>

          <div class="intro-cq-card">
            <span id="pres-slide-subtitle" class="intro-cq-tag">Câu Hỏi Trọng Tâm (CQ)</span>
            <h2 id="pres-slide-title" class="intro-cq-question">
              “<span class="hl-amber">Kinh tế thị trường định hướng xã hội chủ nghĩa</span> có giải quyết được những <span class="hl-emerald">giới hạn lịch sử của chủ nghĩa tư bản</span> không?”
            </h2>
          </div>

          <div class="intro-meta-grid">
            <div class="intro-meta-card">
              <div class="meta-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <span class="meta-card-kicker">Đơn vị thực hiện</span>
                <div class="meta-card-value">Nhóm 8</div>
              </div>
            </div>

            <div class="intro-meta-card">
              <div class="meta-icon-box is-emerald" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div>
                <span class="meta-card-kicker">Học phần và Lớp</span>
                <div class="meta-card-value">Kinh tế chính trị Mác - Lênin • SS008.R12</div>
              </div>
            </div>

            <div class="intro-meta-card">
              <div class="meta-icon-box is-sky" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <span class="meta-card-kicker">Giảng viên hướng dẫn</span>
                <div class="meta-card-value">Nguyễn Anh Khoa</div>
              </div>
            </div>
          </div>

          <button type="button" class="intro-start-cta" onclick="window.PresentationApp.nextSlide()">
            <span>Bắt đầu thuyết trình</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <span id="pres-slide-badge" class="sr-only">${slide.badge || ""}</span>
        <div id="pres-key-points" class="sr-only"></div>
        <p id="pres-slide-desc" class="sr-only">${slide.desc || ""}</p>
        <div id="pres-slide-body" class="sr-only"></div>
      </article>
    `;
  }

  function buildSceneMarkup(slide, animClass) {
    if (slide.id === "intro-cq") {
      return buildIntroSceneMarkup(slide, animClass);
    }

    const lines = Array.isArray(slide.lines) ? slide.lines : [];
    const keywordsHtml = lines
      .map((line, i) => {
        const clean = String(line).replace(/^[•\-\s]+/, "");
        return `
          <div class="kw-card">
            <span class="kw-index">${i + 1}</span>
            <p class="kw-label">${clean}</p>
          </div>
        `;
      })
      .join("");

    const shortDesc = SHORT_THESIS[slide.id] || slide.desc || "";
    const isMatrix = slide.id === "r3-table";
    const visual = SLIDE_VISUALS[slide.id];

    let rightColumnHtml = "";
    if (isMatrix) {
      rightColumnHtml = `
        <div class="dark-matrix-wrap">
          ${(window.PresentationData && window.PresentationData.comparisonTableHtml) || ""}
        </div>
      `;
    } else if (visual) {
      const metricsHtml = visual.metrics
        .map(
          (m) => `
          <div class="metric-chip" style="--chip-color:${m.color}">
            <div class="metric-chip-val">${m.val}</div>
            <div class="metric-chip-lbl">${m.lbl}</div>
          </div>
        `,
        )
        .join("");

      rightColumnHtml = `
        <div class="art-stage-box">${visual.svg}</div>
        <div class="visual-metrics-row">${metricsHtml}</div>
      `;
    } else {
      rightColumnHtml = slide.fullHtml || "";
    }

    return `
      <article class="slide-scene is-current ${animClass}">
        <div class="scene-header">
          <div class="scene-meta">
            <span id="pres-slide-badge" class="scene-badge">${slide.badge || ""}</span>
            <span id="pres-slide-subtitle" class="scene-subtitle">${slide.subtitle || ""}</span>
          </div>
          <h2 id="pres-slide-title" class="scene-title">${slide.title || ""}</h2>
        </div>

        <div id="slide-stage-grid" class="scene-grid ${isMatrix ? "is-matrix-layout" : ""}">
          <div class="scene-keywords-col ${isMatrix ? "hidden" : ""}">
            <div id="pres-key-points" class="keyword-list">${keywordsHtml}</div>
            <div class="thesis-strip">
              <span class="thesis-dot"></span>
              <p id="pres-slide-desc" class="thesis-line">${shortDesc}</p>
            </div>
          </div>

          <div class="scene-visual-col">
            <div id="pres-slide-body" class="visual-canvas">${rightColumnHtml}</div>
          </div>
        </div>
      </article>
    `;
  }

  function renderSlide(idx, animateDirection = 0) {
    const slides = getSlides();
    if (!slides.length) return;

    const clampedIdx = ((idx % slides.length) + slides.length) % slides.length;
    const prevIdx = currentSlideIndex;
    currentSlideIndex = clampedIdx;
    const slide = slides[clampedIdx];

    if (clampedIdx > 0 && !timerRunning && elapsedSeconds === 0) {
      startTimer();
    }

    const panel = document.getElementById("presentation-panel");
    const accent = slide.color || "#f59e0b";
    if (panel) {
      panel.classList.toggle("is-intro-active", slide.id === "intro-cq");
      panel.style.setProperty("--accent-main", accent);
      panel.style.setProperty("--accent-glow", `${accent}48`);
      panel.style.setProperty("--accent-soft", `${accent}24`);
    }

    const host = document.getElementById("pres-slides-host");
    if (host) {
      const oldScene = host.querySelector(".slide-scene.is-current");
      let enterClass = "";
      let exitClass = "";

      if (oldScene && prevIdx !== clampedIdx) {
        if (prevIdx === 0 && clampedIdx > 0) {
          enterClass = "enter-zoom-portal";
          exitClass = "exit-zoom-portal";
        } else if (prevIdx > 0 && clampedIdx === 0) {
          enterClass = "enter-zoom-reverse";
          exitClass = "exit-zoom-reverse";
        } else if (animateDirection > 0 || (animateDirection === 0 && clampedIdx > prevIdx)) {
          enterClass = "enter-from-right";
          exitClass = "exit-to-left";
        } else {
          enterClass = "enter-from-left";
          exitClass = "exit-to-right";
        }
      }

      if (oldScene && exitClass) {
        oldScene.classList.remove(
          "is-current",
          "enter-from-right",
          "enter-from-left",
          "enter-zoom-portal",
          "enter-zoom-reverse",
        );
        oldScene.removeAttribute("id");
        oldScene.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        oldScene.classList.add(exitClass);
        setTimeout(() => {
          if (oldScene.parentNode) oldScene.remove();
        }, 720);
      } else if (oldScene) {
        oldScene.remove();
      }

      host.insertAdjacentHTML("beforeend", buildSceneMarkup(slide, enterClass));
    }

    const drawerTitle = document.getElementById("drawer-title");
    const drawerBody = document.getElementById("drawer-body");
    if (drawerTitle) drawerTitle.textContent = slide.title || "Chi tiết luận điểm";
    if (drawerBody) {
      drawerBody.innerHTML = `
        <div class="drawer-full-desc"><strong>Tóm tắt lập luận:</strong> ${slide.desc || ""}</div>
        ${slide.fullHtml || ""}
      `;
    }

    const activeStage = getStageFromIndex(clampedIdx);
    requestAnimationFrame(() => updateStepperGlider(activeStage));

    const roomTagEl = document.getElementById("pres-room-tag");
    const counterEl = document.getElementById("slide-counter-badge");
    const selectEl = document.getElementById("slide-select-dropdown");
    const progressEl = document.getElementById("pres-progress-bar");
    const roomNames = getRoomNames();

    if (roomTagEl) roomTagEl.textContent = roomNames[slide.room] || "";
    if (counterEl) {
      const curStr = String(clampedIdx + 1).padStart(2, "0");
      const totStr = String(slides.length).padStart(2, "0");
      counterEl.textContent = `${curStr} / ${totStr}`;
    }
    if (selectEl) selectEl.value = String(clampedIdx);
    if (progressEl) {
      progressEl.style.width = `${((clampedIdx + 1) / slides.length) * 100}%`;
    }

    wakeHudBriefly();
  }

  function goToSlide(idx) {
    const dir = idx > currentSlideIndex ? 1 : idx < currentSlideIndex ? -1 : 0;
    renderSlide(idx, dir);
  }

  function nextSlide() {
    renderSlide(currentSlideIndex + 1, 1);
  }

  function prevSlide() {
    renderSlide(currentSlideIndex - 1, -1);
  }

  function wakeHudBriefly() {
    const hud = document.getElementById("pres-dock-shell");
    if (!hud) return;
    hud.classList.add("is-active");
    clearTimeout(hudIdleTimer);
    hudIdleTimer = setTimeout(() => {
      hud.classList.remove("is-active");
    }, 3000);
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateTimerUI() {
    const btn = document.getElementById("pres-timer-btn");
    const display = document.getElementById("pres-timer-display");
    if (!btn || !display) return;

    display.textContent = formatTime(elapsedSeconds);
    btn.classList.toggle("is-running", timerRunning);
    btn.classList.toggle("is-optimal", elapsedSeconds >= 720 && elapsedSeconds < 855);
    btn.classList.toggle("is-danger", elapsedSeconds >= 855);
  }

  function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    updateTimerUI();
    timerInterval = setInterval(() => {
      elapsedSeconds += 1;
      updateTimerUI();
    }, 1000);
  }

  function toggleTimer() {
    if (timerRunning) {
      timerRunning = false;
      clearInterval(timerInterval);
      updateTimerUI();
    } else {
      startTimer();
    }
    wakeHudBriefly();
  }

  function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    updateTimerUI();
  }

  function toggleDrawer(forceState) {
    const drawer = document.getElementById("pres-detail-drawer");
    if (!drawer) return;
    const nextState =
      typeof forceState === "boolean"
        ? forceState
        : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", nextState);
    drawer.setAttribute("aria-hidden", nextState ? "false" : "true");
  }

  function getParentFullscreenFlag() {
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        return !!(
          window.parent.document.fullscreenElement ||
          window.parent.document.webkitFullscreenElement
        );
      }
    } catch (_) {}
    return false;
  }

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      getParentFullscreenFlag()
    );
  }

  function syncFullscreenButtonState(explicitState) {
    const isFs =
      typeof explicitState === "boolean" ? explicitState : isFullscreenActive();
    const panel = document.getElementById("presentation-panel");
    const exitBtn = document.getElementById("btn-exit-pres-fullscreen");
    if (panel) panel.classList.toggle("pres-fullscreen-active", isFs);
    if (exitBtn) exitBtn.classList.toggle("hidden", !isFs);
  }

  function toggleFullscreen() {
    try {
      if (
        window.parent &&
        window.parent !== window &&
        typeof window.parent.toggleMuseumFullscreen === "function"
      ) {
        window.parent.toggleMuseumFullscreen();
        return;
      }
    } catch (_) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "TOGGLE_FULLSCREEN" }, "*");
        return;
      }
    }

    const rootEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (rootEl.requestFullscreen) rootEl.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function exitFullscreenMode() {
    try {
      if (
        window.parent &&
        window.parent !== window &&
        typeof window.parent.exitMuseumFullscreen === "function"
      ) {
        window.parent.exitMuseumFullscreen();
        return;
      }
    } catch (_) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "EXIT_FULLSCREEN" }, "*");
        return;
      }
    }
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }

  function populateSlideDropdown() {
    const selectEl = document.getElementById("slide-select-dropdown");
    if (!selectEl) return;
    const slides = getSlides();
    selectEl.innerHTML = slides
      .map((item, idx) => `<option value="${idx}">${idx + 1}. ${item.title}</option>`)
      .join("");
  }

  function handleKeyDown(e) {
    if (!isActiveState) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (["SELECT", "INPUT", "TEXTAREA"].includes(tag)) return;

    const k = (e.key || "").toLowerCase();
    if (k === "escape") {
      toggleDrawer(false);
      return;
    }
    if (k === "d" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleDrawer();
      return;
    }
    if (k === "t" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleTimer();
      return;
    }
    if (k === "f" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (k === "arrowright" || k === "pagedown" || k === " ") {
      if (tag === "BUTTON" && k === " ") return;
      e.preventDefault();
      nextSlide();
      return;
    }
    if (k === "arrowleft" || k === "pageup") {
      e.preventDefault();
      prevSlide();
      return;
    }
    if (k === "home" || k === "0") {
      e.preventDefault();
      goToSlide(0);
      return;
    }
    if (k === "end") {
      e.preventDefault();
      goToSlide(getSlides().length - 1);
      return;
    }
    if (/^[1-9]$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const targetIdx = parseInt(k, 10);
      if (targetIdx < getSlides().length) {
        e.preventDefault();
        goToSlide(targetIdx);
      }
    }
  }

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    populateSlideDropdown();

    document.querySelectorAll(".step-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const target = parseInt(pill.getAttribute("data-target-slide"), 10);
        if (!isNaN(target)) goToSlide(target);
      });
    });

    const exitFsBtn = document.getElementById("btn-exit-pres-fullscreen");
    const closeDrawerBtn = document.getElementById("btn-close-drawer");
    const drawerBackdrop = document.getElementById("drawer-backdrop");
    const timerBtn = document.getElementById("pres-timer-btn");
    const prevBtn = document.getElementById("btn-hud-prev");
    const nextBtn = document.getElementById("btn-hud-next");
    const drawerHudBtn = document.getElementById("btn-hud-drawer");

    if (exitFsBtn) exitFsBtn.addEventListener("click", exitFullscreenMode);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", () => toggleDrawer(false));
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (drawerHudBtn) drawerHudBtn.addEventListener("click", () => toggleDrawer());
    if (timerBtn) {
      timerBtn.addEventListener("click", toggleTimer);
      timerBtn.addEventListener("dblclick", resetTimer);
    }

    const panel = document.getElementById("presentation-panel");
    if (panel) {
      panel.addEventListener(
        "touchstart",
        (e) => {
          if (!e.changedTouches.length) return;
          touchStartX = e.changedTouches[0].clientX;
          touchStartY = e.changedTouches[0].clientY;
        },
        { passive: true },
      );
      panel.addEventListener(
        "touchend",
        (e) => {
          if (!isActiveState || !e.changedTouches.length) return;
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy)) {
            dx < 0 ? nextSlide() : prevSlide();
          }
        },
        { passive: true },
      );
    }

    window.addEventListener("resize", () => updateStepperGlider(getStageFromIndex(currentSlideIndex)));
    ["fullscreenchange", "webkitfullscreenchange"].forEach((evt) => {
      document.addEventListener(evt, () => syncFullscreenButtonState());
    });

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("message", (e) => {
      if (!e || !e.data) return;
      if (e.data.type === "PRESENTATION_SET_ACTIVE") {
        isActiveState = Boolean(e.data.active);
      } else if (e.data.type === "FULLSCREEN_CHANGED") {
        syncFullscreenButtonState(Boolean(e.data.isFullscreen));
      } else if (e.data.type === "PARENT_KEY_EVENT" && isActiveState) {
        handleKeyDown({
          key: e.data.key,
          ctrlKey: Boolean(e.data.ctrlKey),
          metaKey: Boolean(e.data.metaKey),
          preventDefault() {},
        });
      }
    });

    renderSlide(0, 0);
    syncFullscreenButtonState();
  }

  return {
    init,
    goToSlide,
    nextSlide,
    prevSlide,
    setActive: (active) => { isActiveState = Boolean(active); },
    isActive: () => isActiveState,
    toggleFullscreen,
    exitFullscreen: exitFullscreenMode,
    setFullscreenState: syncFullscreenButtonState,
    getCurrentSlideIndex: () => currentSlideIndex,
    getTotalSlides: () => getSlides().length,
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.PresentationApp.init());
} else {
  window.PresentationApp.init();
}