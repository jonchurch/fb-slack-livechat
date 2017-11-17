const rp = require('request-promise').defaults({json: true})

module.exports = (webserver, slack_controller, facebook_controller) => {
	webserver.get('/facebook/auth', (req, res) => {
		// Okay, here we get the short lived access token, we need to convert it to longlived
		// and make this below call with the long lived token
		rp({
			url: 'https://graph.facebook.com/v2.11/oauth/access_token',
			qs: {
				grant_type: 'fb_exchange_token',
				client_id: process.env.fb_client_id,
				client_secret: process.env.fb_client_secret,
				fb_exchange_token: req.query.token
			}
		})
		.then(token => {

			rp(`https://graph.facebook.com/v2.11/me/accounts?access_token=${token.access_token}`)
			.then(pages => {

				res.json(pages)

				}).catch(err => res.send(false))
		}).catch(err => {
			console.log(err.message)
			res.send(err.message)
		})
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
