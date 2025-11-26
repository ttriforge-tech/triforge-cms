// src/routes/index.js
import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { projectRouter } from "../modules/projects/project.routes.js";
import { segmentRouter } from "../modules/segments/segment.routes.js";
import { contactRouter } from "../modules/contact/contact.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { userRouter } from "../modules/users/user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/projects", projectRouter);
apiRouter.use("/segments", segmentRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/users", userRouter);
