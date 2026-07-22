export type StudentConnectionStatus = "pending" | "connected" | "unconnected";

export interface AdminStudentRow {
  id: string;
  name: string;
  birthDate: string | null;
  connectionStatus: StudentConnectionStatus;
  classNames: string[];
  classMemberships: Array<{ classId: string; className: string; isDefault: boolean }>;
  totalStickers: number;
  requestedAt: string | null;
}

export interface AdminStudentsData {
  students: AdminStudentRow[];
  pendingConnectionCount: number;
  canDeleteStudents: boolean;
}
