import db from "../database/connect_db.js";

const query = async (sql, params) => {
	try {
		// Directly pass params without wrapping it in another array.
		return (await db.promise().query(sql, params))[0];
	} catch (err) {
		throw err;
	}
};

export default query;
