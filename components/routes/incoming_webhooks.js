var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, slack_controller, facebook_controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);

        // Now, pass the webhook into be processed
        slack_controller.handleWebhookPayload(req, res);

    });
	webserver.get('/test', (req, res) => {
		res.send('ok')
	})

    webserver.post('/facebook/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Facebook that the webhook has been received.
        res.status(200).send('ok');
		console.log('Got req from fb')

		// Spawn a Facebook Bot? Not yet, just receive messages
		const bot = facebook_controller.spawn({})

        // Now, pass the webhook into be processed
		// What I need is to push message events to Slack
		// Would be great to listen to all message_received events
		//
		// Really, I just need to parse the messages
		//
		// facebook.controller.on('message_received', handleFacebookMessage)
        facebook_controller.handleWebhookPayload(req, res, bot);

    });

	webserver.get('/facebook/receive', function(req, res) {
				if (req.query['hub.mode'] == 'subscribe') {
					if (req.query['hub.verify_token'] == process.env.verify_token) {
						res.send(req.query['hub.challenge']);
					} else {
						res.send('OK');
					}
				}
			});
}
