const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const User = require("../models/users");

const sidebarGroups = {
  user: {
    name: "User Management",
    icon: "User",
  },
};

AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro({
  resources: [
    {
      resource: User,
      options: {
        parent: sidebarGroups.user,
      },
    },
  ],
  rootPath: "/admin",
  branding: {
    companyName: "CS889 Admin",
    softwareBrothers: false,
  },
});
const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  cookieName: process.env.ADMIN_COOKIE_NAME || "cs889-admin",
  cookiePassword: process.env.ADMIN_COOKIE_PASS || "cs889-admin-pass",
  authenticate: async (email, password) => {
    const user = await User.findByCredentials(email, password);
    if (user) {
      if (user.isAdmin && user.isVerified) {
        return user;
      }
      return null;
    }
    return null;
  },
});

module.exports = { adminBro, adminRouter };
