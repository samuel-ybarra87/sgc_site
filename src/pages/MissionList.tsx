import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import type { Mission } from '../lib/types';
import { PATHS } from '../lib/paths';

export default function missionsList() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMissions() {
        const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('start_date', { ascending: true});
        if (error) {
            console.error(error);
            setError(error.message);
        } else setMissions(data);
        setLoading(false);
        }

        fetchMissions();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (error) return <p>No mission records found.</p>;

    return (
        <div>
        <h1>SGC Mission Records</h1>
        <button onClick={() => navigate(PATHS.HOME)}>Home</button>
        <button onClick={() => navigate(PATHS.MISSION_NEW)}>Add Mission Record</button>
        {missions.length === 0 ? (
            <p>No mission records found.</p>
        ) : (
            <div>
                <ul>
                    {missions.map((m) => (
                    <li key={m.id}>
                        <Link to={`/missions/${m.id}`}>
                        {m.destination} | {m.name} | {m.status}
                        </Link>
                    </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
}