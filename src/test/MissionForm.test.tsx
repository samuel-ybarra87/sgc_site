import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MissionForm from '../pages/MissionForm';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import MissionList from '../pages/MissionList';
import { mockTeams, mockMissions, mockMissionData } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

const user = userEvent.setup();
const abydos = mockMissions[0];
const { objectives, teams, id: mockMissionID, ...mockMission } = mockMissionData;

describe('MissionForm', () => {

    beforeEach(() =>{
        vi.resetAllMocks();
    });

    it('should show empty fields for new entries', async () =>{

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        expect(await screen.findByLabelText('Name:')).toHaveValue('');
        expect(await screen.findByLabelText('Destination:')).toHaveValue('');
        expect(await screen.findByLabelText('Status:')).toHaveValue('active');
        expect(await screen.findByLabelText('Start Date:')).toHaveValue('');
        expect(await screen.findByLabelText('End Date:')).toHaveValue('');
        expect(await screen.findByLabelText('Team 1:')).toHaveValue('');
        expect(await screen.findByLabelText('Objective 1:')).toHaveValue('');
        expect(await screen.findByLabelText('Report:')).toHaveValue('');
    });

    it('should insert values into database after clicking save', async () => {
        // Save to mock db
        const mockSubmitData = vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                single: vi.fn().mockResolvedValueOnce({
                    data: { id: mockMissionID, ...mockMission },
                    error: null
                })
            }),
        });

        const missionTeamLink = vi.fn().mockReturnValueOnce({
            data: { mission_id: mockMissionID, team_id: teams[0].id },
            error: null
        });

        const mockObjective = vi.fn().mockReturnValueOnce({
            data: objectives[0],
            error: null
        });

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockSubmitData,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: missionTeamLink,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockObjective,
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        // Enter mock data into fields
        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id)
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);

        // click save
        await user.click(await screen.findByText('Save'));

        expect(mockSubmitData).toHaveBeenCalled();
        expect(missionTeamLink).toHaveBeenCalled();
        expect(mockObjective).toHaveBeenCalled();
    });

    it('should display error message when mission insert fails', async () => {
        const mockSubmitData = vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                single: vi.fn().mockResolvedValueOnce({
                    error: { message: 'insert failed' }
                })
            }),
        });

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockSubmitData,
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
        insert: mockSubmitData,
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        // Enter mock data into fields
        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id)
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);

        // click save
        await user.click(await screen.findByText('Save'));
        const error = await screen.findByText('insert failed');

        expect(mockSubmitData).toHaveBeenCalled();
        expect(error).toBeInTheDocument();
    });

    it('should display error message when mission-team-link insert fails', async () => {
        const mockSubmitData = vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                single: vi.fn().mockResolvedValueOnce({
                    data: { id: mockMissionID, ...mockMission },
                    error: null
                })
            }),
        });

        const missionTeamLink = vi.fn().mockReturnValueOnce({
            error: { message: 'insert failed' }
        });

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockSubmitData,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: missionTeamLink,
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
        insert: mockSubmitData,
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        // Enter mock data into fields
        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id)
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);

        // click save
        await user.click(await screen.findByText('Save'));
        const error = await screen.findByText('insert failed');

        expect(mockSubmitData).toHaveBeenCalled();
        expect(missionTeamLink).toHaveBeenCalled();
        expect(error).toBeInTheDocument();
    });

    it('should display error message when mission-objectives insert fails', async () => {
        const mockSubmitData = vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                single: vi.fn().mockResolvedValueOnce({
                    data: { id: mockMissionID, ...mockMission },
                    error: null
                })
            }),
        });

        const missionTeamLink = vi.fn().mockReturnValueOnce({
            data: { mission_id: mockMissionID, team_id: teams[0].id },
            error: null
        });

        const mockObjective = vi.fn().mockReturnValueOnce({
            error: { message: 'insert failed' }
        });

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockSubmitData,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: missionTeamLink,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            insert: mockObjective,
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
        insert: mockSubmitData,
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        // Enter mock data into fields
        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id)
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);

        // click save
        await user.click(await screen.findByText('Save'));
        const error = await screen.findByText('insert failed');

        expect(mockSubmitData).toHaveBeenCalled();
        expect(missionTeamLink).toHaveBeenCalled();
        expect(mockObjective).toHaveBeenCalled();
        expect(error).toBeInTheDocument();
    });

    it('should show error message if team 1 is empty', async () => {
        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);

        // click save
        await user.click(await screen.findByText('Save'));

        const err = await screen.getByText('Please select Team 1.');
        
        expect(err).toBeInTheDocument();
    });

    it('should show error message if extra team is empty', async () => {
        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);
        // click save
        await user.click(await screen.findByText('Save'));
        
        expect(await screen.findByText('Please select Team 1.')).toBeInTheDocument();

        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id);
        await user.click(screen.getByRole('button', { name: 'Add Team' }))
        // click save
        await user.click(await screen.findByText('Save'));
        
        expect(await screen.findByText('Please select Team 2.')).toBeInTheDocument();
    });

    it('should remove the exta team based on index', async () => {
        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        expect(await screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();

        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id);
        await user.click(screen.getByRole('button', { name: 'Add Team' }))

        expect(await screen.findByLabelText('Team 2:')).toBeInTheDocument();
        expect(await screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();

        await user.selectOptions(await screen.findByLabelText('Team 2:'), mockTeams[1].id);
        await user.click(screen.getByRole('button', { name: 'Add Team' }))

        expect(await screen.findByLabelText('Team 3:')).toBeInTheDocument();
        expect(await screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();

        await user.click(await screen.findByTestId('remove-button-2'));
    });

    it('should show error message if objective 1 is empty', async () => {        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id);
        // click save
        await user.click(await screen.findByText('Save'));
        
        expect(await screen.findByText('Please fill out Objective 1.')).toBeInTheDocument();
    });

    it('should show error message if extra objective is empty', async () => {        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter>
                <MissionForm />
            </MemoryRouter>
        );

        await user.type(await screen.findByLabelText('Name:'), mockMission.name);
        await user.type(await screen.findByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(await screen.findByLabelText('Status:'), mockMission.status);
        await user.type(await screen.findByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id);
        // click save
        await user.click(await screen.findByText('Save'));
        
        expect(await screen.findByText('Please fill out Objective 1.')).toBeInTheDocument();

        await user.type(await screen.findByLabelText('Objective 1:'), objectives[0].objective);
        await user.click(screen.getByRole('button', { name: 'Add Objective' }))
        // click save
        await user.click(await screen.findByText('Save'));
        
        expect(await screen.findByText('Please fill out Objective 2.')).toBeInTheDocument();
    });

    // it('should show values of record to edit', async () =>{

    //     // personnel
    //     vi.mocked(supabase.from).mockReturnValueOnce({
    //     select: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
    //     })
    //     })
    //     }),
    //     } as any);

    //     vi.mocked(supabase.from).mockReturnValueOnce({
    //     select: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     single: vi.fn().mockResolvedValueOnce({ data: mockTeams[0], error: null }),
    //     }),
    //     }),
    //     } as any);

    //     render(
    //     <MemoryRouter initialEntries={[PATHS.TEAM_EDIT(mockTeams[0].id)]}>
    //     <Routes>
    //     <Route path={ROUTES.TEAM_EDIT} element={<MissionForm />} />
    //     </Routes>
    //     </MemoryRouter>
    //     );

    //     expect(await screen.findByLabelText('Designation:')).toHaveValue("SG-1");
    //     expect(await screen.findByLabelText('Commanding Officer:')).toHaveDisplayValue("Col Jack O'Neill");
    //     expect(await screen.findByLabelText('Status:')).toHaveValue('active');
    // });

    // it('should update values into database after clicking save', async () => {
    //     // Populate mock database with data

    //     // personnel
    //     vi.mocked(supabase.from).mockReturnValueOnce({
    //     select: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
    //     })
    //     })
    //     }),
    //     } as any);

    //     vi.mocked(supabase.from).mockReturnValueOnce({
    //     select: vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockReturnValueOnce({
    //     single: vi.fn().mockResolvedValueOnce({ data: mockTeams[4], error: null }),
    //     }),
    //     }),
    //     } as any);

    //     const updateMock = vi.fn().mockReturnValueOnce({
    //     eq: vi.fn().mockResolvedValueOnce({ error: null }),
    //     });

    //     // Save to mock db
    //     vi.mocked(supabase.from).mockReturnValueOnce({
    //     update: updateMock,
    //     } as any);

    //     render(
    //     <MemoryRouter initialEntries={[PATHS.TEAM_EDIT(mockTeams[4].id)]}>
    //     <Routes>
    //     <Route path={ROUTES.TEAM_EDIT} element={<MissionForm />} />
    //     </Routes>
    //     </MemoryRouter>
    //     );

    //     // Type into fields
    //     await user.selectOptions(await screen.findByLabelText('Commanding Officer:'), mockPersonnel[0].id);
    //     // click save
    //     await user.click(screen.getByText('Save'));

    //     // Expected behavior
    //     expect(updateMock).toHaveBeenCalled();
    // });

    it('should navigate back to mission list when cancelling (add)', async () =>{
        // Populate mock database with data
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockMissions, error: null }),
            }),
        } as any);

        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_NEW]}>
                <Routes>
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        const title = await screen.findByText(/SGC Mission Records/);
        const abydosLink = await screen.findByRole('link', { name: `${abydos.destination} | ${abydos.name} | ${abydos.status}`})

        expect(title).toBeInTheDocument();
        expect(abydosLink).toBeInTheDocument();
    });
});