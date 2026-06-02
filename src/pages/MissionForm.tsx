import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import type { MissionObjectives, Team, MissionTeamLink } from '../lib/types';

type MissionForm = {
    name: string;
    destination: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    objectives: MissionObjectives[]
    teams: Team[];
}

const emptyTeam = { id: '', commanding_officer: '', designation: '', status: '' };
const emptyObjective: MissionObjectives = { id: '', mission_id: '', objective: '', is_completed: false, secret_objective: false };

const defaultForm: MissionForm = {
    name: '',
    destination: '',
    description: '',
    status: 'active',
    start_date: '',
    end_date: '',
    objectives: [emptyObjective],
    teams: [emptyTeam],
}

export default function MissionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [form, setForm] = useState<MissionForm>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [fetching, setFetching] = useState(isEditing);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const eligibleTeams = useMemo(()=>{
        return teams.filter(t => t.designation !== "Unassigned");
    }, [teams]);

    const canAddMoreTeams = useMemo(()=>{
        const activeTeams = eligibleTeams.filter(t => t.status === 'active');

        const hasUnusedActiveTeams = activeTeams.some(activeTeam => !form.teams.includes(activeTeam))

        const isSlotEmpty = form.teams.includes(emptyTeam);

        // Check if any active team is not yet present in the form's teams array
        return hasUnusedActiveTeams && !isSlotEmpty;
    }, [eligibleTeams, form.teams]);

    const availableTeams = (currentIndex: number) => {
        const currentSlot = form.teams[currentIndex];

        const selectableTeams = form.teams
            .filter((_, i) => i !== currentIndex);

        return eligibleTeams.filter(team => {
            if(!selectableTeams.includes(team)
                && team.status === 'active'
                || team === currentSlot)
                return team;
        });
    }

    const addTeamSlot = () =>{
        setForm(prev => ({
            ...prev,
            teams: [...prev.teams, emptyTeam]
        }));
    };

    const removeTeamSlot = (index: number) => {
        if(form.teams.length > 1) {
            const updatedTeams = form.teams.filter((_, i) => i !== index);
            setForm({ ...form, teams: updatedTeams });
        }
    };

    const addObjectiveSlot = () => {
        setForm(prev => ({
            ...prev,
            objectives:[...prev.objectives, emptyObjective]
        }));
    };

    const removeObjectiveSlot = (index: number) => {
        if(form.objectives.length > 1){
            const updatedObjectives = form.objectives.filter((_, i) => i !== index);
            setForm({ ...form, objectives: updatedObjectives });
        }
    };

    useEffect(() => {
        async function loadAllData() {
            setFetching(true);

            // 1. Fetch the master list of all teams first
            const { data: allTeams, error: fetchError } = await supabase
                .from('teams')
                .select('*')
                .order('designation', { ascending: true });
            if (fetchError){
                console.error(fetchError.message);
                setFetching(false);
                return;
            } else setTeams(allTeams);

            if (!isEditing || !id) {
                setFetching(false);
                return;
            }

            // 2. Fetch the specific mission and its members in parallel
            const [missionRes, membersRes] = await Promise.all([
                supabase
                    .from('missions')
                    .select(`*, objectives:mission_objectives(*)`)
                    .eq('id', id)
                    .single(),
                supabase
                    .from('missions_teams')
                    .select('team_id')
                    .eq('mission_id', id)
            ]);

            if (missionRes.data && membersRes.data && allTeams) {
                const ids = membersRes.data.map(row => row.team_id);

                // 3. Match the IDs to the actual team objects from our master list
                const assignedTeams: Team[] = allTeams.filter(team => ids.includes(team.id));

                // 4. Update the form all at once
                setForm({
                    ...missionRes.data,
                    // Ensure we at least have one empty slot if none were assigned
                    teams: assignedTeams.length > 0 ? assignedTeams : [emptyTeam],
                    objectives: missionRes.data.objectives.length > 0 
                        ? missionRes.data.objectives 
                        : [emptyObjective]
                });
            }
            setFetching(false);
        }

        loadAllData();
    }, [id, isEditing]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleTeamChange(index: number, e:React.ChangeEvent<HTMLSelectElement>){
        const team = teams.find(t => t.id === e.target.value);
        const updatedTeams = [...form.teams];
        updatedTeams[index] = team ?? emptyTeam;
        setForm({ ...form, teams: updatedTeams });
    }

    function handleObjectiveChange(index: number, e:React.ChangeEvent<HTMLInputElement>){
        const updatedObjectives = [...form.objectives];
        updatedObjectives[index] = {
            ...updatedObjectives[index],
            objective: e.target.value
        };
        setForm({ ...form, objectives: updatedObjectives });
    }

    const toggleSecretStatus = (index: number) => {
        const updatedObjectives = [...form.objectives];
        updatedObjectives[index] = {
            ...updatedObjectives[index],
            secret_objective: !updatedObjectives[index].secret_objective
        };
        setForm({ ...form, objectives: updatedObjectives });
    }

    const toggleComplete = (index: number) => {
        const updatedObjectives = [...form.objectives];
        updatedObjectives[index] = {
            ...updatedObjectives[index],
            is_completed: !updatedObjectives[index].is_completed
        };
        setForm({ ...form, objectives: updatedObjectives });
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);

        const teamIndex = form.teams.findIndex(item => item.id === '')
        if(teamIndex !== -1 ){
            setSubmitError(`Please select Team ${teamIndex + 1}.`);
            setLoading(false);
            return;
        }

        const objectiveIndex = form.objectives.findIndex(item => item.objective === '');
        if(objectiveIndex !== -1 ){
            setSubmitError(`Please fill out Objective ${objectiveIndex + 1}.`);
            setLoading(false);
            return;
        }

        const formData = {
            ...form,
            description: form.description === '' ? null : form.description,
            start_date: new Date(`${form.start_date.slice(0,16)}Z`).toISOString(),
            end_date: form.end_date === '' ? null : new Date(`${form.end_date.slice(0,16)}Z`).toISOString()
        }

        const { objectives, teams, ...missionData } = formData;
        const cleanObjectives = objectives.map(({ id: _, ...obj }) => obj)
        const missionTeams: MissionTeamLink[] = teams.map(team => ({ mission_id: '', team_id: team.id }));

        if (isEditing && id) {
            // remove join table links
            await supabase
                .from('missions_teams')
                .delete()
                .eq('mission_id', id);
            await supabase
                .from('mission_objectives')
                .delete()
                .eq('mission_id', id);

            // reset mission_id
            cleanObjectives.forEach(obj => obj.mission_id = id);
            missionTeams.forEach(obj => obj.mission_id = id);

            // Insert missions_teams link
            const { error: teamLinkError } = await supabase
                .from('missions_teams')
                .insert(missionTeams)
            
            if (teamLinkError) {
                console.error(teamLinkError);
                setSubmitError(teamLinkError.message);
                setLoading(false);
                return;
            }

            // Insert objective data
            const { error: insertError } = await supabase
                .from('mission_objectives')
                .insert(cleanObjectives);

            if (insertError) {
                console.error(insertError);
                setSubmitError(insertError.message);
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('missions')
                .update(missionData)
                .eq('id', id);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
                setLoading(false);
                return;
            } else navigate(PATHS.MISSION_LIST);

        } else {

            // Insert mission data
            const { data, error: missionError } = await supabase
                .from('missions')
                .insert(missionData)
                .select()
                .single();

            if (missionError) {
                console.error(missionError);
                setSubmitError(missionError.message);
                setLoading(false);
                return;
            } else {
                const missionID = data.id;
                cleanObjectives.forEach(obj => obj.mission_id = missionID);
                missionTeams.forEach(obj => obj.mission_id = missionID);
            }

            // Insert missions_teams link
            const { error: teamLinkError } = await supabase
                .from('missions_teams')
                .insert(missionTeams)
            
            if (teamLinkError) {
                console.error(teamLinkError);
                setSubmitError(teamLinkError.message);
                setLoading(false);
                return;
            }

            // Insert objective data
            const { error: insertError } = await supabase
                .from('mission_objectives')
                .insert(cleanObjectives);

            if (insertError) {
                console.error(insertError);
                setSubmitError(insertError.message);
                setLoading(false);
                return;
            } else navigate(PATHS.MISSION_LIST);
        }

        setLoading(false);
    }
    
    if (fetching) return <p>Loading...</p>;

    return(
        <div>
            <h1>{isEditing ? 'Edit Mission Record' : 'Add Mission Record'}</h1>
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-row-3">
                    <div className="form-group">
                        <label htmlFor="name">Name: </label>
                        <input id="name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="destination">Destination: </label>
                        <input id="destination" name="destination" value={form.destination} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status: </label>
                        <select id="status" name="status" value={form.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="complete">Complete</option>
                            <option value="failed">Failed</option>
                            <option value="aborted">Aborted</option>
                        </select>
                    </div>
                </div>
                <div className="form-row-3">
                    <div className="form-group">
                        <label htmlFor="start_date">Start Date: </label>
                        <input type="datetime-local" id="start_date" name="start_date" value={form.start_date ? form.start_date.slice(0,16) : ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="end_date">End Date: </label>
                        <input type="datetime-local" id="end_date" name="end_date" value={form.end_date ? form.end_date.slice(0,16) : ''} onChange={handleChange} />
                    </div>
                </div>

                {form.teams.map((teamSlot, index) => (
                    <div key={index} className="form-group">
                        <label htmlFor={`team-${index}`}>Team {index + 1}: </label>
                        <div className='button-group'>
                            <select id={`team-${index}`} value={teamSlot.id} onChange={(e) => handleTeamChange(index, e)}>
                                <option value="">Select a Team</option>
                                {availableTeams(index).map((team) =>
                                    <option key={team.id} value={team.id}>
                                        {team.designation}
                                    </option>
                                )}
                            </select>
                            {form.teams.length > 1 && <button id={`remove-team-${index}`} type="button" className="remove-btn" onClick={()=>removeTeamSlot(index)}>Remove</button>}
                        </div>
                    </div>
                ))}

                {form.objectives.map((objectiveSlot, index) => (
                    <div key={index} className="form-group">
                        <label htmlFor={`objective-${index}`}>Objective {index + 1}: </label>
                        <div className="objective-input-row">
                            <input id={`objective-${index}`} value={objectiveSlot.objective} onChange={(e) => handleObjectiveChange(index, e)}/>
                            <button
                                type='button'
                                className={objectiveSlot.is_completed ? 'btn-active' : 'btn-inactive'}
                                onClick={() => toggleComplete(index)}
                                aria-pressed={objectiveSlot.is_completed}
                            >
                                Completed
                            </button>
                            <button
                                type='button'
                                className={objectiveSlot.secret_objective ? 'btn-active' : 'btn-inactive'}
                                onClick={() => toggleSecretStatus(index)}
                                aria-pressed={objectiveSlot.secret_objective}
                            >
                                Classified
                            </button>
                            {form.objectives.length > 1 && <button id={`remove-objective-${index}`} type="button" className="remove-btn" onClick={()=>removeObjectiveSlot(index)}>Remove</button>}
                        </div>
                    </div>
                ))}

                <div className="form-group">
                    <label htmlFor="description">Report: </label>
                    <textarea id="description" name="description" value={form.description ?? ""} onChange={handleChange} rows={10} placeholder='Enter the full mission debriefing here...'/>
                </div>

                <div className='form-actions'>
                    <div className='button-group'>
                        {canAddMoreTeams &&<button type="button" onClick={addTeamSlot}>Add Team</button>}
                        <button type="button" onClick={addObjectiveSlot}>Add Objective</button>
                    </div>
                </div>
                <div className="form-actions">
                    <div className='submit-group'>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => navigate(PATHS.MISSION_LIST)}>Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    );
};
