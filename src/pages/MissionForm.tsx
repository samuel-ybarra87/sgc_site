import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import { rankAbbreviations } from '../lib/rankAbbreviations';
import type { Personnel, Team } from '../lib/types';

type ObjectiveForm = {
    mission_id: string;
    objective: string;
    isCompleted: boolean;
    commandingOfficerObjective: boolean;
}

type MissionForm = {
    name: string;
    destination: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    objectives: ObjectiveForm[]
    teams: Team[];
}

const emptyTeam = { id: '', commanding_officer: '', designation: '', status: '' };
const emptyObjective = { mission_id: '', objective: '', isCompleted: false, commandingOfficerObjective: false };

const defaultForm: MissionForm = {
    name: '',
    destination: '',
    description: '',
    status: '',
    startDate: '',
    endDate: '',
    objectives: [emptyObjective],
    teams: [emptyTeam],
}

export default function MissionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [form, setForm] = useState<MissionForm>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [teamsIds, setTeamIds] = useState<string[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [fetching, setFetching] = useState(isEditing);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const eligibleTeams = useMemo(()=>{
        return teams.filter(t => t.designation !== "Unassigned");
    }, [teams]);

    const availableTeams = (currentIndex: number) => {
        const selectedIds = form.teams
            .filter((_, i) => i !== currentIndex)
            .map(slot => slot);
        return eligibleTeams.filter(t => !selectedIds.includes(t));
    }

    const addTeamSlot = () =>{
        setForm(prev => ({
            ...prev,
            teams: [...prev.teams, emptyTeam]
        }));
    };

    const removeTeamSlot = () => {
        if(form.teams.length > 1) {
            const index = form.teams.length - 1;
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

    const removeObjectiveSlot = () => {
        if(form.objectives.length > 1){
            const index = form.objectives.length -1;
            const updatedObjectives = form.objectives.filter((_, i) => i !== index);
            setForm({ ...form, objectives: updatedObjectives });
        }
    };

    useEffect(() => {
        async function getMissionMembers() {
            const { data: teamData, error: idsError } = await supabase
                .from('missions_teams')
                .select('team_id')
                .eq('mission_id', id);

            if (idsError) {
                console.error(idsError);
                return;
            }

            if(teamData.length === 0){
                console.error('No data returned on fetch');
                return;
            }

            const ids = teamData.map(row => row.team_id);
            setTeamIds(ids);
            
            const { data: memberData, error: memberError } = await supabase
                .from('personnel')
                .select(`*,
                    roles:roles(name),
                    teams:teams(*)
                    `)
                .in('team_id', teamsIds);
            
            if(memberError) console.error(memberError);
            else setPersonnel(memberData);
        }
        if (id) getMissionMembers();

        async function fetchTeams() {
            const { data, error } = await supabase
                .from('teams')
                .select('*')
            if (error) console.error(error);
            else setTeams(data);
        }
        fetchTeams();

        if (!isEditing) return;

        let shouldUpdate = true;
        async function fetchMissions() {
            const { data, error } = await supabase
                .from('missions')
                .select(`*,
                    objectives:mission_objectives(*),
                    teams:teams(*)
                    `)
                .eq('id', id)
                .single();
            if (error) console.error(error);
            else if (shouldUpdate) {
                setForm(data);
                setFetching(false);
            }
        }

        fetchMissions();

        return () => { shouldUpdate = false; }
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
            commandingOfficerObjective: !updatedObjectives[index].commandingOfficerObjective
        };
        setForm({ ...form, objectives: updatedObjectives });
    }

    const toggleComplete = (index: number) => {
        const updatedObjectives = [...form.objectives];
        updatedObjectives[index] = {
            ...updatedObjectives[index],
            isCompleted: !updatedObjectives[index].isCompleted
        };
        setForm({ ...form, objectives: updatedObjectives });
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);

        if(form.teams.includes(emptyTeam)){
            setSubmitError('Please select a Team.');
            setLoading(false);
            return;
        }


        const formData = {
            ...form,
            description: form.description === '' ? null : form.description,
            endDate: form.endDate === '' ? null : form.endDate
        }

        if (isEditing) {
            const { error } = await supabase
                .from('missions')
                .update(formData)
                .eq('id', id);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.MISSION_LIST);
        } else {
            const { error } = await supabase
                .from('missions')
                .insert(formData);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.TEAM_LIST);
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
                        <label htmlFor="startDate">Start Date: </label>
                        <input type="datetime-local" id="startDate" name="startDate" value={form.startDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">End Date: </label>
                        <input type="datetime-local" id="endDate" name="endDate" value={form.description} onChange={handleChange} />
                    </div>
                </div>

                {form.teams.map((teamSlot, index) => (
                    <div key={index} className="form-group">
                        <label>Team {index + 1}: </label>
                        <select value={teamSlot.id} onChange={(e) => handleTeamChange(index, e)}>
                            <option value="">Select a Team</option>
                            {availableTeams(index).map((team) =>
                                <option value={team.id}>
                                    {team.designation}
                                </option>
                            )}
                        </select>
                    </div>
                ))}

                {form.objectives.map((objectiveSlot, index) => (
                    <div key={index} className="form-group">
                        <label>Objective {index + 1}</label>
                        <div className="objective-input-row">
                            <input id="objective" name="objective" value={objectiveSlot.objective} onChange={(e) => handleObjectiveChange(index, e)}/>
                            <button type='button' className={objectiveSlot.isCompleted ? 'btn-active' : 'btn-inactive'} onClick={() => toggleComplete(index)}>Completed</button>
                            <button type='button' className={objectiveSlot.commandingOfficerObjective ? 'btn-active' : 'btn-inactive'} onClick={() => toggleSecretStatus(index)}>Classified</button>
                        </div>
                    </div>
                ))}

                <div className="form-group">
                    <label htmlFor="description">Report: </label>
                    <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={10} placeholder='Enter the full mission debriefing here...'/>
                </div>

                <div className='form-actions'>
                    <div className='button-group'>
                        <button type="button" onClick={addTeamSlot}>Add Team</button>
                        <button type="button" onClick={removeTeamSlot}>Remove Team</button>
                    </div>
                    <div className='button-group'>
                        <button type="button" onClick={addObjectiveSlot}>Add Objective</button>
                        <button type="button" onClick={removeObjectiveSlot}>Remove Objective</button>
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
