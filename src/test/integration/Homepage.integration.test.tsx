import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import Homepage from '../../pages/Homepage'
import PersonnelList from '../../pages/PersonnelList';
import TeamList from '../../pages/TeamList';
import { PATHS } from '../../lib/paths';

const user = userEvent.setup();

describe('Homepage (integration)', () => {
    it('navigates to Personnel List from Homepage', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.HOME]}>
                <Routes>
                    <Route path={PATHS.HOME} element={<Homepage />} />
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                </Routes>
            </MemoryRouter>
        );

    
        const personnel = await screen.findByRole('link', { name: 'PERSONNEL LIST' });
        await user.click(personnel);

        const jack = await screen.findByText(/Col Jack O'Neill/);
        expect(jack).toBeInTheDocument(); 
        expect(await screen.findByRole('button', { name: 'Home' }));
    });

    it('navigates to Team List from Homepage', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.HOME]}>
                <Routes>
                    <Route path={PATHS.HOME} element={<Homepage />} />
                    <Route path={PATHS.TEAM_LIST} element={<TeamList />} />
                </Routes>
            </MemoryRouter>
        );

    
        const team = await screen.findByRole('link', { name: 'TEAM LIST' });
        await user.click(team);

        const sg1 = await screen.findByText('SG-1');
        expect(sg1).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Home' }));
    });
});