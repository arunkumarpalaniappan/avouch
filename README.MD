
[Avouch'](https://github.com/arunkumarpalaniappan/avouch) application generator.

[![NPM Version][npm-image]][npm-url]

## Installation

```sh
$ npm install -g avouch
```

## Quick Start

The quickest way to get started with authentication module is

Create the app:

```bash
$ avouch <new_project_name>
```

Install dependencies:

```bash
$ npm install
```
## Update Config
```/config/config.json```

```json
{
    "tokenExpiry": 3600, // expiry time for JWT token
    "jwtKey": "3c360c7d4Ab94cO998978c@11c8Ead408I5ab466c7544609b3e3E306aace7e03",
    "encryptionKey": "832720e0-fa6e-43d6-bddc-60035164b4c2-cd0c7f4f-5af2-4dc0-a789-501254e7e528",
    "validTenants": {
        "0177d67f-3b29-42c6-b0cd-2cc70ffccb41": { //unique tenant id/ application ID
            "tenantName": "My Blog", // application reference
            "allowedUrls": ["https://lexicalgrammar.dev"], //urls
            "email": {
                "headerLink": "https://lexicalgrammar.dev", //forgot password email header
                "headerLogo": "https://lexicalgrammar.dev/logo.svg",//forgot password email header logo
                "endPoint": "http://localhost:4001", //reset password email domain name
                "address": "Made in ❤ with India" //forgot password email footer
             }
        }
    },
    "smtp": {
        "service": "gmail", //see the below list for supported smtp services
        "username": "hello@lexicalgrammar.dev",
        "password": "S3c3r3tP@ssW0rd"
    }
}
```

#### Suported SMTP Services

| Service        |
|-----------------|
| 126           |
| 163           |
| 1und1         |
| AOL           |
| DebugMail     |
| DynectEmail   |
| FastMail      |
| GandiMail     |
| Gmail         |
| Godaddy       |
| GodaddyAsia   |
| GodaddyEurope |
| hot.ee        |
| Hotmail       |
| iCloud        |
| mail.ee       |
| Mail.ru       |
| Maildev       |
| Mailgun       |
| Mailjet       |
| Mailosaur     |
| Mandrill      |
| Naver         |
| OpenMailBox   |
| Outlook365    |
| Postmark      |
| QQ            |
| QQex          |
| SendCloud     |
| SendGrid      |
| SendinBlue    |
| SendPulse     |
| SES           |
| SES-US-EAST-1 |
| SES-US-WEST-2 |
| SES-EU-WEST-1 |
| Sparkpost     |
| Yahoo         |
| Yandex        |
| Zoho          |
| qiye.aliyun   |


```/config/postgres.json```
Config should follow [Sequelize](https://sequelize.org/) syntax.
```json
{
    "database": "avouch", //db name
    "userName": "avouch@postgres", //db username
    "password": "avouch", //db password
    "host": "avouch.lexicalgrammmar.dev", //db host
    "port": 5432, //db port
    "options": {
        "dialect": "postgres",
        "define": {
            "timestamps": false
        },
        "pool": {
            "max": 10,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        },
        "dialectOptions": {
            "multipleStatements": true,
            "dateStrings": true,
            "useUTC": false,
            "typeCast": true
        },
        "timezone": "+05:30",
        "ssl": true
    }
}
```

After updating the config, you can start Express.js app at `http://localhost:4001/` using the following command.

```bash
$ node index.js
```

## Command Line Options

This generator can also be further configured with the following command line flags.

        --version        output the version number
    -f, --force          force on non-empty directory
    -h, --help           output usage information

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/avouch.svg
[npm-url]: https://npmjs.org/package/avouch