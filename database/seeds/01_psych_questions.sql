-- 100 psychological readiness questions (10 per domain).
-- All questions are version 1, active, and not reverse-scored by default.

INSERT INTO psych_questions (domain, question_text, reverse_scored, active, sort_order, version) VALUES
-- Self-regulation (10)
('self_regulation', 'I stay with my training plan even when motivation is low.', false, true, 1, 1),
('self_regulation', 'I can break a long-term football goal into weekly actions.', false, true, 2, 1),
('self_regulation', 'I notice quickly when my habits are slipping.', false, true, 3, 1),
('self_regulation', 'I usually correct mistakes in the next action instead of repeating them.', false, true, 4, 1),
('self_regulation', 'I manage my time well around training, school, or work.', false, true, 5, 1),
('self_regulation', 'I prepare mentally before matches instead of only physically.', false, true, 6, 1),
('self_regulation', 'I track my own progress and adjust my approach when needed.', false, true, 7, 1),
('self_regulation', 'I can resist distractions that interfere with my football development.', false, true, 8, 1),
('self_regulation', 'I set clear priorities when I have competing demands on my time.', false, true, 9, 1),
('self_regulation', 'I reflect on my training sessions to identify what I can do better.', false, true, 10, 1),

-- Resilience (10)
('resilience', 'I recover quickly after a poor performance.', false, true, 1, 1),
('resilience', 'Setbacks usually make me work harder rather than withdraw.', false, true, 2, 1),
('resilience', 'I can stay positive when selection decisions go against me.', false, true, 3, 1),
('resilience', 'I handle criticism without losing confidence for long.', false, true, 4, 1),
('resilience', 'I keep pushing when a match becomes difficult.', false, true, 5, 1),
('resilience', 'I can stay committed during long periods without obvious progress.', false, true, 6, 1),
('resilience', 'I maintain my effort level even when results are not going my way.', false, true, 7, 1),
('resilience', 'I can adapt my game when my usual approach is not working.', false, true, 8, 1),
('resilience', 'I use difficult experiences as motivation rather than excuses.', false, true, 9, 1),
('resilience', 'I bounce back from injuries with a focused rehabilitation mindset.', false, true, 10, 1),

-- Commitment and discipline (10)
('commitment_and_discipline', 'I complete football-related work even when nobody checks on me.', false, true, 1, 1),
('commitment_and_discipline', 'I am consistent with recovery, sleep, and preparation.', false, true, 2, 1),
('commitment_and_discipline', 'I rarely skip sessions for avoidable reasons.', false, true, 3, 1),
('commitment_and_discipline', 'I take responsibility for my development outside formal team training.', false, true, 4, 1),
('commitment_and_discipline', 'I review performances to find ways to improve.', false, true, 5, 1),
('commitment_and_discipline', 'I follow through on the standards I set for myself.', false, true, 6, 1),
('commitment_and_discipline', 'I maintain high standards even during off-season or breaks.', false, true, 7, 1),
('commitment_and_discipline', 'I prioritize long-term development over short-term comfort.', false, true, 8, 1),
('commitment_and_discipline', 'I hold myself accountable without needing external pressure.', false, true, 9, 1),
('commitment_and_discipline', 'I consistently put in extra work beyond what is required.', false, true, 10, 1),

-- Achievement motivation (10)
('achievement_motivation', 'I want to improve even when I am already playing well.', false, true, 1, 1),
('achievement_motivation', 'I enjoy competing against strong opponents.', false, true, 2, 1),
('achievement_motivation', 'I actively look for ways to develop weak areas in my game.', false, true, 3, 1),
('achievement_motivation', 'I set performance goals, not only outcome goals.', false, true, 4, 1),
('achievement_motivation', 'I am driven more by growth than by outside praise.', false, true, 5, 1),
('achievement_motivation', 'I take pride in difficult improvement work.', false, true, 6, 1),
('achievement_motivation', 'I measure my progress against my own previous performance, not just others.', false, true, 7, 1),
('achievement_motivation', 'I seek out challenges that push me beyond my comfort zone.', false, true, 8, 1),
('achievement_motivation', 'I find satisfaction in mastering difficult skills.', false, true, 9, 1),
('achievement_motivation', 'I stay motivated even when recognition or rewards are delayed.', false, true, 10, 1),

-- Emotional control (10)
('emotional_control', 'I stay composed after making a visible mistake.', false, true, 1, 1),
('emotional_control', 'I can control frustration during matches.', false, true, 2, 1),
('emotional_control', 'My emotions rarely damage my decision-making in games.', false, true, 3, 1),
('emotional_control', 'I avoid arguing in ways that hurt my team.', false, true, 4, 1),
('emotional_control', 'I can reset emotionally after a bad referee call.', false, true, 5, 1),
('emotional_control', 'I remain useful to the team when I feel pressure.', false, true, 6, 1),
('emotional_control', 'I can manage my body language even when I feel frustrated.', false, true, 7, 1),
('emotional_control', 'I avoid letting one bad moment define my entire performance.', false, true, 8, 1),
('emotional_control', 'I can channel nervous energy into positive performance.', false, true, 9, 1),
('emotional_control', 'I stay level-headed when teammates or opponents try to provoke me.', false, true, 10, 1),

-- Confidence and self-belief (10)
('confidence_and_self_belief', 'I back myself in important moments.', false, true, 1, 1),
('confidence_and_self_belief', 'I believe I can improve areas where I currently struggle.', false, true, 2, 1),
('confidence_and_self_belief', 'I trust my preparation before big matches.', false, true, 3, 1),
('confidence_and_self_belief', 'I can perform even when I doubt myself at first.', false, true, 4, 1),
('confidence_and_self_belief', 'I do not need constant reassurance to play with confidence.', false, true, 5, 1),
('confidence_and_self_belief', 'I respond to challenge with belief rather than fear.', false, true, 6, 1),
('confidence_and_self_belief', 'I maintain belief in my abilities even after a run of poor form.', false, true, 7, 1),
('confidence_and_self_belief', 'I can perform confidently in unfamiliar environments or teams.', false, true, 8, 1),
('confidence_and_self_belief', 'I trust my instincts in game situations.', false, true, 9, 1),
('confidence_and_self_belief', 'I see setbacks as temporary rather than permanent reflections of my ability.', false, true, 10, 1),

-- Coachability (10)
('coachability', 'I apply feedback quickly in training or matches.', false, true, 1, 1),
('coachability', 'I can accept tough feedback without becoming defensive.', false, true, 2, 1),
('coachability', 'I actively ask for feedback on my development.', false, true, 3, 1),
('coachability', 'I can change habits when a coach shows a better way.', false, true, 4, 1),
('coachability', 'I listen carefully even when I disagree at first.', false, true, 5, 1),
('coachability', 'I see correction as part of growth, not as a personal attack.', false, true, 6, 1),
('coachability', 'I seek out different perspectives to improve my understanding.', false, true, 7, 1),
('coachability', 'I can adapt to different coaching styles and methods.', false, true, 8, 1),
('coachability', 'I take ownership of implementing feedback rather than waiting to be reminded.', false, true, 9, 1),
('coachability', 'I am open to changing my playing style if it benefits my development.', false, true, 10, 1),

-- Team communication (10)
('team_communication', 'I communicate clearly with teammates during matches.', false, true, 1, 1),
('team_communication', 'I give information early enough to help teammates act.', false, true, 2, 1),
('team_communication', 'I stay constructive when speaking under pressure.', false, true, 3, 1),
('team_communication', 'I encourage teammates when the team is struggling.', false, true, 4, 1),
('team_communication', 'I can raise standards without creating conflict.', false, true, 5, 1),
('team_communication', 'I communicate in a way that helps the team stay organized.', false, true, 6, 1),
('team_communication', 'I adapt my communication style to different teammates.', false, true, 7, 1),
('team_communication', 'I take responsibility for miscommunications rather than blaming others.', false, true, 8, 1),
('team_communication', 'I contribute to team discussions and planning.', false, true, 9, 1),
('team_communication', 'I can deliver honest feedback to teammates in a respectful way.', false, true, 10, 1),

-- Focus under pressure (10)
('focus_under_pressure', 'I can keep attention on my role in chaotic moments.', false, true, 1, 1),
('focus_under_pressure', 'I recover concentration quickly after distractions.', false, true, 2, 1),
('focus_under_pressure', 'I perform close to my normal level in high-pressure matches.', false, true, 3, 1),
('focus_under_pressure', 'I can follow the game plan even when emotions rise.', false, true, 4, 1),
('focus_under_pressure', 'I stay present instead of thinking too much about earlier mistakes.', false, true, 5, 1),
('focus_under_pressure', 'I can make decisions quickly without panicking.', false, true, 6, 1),
('focus_under_pressure', 'I can block out crowd noise or external distractions during matches.', false, true, 7, 1),
('focus_under_pressure', 'I maintain my decision-making quality as fatigue increases.', false, true, 8, 1),
('focus_under_pressure', 'I can execute practiced routines under competitive pressure.', false, true, 9, 1),
('focus_under_pressure', 'I stay focused on the process rather than worrying about the outcome.', false, true, 10, 1),

-- Professional habits (10)
('professional_habits', 'I sleep and recover in ways that support performance.', false, true, 1, 1),
('professional_habits', 'I arrive prepared and on time for football commitments.', false, true, 2, 1),
('professional_habits', 'I manage nutrition and hydration seriously around training and matches.', false, true, 3, 1),
('professional_habits', 'I behave professionally with coaches, teammates, and staff.', false, true, 4, 1),
('professional_habits', 'I make lifestyle choices that support my football goals.', false, true, 5, 1),
('professional_habits', 'I am dependable over time, not only in short bursts.', false, true, 6, 1),
('professional_habits', 'I take care of my mental well-being as seriously as my physical fitness.', false, true, 7, 1),
('professional_habits', 'I manage my social media and public behavior responsibly.', false, true, 8, 1),
('professional_habits', 'I seek out learning opportunities beyond just playing matches.', false, true, 9, 1),
('professional_habits', 'I maintain consistent habits regardless of whether I am in or out of the team.', false, true, 10, 1);
