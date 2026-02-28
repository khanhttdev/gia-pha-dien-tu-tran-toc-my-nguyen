/**
 * Global Constants for the Gia Phả application
 */

export const APP_ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
    ACCOUNTANT: "accountant",
} as const;

export const APP_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
} as const;

export const MEDIA_TYPES = {
    IMAGE: "image",
    VIDEO: "video",
} as const;

export const BOARD_TYPES = {
    NEWS: "news",
    EVENT: "event",
    CORRECTION: "correction",
    ADVICE: "advice",
} as const;

export const APP_PATHS = {
    HOME: "/home",
    LOGIN: "/login",
    REGISTER: "/register",
    MEDIA: "/media",
    BOARD: "/board",
    ADMIN: "/admin",
} as const;
