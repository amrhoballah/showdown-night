import type { MafiaRole, MafiaRoleName } from '../types';

export const ROLE_INFO: Record<MafiaRoleName, MafiaRole> = {
    mafia:    { label:'MAFIA',     cls:'role-mafia',   desc:'Each night you and the other mafia silently agree on one person to eliminate. By day, lie convincingly.' },
    detective:{ label:'DETECTIVE', cls:'role-special', desc:'Each night you may investigate one player. The screen will privately tell you whether they are mafia.' },
    doctor:   { label:'DOCTOR',    cls:'role-special', desc:'Each night you choose one player to protect. If the mafia attack them, they survive.' },
    civilian: { label:'CIVILIAN',  cls:'role-town',    desc:'You have no special power — only your judgement. Talk, accuse, and vote the mafia out before they outnumber you.' }
  };
