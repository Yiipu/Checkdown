import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { pool } from '/lib/pool';

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Retrieve a user's information
 *     description: Retrieve a user's nickname, picture, and email by their user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 picture:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
export const GET = withApiAuthRequired(async (req, { params: { pathUserID } }) => {
    const res = new Response();

    try {
        const [userInfo,] = await pool.execute(
            "SELECT nickname, picture, email FROM users WHERE sub = ?;",
            [pathUserID]
        );
        if (userInfo.length === 0) {
            return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(userInfo[0]), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "database error" }), { status: 500 });
    }
});
