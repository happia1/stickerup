export type StudentConnectionStatus = "pending" | "connected" | "unconnected";

export interface AdminStudentRow {
  id: string;
  name: string;
  age: number | null;
  connectionStatus: StudentConnectionStatus;
  classNames: string[];
  totalStickers: number;
  requestedAt: string | null;
}

export interface AdminStudentsData {
  students: AdminStudentRow[];
  pendingConnectionCount: number;
  canDeleteStudents: boolean;
}
