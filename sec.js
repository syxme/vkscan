var request = require('request');

request.post(
    'http://m.vk.com/login.php?act=security_check&to=&hash=f744bd62ce978234ae&api_hash=fea56dd8590bf419e0',
    { form: { code: '95182774' } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);