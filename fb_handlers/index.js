

module.exports = (slack_controller, facebook_controller) => {

	facebook_controller.on('standby', (bot, message) => {
		console.log('Another standby message...')
	})

	facebook_controller.on('facebook_receive_thread_control', (bot, message) => {
		
	})
	facebook_controller.on('message_received', (bot, message) => {
		console.log('Saw that FB event!')

		bot.reply(message, 'Heard your facebook message!')

		// const bot = slack_controller.spawn()

	})
}
