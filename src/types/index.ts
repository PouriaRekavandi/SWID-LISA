export type StudentDegree = 'BSc' | 'MSc' | 'PhD' | 'Postdoctoral' | 'Other';
export type StudentStatus = 'In Progress' | 'Submitted' | 'Completed' | 'On Hold';

export interface StudentRecord {
  id: string;
  name: string;
  degree: StudentDegree;
  studentId?: string;
  title: string;
  startDate?: string;
  expectedDate?: string;
  status: StudentStatus;
  email?: string;
  notes?: string;
  updatedAt?: string;
  milestoneStage?: string;
  progressPercent?: number;
  researchFocus?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  doi?: string;
  bibtex?: string;
  category: string;
  keywords?: string[];
  abstract?: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  part: number;
  url: string;
  description: string;
  duration?: string;
}

export type TabKey = 'home' | 'research' | 'publications' | 'students' | 'gear' | 'abaqus' | 'contact' | 'chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  sources?: { title: string; uri: string }[];
  modelUsed?: string;
  isError?: boolean;
}
