export type Team = {
  id: string;
  designation: string;
  commanding_officer: string | null;
  status: string;
};

export type Personnel = {
  id: string;
  prefix: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  rank: string | null;
  role: string;
  role_id: string | null;
  roles: { name: string } | null;
  team_id: string | null;
  teams: { designation: string } | null;
  personnel_type: string;
  status: string;
};

export type MissionObjectives = {
  id: string;
  mission_id: string;
  objective: string;
  is_completed: boolean;
  secret_objective: boolean;
}

export type Mission = {
  id: string;
  name: string;
  destination: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  objectives: MissionObjectives[];
  teams: Team[];
};

export type MissionTeamLink = {
  mission_id: string;
  team_id: string;
}

export type TeamPersonnelLink = {
  team_id: string;
  personnel_id: string;
}