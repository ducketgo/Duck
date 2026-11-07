// ============================================
// DUCK Platform - Core Types
// ============================================

// User & Auth
export interface DuckUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  isProfilePublic: boolean;
  duckPoints: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'member' | 'visitor';

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  themeColor: string;
  backgroundColor: string;
  isPublic: boolean;
  showProjects: boolean;
  showPublications: boolean;
  showFriends: boolean;
  showActivity: boolean;
  customCss: string | null;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

// Dashboard
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
}

export type WidgetType = 
  | 'publications'
  | 'projects'
  | 'profile'
  | 'recent-activity'
  | 'notifications'
  | 'stats'
  | 'shortcuts'
  | 'creation-history';

// Publications
export interface Publication {
  id: string;
  authorId: string;
  author?: DuckUser;
  content: string;
  mediaUrls: string[];
  type: PublicationType;
  isOfficial: boolean;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export type PublicationType = 'text' | 'image' | 'video' | 'article' | 'link' | 'file';
export type Visibility = 'public' | 'friends' | 'private';

// Comments
export interface Comment {
  id: string;
  publicationId: string;
  authorId: string;
  author?: DuckUser;
  content: string;
  parentId: string | null;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// Software
export interface Software {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  imageUrls: string[];
  categories: string[];
  currentVersion: string;
  versions: SoftwareVersion[];
  downloadUrl: string;
  repositoryUrl: string | null;
  documentationUrl: string | null;
  branch: DuckBranch;
  downloadsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SoftwareVersion {
  id: string;
  softwareId: string;
  version: string;
  changelog: string;
  downloadUrl: string;
  releaseDate: string;
}

// Branches / Services
export type DuckBranch = 
  | 'duckdev'
  | 'djduck'
  | 'duckos'
  | 'ducktechnologies'
  | 'duckweb'
  | 'duckcommunity'
  | 'duckauth'
  | 'duckcommunication';

export interface BranchInfo {
  id: DuckBranch;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

// Community
export interface Server {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  bannerUrl: string | null;
  ownerId: string;
  isPublic: boolean;
  memberCount: number;
  channels: Channel[];
  roles: ServerRole[];
  createdAt: string;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
  isPublic: boolean;
  position: number;
  categoryId: string | null;
}

export interface ServerRole {
  id: string;
  serverId: string;
  name: string;
  color: string;
  permissions: string[];
  position: number;
}

// Messaging
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  participants: string[];
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: DuckUser;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  fileUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

// Notifications
export interface DuckNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'system'
  | 'friend_request'
  | 'message'
  | 'publication'
  | 'comment'
  | 'like'
  | 'mention'
  | 'event'
  | 'contest'
  | 'points'
  | 'moderation';

// Events
export interface DuckEvent {
  id: string;
  title: string;
  description: string;
  type: 'public' | 'private';
  startDate: string;
  endDate: string;
  location: string | null;
  organizerId: string;
  maxParticipants: number | null;
  participantsCount: number;
  imageUrl: string | null;
  isLive: boolean;
  createdAt: string;
}

// Contest
export interface CodingContest {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'announced' | 'open' | 'judging' | 'completed';
  entries: ContestEntry[];
  winners: ContestWinner[];
  createdAt: string;
}

export interface ContestEntry {
  id: string;
  contestId: string;
  userId: string;
  user?: DuckUser;
  softwareId: string;
  software?: Software;
  submittedAt: string;
}

export interface ContestWinner {
  place: 1 | 2 | 3;
  entryId: string;
  entry?: ContestEntry;
  pointsAwarded: number;
}

// Shop
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number; // in Duck Points
  imageUrl: string | null;
  type: 'theme' | 'color' | 'animation' | 'effect' | 'decoration' | 'tool' | 'feature';
  isAvailable: boolean;
  createdAt: string;
}

export type ShopCategory = 'personalization' | 'features' | 'community';

export interface Transaction {
  id: string;
  userId: string;
  itemId: string | null;
  type: 'purchase' | 'reward' | 'bonus' | 'registration';
  amount: number;
  description: string;
  createdAt: string;
}

// Reports
export interface Report {
  id: string;
  reporterId: string;
  reporter?: DuckUser;
  targetId: string;
  targetType: 'publication' | 'comment' | 'user' | 'server' | 'message';
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy: string | null;
  aiAnalysis: string | null;
  decision: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

// API
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // Only first 8 chars stored for display
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// Search
export interface SearchResult {
  id: string;
  type: 'user' | 'publication' | 'software' | 'server' | 'event' | 'page';
  title: string;
  description: string;
  url: string;
  relevance: number;
  createdAt: string;
}

// Stats
export interface PlatformStats {
  totalMembers: number;
  activeMembers: number;
  totalPublications: number;
  totalSoftware: number;
  totalDownloads: number;
  totalServers: number;
  totalEvents: number;
}
