import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { pool } from "./lib/pool.js";
import { decrypt } from "./lib/utils.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, { perMessageDeflate: false });

  io.on("connection", (socket) => {
    const info = socket.handshake.auth;
    const { workSpaceID, userID } = {
      workSpaceID: decrypt(info.workSpaceID).replace(/^"|"$/g, ""),
      userID: decrypt(info.userID).replace(/^"|"$/g, ""),
    };
    socket.join(workSpaceID);

    socket.on("ready", async () => {
      try {
        const sql = " SELECT task_id, is_done, updated_by_user, updated_at "
          + " FROM progresses "
          + " WHERE workspace_id = ? "
          + " ORDER BY task_id ASC; "
        const [progress,] = await pool.execute(sql, [workSpaceID]);
        io.to(socket.id).emit("progress", progress);
      } catch (err) {
        console.error(err);
        return;
      }
    });

    socket.on("taskupdate", async (id, checked) => {
      // emit to all clients in the same room
      try {
        const sql =
          "INSERT INTO progresses (workspace_id, task_id, is_done, updated_by_user) " +
          "VALUES (?, ?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE is_done = VALUES(is_done), updated_by_user = VALUES(updated_by_user);";
        await pool.execute(sql, [workSpaceID, id, checked, userID]);
      } catch (err) {
        console.error(err);
        return;
      }
      io.to(workSpaceID).emit(
        "taskupdated",
        {
          id,
          taskInfo: { task_id: id, is_done: checked, updated_by_user: userID, updated_at: new Date() }
        });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully.');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully.');
  await pool.end();
  process.exit(0);
});
