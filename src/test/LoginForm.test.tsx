import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext'
import userEvent from '@testing-library/user-event';
import LoginForm from '../pages/LoginForm';
import Homepage from '../pages/Homepage'
import Navbar from '../components/Navbar';

const USER = { email: 'user@sgc.gov', role: 'user' };

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
        signInWithPassword: vi.fn(),
    }
  },
}));

// Mock authentication
vi.mock('../components/AuthContext', () => ({
    useAuth: vi.fn(),
}));

const user = userEvent.setup();

describe('Login', () => {
    it('displays a login form for users', async () => {
        render(<LoginForm />);

        const header = await screen.findByText('SGC Personnel Access Portal');
        const email = await screen.findByLabelText('Email Address');
        const password = await screen.findByLabelText('Password');
        const login = await screen.findByRole('button', { name: 'Log In' });
        expect(header).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(login).toBeInTheDocument();
    });

    it('successfully logs in with correct credentials', async () => {
        // Define the mock resolution
        const mockSignIn = vi.fn().mockResolvedValueOnce({
            data: {
                user: { id: 'mock-user-id', email: 'test@sgc.gov' },
                session: { access_token: 'mock-token' }
            },
            error: null
        });

        // Inject the mock into the mocked supabase client
        supabase.auth.signInWithPassword = mockSignIn;

        render(<LoginForm />);

        // Type in credentials
        await user.type(screen.getByLabelText('Email Address'), 'test@sgc.gov');
        await user.type(screen.getByLabelText('Password'), 'passwordsg1');
        
        // Click submit
        await user.click(screen.getByRole('button', { name: 'Log In' }));

        // Assertions
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@sgc.gov',
            password: 'passwordsg1'
        });
    });

    it('displays an error message when login fails', async () => {
        // Define the mock to reject/return an error
        const mockSignIn = vi.fn().mockResolvedValueOnce({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' }
        });

        supabase.auth.signInWithPassword = mockSignIn;

        render(<LoginForm />);

        await user.type(screen.getByLabelText('Email Address'), 'wrong@sgc.gov');
        await user.type(screen.getByLabelText('Password'), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: 'Log In' }));

        // Assert that your component displays the error message to the user
        const errorMessage = await screen.findByText('Invalid login credentials');
        expect(errorMessage).toBeInTheDocument();
    });

    it('should show email address for authenticated users', async () =>{
        vi.mocked(useAuth).mockReturnValueOnce({
            session: {
                user: { id: 'mock-user-id', email: USER.email }
            },
            error: null,
            role: USER.role,
            loading: false,
        } as any);

        render(
            <MemoryRouter>
                <Navbar userEmail={USER.email} />
                <Homepage />
            </MemoryRouter>
        )

        expect(await screen.findByText('Stargate Command Records')).toBeVisible();
        expect(await screen.findByText(USER.email)).toBeVisible();
    });
});