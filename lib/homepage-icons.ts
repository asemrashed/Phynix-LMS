import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Infinity,
  LineChart,
  MessageSquare,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Youtube,
  Award,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Video,
  Infinity,
  Users,
  Handshake,
  Bot,
  ClipboardCheck,
  Briefcase,
  Globe,
  TrendingUp,
  Building2,
  Brain,
  MessageSquare,
  BarChart3,
  Star,
  BookOpen,
  Youtube,
  FileText,
  LineChart,
  UserCheck,
  GraduationCap,
  Award,
}

export function getHomepageIcon(name?: string): LucideIcon {
  if (!name) return Star
  return ICON_MAP[name] ?? Star
}
