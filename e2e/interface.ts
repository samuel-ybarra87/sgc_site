export interface Team {
  designation: string;
  commanding_officer: string | null;
  status: string;
};

export interface Role {
  name: string;
};

export interface Personnel {
  prefix: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  rank: string | null;
  role: string;
  role_id: string | null;
  team_id: string | null;
  personnel_type: string;
  status: string;
};

export interface Mission {
    name: string;
    destination: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    status: string;
}

export interface MissionObjective {
  mission_id: string | null;
  objective: string;
  is_completed: boolean;
  secret_objective: boolean;
}

export interface MissionTeamLink {
  mission_id: string;
  team_id: string;
}

export interface TeamPersonnelLink {
  team_id: string;
  personnel_id: string;
}