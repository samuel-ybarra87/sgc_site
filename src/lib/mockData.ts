// Mock data
export const mockEntry = {
    prefix: "Mr.",
    first_name: "Samuel",
    middle_name: "Test",
    last_name: "Ybarra",
    suffix: "Jr.",
    personnel_type: "military",
    rank: "Second Lieutenant",
    team_id: "team-sg-test",
    role: "Technical Expert",
    status: "active"
};

export const mockPersonnel = [
    {
        id: '1',
        rank: 'Colonel',
        role: 'Team Leader',
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
        role: 'Archeology Expert',
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
        role: 'Combat Support',
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
        role: 'Combat Expert',
        team_id: 'team-sg-1',
        teams: { designation: 'SG-1' },
        status: 'active',
        prefix: null,
        first_name: "Teal'c",
        middle_name: '',
        last_name: null,
        suffix: '',
        personnel_type: 'civilian'
    },
    {
        id: '7',
        rank: 'Lieutenant General',
        role: 'Base Commanding Officer',
        team_id: 'team-sg-command',
        teams: { designation: 'SGC' },
        status: 'active',
        prefix: 'Mr.',
        first_name: 'George',
        middle_name: 'S.',
        last_name: 'Hammond',
        suffix: '',
        personnel_type: 'military'
    }
];

// Teams
export const mockTeams = [
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
        commanding_officer: mockPersonnel[6].id,
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
