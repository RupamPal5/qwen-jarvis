import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ollamaRouter from "./ollama";
import consensusRouter from "./consensus";
import evolutionRouter from "./evolution";
import omnipresenceRouter from "./omnipresence";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ollamaRouter);
router.use(consensusRouter);
router.use(evolutionRouter);
router.use(omnipresenceRouter);

export default router;
