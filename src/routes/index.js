const { Router } = require("express")

const usersRoutes = require("./users.routes")
const tagsRoutes = require("./tags.routes")
const sessionsRoutes = require("./sessions.routes")
const foodsRoutes = require("./foods.routes")

const routes = Router();

routes.use("/users" , usersRoutes)
routes.use("/foods", foodsRoutes)
routes.use("/tags", tagsRoutes)
routes.use("/sessions", sessionsRoutes)

module.exports = routes
