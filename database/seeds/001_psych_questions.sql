-- 001 — Psych assessment v1 question bank (100 items, 10 domains x 10 questions)
-- Scoring: 1 = strongly disagree, 5 = strongly agree. Reverse-scored items
-- are flagged. This is version "v1"; future versions can live alongside.

INSERT INTO psych_questions (version, domain, question_text, reverse_scored, sort_order) VALUES
  -- 1. Self-regulation
  ('v1','self_regulation','I stick to my training plan even when I do not feel motivated.', false, 1),
  ('v1','self_regulation','I monitor my sleep and recovery to stay at my best.',               false, 2),
  ('v1','self_regulation','I set clear goals for each training session.',                      false, 3),
  ('v1','self_regulation','I often skip parts of my training that I find boring.',             true,  4),
  ('v1','self_regulation','I manage my time well between football, school/work, and rest.',    false, 5),
  ('v1','self_regulation','I keep track of my progress and adjust my routine when needed.',    false, 6),
  ('v1','self_regulation','I struggle to say no to distractions before matches.',              true,  7),
  ('v1','self_regulation','I can push through discomfort when I know it will help me improve.',false, 8),
  ('v1','self_regulation','I plan my pre-match nutrition and hydration in advance.',           false, 9),
  ('v1','self_regulation','I tend to act on impulse rather than stick to my plan.',            true,  10),

  -- 2. Resilience
  ('v1','resilience','After a poor performance I focus on what I can learn and move on.',  false, 1),
  ('v1','resilience','Setbacks motivate me to train harder.',                              false, 2),
  ('v1','resilience','I bounce back quickly after losing a match.',                        false, 3),
  ('v1','resilience','When injured, I stay disciplined with my rehabilitation.',           false, 4),
  ('v1','resilience','I dwell on mistakes for days after they happen.',                    true,  5),
  ('v1','resilience','Criticism from coaches helps me grow rather than discourages me.',   false, 6),
  ('v1','resilience','I keep believing in my ability even after a string of bad games.',   false, 7),
  ('v1','resilience','I find it hard to recover mentally after big losses.',               true,  8),
  ('v1','resilience','I see pressure situations as opportunities to prove myself.',        false, 9),
  ('v1','resilience','Failure makes me want to give up rather than try again.',            true,  10),

  -- 3. Commitment and discipline
  ('v1','commitment_discipline','I arrive early to training to prepare properly.',                 false, 1),
  ('v1','commitment_discipline','I follow my coach''s instructions even when I disagree initially.',false, 2),
  ('v1','commitment_discipline','I am willing to sacrifice social activities for my football career.',false, 3),
  ('v1','commitment_discipline','I complete extra work outside scheduled training.',               false, 4),
  ('v1','commitment_discipline','I often arrive late or unprepared for sessions.',                 true,  5),
  ('v1','commitment_discipline','I treat every training session with the same seriousness as a match.',false,6),
  ('v1','commitment_discipline','I prioritise my recovery and diet like a professional.',          false, 7),
  ('v1','commitment_discipline','I sometimes cut sessions short when I am tired.',                 true,  8),
  ('v1','commitment_discipline','I hold myself accountable to high standards every day.',          false, 9),
  ('v1','commitment_discipline','I only give full effort when someone is watching me.',            true,  10),

  -- 4. Achievement motivation
  ('v1','achievement_motivation','I set challenging long-term goals for my football career.',     false, 1),
  ('v1','achievement_motivation','I constantly compare my performance to players better than me.',false, 2),
  ('v1','achievement_motivation','I want to be the best player on my team.',                       false, 3),
  ('v1','achievement_motivation','I get bored quickly when there is nothing big to play for.',     true,  4),
  ('v1','achievement_motivation','I take pride in small daily improvements.',                       false, 5),
  ('v1','achievement_motivation','I seek out harder opponents so I can improve faster.',           false, 6),
  ('v1','achievement_motivation','I am content just to make the squad.',                           true,  7),
  ('v1','achievement_motivation','Winning individual awards matters a lot to me.',                 false, 8),
  ('v1','achievement_motivation','I set clear performance targets before each season.',             false, 9),
  ('v1','achievement_motivation','I lose interest when progress is slow.',                          true,  10),

  -- 5. Emotional control
  ('v1','emotional_control','I stay calm when a referee makes a bad call against me.',     false, 1),
  ('v1','emotional_control','I can control my temper after a hard tackle.',                 false, 2),
  ('v1','emotional_control','I do not let conceding a goal affect the rest of my game.',    false, 3),
  ('v1','emotional_control','I sometimes lose my composure and get carded.',                 true,  4),
  ('v1','emotional_control','I recover emotionally within minutes after a big mistake.',    false, 5),
  ('v1','emotional_control','I let my frustration show through body language.',              true,  6),
  ('v1','emotional_control','I keep my focus when opponents try to provoke me.',             false, 7),
  ('v1','emotional_control','My emotions drop quickly when things go against me.',           true,  8),
  ('v1','emotional_control','I can regulate my nerves before important matches.',           false, 9),
  ('v1','emotional_control','I argue with teammates when I am frustrated.',                  true,  10),

  -- 6. Confidence and self-belief
  ('v1','confidence_self_belief','I back my own ability in pressure moments.',              false, 1),
  ('v1','confidence_self_belief','I believe I will reach my long-term football goals.',     false, 2),
  ('v1','confidence_self_belief','I trust my decisions on the ball.',                        false, 3),
  ('v1','confidence_self_belief','I doubt myself when playing against strong opponents.',    true,  4),
  ('v1','confidence_self_belief','I step up to take responsibility in big games.',            false, 5),
  ('v1','confidence_self_belief','I often feel I do not deserve to be on the pitch.',         true,  6),
  ('v1','confidence_self_belief','I am comfortable taking risks in attacking situations.',    false, 7),
  ('v1','confidence_self_belief','I avoid the ball when my confidence is low.',               true,  8),
  ('v1','confidence_self_belief','I believe I can influence the outcome of any match I play.', false, 9),
  ('v1','confidence_self_belief','I worry about making mistakes in front of scouts or coaches.', true, 10),

  -- 7. Coachability
  ('v1','coachability','I actively ask my coaches for feedback.',                            false, 1),
  ('v1','coachability','I apply corrections quickly in the next training session.',          false, 2),
  ('v1','coachability','I welcome criticism, even when it is harsh.',                        false, 3),
  ('v1','coachability','I get defensive when coaches point out my mistakes.',                true,  4),
  ('v1','coachability','I adapt my game based on tactical instructions.',                     false, 5),
  ('v1','coachability','I think I know better than my coaches most of the time.',            true,  6),
  ('v1','coachability','I take notes or reflect after feedback sessions.',                    false, 7),
  ('v1','coachability','I watch video review sessions attentively.',                          false, 8),
  ('v1','coachability','I struggle to change habits even when told to.',                     true,  9),
  ('v1','coachability','I seek out mentors and senior players for advice.',                   false, 10),

  -- 8. Team communication
  ('v1','team_communication','I talk to my teammates constantly during a match.',            false, 1),
  ('v1','team_communication','I call for the ball clearly when I am available.',              false, 2),
  ('v1','team_communication','I encourage teammates when they make mistakes.',                false, 3),
  ('v1','team_communication','I go quiet when the team is struggling.',                       true,  4),
  ('v1','team_communication','I give clear instructions to players near me.',                  false, 5),
  ('v1','team_communication','I resolve disagreements with teammates directly and calmly.',   false, 6),
  ('v1','team_communication','I avoid speaking up in team meetings.',                          true,  7),
  ('v1','team_communication','I make sure new teammates feel welcome.',                        false, 8),
  ('v1','team_communication','I struggle to communicate under pressure.',                      true,  9),
  ('v1','team_communication','I adapt my communication style to different teammates.',         false, 10),

  -- 9. Focus under pressure
  ('v1','focus_under_pressure','I perform at my best in high-stakes matches.',                false, 1),
  ('v1','focus_under_pressure','I can block out crowd noise and focus on my job.',             false, 2),
  ('v1','focus_under_pressure','I stay concentrated for the full 90 minutes.',                 false, 3),
  ('v1','focus_under_pressure','My concentration drops in the final minutes of a match.',      true,  4),
  ('v1','focus_under_pressure','I reset quickly after losing possession.',                     false, 5),
  ('v1','focus_under_pressure','I get distracted by what is happening off the ball.',          true,  6),
  ('v1','focus_under_pressure','I can execute set-piece routines under pressure.',             false, 7),
  ('v1','focus_under_pressure','I lose track of tactical instructions when tired.',            true,  8),
  ('v1','focus_under_pressure','I keep my decision-making sharp late in games.',               false, 9),
  ('v1','focus_under_pressure','My mind wanders during less exciting phases of play.',         true,  10),

  -- 10. Professional habits
  ('v1','professional_habits','I prepare my kit and equipment the night before training.',    false, 1),
  ('v1','professional_habits','I maintain a consistent sleep schedule.',                       false, 2),
  ('v1','professional_habits','I manage my nutrition intentionally every day.',                 false, 3),
  ('v1','professional_habits','I sometimes turn up to training without proper rest.',           true,  4),
  ('v1','professional_habits','I log my training, matches, or stats regularly.',                false, 5),
  ('v1','professional_habits','I use social media responsibly and think before posting.',      false, 6),
  ('v1','professional_habits','I let off-pitch issues affect my preparation.',                  true,  7),
  ('v1','professional_habits','I actively work on recovery (stretching, mobility, sleep).',    false, 8),
  ('v1','professional_habits','I rarely plan ahead for match days.',                            true,  9),
  ('v1','professional_habits','I present myself as a professional in every interaction.',      false, 10);
