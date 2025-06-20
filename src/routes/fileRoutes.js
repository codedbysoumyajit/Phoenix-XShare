// routes/fileRoutes.js
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  renderUploadPage,
  uploadFile,
  webshareUploadFile,
  renderDownloadPage,
  cdnFile,
  renderViewPage,
} from "../controllers/fileController.js";

const router = Router();

router.get("/upload", authenticate, renderUploadPage);
router.post("/upload", authenticate, uploadFile);
router.post("/webshare", authenticate, webshareUploadFile);
router.get("/download/:fileName", renderDownloadPage);
router.get("/cdn/:fileName", cdnFile);
router.get("/view/:fileName", renderViewPage);

export default router;
