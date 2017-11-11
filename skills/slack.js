
module.exports = (slack_controller, fb_controller) => {

	slack_controller.on('interactive_message_callback', (bot, message) => {
		if (message.callback_id === 'select_support_channel') {
			bot.reply(message, 'Thanks for picking a channel')
			slack_controller.storage.teams.get(message.team.id, (err, team) => {
				if (err) {
					console.log({err})
				} else {
					// Set support channel for team
					team.support_channel = message.text

					slack_controller.storage.teams.save(team, (err, res) => {
						if (err) {
							console.log({err})
						} else  {
							console.log('Saved team')
						}
					})
				}
			})
		}
	})

	slack_controller.hears('onboard', 'direct_message', (bot, message) => {
		console.log('heard onboard')
		bot.reply(message, 'Heard you!')
		slack_controller.trigger('onboard', [bot])
	})
	
	slack_controller.on('facebook_message', (bot, message) => {
		// Post the FB message in the appopriate channel, fudged for now
		console.log('Bot Config', bot.config)
		const origin = {
			channel: bot.config.support_channel,
		}
		const slackMsg = {
			text: `Message from ${message.profile.first_name} ${message.profile.last_name}: \n${message.text}`
		}
		bot.reply(origin, slackMsg)
	})
}
