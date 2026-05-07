// Mock Data
export const e2eTestRecords = {
    e2eTestRec : {
    prefix: "Mr.",
    first_name: "Samuel",
    middle_name: "Test",
    last_name: "Ybarra",
    suffix: "TEST1",
    personnel_type: "military",
    rank: "Second Lieutenant",
    team_id: "team-sg-test",
    teams: { designation: 'SG-Test' },
    role: "Technical Expert",
    status: "active"
    },
    e2eTestRec2: {
        rank: 'Major',
        role: 'Combat Support',
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
        role: 'Test Role',
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
        role: 'Test Role',
        team_id: 'team-sg-test',
        teams: { designation: 'SG-Test' },
        status: 'active',
        prefix: 'Dr.',
        first_name: 'Civilian',
        middle_name: 'Test',
        last_name: 'Fields',
        suffix: 'TEST',
        personnel_type: 'civilian'
    }
}

export const TEST_PERSONNEL_NAMES = Object.values(e2eTestRecords).map(p => p.suffix);

export const e2eTestTeams = [
    {
        designation: 'SG-Test-1',
        status: 'active'
    },
    {
        designation: 'SG-Test-2',
        status: 'active'
    },
    {
        designation: 'SG-Unassigned-Test',
        status: 'inactive'
    }
]

export const TEST_TEAM_DESIGNATIONS = e2eTestTeams.map(t => t.designation);