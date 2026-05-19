export const PATHS = {
    HOME: '/',
    PERSONNEL_LIST: '/personnel',
    PERSONNEL_NEW: '/personnel/new',
    PERSONNEL_DETAIL: (id: string) => `/personnel/${id}`,
    PERSONNEL_EDIT: (id: string) => `/personnel/${id}/edit`,
    TEAM_LIST: '/teams',
    TEAM_NEW: '/teams/new',
    TEAM_DETAIL: (id: string) => `/teams/${id}`,
    TEAM_EDIT: (id: string) => `/teams/${id}/edit`,
    MISSION_LIST: '/missions',
    MISSION_NEW: '/missions/new',
    MISSION_DETAIL: (id: string) => `/missions/${id}`,
    MISSION_EDIT: (id: string) => `/missions/${id}/edit`
};

export const ROUTES = {
    PERSONNEL_DETAIL: "/personnel/:id",
    PERSONNEL_EDIT: "/personnel/:id/edit",
    TEAM_DETAIL: "/teams/:id",
    TEAM_EDIT: "/teams/:id/edit",
    MISSION_DETAIL: "/missions/:id",
    MISSION_EDIT: "/missions/:id/edit",
}