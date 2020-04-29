
[Avouch](https://github.com/arunkumarpalaniappan/avouch), Complete Out of the Box Authentication server using Express

[![NPM Version][npm-image]][npm-url]

| Currently Supported DB        |   
|-----------------|
|Postgres |

| Currently Supported Encryption Standard        |   
|-----------------|
|AES |

| Available in Future Versions        |   
|-----------------|
|MySQL* |
|MariaDB*|
|MS SQL*|
|MongoDB*|


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

Open Project Directory:

```bash
$ cd new_project_name
```

Install dependencies:

```bash
$ npm install
```
## Update Config
Update Application Config at location ```/config/config.json```  to set JWT Key, SMTP Details, etc..,

|Property| Data Type |Description|
|--------| ----| ---|
|`tokenExpiry`|Number| JWT Token Expiry in Seconds|
|`jwtKey`|String| JWT Token Secret, used while generating token |
|`encryptionKey`|String| AES Secret, used while encrypting the data |
|`validTenants`| JSON | Objects of unique application/tenant ids with config|
|`validTenants.<TENANT_ID>`| String | Array of unique application/tenant ids|
|`validTenants.<TENANT_ID.tenantName>`| String | Uniuqe name for the application|
|`validTenants.<TENANT_ID.allowedUrls>`*| Array | Array of unique application/tenant ids|
|`validTenants.<TENANT_ID>.email`| JSON | Email customisation config for forgot reset email|
|`validTenants.<TENANT_ID>.email.headerLink`| String | URL for the Header Image in Email|
|`validTenants.<TENANT_ID>.email.headerLogo`| Link(with https) | Public Link for your logo |
|`validTenants.<TENANT_ID>.email.endPoint`| Link(with https) | Domain name of your UI with page to rest password, email will be sent as `{endpoint}/<reset_token>`|
|`validTenants.<TENANT_ID>.emailaddress`| String | Footer text in email|
|`smtp`|JSON| SMTP Config for Sending Forgot Password Emails|
|`smtp.service`|String| SMTP Service Provider|
|`smtp.username`|String| SMTP User Name|
|`smtp.password`|String| SMTP Password|

Click here to see list of all [Supported SMTP Services]( #supported-smtp-services)


\* Available in next release.
### Example config.json
```json
{
    "tokenExpiry": 3600, 
    "jwtKey": "3c360c7d4Ab94cO998978c@11c8Ead408I5ab466c7544609b3e3E306aace7e03",
    "encryptionKey": "832720e0-fa6e-43d6-bddc-60035164b4c2-cd0c7f4f-5af2-4dc0-a789-501254e7e528",
    "validTenants": {
        "0177d67f-3b29-42c6-b0cd-2cc70ffccb41": {
            "tenantName": "My Blog", 
            "allowedUrls": ["https://lexicalgrammar.dev"],
            "email": {
                "headerLink": "https://lexicalgrammar.dev", 
                "headerLogo": "https://lexicalgrammar.dev/logo.svg",
                "endPoint": "http://localhost:4001",
                "address": "Made in ❤ with India" 
             }
        }
    },
    "smtp": {
        "service": "gmail", 
        "username": "hello@lexicalgrammar.dev",
        "password": "S3c3r3tP@ssW0rd"
    }
}
```
\# Values provided in the above JSON is just for representational purpose and not actual values.

After updating `config.json`, you have to update ```/config/postgres.json``` to establish db connection.

DDL Script available at [DDL](https://github.com/arunkumarpalaniappan/avouch/blob/master/template/utils/ddl.sql) Script, after creating the table in Postgres, you can update the following config.

You can read more about [Sequelize](https://sequelize.org/master/manual/migrations.html) syntax.

#### Example postgres.json

```json
{
    "database": "avouch", 
    "userName": "avouch@postgres", 
    "password": "avouch", 
    "host": "avouch.lexicalgrammmar.dev", 
    "port": 5432, 
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
\# Values provided in the above JSON is just for representational purpose and not actual values.

After updating the config, you can start Express.js app at `http://localhost:4001/` using the following command.

```bash
$ node index.js
```

## Command Line Options

This generator can also be further configured with the following command line flags.

        --version        output the version number
    -f, --force          force on non-empty directory
    -h, --help           output usage information

## Available API's

| Endpoint        |    Method    |  Usecase       | Supported Fields|
|-----------------|--------------|----------------|-----------------|
| /register       | POST         | Create new User| [register](#register)|
| /login       | POST         | Login and Get Token| [login](#login)|
| /forgot       | POST         | Send Reset Password Link| [forgot](#forgot)|
| /verify/:{reset_token}       | GET         | Verify Reset Token| reset_token - Token from email link|
| /reset       | POST         | Update Password| [reset](#reset)|
| /register       | PUT         | Update Existing User(except email address)| [register](#register)|
| /authenticate       | POST         | Verify Token or Get User Info| [authenticate](#authenticate)|
| /refresh       | POST         | Get new Token using current JWT Token| [refresh](#refresh)|    


### register

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|firstName|  Yes        |String| First Name| - |
|lastName|  Yes        |String| Last Name| - |
|email|  Yes        |String| Email Address| - |
|password|  Yes        |String| Password | Base64|
|authorisedTenants|  Yes  | Array with Strings| Array of Tenants IDs which user has access to | -|
|tenantID|  Yes        | String| Current Tenant ID| - |
|accountDetails| Yes | JSON | Additional user profile fields | - |
```json
{
    "firstName": "Arunkumar",
    "lastName": "palaniappan",
    "email": "hello@lexicalgrammar.dev",
    "password": "cGFzc3dvcmQ=",
    "authorisedTenants": [
        "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
    ],
    "accountDetails": {
        "phone": "0000000000",
        "designation": "Full Stack Developer",
        "roleID": "101",
        "userType": "admin"
    },
    "tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
}
```
#### Response
| Response Code        |    Type  or Description   | 
|-----------------|--------------|
|200| Success Response with No Content|
|401| User Doesn't have access to particular Tenant|
|500| Internal Server Error|
### login

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|email|  Yes        |String| Email Address| - |
|password|  Yes        |String| Password | Base64|
|tenantID|  Yes        | String| Current Tenant ID| - |
```json
{
  "loginID": "hello@lexicalgrammar.dev",
  "password": "cGFzc3dvcmQ=",
  "tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
}
```
#### Response
| Response Code        |    Type  or Description   | 
|-----------------|--------------|
|200| Success as json with token|
|401| User Doesn't have access to particular Tenant|
|500| Internal Server Error|
### forgot

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|email|  Yes        |String| Email Address| - |
|tenantID|  Yes        | String| Current Tenant ID| - |
```json
{
  "loginID": "hello@lexicalgrammar.dev",
  "tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
}
```
#### Response
| Response Code        |    Type  or Description   | 
|-----------------|--------------|
|200| Success message regarding email sent status|
|401| User Doesn't have access to particular Tenant|
|500| Internal Server Error|
### reset

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|password|  Yes        |String| New Password| base64 |
|token|  Yes        |String| Reset Token| - |
|tenantID|  Yes        | String| Current Tenant ID| - |
```json
{
	"password": "MTIzNDU=",
	"tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41",
	"token": "529438c7ed0cc7c3edb237c5afbe4ab9f31944b0938dc874855e317261943189"
}
```
#### Response
| Response Code        |    Type  or Description   | 
|-----------------|--------------|
|200| Success message with password update status|
|401| User Doesn't have access to particular Tenant|
|500| Internal Server Error|
### authenticate

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|token|  Yes        |String| JWT Token from Login| - |
|tenantID|  Yes        | String| Current Tenant ID| - |
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnVua3VtYXIucGFsYW5pYXBwYW5AdGhlZGF0YXRlYW0uaW4iLCJyb2xlcyI6WyJhZG1pbiJdLCJhdWQiOiIwMTc3ZDY3Zi0zYjI5LTQyYzYtYjBjZC0yY2M3MGZmY2NiNDEiLCJpc3MiOiJhdm91Y2gtdjAuMC4xLXRlbmFudC0wMTc3ZDY3Zi0zYjI5LTQyYzYtYjBjZC0yY2M3MGZmY2NiNDEiLCJleHAiOjE1ODg2NzEzNjcsImlhdCI6MTU4ODA2NjU2N30.Eu_hXHtzv1RkyZBV832M26uJki_Dbcgt0BrdHg3k9pY",
  "tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
}
```
#### Response
| Response Code        |    Type   or Description  | 
|-----------------|--------------|
|200| Success with user profile with all fields from register customer except password and an additional property named `validToken` as `true` if the token is valid|
|401| User Doesn't have access to particular Tenant or Token Expired|
|500| Internal Server Error|
### refresh

|  Field  |   Required  | Type | Description|  Encoding |
|---------|-------------|------|-------|----------|
|token|  Yes        |String| JWT Token from Login| - |
|tenantID|  Yes        | String| Current Tenant ID| - |
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnVua3VtYXIucGFsYW5pYXBwYW5AdGhlZGF0YXRlYW0uaW4iLCJyb2xlcyI6WyJhZG1pbiJdLCJhdWQiOiIwMTc3ZDY3Zi0zYjI5LTQyYzYtYjBjZC0yY2M3MGZmY2NiNDEiLCJpc3MiOiJhdm91Y2gtdjAuMC4xLXRlbmFudC0wMTc3ZDY3Zi0zYjI5LTQyYzYtYjBjZC0yY2M3MGZmY2NiNDEiLCJleHAiOjE1ODg2NzEzNjcsImlhdCI6MTU4ODA2NjU2N30.Eu_hXHtzv1RkyZBV832M26uJki_Dbcgt0BrdHg3k9pY",
  "tenantID": "0177d67f-3b29-42c6-b0cd-2cc70ffccb41"
}
```
#### Response
| Response Code        |    Type or Description   | 
|-----------------|--------------|
|200| Success as json with token|
|401| User Doesn't have access to particular Tenant or Token Expired|
|500| Internal Server Error|


Postman collection.json is available at [postman/collection.json](https://github.com/arunkumarpalaniappan/avouch/blob/master/postman/collection.json)


#### Supported SMTP Services

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

## Contribution
Contributions to avouch are welcome. 

Here is how you can contribute to avouch:

[Submit bugs](https://github.com/arunkumarpalaniappan/avouch/issues) and verify existing issues.

[Submit pull requests](https://github.com/arunkumarpalaniappan/avouch/pulls)  for bug fixes and features and discuss existing proposals.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/avouch.svg
[npm-url]: https://npmjs.org/package/avouch