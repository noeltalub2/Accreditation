import jwt from "jsonwebtoken";

const createToken = (id, username, role) => {
	const payload = {
		id,
		username,
		role,
	};

	const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	return accessToken;
};

export default createToken;
