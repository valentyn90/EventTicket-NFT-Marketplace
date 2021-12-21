const mailjet = require('node-mailjet')
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)


async function sendMail( email: string, name: string) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: 'pilot@mailjet.com',
                    Name: 'Mailjet Pilot',
                },
                To: [
                    {
                        Email: 'passenger1@mailjet.com',
                        Name: 'passenger 1',
                    },
                ],
                TemplateID: 1,
                TemplateLanguage: true,
                Subject: 'Your email flight plan!',
                Variables: {
                    name: 'John',
                    link: 'https://mailjet.com?id=123',
                }
            },
        ],
    })
    request
        .then((result: any) => {
            console.log(result.body)
        })
        .catch((err: any) => {
            console.log(err.statusCode)
        })

}

export default sendMail;

