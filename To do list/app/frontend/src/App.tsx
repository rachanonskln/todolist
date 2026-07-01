import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { CalendarView } from "@/pages/CalendarView";
import { TaskForm } from "@/pages/TaskForm";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="tasks/new" element={<TaskForm />} />
        <Route path="tasks/:id/edit" element={<TaskForm />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
