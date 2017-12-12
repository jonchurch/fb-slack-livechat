
module.exports = (slack_controller, facebook_controller) => {

	slack_controller.tickets = []
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
		if (message.callback_id === 'resolve') {
			const ticket = slack_controller.tickets.find(e => e.thread_ts === message.text)
			
			// this is when I do the thread control handover!
			facebook_controller.api.handover.pass_thread_control(ticket.fb_id, facebook_controller.config.primary_app, '', (err, res)=> {
				if (err) {
					console.log({err})
				} else {
					console.log('Success with handover', res)
				}
			})

		}
	})
	
	// Handle messages going into support threads
	slack_controller.on('ambient', (bot, message) => {
		const openTicket = slack_controller.tickets.find(e => e.thread_ts === message.thread_ts && e.open === true)
		if (openTicket) {
			console.log({openTicket})
			// send message to fb_user
			const bot = facebook_controller.spawn({})
			bot.reply({channel: openTicket.fb_id}, {text: `Support: ${message.text}` })
		} else {
			bot.replyEphemeral(message, 'This ticket is closed!')
		}
	})

	slack_controller.hears('onboard', 'direct_message', (bot, message) => {
		console.log('heard onboard')
		bot.reply(message, 'Heard you!')
		slack_controller.trigger('onboard', [bot])
	})
	
	// Post messages from FB in the support channel
	slack_controller.on('facebook_message', (bot, message) => {
		const origin = {
			channel: bot.config.support_channel,
			thread_ts: message.ticket.thread_ts
		}
		const slackMsg = {
			as_user: false,
			username: `${message.profile.first_name} ${message.profile.last_name}`,
			text: message.text,
			icon_url: message.profile.profile_pic
		}
		console.log(message.profile)
		bot.reply(origin, slackMsg)
	})

	slack_controller.on('open_ticket', (bot, message) => {
		bot.reply({channel: bot.config.support_channel}, {
			text: `*${message.profile.first_name} ${message.profile.last_name}* requested a Human! \n*Status:* :rotating_light: Opened`
		}, (err, msg) => {

		slack_controller.tickets.push({thread_ts: msg.ts, fb_id: message.user, open: true})
			msg.thread_ts = msg.ts
			bot.reply(msg, {
			"attachments": [
				{
					"text": "Respond to start chatting",
					"fallback": "You are unable to choose a game",
					"callback_id": "close",
					"color": "#3AA3E3",
					"attachment_type": "default",
					"actions": [
						{
							"name": "answer",
							"text": "Close Ticket",
							"type": "button",
							"style": "primary",
							"value": `${msg.thread_ts}`
						},
					]
				}
			]
		})
		})

	})
}
