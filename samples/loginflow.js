const mysql = require("mysql2/promise");

/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
    const pool = mysql.createPool({
        host: event.secrets.DB_HOST,
        port: parseInt(event.secrets.DB_PORT, 10),
        user: event.secrets.DB_USER,
        password: event.secrets.DB_PASSWORD,
        database: event.secrets.DB_DATABASE,
    });

    const [rows] = await pool.execute(
        "SELECT nickname, name, picture, email, email_verified FROM users WHERE sub = ?",
        [event.user.user_id]
    );

    if (rows.length === 0) {
        // Case 1: The user has never logged in before, there is no user in the database
        await pool.execute(
            "INSERT INTO users (sub, nickname, name, picture, email, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
            [event.user.user_id, event.user.nickname || null, event.user.name || null, event.user.picture || null, event.user.email || null, event.user.email_verified || null]
        );
    } else {
        const user = rows[0];
        if (user.nickname !== event.user.nickname || user.name !== event.user.name || user.picture !== event.user.picture || user.email !== event.user.email || user.email_verified !== event.user.email_verified) {
            // Case 3: The user has logged in before, and the information has changed
            await pool.execute(
                "UPDATE users SET nickname = ?, name = ?, picture = ?, email = ?, email_verified = ? WHERE sub = ?",
                [event.user.nickname || null, event.user.name || null, event.user.picture || null, event.user.email || null, event.user.email_verified || null, event.user.user_id]
            );
        }
        // Case 2: The user has logged in before, and the information has not changed
        // Do nothing
    }

    pool.end();
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
