const getIndex = (req, res) => {
	res.render("index", { title: "Homepage" });
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/signin");
};

const getError403 = (req, res) => {
	res.render("unauthorized", { title: "403 - Unauthorized" });
};
const getError404 = (req, res) => {
	res.render("notfound", { title: "404 - Not found" });
};
export default {
	getIndex,
	getLogout,
	getError403,
	getError404,
};
