import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Homepage from '../pages/Homepage';

describe('Homepage', () => {
  it('displays a list of links to each record type', async () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

    const header = await screen.findByText('Stargate Command Records');
    const personnel = await screen.findByRole('link', { name: 'PERSONNEL LIST' });
    const team = await screen.findByRole('link', { name: 'TEAM LIST' });
    expect(header).toBeInTheDocument();
    expect(personnel).toBeInTheDocument();
    expect(team).toBeInTheDocument();
  });
});