// Mock Data
export const e2eTestRecords = {
    e2eTestRec : {
        prefix: "Mr.",
        first_name: "Samuel",
        middle_name: "Test",
        last_name: "Ybarra",
        suffix: "TEST",
        personnel_type: "military",
        rank: "Colonel",
        team_id: "team-sg-test",
        teams: { designation: 'SG-Test' },
        role: '',
        role_id: 'test-commander-role',
        roles: { name: 'Commanding Officer' },
        status: "active"
    },
    e2eTestRec2: {
        rank: 'Major',
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'kia',
        prefix: 'Mr.',
        first_name: 'Carl',
        middle_name: 'Test',
        last_name: 'Baker',
        suffix: 'TEST',
        personnel_type: 'military'
    },
    e2eTestRec3 : {
        rank: null,
        role: 'Computer Expert',
        role_id: null,
        roles: { name: null },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'inactive',
        prefix: 'Dr.',
        first_name: 'Samantha',
        middle_name: 'Test',
        last_name: 'Shepard',
        suffix: 'TEST',
        personnel_type: 'civilian'
    },
    e2eTestMilitary: {
        rank: 'Airman Basic',
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Mr.',
        first_name: 'E2E',
        middle_name: 'Test',
        last_name: 'Military',
        suffix: 'TEST',
        personnel_type: 'military'
    },
    e2eTestCivilian : {
        rank: null,
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'Civilian',
        middle_name: 'Test',
        last_name: 'Fields',
        suffix: 'TEST',
        personnel_type: 'civilian'
    },
    teamMember1 : {
        rank: 'Major',
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'John',
        middle_name: '',
        last_name: 'Smith',
        suffix: 'TEST',
        personnel_type: 'military'
    },
    teamMember2 : {
        rank: 'Captain',
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Ms.',
        first_name: 'Jane',
        middle_name: '',
        last_name: 'Smith',
        suffix: 'TEST',
        personnel_type: 'military'
    },
    teamMember3 : {
        rank: null,
        role: '',
        role_id: 'test-role',
        roles: { name: 'Test Role' },
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'Alex',
        middle_name: '',
        last_name: 'Smith',
        suffix: 'TEST',
        personnel_type: 'civilian'
    }
}

export const TEST_PERSONNEL_NAMES = Object.values(e2eTestRecords).map(p => p.suffix);

export const e2eTestTeams = [
    {
        designation: 'SG-Test-1',
        commanding_officer: null,
        status: 'active'
    },
    {
        designation: 'SG-Test-2',
        commanding_officer: null,
        status: 'active'
    }
]

export const TEST_TEAM_DESIGNATIONS = e2eTestTeams.map(t => t.designation);

export const e2eTestRoles = [
    {
        name: 'Test Role'
    }
]

export const TEST_ROLE_NAMES = e2eTestRoles.map(r => r.name);