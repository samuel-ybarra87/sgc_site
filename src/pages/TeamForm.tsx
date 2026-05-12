import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import { rankAbbreviations } from '../lib/rankAbbreviations';

type TeamFormData = {
    designation: string;
    commanding_officer: string;
    status: string;
};

type PersonnelOptions = {
    id: string;
    prefix: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    rank: string;
    status: string;
};

const defaultForm: TeamFormData = {
    designation: '',
    commanding_officer: '',
    status: 'active',
};

export default function TeamForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<TeamFormData>(defaultForm);
    const [loading, setLoading] = useState(false);
    const isEditing = Boolean(id);
    const [fetching, setFetching] = useState(isEditing);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [personnel, setPersonnel] = useState<PersonnelOptions[]>([]);

    useEffect(() => {
        async function fetchPersonnel() {
            const { data, error } = await supabase
                .from('personnel')
                .select('*, roles!inner(name)')
                .eq('roles.name', 'Commanding Officer')
                .eq('status', 'active')
                .order('last_name', { ascending: true });
            if (error) console.error(error);
            else setPersonnel(data);
        }
        fetchPersonnel();

        if (!isEditing) return;

        async function fetchTeams() {
            const { data, error } = await supabase
                .from('teams')
                .select('*')
                .eq('id', id)
                .single();
            if (error) console.error(error);
            else setForm(data);
            setFetching(false);
        }

        fetchTeams();
    }, [id, isEditing]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);

        if(!form.commanding_officer){
            setSubmitError('Please select a Commanding Officer.');
            setLoading(false);
            return;
        }

        const formData = {
            ...form,
            commanding_officer: form.commanding_officer === '' ? null : form.commanding_officer,
        }

        if (isEditing) {
            const { error } = await supabase
                .from('teams')
                .update(formData)
                .eq('id', id);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.TEAM_LIST);
        } else {
            const { error } = await supabase
                .from('teams')
                .insert(formData);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.TEAM_LIST);
        }

        setLoading(false);
    }

    if (fetching) return <p>Loading...</p>;

    return (
    <div>
        <h1>{isEditing ? 'Edit Team' : 'Add Team'}</h1>
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
        <form onSubmit={handleSubmit}>
            <div className="form-row-3">
                <div className="form-group">
                    <label htmlFor="designation">Designation: </label>
                    <input id="designation" name="designation" value={form.designation} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="commanding_officer">Commanding Officer: </label>
                        <select id="commanding_officer" name="commanding_officer" value={form.commanding_officer} onChange={handleChange}>
                            <option value="">None</option>
                            {personnel.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {`${rankAbbreviations[person.rank] ?? person.rank} ` }
                                    {`${person.first_name} `}
                                    {person.middle_name ? ` ${person.middle_name} ` : ''} 
                                    {person.last_name}
                                    {person.suffix ? ` ${ person.suffix}` : ''}
                                </option>
                            ))}
                        </select>
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status: </label>
                    <select id="status" name="status" value={form.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => navigate(PATHS.TEAM_LIST)}>Cancel</button>
            </div>
        </form>
    </div>
    );
}