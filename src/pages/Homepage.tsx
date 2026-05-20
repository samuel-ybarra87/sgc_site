import { Link } from "react-router-dom";
import { PATHS } from "../lib/paths";

export default function PersonnelList() {
    return (
        <div>
            <h1>Stargate Command Records</h1>
            <ul>
                <li key={PATHS.PERSONNEL_LIST}>
                    <Link to={PATHS.PERSONNEL_LIST}>PERSONNEL LIST</Link>
                </li>
                <li key={PATHS.TEAM_LIST}>
                    <Link to={PATHS.TEAM_LIST}>TEAM LIST</Link>
                </li>
                <li key={PATHS.MISSION_LIST}>
                    <Link to={PATHS.MISSION_LIST}>MISSION LIST</Link>
                </li>
            </ul>
        </div>
    );
}