const sessionController = require("../controllers/session.controller");

const router = express.Router();

// Session CRUD (Admin only)

router.post(
  "/",
  auth,
  authorize(["admin"]),
  catchAsync(sessionController.createSession)
);
router.get(
  "/",
  auth,
  authorize(["admin"]),
  catchAsync(sessionController.getAllSessions)
);
router.get(
  "/:id",
  auth,
  authorize(["admin"]),
  catchAsync(sessionController.getSession)
);
router.put(
  "/:id",
  auth,
  authorize(["admin"]),
  catchAsync(sessionController.updateSession)
);
router.delete(
  "/:id",
  auth,
  authorize(["admin"]),
  catchAsync(sessionController.deleteSession)
);

module.exports = router