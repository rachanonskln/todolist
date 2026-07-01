export interface TranslationShape {
  nav: {
    dashboard: string;
    tasks: string;
    calendar: string;
    newTask: string;
    settings: string;
    brand: string;
  };
  tasksList: {
    title: string;
    searchPlaceholder: string;
    allStatuses: string;
    allPriorities: string;
    allCategories: string;
    noResults: string;
  };
  navbar: {
    greeting: string;
    subtitle: string;
  };
  dashboard: {
    today: string;
    pending: string;
    completed: string;
    highPriority: string;
    todaysTasks: string;
    noTasksToday: string;
    forecast7Day: string;
    pm25: string;
    pm25Unit: string;
    weatherUnavailable: string;
    useMyLocation: string;
    pm25Level: {
      veryGood: string;
      good: string;
      moderate: string;
      unhealthySensitive: string;
      unhealthy: string;
    };
  };
  aiReview: {
    title: string;
    subtitle: string;
    approve: string;
    reject: string;
  };
  priority: { low: string; medium: string; high: string };
  status: { pending: string; in_progress: string; completed: string };
  calendar: {
    selectDay: string;
    noTasksThisDay: string;
    weekdays: string[];
  };
  taskForm: {
    newTitle: string;
    editTitle: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    start: string;
    end: string;
    priority: string;
    status: string;
    category: string;
    uncategorized: string;
    remindBefore: string;
    lineUserId: string;
    lineUserIdHint: string;
    assignee: string;
    assigneePlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
  };
  settings: {
    integrations: string;
    notionApiKey: string;
    lineToken: string;
    lineTokenPlaceholder: string;
    emailMonitoring: string;
    connected: string;
    notConnected: string;
    connectGmail: string;
    disconnect: string;
    save: string;
    saved: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    invalidCredentials: string;
    logout: string;
  };
}

export type Locale = "en" | "th";

export const translations: Record<Locale, TranslationShape> = {
  en: {
    nav: {
      dashboard: "Dashboard",
      tasks: "Tasks",
      calendar: "Calendar",
      newTask: "New Task",
      settings: "Settings",
      brand: "Rachanon BLNS Task",
    },
    tasksList: {
      title: "All Tasks",
      searchPlaceholder: "Search by title...",
      allStatuses: "All statuses",
      allPriorities: "All priorities",
      allCategories: "All categories",
      noResults: "No tasks match your filters.",
    },
    navbar: {
      greeting: "Good to see you 👋",
      subtitle: "Here's what's on your plate today.",
    },
    dashboard: {
      today: "Today",
      pending: "Pending",
      completed: "Completed",
      highPriority: "High Priority",
      todaysTasks: "Today's Tasks",
      noTasksToday: "No tasks scheduled for today. 🌤️",
      forecast7Day: "7-Day Forecast",
      pm25: "PM2.5 (real-time)",
      pm25Unit: "µg/m³",
      weatherUnavailable: "Weather data unavailable right now.",
      useMyLocation: "Use my location",
      pm25Level: {
        veryGood: "Very Good",
        good: "Good",
        moderate: "Moderate",
        unhealthySensitive: "Unhealthy for sensitive groups",
        unhealthy: "Unhealthy",
      },
    },
    aiReview: {
      title: "AI Suggestions — Needs Your Review",
      subtitle: "Extracted automatically from email/LINE. Approve or reject each one.",
      approve: "Approve",
      reject: "Reject",
    },
    priority: { low: "Low", medium: "Medium", high: "High" },
    status: { pending: "Pending", in_progress: "In progress", completed: "Completed" },
    calendar: {
      selectDay: "Select a day",
      noTasksThisDay: "No tasks this day.",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    taskForm: {
      newTitle: "New Task",
      editTitle: "Edit Task",
      title: "Title",
      titlePlaceholder: "e.g. Submit quarterly report",
      description: "Description",
      start: "Start",
      end: "End",
      priority: "Priority",
      status: "Status",
      category: "Category",
      uncategorized: "Uncategorized",
      remindBefore: "Remind me before (minutes)",
      lineUserId: "LINE User ID (for reminders)",
      lineUserIdHint: "Optional — get this from the LINE bot's webhook logs or your Settings page.",
      assignee: "Assigned to",
      assigneePlaceholder: "e.g. Prof. Somchai",
      cancel: "Cancel",
      save: "Save Task",
      saving: "Saving...",
    },
    settings: {
      integrations: "Integrations",
      notionApiKey: "Notion API Key",
      lineToken: "LINE Channel Access Token",
      lineTokenPlaceholder: "Long-lived channel access token",
      emailMonitoring: "Email Monitoring",
      connected: "Connected via OAuth2",
      notConnected: "Not connected",
      connectGmail: "Connect Gmail",
      disconnect: "Disconnect",
      save: "Save Settings",
      saved: "Saved ✓",
    },
    login: {
      title: "Welcome back",
      subtitle: "Sign in to Rachanon BLNS Task",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      submitting: "Signing in...",
      invalidCredentials: "Invalid email or password.",
      logout: "Log out",
    },
  },
  th: {
    nav: {
      dashboard: "แดชบอร์ด",
      tasks: "งานทั้งหมด",
      calendar: "ปฏิทิน",
      newTask: "เพิ่มงาน",
      settings: "ตั้งค่า",
      brand: "Rachanon BLNS Task",
    },
    tasksList: {
      title: "งานทั้งหมด",
      searchPlaceholder: "ค้นหาจากหัวข้องาน...",
      allStatuses: "ทุกสถานะ",
      allPriorities: "ทุกความสำคัญ",
      allCategories: "ทุกหมวดหมู่",
      noResults: "ไม่พบงานที่ตรงกับตัวกรอง",
    },
    navbar: {
      greeting: "ยินดีต้อนรับกลับมา 👋",
      subtitle: "นี่คืองานที่รอคุณอยู่วันนี้",
    },
    dashboard: {
      today: "วันนี้",
      pending: "ค้างอยู่",
      completed: "เสร็จแล้ว",
      highPriority: "ความสำคัญสูง",
      todaysTasks: "งานของวันนี้",
      noTasksToday: "ไม่มีงานสำหรับวันนี้ 🌤️",
      forecast7Day: "พยากรณ์อากาศ 7 วัน",
      pm25: "PM2.5 (เรียลไทม์)",
      pm25Unit: "ไมโครกรัม/ลบ.ม.",
      weatherUnavailable: "ดึงข้อมูลสภาพอากาศไม่ได้ในขณะนี้",
      useMyLocation: "ใช้ตำแหน่งของฉัน",
      pm25Level: {
        veryGood: "ดีมาก",
        good: "ดี",
        moderate: "ปานกลาง",
        unhealthySensitive: "เริ่มมีผลกระทบต่อกลุ่มเสี่ยง",
        unhealthy: "มีผลกระทบต่อสุขภาพ",
      },
    },
    aiReview: {
      title: "งานที่ AI แนะนำ — รอตรวจสอบ",
      subtitle: "ดึงมาจากอีเมล/LINE อัตโนมัติ กดยืนยันหรือปฏิเสธแต่ละรายการ",
      approve: "ยืนยัน",
      reject: "ปฏิเสธ",
    },
    priority: { low: "ต่ำ", medium: "ปานกลาง", high: "สูง" },
    status: { pending: "รอดำเนินการ", in_progress: "กำลังทำ", completed: "เสร็จแล้ว" },
    calendar: {
      selectDay: "เลือกวันที่",
      noTasksThisDay: "ไม่มีงานในวันนี้",
      weekdays: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
    },
    taskForm: {
      newTitle: "เพิ่มงานใหม่",
      editTitle: "แก้ไขงาน",
      title: "หัวข้อ",
      titlePlaceholder: "เช่น ส่งรายงานประจำไตรมาส",
      description: "รายละเอียด",
      start: "เริ่ม",
      end: "สิ้นสุด",
      priority: "ความสำคัญ",
      status: "สถานะ",
      category: "หมวดหมู่",
      uncategorized: "ไม่มีหมวดหมู่",
      remindBefore: "แจ้งเตือนล่วงหน้า (นาที)",
      lineUserId: "LINE User ID (สำหรับแจ้งเตือน)",
      lineUserIdHint: "ไม่บังคับ — ดูได้จาก webhook log ของ LINE bot หรือหน้าตั้งค่า",
      assignee: "ผู้ได้รับมอบหมาย",
      assigneePlaceholder: "เช่น อาจารย์สมชาย",
      cancel: "ยกเลิก",
      save: "บันทึกงาน",
      saving: "กำลังบันทึก...",
    },
    settings: {
      integrations: "การเชื่อมต่อ",
      notionApiKey: "Notion API Key",
      lineToken: "LINE Channel Access Token",
      lineTokenPlaceholder: "Long-lived channel access token",
      emailMonitoring: "ระบบตรวจอีเมล",
      connected: "เชื่อมต่อผ่าน OAuth2 แล้ว",
      notConnected: "ยังไม่ได้เชื่อมต่อ",
      connectGmail: "เชื่อมต่อ Gmail",
      disconnect: "ยกเลิกการเชื่อมต่อ",
      save: "บันทึกการตั้งค่า",
      saved: "บันทึกแล้ว ✓",
    },
    login: {
      title: "ยินดีต้อนรับกลับมา",
      subtitle: "เข้าสู่ระบบ Rachanon BLNS Task",
      email: "อีเมล",
      password: "รหัสผ่าน",
      submit: "เข้าสู่ระบบ",
      submitting: "กำลังเข้าสู่ระบบ...",
      invalidCredentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      logout: "ออกจากระบบ",
    },
  },
};
