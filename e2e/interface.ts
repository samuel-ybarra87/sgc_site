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