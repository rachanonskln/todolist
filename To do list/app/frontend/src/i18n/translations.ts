export interface TranslationShape {
  nav: {
    dashboard: string;
    calendar: string;
    newTask: string;
    settings: string;
    brand: string;
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
}

export type Locale = "en" | "th";

export const translations: Record<Locale, TranslationShape> = {
  en: {
    nav: {
      dashboard: "Dashboard",
      calendar: "Calendar",
      newTask: "New Task",
      settings: "Settings",
      brand: "Aurora Tasks",
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
  },
  th: {
    nav: {
      dashboard: "แดชบอร์ด",
      calendar: "ปฏิทิน",
      newTask: "เพิ่มงาน",
      settings: "ตั้งค่า",
      brand: "Aurora Tasks",
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
  },
};
