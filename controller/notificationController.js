// userController.js
import query from "../database/query_db.js";
const getNotifications = async (req, res) => {
	const userId = res.locals.user.id;

	// Fetch notifications based on the user's role
	const notifications = await query(
		"SELECT * FROM notifications WHERE user_uuid = ? AND is_read = 0 ORDER BY id DESC LIMIT 5",
		[userId]
	);
	// Format notifications with a readable timestamp
	const formattedNotifications = notifications.map((notification) => ({
		...notification,
		timestamp: new Date(notification.created_at).toLocaleString(), // Format date
	}));
	// You can add more logic here if you want to filter or modify notifications based on role

	res.status(200).json(formattedNotifications);
};

const markAsRead = async (req, res) => {
	const { notificationId } = req.body; // Extract the notification ID from the request body
    
	try {
		// Update the notification's 'is_read' status to 1 (mark as read)
		await query("UPDATE notifications SET is_read = 1 WHERE id = ?", [
			notificationId,
		]);

		// Respond with success
		res.status(200).json({
			success: true,
			message: "Notification marked as read.",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating notification." });
	}
};

export default { getNotifications,markAsRead };
