

module.exports = (slack_controller, facebook_controller) => {

	facebook_controller.middleware.receive.use((bot, message, next) => {
		bot.getMessageUser(message)
			.then(profile => {
				message.profile = profile
				next()
			}).catch(err => {
				next(err)
			})
	})

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
	facebook_controller.hears('operator', 'message_received', (bot, message) => {
		bot.reply(message, "Someone will be with you as soon as possible!")
		slack_controller.storage.teams.get(process.env.TEAM, function(err, team) {
			if (err) {
				console.log({err})
			} else {
				console.log({team})

				const bot = slack_controller.spawn(team)
				slack_controller.trigger('open_ticket', [bot, message])
			}
		})
	})
	facebook_controller.on('message_received', (bot, message) => {
		console.log('Saw that FB event!')

		bot.reply(message, 'Heard your facebook message!')
		slack_controller.storage.teams.get(process.env.TEAM, function(err, team) {
			if (err) {
				console.log({err})
			} else {
				console.log({team})
				// spawn a bot that is configured to respond in slack context
				const bot = slack_controller.spawn(team)

				// I'll need to know the channel to post it to, selected from Slack
				slack_controller.trigger('facebook_message', [bot, message])
			}
		})
	})

}
