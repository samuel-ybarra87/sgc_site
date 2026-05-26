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
const abydosData = mockMissions[0];
const { objectives, teams, id: mockMissionID, ...mockMission } = mockMissionData;
const { objectives: abydosObjectives, teams: abydosTeams, id: abydosID, ...abydos } = abydosData;

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

    it('should toggle button states for completed and classified', async () => {
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

        const completedBtn = await screen.findByRole('button', { name: 'Completed' });
        const classifiedBtn = await screen.findByRole('button', { name: 'Classified' });

        expect(completedBtn).toHaveAttribute('aria-pressed', 'false');
        expect(classifiedBtn).toHaveAttribute('aria-pressed', 'false');

        await user.click(completedBtn);
        await user.click(classifiedBtn);

        expect(completedBtn).toHaveAttribute('aria-pressed', 'true');
        expect(classifiedBtn).toHaveAttribute('aria-pressed', 'true');

        await user.click(completedBtn);
        await user.click(classifiedBtn);

        expect(completedBtn).toHaveAttribute('aria-pressed', 'false');
        expect(classifiedBtn).toHaveAttribute('aria-pressed', 'false');
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

        expect(screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();

        await user.selectOptions(await screen.findByLabelText('Team 1:'), teams[0].id);
        await user.click(screen.getByRole('button', { name: 'Add Team' }))

        expect(await screen.findByLabelText('Team 2:')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();

        await user.selectOptions(await screen.findByLabelText('Team 2:'), mockTeams[1].id);
        await user.click(screen.getByRole('button', { name: 'Add Team' }))

        expect(await screen.findByLabelText('Team 3:')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Team 2:')).toHaveDisplayValue(mockTeams[1].designation);

        const removeButtons = await screen.findAllByRole('button', { name: /Remove/i });
        await user.click(removeButtons[1]);

        expect(screen.queryByText('Team 3:')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Team' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Team 2:')).toHaveDisplayValue("Select a Team");
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

    it('should remove the exta objective based on index', async () =>{
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

        expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();

        await user.click(await screen.findByRole('button', { name: 'Add Objective' }));
        await user.click(await screen.findByRole('button', { name: 'Add Objective' }));
        await user.type(await screen.findByText(/Objective 2:/), "Test");

        expect(await screen.findByText(/Objective 1:/)).toBeInTheDocument();
        expect(await screen.findByText(/Objective 2:/)).toBeInTheDocument();
        expect(await screen.findByText(/Objective 3:/)).toBeInTheDocument();
        expect(await screen.findByLabelText(/Objective 2:/)).toHaveValue("Test");

        const removeButtons = await screen.findAllByRole('button', { name: /Remove/i });
        await user.click(removeButtons[1]);

        expect(await screen.queryByText(/Objective 3:/)).not.toBeInTheDocument();
        expect(await screen.findByLabelText(/Objective 2:/)).toHaveValue("");
    });

    it('should show values of record to edit', async () =>{
        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
            }),
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: {
                            ...abydos,
                            id: abydosID,
                            objectives: abydosObjectives
                        },
                        error: null
                    }),
                }),
            }),
        } as any);

        // teams assigned
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: [{ team_id: abydosTeams[0].id }],
                    error: null
                }),
            }),
        } as any);

        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_EDIT(abydosID)]}>
                <Routes>
                    <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        const teamList = await screen.findAllByLabelText(/Team/i);
        const missionObjectives = await screen.findAllByLabelText(/Objective/i);
        const completedBtn = await screen.findAllByRole('button', { name: /Completed/i });
        const classifiedBtn = await screen.findAllByRole('button', { name: /Classified/i });

        expect(teamList).toHaveLength(abydosTeams.length);
        expect(missionObjectives).toHaveLength(abydosObjectives.length);
        expect(completedBtn).toHaveLength(abydosObjectives.length);
        expect(classifiedBtn).toHaveLength(abydosObjectives.length);

        expect(await screen.findByLabelText("Name:")).toHaveValue(abydos.name);
        expect(await screen.findByLabelText("Destination:")).toHaveValue(abydos.destination);
        expect(await screen.findByLabelText("Status:")).toHaveValue(abydos.status);
        expect(await screen.findByLabelText("Start Date:")).toHaveValue(abydos.start_date.slice(0,16));
        expect(await screen.findByLabelText("End Date:")).toHaveValue(abydos.end_date!.slice(0,16));

        teamList.forEach((node, i) => {
            expect(node).toHaveValue(abydosTeams[i].id);
            expect(node).toHaveDisplayValue(abydosTeams[i].designation);
        });
        missionObjectives.forEach((node, i) => expect(node).toHaveValue(abydosObjectives[i].objective));
        completedBtn.forEach((node, i) => expect(node).toHaveAttribute('aria-pressed', `${abydosObjectives[i].is_completed}`));
        classifiedBtn.forEach((node, i) => expect(node).toHaveAttribute('aria-pressed', `${abydosObjectives[i].secret_objective}`));

        expect(await screen.findByLabelText("Report:")).toHaveValue(abydos.description);
    });

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