import { Database } from "./database.types";

export type Json =
  Database["public"]["Tables"]["contributions"]["Row"]["proposed_data"];
export type { Database } from "./database.types";

// Member (blood relative)
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
export type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];

// Spouse (in-law)
export type Spouse = Database["public"]["Tables"]["spouses"]["Row"];
export type SpouseInsert = Database["public"]["Tables"]["spouses"]["Insert"];
export type SpouseUpdate = Database["public"]["Tables"]["spouses"]["Update"];

// Metadata helpers
export type MemberMetadata = {
  birth_year?: number | null;
  death_year?: number | null;
  is_alive?: boolean;
  avatar_url?: string | null;
  notes?: string | null;
  [key: string]: Json | undefined;
};

// ─── Author Profile (for joined queries) ─────────────────────────────────────

export type AuthorProfile = {
  full_name: string | null;
  avatar_url: string | null;
};

// ─── Board Feed Item ─────────────────────────────────────────────────────────

export type Contribution = Database["public"]["Tables"]["contributions"]["Row"];

/** A board feed item returned by getBoardFeed: contribution + nested author + comment count */
export type BoardFeedItem = Contribution & {
  author: AuthorProfile | null;
  comments: [{ count: number }] | [];
};

// ─── Comment with Author ─────────────────────────────────────────────────────

export type Comment = Database["public"]["Tables"]["comments"]["Row"];

/** A comment with nested author profile, returned by getComments */
export type CommentWithAuthor = Comment & {
  author: AuthorProfile | null;
};

// ─── Other tables ─────────────────────────────────────────────────────────────

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

// ─── Legacy aliases (deprecated — do not use in new code) ────────────────────

/** @deprecated Use Member instead */
export type Person = Member;
/** @deprecated Use MemberInsert instead */
export type PersonInsert = MemberInsert;
/** @deprecated Use MemberUpdate instead */
export type PersonUpdate = MemberUpdate;
