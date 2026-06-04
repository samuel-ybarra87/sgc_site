import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import MissionDetail from '../pages/MissionDetail';
import { mockMissions, mockPersonnel, mockTeamPersonnelLink } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';
import { extractDate, extractName } from '../lib/utils';
import type { Personnel } from '../lib/types';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const user = userEvent.setup();
const { objectives: abydosObjectives, teams: abydosTeams, id: abydosID, ...abydos } = mockMissions[0];
const { objectives: missionObjectives, teams: missionTeams, id: missionID, ...mission } = mockMissions[1];

describe('MissionDetail', () => {
    it('displays a message when no record is found', async () => {
        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: abydosTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: abydosTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => abydosTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: null,
                        error: { message: 'no rows returned', code: 'PGRST116' }
                    }),
                }),
            }),
        } as any);

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(abydosID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        const message = await screen.findByText('Mission record not found.');
        expect(message).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () =>{
        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: abydosTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: abydosTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => abydosTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: null,
                        error:  { message: 'connection failed', code: '500' }
                    }),
                }),
            }),
        } as any);

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(abydosID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        const message = await screen.findByText(/Error 500: An unexpected error occurred./);
        expect(message).toBeInTheDocument();
    });

    it('should load relevant mission details when data is returned (completed missions)', async () => {
        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: abydosTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: abydosTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => abydosTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
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

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(abydosID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        expect(await screen.findByRole('heading', { name: "Mission Record" })).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Status: ${abydos.status}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission Start: ${extractDate(abydos.start_date)}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission End: ${extractDate(abydos.end_date)}`))).toBeInTheDocument();
        expect(await screen.findByText("TEAMS:")).toBeInTheDocument();

        for(const [i, team] of abydosTeams.entries()){
            const teamHeader = await screen.findByTitle(`team-name ${i}`);
            expect(teamHeader).toHaveTextContent(team.designation);

            const teamMembers = mockPersonnel.filter(p => 
                mockTeamPersonnelLink.some(l =>
                    l.team_id === team.id && l.personnel_id === p.id
                )
            )

            for(const [j, person] of teamMembers.entries()) {
                const memberRow = await screen.findByTitle(`team ${i} member ${j}`);
                expect(memberRow).toHaveTextContent(extractName(person));
            }
        }

        expect(await screen.findByText("OBJECTIVES:")).toBeInTheDocument();

        for(const [i, obj] of abydosObjectives.entries()) {
            const objective = await screen.findByTitle(`objective ${i}`);
            expect(objective).toHaveTextContent(`- ${obj.objective}`)

            const checkbox = await screen.findByTitle(`objective-status ${i}`);
            if(obj.is_completed) expect(checkbox).toBeChecked();
            else expect(checkbox).not.toBeChecked();
        }

        expect(await screen.findByText("Mission Debriefing")).toBeInTheDocument();
        expect(await screen.findByTitle("mission-description")).toHaveTextContent(abydos.description!);
    });

    it('should load relevant mission details when data is returned (active missions)', async () => {
        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: missionTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: missionTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => missionTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: {
                            ...mission,
                            id: missionID,
                            objectives: missionObjectives
                        },
                        error: null
                    }),
                }),
            }),
        } as any);

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(missionID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        expect(await screen.findByRole('heading', { name: "Mission Record" })).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Status: ${mission.status}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission Start: ${extractDate(mission.start_date)}`))).toBeInTheDocument();
        expect(await screen.queryByText(new RegExp(/Mission End:/))).not.toBeInTheDocument();
        expect(await screen.findByText("TEAMS:")).toBeInTheDocument();

        for(const [i, team] of missionTeams.entries()){
            const teamHeader = await screen.findByTitle(`team-name ${i}`);
            expect(teamHeader).toHaveTextContent(team.designation);

            const teamMembers: Personnel[] = mockPersonnel.filter(p => 
                mockTeamPersonnelLink.some(l =>
                    l.team_id === team.id && l.personnel_id === p.id
                )
            )

            for(const [j, person] of teamMembers.entries()) {
                const memberRow = await screen.findByTitle(`team ${i} member ${j}`);
                expect(memberRow).toHaveTextContent(extractName(person));
            }
        }

        expect(await screen.findByText("OBJECTIVES:")).toBeInTheDocument();

        for(const [i, obj] of missionObjectives.entries()) {
            const objective = await screen.findByTitle(`objective ${i}`);
            expect(objective).toHaveTextContent(`- ${obj.objective}`)

            const checkbox = await screen.findByTitle(`objective-status ${i}`);
            if(obj.is_completed) expect(checkbox).toBeChecked();
            else expect(checkbox).not.toBeChecked();
        }

        expect(await screen.queryByText("Mission Debriefing")).not.toBeInTheDocument();
        expect(await screen.queryByTitle("mission-description")).not.toBeInTheDocument();
    });

    it('should retun to List view after confirming delete record', async () =>{
        // Delete mock db entries
        const mockDelete = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null })
        });

        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: missionTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: missionTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => missionTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: {
                            ...mission,
                            id: missionID,
                            objectives: missionObjectives
                        },
                        error: null
                    }),
                }),
            }),
        } as any);

        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        vi.mocked(supabase.from).mockReturnValueOnce({
            delete: mockDelete,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            delete: mockDelete,
        } as any);

        vi.mocked(supabase.from).mockReturnValueOnce({
            delete: mockDelete,
        } as any);

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(missionID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
              <Route path={PATHS.MISSION_LIST} element={<h1>Mission List</h1>} />
            </Routes>
          </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: "Delete" }));

        expect(mockDelete).toHaveBeenCalled();
        expect(await screen.findByRole('heading', { name: "Mission List" }));
    });

    it('should stay on detail page after cancelling delete', async () =>{
        // missions_teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    data: missionTeams.map(team => ({ team_id: team.id })),
                    error: null
                }),
            }),
        } as any);

        // teams
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    order: vi.fn().mockReturnValueOnce({
                        data: missionTeams,
                        error: null
                    }),
                }),
            }),
        } as any);

        // team_personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValueOnce({
                    data: mockTeamPersonnelLink.filter(l => missionTeams.some(t => t.id === l.team_id)),
                    error: null })
            }),
        } as any);

        // personnel
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                in: vi.fn().mockReturnValueOnce({
                    data: mockPersonnel.filter(p => mockTeamPersonnelLink.some(l => l.personnel_id === p.id))
                })
            })
        } as any);

        // specific mission
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
                eq: vi.fn().mockReturnValueOnce({
                    single: vi.fn().mockResolvedValueOnce({
                        data: {
                            ...mission,
                            id: missionID,
                            objectives: missionObjectives
                        },
                        error: null
                    }),
                }),
            }),
        } as any);

        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

        render(
          <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(missionID)]}>
            <Routes>
              <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
          </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: "Delete" }));

        expect(await screen.findByRole('heading', { name: "Mission Record" })).toBeInTheDocument();
        expect(await screen.findByText(mission.destination)).toBeInTheDocument();
    });
});