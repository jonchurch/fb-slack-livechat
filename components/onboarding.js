var debug = require('debug')('botkit:onboarding');

module.exports = function(controller) {

    controller.on('onboard', function(bot) {

        debug('Starting an onboarding experience!');

            bot.startPrivateConversation({user: bot.config.createdBy},function(err,convo) {
              if (err) {
                console.log(err);
              } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
				  convo.say('You will need to set up your Facebook page to receive messages from. First, create a channel in slack to be your inbox for support tickets from Facebook')

				  convo.say({
    "text": "Select your FB Support channel",
    "response_type": "in_channel",
    "attachments": [
        {
            "fallback": "Upgrade your Slack client to use messages like these.",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "callback_id": "select_support_channel",
            "actions": [
                {
                    "name": "channels_list",
                    "text": "Which Channel?",
                    "type": "select",
                    "data_source": "channels"
                }
            ]
        }
    ]
})
              }
            });
    });

}
