

module.exports = (slack_controller, facebook_controller) => {

	facebook_controller.on('standby', (bot, message) => {
		console.log('Another standby message...')

		facebook_controller.api.handover.take_thread_control(message.user, (err, res) => {
			if (err) {
				console.log(err)
			} else {
				console.log({res})
			}
		})
	})

	facebook_controller.on('facebook_receive_thread_control', (bot, message) => {
		
	})
	facebook_controller.on('message_received', (bot, message) => {
		console.log('Saw that FB event!')

		bot.reply(message, 'Heard your facebook message!')
		postToSlack(message)

		// const bot = slack_controller.spawn()

	})

	function postToSlack(message) {

		// find the access_token for the Slack team associated with the FB page
		const team = slack_controller.getTeamConfigForPage(message)

		// spawn a bot that is configured to respond in slack context
		const bot = slack_controller.spawn(team)

		// I need to take this FB message, with the User info, and Post it into slack...
		slack_controller.trigger('facebook_message', [bot, message])
		
	}
}
