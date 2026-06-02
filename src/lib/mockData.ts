import type { Mission, MissionTeamLink, Personnel, Team, TeamPersonnelLink } from "./types";

// Mock data
// Roles
export const mockRoles = [
    {
        id: 'test-role',
        name: 'Test Role'
    },
    {
        id: 'test-commander',
        name: 'Commanding Officer'
    }
]

// Add Personnel
export const mockEntry = {
    prefix: "Mr.",
    first_name: "Samuel",
    middle_name: "Test",
    last_name: "Ybarra",
    suffix: "Jr.",
    personnel_type: "military",
    rank: "Second Lieutenant",
    team_id: "team-sg-test",
    role: '',
    role_id: "test-role",
    status: "active"
};

// Personnel
export const mockPersonnel: Personnel[] = [
    {
        id: '1',
        rank: 'Colonel',
        role: '',
        role_id: 'test-commander',
        roles: { name: mockRoles[1].name },
        team_id: 'team-sg-1',
        teams: { designation: 'SG-1' },
        status: 'active',
        prefix: 'Mr.',
        first_name: 'Jack',
        middle_name: '',
        last_name: "O'Neill",
        suffix: '',
        personnel_type: 'military'
    },
    {
        id: '2',
        rank: null,
        role: '',
        role_id: 'test-role',
        roles: { name: mockRoles[0].name },
        team_id: 'team-sg-1',
        teams: { designation: 'SG-1' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'Daniel',
        middle_name: '',
        last_name: 'Jackson',
        suffix: 'PHD',
        personnel_type: 'civilian'
    },
    {
        id: '3',
        rank: 'Second Lieutenant',
        role: '',
        role_id: 'test-role',
        roles: { name: mockRoles[0].name },
        team_id: 'team-sg-2',
        teams: { designation: 'SG-2' },
        status: 'active',
        prefix: 'Mr.',
        first_name: 'Carl',
        middle_name: 'John',
        last_name: 'Baker',
        suffix: 'III',
        personnel_type: 'military'
    },
    {
        id: '4',
        rank: null,
        role: 'Computer Expert',
        role_id: null,
        roles: null,
        team_id: 'team-sg-2',
        teams: { designation: 'SG-2' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'Samantha',
        middle_name: 'Alexandra',
        last_name: 'Shepard',
        suffix: 'PHD',
        personnel_type: 'civilian'
    },
    {
        id: '5',
        rank: '',
        role: 'broken',
        role_id: null,
        roles: null,
        team_id: '',
        teams: { designation: '' },
        status: 'active',
        prefix: '',
        first_name: 'test',
        middle_name: '',
        last_name: 'test',
        suffix: '',
        personnel_type: 'military'
    },
    {
        id: '6',
        rank: null,
        role: '',
        role_id: 'test-role',
        roles: { name: mockRoles[0].name },
        team_id: 'team-sg-1',
        teams: { designation: 'SG-1' },
        status: 'active',
        prefix: null,
        first_name: "Teal'c",
        middle_name: '',
        last_name: null,
        suffix: null,
        personnel_type: 'civilian'
    },
    {
        id: '7',
        rank: 'Lieutenant General',
        role: '',
        role_id: 'test-commander',
        roles: { name: mockRoles[1].name },
        team_id: 'team-sg-command',
        teams: { designation: 'SGC' },
        status: 'active',
        prefix: 'Mr.',
        first_name: 'George',
        middle_name: 'S.',
        last_name: 'Hammond',
        suffix: '',
        personnel_type: 'military'
    },
    {
        id: '8',
        rank: 'Major',
        role: '',
        role_id: 'test-commander',
        roles: { name: mockRoles[1].name },
        team_id: 'team-sg-2',
        teams: { designation: 'SG-2' },
        status: 'deceased',
        prefix: 'Mr.',
        first_name: 'Charles',
        middle_name: '',
        last_name: 'Kawalsky',
        suffix: '',
        personnel_type: 'military'
    },
    {
        id: '9',
        rank: null,
        role: 'Guest',
        role_id: null,
        roles: null,
        team_id: 'team-unassigned',
        teams: { designation: 'Unassigned' },
        status: 'active',
        prefix: 'Ms.',
        first_name: 'Vala',
        middle_name: '',
        last_name: 'Maldaran',
        suffix: '',
        personnel_type: 'civilian'
    },
    {
        id: '10',
        rank: 'Major',
        role: '',
        role_id: 'test-role',
        roles: { name: mockRoles[0].name },
        team_id: 'team-unassigned',
        teams: { designation: 'Unassigned' },
        status: 'transferred',
        prefix: 'Mr.',
        first_name: 'John',
        middle_name: '',
        last_name: 'Shepard',
        suffix: '',
        personnel_type: 'military'
    }
];

// Add Team
export const mockTeamEntry = {
    designation: 'SG-Mock-Test',
    commanding_officer: mockPersonnel[6].id,
    status: 'active'
};

// Teams
export const mockTeams: Team[] = [
    {
        id: 'team-sg-1',
        designation: 'SG-1',
        commanding_officer: mockPersonnel[0].id,
        status: 'active'
    },
    {
        id: 'team-sg-2',
        designation: 'SG-2',
        commanding_officer: mockPersonnel[2].id,
        status: 'active'
    },
    {
        id: 'team-sg-test',
        designation: 'SG-Test',
        commanding_officer: null,
        status: 'active'
    },
    {
        id: 'team-unassigned',
        designation: 'Unassigned',
        commanding_officer: null,
        status: 'inactive'
    },
    {
        id: 'team-sg-command',
        designation: 'SGC',
        commanding_officer: mockPersonnel[6].id,
        status: 'active'
    }
]

export const mockTeamData = [
    {
        ...mockTeams[0],
        commanding_officer_details: mockPersonnel[0],
        members: [
            mockPersonnel[0],
            mockPersonnel[1],
            mockPersonnel[5],
            {
                id: '0',
                rank: 'Captain',
                role: 'Chief Science Officer',
                role_id: null,
                roles: null,
                team_id: 'team-sg-1',
                teams: { designation: 'SG-1' },
                status: 'active',
                prefix: 'Dr.',
                first_name: 'Samantha',
                middle_name: '',
                last_name: 'Carter',
                suffix: 'PHD',
                personnel_type: 'military'
            }
        ]
    },
    {
        ...mockTeams[2],
        commanding_officer: mockPersonnel[0].id,
        commanding_officer_details: { ...mockPersonnel[0], team_id: 'team-sg-test', teams: { name: 'SG-Test' } },
        members: [
            { ...mockPersonnel[0], team_id: 'team-sg-test', teams: { name: 'SG-Test' } },
            { ...mockPersonnel[2], team_id: 'team-sg-test', teams: { name: 'SG-Test' } },
            { ...mockPersonnel[3], team_id: 'team-sg-test', teams: { name: 'SG-Test' } },
            { ...mockPersonnel[9], team_id: 'team-sg-test', teams: { name: 'SG-Test' } },
        ]
    },
    {
        ...mockTeams[3],
        commanding_officer_details: null,
        members:[
            mockPersonnel[8],
            mockPersonnel[9],
        ]
    }
]

export const mockTeamPersonnelLink: TeamPersonnelLink[] = mockTeamData.flatMap(team =>
    team.members.map(person=>({
        team_id: team.id,
        personnel_id: person.id
    }))
);

export const mockMissionObjectives = [
    {
        id: "objective-uuid-1",
        objective: "test-not-complete",
        is_completed: false,
        secret_objective: false
    },
    {
        id: "objective-uuid-2",
        objective: "test-complete",
        is_completed: true,
        secret_objective: false
    },
    {
        id: "objective-uuid-3",
        objective: "test-secret",
        is_completed: false,
        secret_objective: true
    },
    {
        id: "objective-uuid-4",
        objective: "test-both",
        is_completed: true,
        secret_objective: true
    }
]

export const mockMissionData = {
    id: "mission-uuid-3",
    name: "MockMissionEntry",
    destination: "PT3-5T1",
    description: null,
    start_date: "2026-05-01T08:00:00.000Z",
    end_date: null,
    status: "active",
    objectives: [mockMissionObjectives[0]],
    teams: [mockTeams[0]]
}

export const mockMissions: Mission[] = [
    {
        id: "mission-uuid-1",
        name: "Abydos Recon",
        destination: "P3X-984",
        description: "Mock Abydos Mission",
        start_date: "1996-10-28T04:00:00.000Z",
        end_date: "1996-10-29T18:30:00.000Z",
        status: "complete",
        objectives: mockMissionObjectives.map(obj=>({ mission_id: "mission-uuid-1", ...obj})),
        teams: [mockTeams[1], mockTeams[0]]
    },
    {
        id: "mission-uuid-2",
        name: "MockMission",
        destination: "PT3-5T2",
        description: null,
        start_date: "2026-05-01T08:00:00.000Z",
        end_date: null,
        status: "active",
        objectives: mockMissionObjectives.map(obj=>({mission_id: "mission-uuid-2", ...obj})),
        teams: mockTeams.filter(team => team.designation !== 'Unassigned')
    }
]

const allMissions = [...mockMissions, mockMissionData];

export const mockMissionTeamLink: MissionTeamLink[] = allMissions.flatMap(mission =>
    mission.teams.map(team => ({
        mission_id: mission.id,
        team_id: team.id
    }))
);