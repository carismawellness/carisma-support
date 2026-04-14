-- Add opened_date to locations for SSG calculation
ALTER TABLE locations ADD COLUMN IF NOT EXISTS opened_date DATE;

-- Update known opening dates (these are approximate — real dates to be set via admin)
UPDATE locations SET opened_date = '2018-01-01' WHERE slug = 'inter';
UPDATE locations SET opened_date = '2019-06-01' WHERE slug = 'hugos';
UPDATE locations SET opened_date = '2020-03-01' WHERE slug = 'hyatt';
UPDATE locations SET opened_date = '2021-01-01' WHERE slug = 'ramla';
UPDATE locations SET opened_date = '2022-06-01' WHERE slug = 'labranda';
UPDATE locations SET opened_date = '2023-01-01' WHERE slug = 'odycy';
UPDATE locations SET opened_date = '2023-06-01' WHERE slug = 'novotel';
UPDATE locations SET opened_date = '2024-01-01' WHERE slug = 'excelsior';
