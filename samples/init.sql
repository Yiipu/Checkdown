-- Drop tables if they exist
DROP TABLE IF EXISTS user_workspaces;
DROP TABLE IF EXISTS progresses;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS u_f_view;
DROP TABLE IF EXISTS user_files;
DROP TABLE IF EXISTS mdx_files;
DROP TABLE IF EXISTS users;

-- Recreate tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sub VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    nickname VARCHAR(255),
    name VARCHAR(255),
    picture VARCHAR(255),
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE mdx_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file MEDIUMTEXT NOT NULL,
    popularity INT DEFAULT 0,
    description VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    file_name VARCHAR(255) NOT NULL
);

ALTER TABLE mdx_files ADD FULLTEXT(file_name);

CREATE TABLE user_files (
    user_sub VARCHAR(255) NOT NULL,
    file_id INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_sub, file_id),
    FOREIGN KEY (user_sub) REFERENCES users(sub),
    FOREIGN KEY (file_id) REFERENCES mdx_files(id)
);

CREATE VIEW u_f_view AS
SELECT u.user_sub as u_id, m.file as f, m.file_name as f_name, m.description AS description, m.id as f_id, u.is_public as is_public
FROM user_files u
JOIN mdx_files m ON u.file_id = m.id;

CREATE TABLE workspaces(
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_id INT NOT NULL,
    invite_code VARCHAR(20) UNIQUE,
    code_expire_at TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES mdx_files(id)
);

CREATE TABLE progresses(
    workspace_id INT NOT NULL,
    task_id INT NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    updated_by_user VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, task_id),
    FOREIGN KEY (updated_by_user) REFERENCES users(sub)
);

CREATE TABLE user_workspaces(
    user_sub VARCHAR(255) NOT NULL,
    workspace_id INT NOT NULL,
    privilege ENUM('manager', 'partner') DEFAULT 'partner',
    PRIMARY KEY (user_sub, workspace_id),
    FOREIGN KEY (user_sub) REFERENCES users(sub),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE VIEW w_uw_view AS
SELECT w.id as id, w.created_at as created, uw.user_sub as u_id, uw.privilege as privilege, w.file_id as f_id, m.file_name as f_name
FROM workspaces w
JOIN user_workspaces uw ON w.id = uw.workspace_id
JOIN mdx_files m ON w.file_id = m.id;

DELIMITER //
CREATE TRIGGER check_user_access BEFORE INSERT ON progresses
FOR EACH ROW
BEGIN
    DECLARE user_access INT;
    SELECT COUNT(*) INTO user_access
    FROM user_workspaces
    WHERE user_sub = NEW.updated_by_user AND workspace_id = NEW.workspace_id;
    IF user_access = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User does not have access to this workspace';
    END IF;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_user_access_update BEFORE UPDATE ON progresses
FOR EACH ROW
BEGIN
    DECLARE user_access INT;
    SELECT COUNT(*) INTO user_access
    FROM user_workspaces
    WHERE user_sub = NEW.updated_by_user AND workspace_id = NEW.workspace_id;
    IF user_access = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User does not have access to this workspace';
    END IF;
END;
//
DELIMITER ;