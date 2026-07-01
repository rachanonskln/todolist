import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { Dashboard } from "@/pages/Dashboard";
import { TasksList } from "@/pages/TasksList";
import { CalendarView } from "@/pages/CalendarView";
import { TaskForm } from "@/pages/TaskForm";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TasksList />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="tasks/new" element={<TaskForm />} />
          <Route path="tasks/:id/edit" element={<TaskForm />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
