import jwt from "jsonwebtoken";
import db from "../database/connect_db.js";

const queryId = async (id, role) => {
  try {
    if (role === "admin") {
      const [rows] = await db
        .promise()
        .query("SELECT id, username FROM admin WHERE id = ?", [id]);
      return rows;
    } else if (role === "user") {
      const [rows] = await db
        .promise()
        .query(
          "SELECT id, profile_url, firstname,lastname, middlename FROM users WHERE uuid = ?",
          [id]
        );
      return rows;
    } else if (role === "assessor") {
      const [rows] = await db
        .promise()
        .query(
          "SELECT assessor_id, profile_url, firstname,lastname, middlename FROM assessor WHERE uuid = ?",
          [id]
        );
      return rows;
    } else {  
      throw new Error("Invalid role"); // Handle invalid role more gracefully
    }
  } catch (err) {
    throw err;
  }
};

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.redirect("/unauthorized");
      } else {
        const user = await queryId(decodedToken.id, decodedToken.role);
        if (
          user.length === 0 ||
          !["user", "admin","assessor"].includes(decodedToken.role)
        ) {
          res.redirect("/unauthorized");
        } else {
          res.locals.user = {
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role,
          };

          if (decodedToken.role === "user") {
            res.locals.user_info = {
              profile_url: user[0].profile_url,
              fullname: `${user[0].firstname} ${user[0].middlename.charAt(
                0
              )}. ${user[0].lastname}`,
            };
          }
          if (decodedToken.role === "assessor") {
            res.locals.user_info = {
              profile_url: user[0].profile_url,
              fullname: `${user[0].firstname} ${user[0].middlename.charAt(
                0
              )}. ${user[0].lastname}`,
            };
          }

          if (decodedToken.role === "admin") {
            res.locals.user_info = {
              profile_url: 'default.jpg',
              fullname: `Administrator`,
            };
          }
          next();
        }
      }
    });
  } else {
    res.redirect("/unauthorized");
  }
};

const forwardAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        const user = await queryId(decodedToken.id, decodedToken.role);
        if (
          user.length === 0 ||
          !["user", "admin","assessor"].includes(decodedToken.role)
        ) {
          next();
        } else {
          res.locals.user = {
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role,
          };

          if (decodedToken.role === "user") {
            res.locals.user_info = {
              profile_url: user[0].profile_url,
              fullname: `${user[0].firstname} ${user[0].middlename.charAt(
                0
              )}. ${user[0].lastname}`,
            };
          }
          if (decodedToken.role === "assessor") {
            res.locals.user_info = {
              profile_url: user[0].profile_url,
              fullname: `${user[0].firstname} ${user[0].middlename.charAt(
                0
              )}. ${user[0].lastname}`,
            };
          }


          if (decodedToken.role === "admin") {
            res.locals.user_info = {
              profile_url: 'default.png',
              fullname: `Administrator`,
            };
          }

          switch (decodedToken.role) {
            case "admin":
              res.redirect("/admin/dashboard");
              break;
              case "assessor":
                res.redirect("/assessor/home");
                break;
            case "user":
              res.redirect("/home");
              break;
            default:
              next();
          }
        }
      }
    });
  } else {
    next();
  }
};

const checkRole = (roles) => (req, res, next) => {
  const userRole = res.locals.user.role;
  if (roles.includes(userRole)) {
    next();
  } else {
    res.redirect("/unauthorized");
  }
};

export default {
  forwardAuth,
  requireAuth,
  checkRole,
};