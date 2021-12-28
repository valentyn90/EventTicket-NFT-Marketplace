var Twitter = require('twit');

async function sendMessage(twitter_handle: string, text_st: string) {

    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
        access_token: process.env.TWITTER_ACCESS_TOKEN as string,
        access_token_secret: process.env.TWITTER_ACCESS_SECRET as string,
    });


    const user_id = await client.get('users/show', { screen_name: twitter_handle })

    const follow = {
        screen_name: twitter_handle
    }

    client.get('friendships/lookup', follow, (error: any, data: any, response: any) => {
        let connections = data[0].connections;

        if (!connections.some((item: string) => ['following', 'following_requested'].includes(item))) {
            client.post('friendships/create', follow, (error: any, data: any, response: any) => {
                console.log(response.statusCode);
            });
        }
        else {
            console.log('Already requested or following');
        }
    });

    const data = {
        event: {
            type: "message_create",
            message_create: {
                target: {
                    recipient_id: user_id.data.id_str
                },
                message_data: {
                    text: text_st
                }
            }
        }
    }

    client.post('direct_messages/events/new', data, (error: any, data: any, response: any) =>{
        // console.log(response);
        return(response);
    });

        return(data)



}



export default sendMessage;