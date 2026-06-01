import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Mission, Personnel } from '../lib/types';
import { PATHS } from '../lib/paths';
import { rankAbbreviations } from '../lib/rankAbbreviations';

export default function MissionDetail(){
    const user = { authorized: true };
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; code: string } | null>(null);
    const [persons, setPersons] = useState<Personnel[] | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);

    function extractName(person: Personnel){
        const rank = rankAbbreviations[person.rank ?? ''];
        const prefix = person.personnel_type === 'military' ? `${rank} ` : (person.prefix ? `${person.prefix} ` : '');
        const name = `${person.first_name}${person.middle_name ? ` ${person.middle_name} `: ' '}${person.last_name ?? ''}${person.suffix ? ` ${person.suffix}` : ''}`
        
        return `${prefix}${name}`;
    }

    function extractDate(timestamp: string){
        const [date, time] = timestamp.slice(0,16).split('T');

        return `${date} ${time}`;
    }

    useEffect(()=>{
        async function fetchData() {
            // Find assigned teams
            setLoading(true);
            const { data: assignedTeamIDs, error: fetchTeamIDError } = await supabase
                .from('missions_teams')
                .select('team_id')
                .eq('mission_id', id);
            if(fetchTeamIDError){
                console.error(fetchTeamIDError.message);
                setError({
                    message: fetchTeamIDError.message,
                    code: fetchTeamIDError.code
                });
                setLoading(false);
                return;
            }

            const teamIds = (assignedTeamIDs || []).map(row => row.team_id);

            const { data: assignedTeams, error: fetchTeamErrors } =  await supabase
                .from('teams')
                .select('*')
                .in('id', teamIds);
            if(fetchTeamErrors){
                console.error(fetchTeamErrors.message);
                setError({
                    message: fetchTeamErrors.message,
                    code: fetchTeamErrors.code
                });
                setLoading(false);
                return;
            }

            // Find assigned personnel
            const { data: personnelLink, error: fetchPersonIDError } = await supabase
                .from('team_personnel')
                .select('*')
                .in('team_id', teamIds);
            if(fetchPersonIDError){
                console.error(fetchPersonIDError.message);
                setError({
                    message: fetchPersonIDError.message,
                    code: fetchPersonIDError.code
                });
                setLoading(false);
                return;
            }

            const personIDs = personnelLink.map(row => row.personnel_id);

            const { data: personnel, error: fetchPersonError } = await supabase
                .from('personnel')
                .select(`
                    *,
                    teams!personnel_team_id_fkey(designation),
                    roles!personnel_role_id_fkey(name)`)
                .in('id', personIDs);
            if(fetchPersonError){
                console.error(fetchPersonError.message);
                setError({ message: fetchPersonError.message, code: fetchPersonError.code });
                setLoading(false);
                return;
            } else {
                const assginedPersonnel: Personnel[] = (personnel || []).map(p =>({
                    ...p,
                    team_id: personnelLink.find(l => l.personnel_id === p.id)?.team_id || p.team_id
                }));
                setPersons(assginedPersonnel)
            };

            // Find mission record and objectives
            const { data: missionData, error: fetchMissionError } = await supabase
                .from('missions')
                .select(`*, objectives:mission_objectives(*)`)
                .eq('id', id)
                .single();
            if(fetchMissionError){
                if(fetchMissionError.code === 'PGRST116'){
                    setMission(null);
                } else {
                    console.error(fetchMissionError.message);
                    setError({ message: 'An unexpected error occurred.', code: '500' });
                    setLoading(false);
                    return;
                }
            } else setMission({...missionData, teams: assignedTeams ?? [] });

            setLoading(false);
        }

        fetchData();
    }, [id]);

    async function handleDelete() {
        if(!confirm('Are you sure you want to delete this record?')) return;

        const { error: teamError } = await supabase
            .from('missions_teams')
            .delete()
            .eq('mission_id', id);
        if(teamError){
            setError({ message: teamError.message, code: teamError.code });
            return;
        }

        const { error: objError } = await supabase
            .from('mission_objectives')
            .delete()
            .eq('mission_id', id);
        if(objError){
            setError({ message: objError.message, code: objError.code });
            return;
        }

        const { error: missionError } = await supabase
            .from('missions')
            .delete()
            .eq('id', id);
        if(missionError){
            setError({ message: missionError.message, code: missionError.code });
            return;
        } else {
            navigate(PATHS.MISSION_LIST);
        }
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error {error.code}: {error.message}</p>;
    if (!mission) return <p>Mission record not found.</p>;

    return(
        <div>
            <h1>Mission Record</h1>
            <h2>{mission.destination}</h2>
            <p>Status: {mission.status}</p>
            <p>Mission Start: {extractDate(mission.start_date)}</p>
            <div>{mission.end_date && <p>Mission End: {extractDate(mission.end_date)}</p>}</div>
            <div><b>TEAMS:</b>
                {mission.teams.map((team, i) => (
                    <div key={team.id}>
                        <strong title={`team-name ${i}`}><i>{team.designation}</i></strong>
                        {persons!.filter(p => p.team_id === team.id).map((person, j) => (
                            <p title={`team ${i} member ${j}`} key={person.id}>
                                {extractName(person)}
                            </p>
                        ))}
                    </div>
                ))}
            </div>
            <div>OBJECTIVES:
                {mission.objectives.map((obj, i) => {
                    const display = !obj.secret_objective || (user.authorized && obj.secret_objective);

                    if(!display) return null;

                    return (
                        <div key={obj.id}>
                            <p title={`objective ${i}`}>- {obj.objective}</p>
                            <input title={`objective-status ${i}`} type='checkbox' checked={obj.is_completed} readOnly></input>
                        </div>
                    );
                })}
            </div>
            <p>Mission Debriefing</p>
            <p>{mission.description}</p>

            <div className="form-actions">
                <div className='submit-buttons'>
                    <button onClick={() => navigate(PATHS.MISSION_LIST)}>Back</button>
                    <button onClick={() => navigate(PATHS.MISSION_EDIT(mission.id))}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
}