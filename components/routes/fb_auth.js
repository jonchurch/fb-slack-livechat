const rp = require('request-promise').defaults({json: true})

module.exports = (webserver, slack_controller, facebook_controller) => {
	webserver.get('/facebook/auth', (req, res) => {
		rp('https://graph.facebook.com/v2.11/me/accounts?access_token=' + req.query.token)
		.then(pages => {

			res.json(pages)

			}).catch(err => res.send(false))
	})

	webserver.post('/facebook/auth', (req, res) => {
		// sets up a facebook page
		const page = req.body.page
		rp.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + page.access_token)
		.then(result => {
			if (result.success) {
				facebook_controller.debug(`Successfully subscribed to ${page.name}'s messages'`)
				facebook_controller.storage.teams.save({
					id: page.id,
					access_token: page.access_token,
					name: page.name
				}, (err, team) => {
					if (err) {
						facebook_controller.debug('Error saving team')
					} else {
						facebook_controller.debug('Saved team', team)
						res.json(result)
					}
				})
			} else {
				res.json(result)
			}
		}).catch(err => res.json(err.message))

	})
}
