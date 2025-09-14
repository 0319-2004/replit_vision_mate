-- Performance improvements and like/hide functionality migration
-- Run this after the main schema is created

-- Performance indexes for projects feed
CREATE INDEX IF NOT EXISTS idx_projects_created_at_id ON projects(created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id_tag ON project_tags(project_id, tag);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_hides_user_id_project_id ON project_hides(user_id, project_id);

-- Project Likes Table
CREATE TABLE IF NOT EXISTS project_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- Project Hides Table  
CREATE TABLE IF NOT EXISTS project_hides (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- Enable Row Level Security
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_hides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_likes
CREATE POLICY "like:insert-own" ON project_likes 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "like:select-own" ON project_likes 
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "like:delete-own" ON project_likes 
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for project_hides
CREATE POLICY "hide:all-own" ON project_hides 
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level INT DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  PRIMARY KEY (user_id, skill)
);

-- Project Required Skills Table
CREATE TABLE IF NOT EXISTS project_required_skills (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  priority INT DEFAULT 1,
  PRIMARY KEY (project_id, skill)
);

-- Enable RLS for skills tables
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_required_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skills
CREATE POLICY "user_skills:rw-own" ON user_skills
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for project_required_skills
CREATE POLICY "prs:read" ON project_required_skills 
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "prs:owner-edit" ON project_required_skills
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.creator_id = auth.uid()));

-- Performance indexes for skills
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill);
CREATE INDEX IF NOT EXISTS idx_prs_project_skill ON project_required_skills(project_id, skill);

-- Collaborator search function
CREATE OR REPLACE FUNCTION search_candidates_for_project(
  pid UUID,
  match_all BOOLEAN DEFAULT false,
  min_overlap INT DEFAULT 1,
  limit_n INT DEFAULT 20,
  offset_n INT DEFAULT 0
)
RETURNS TABLE(
  user_id UUID,
  overlap_count INT,
  total_skills INT,
  overlap_percentage DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow project owners to search for candidates
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = pid AND creator_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only project owners can search for candidates';
  END IF;

  RETURN QUERY
  WITH project_skills AS (
    SELECT skill FROM project_required_skills WHERE project_id = pid
  ),
  user_skill_matches AS (
    SELECT 
      us.user_id,
      COUNT(us.skill) AS overlap_count,
      (SELECT COUNT(*) FROM user_skills us2 WHERE us2.user_id = us.user_id) AS total_skills
    FROM user_skills us
    INNER JOIN project_skills ps ON us.skill = ps.skill
    GROUP BY us.user_id
  ),
  filtered_matches AS (
    SELECT 
      user_id,
      overlap_count,
      total_skills,
      ROUND((overlap_count::DECIMAL / NULLIF((SELECT COUNT(*) FROM project_skills), 0)) * 100, 2) AS overlap_percentage
    FROM user_skill_matches
    WHERE overlap_count >= min_overlap
      AND (NOT match_all OR overlap_count = (SELECT COUNT(*) FROM project_skills))
  )
  SELECT 
    fm.user_id,
    fm.overlap_count,
    fm.total_skills,
    fm.overlap_percentage
  FROM filtered_matches fm
  ORDER BY fm.overlap_count DESC, fm.overlap_percentage DESC
  LIMIT limit_n OFFSET offset_n;
END;
$$;
