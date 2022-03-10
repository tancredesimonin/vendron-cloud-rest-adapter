# Usage of the restified Vendron websocket API

There is the detail informations about the 2 endpoints with business logic.

All other endpoints are classical CRUD and search available on the hosted swagger (documentation tab in the admin panel).

## Check status of a machine as a customer

This request checks the status of a smart fridge for a customer.
It creates a new user in the db if the given informations does not match an existing
It creates a new transaction for the given user, and this new transaction will be used for the second request

### Request

**POST** `http://localhost:1337/machines/{id}/status`

Request body

```json
{
    "customer": {
        "email": "john-doe@gmail.com",
        "customerId": "1111111", // your own user management system ID
        "amount": 34, // authorized amount - not required - fallback to an .env default config
        "paymentName": "STRIPE", //  not required - fallback to an .env default config
    }
}
```

Curl

```
curl --location --request POST 'http://localhost:1337/machines/1/status' \
--header 'accept: application/json' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customer": {
        "email": "john-doe@gmail.com",
        "customerId": "XXXXXX"
    }
}'
```
<div class="page"/>

### Response

```json
{
    "success": true,
    "transactionId": 87, // retrieve this one as you'll need it for the door-open request
    "transactionEvent": {
        "id": 211,
        "transaction": {
            "id": 87,
            "user": 3,
            "machine": 1,
            "status": "purchasing",
            "products": null,
            "created_by": null,
            "updated_by": null,
            "created_at": "2022-03-10T14:46:11.173Z",
            "updated_at": "2022-03-10T14:46:11.191Z"
        },
        "user": {
            "id": 3,
            "username": "john-doe@gmail.com",
            "email": "john-doe@gmail.com",
            "provider": null,
            "password": null,
            "resetPasswordToken": null,
            "confirmationToken": null,
            "confirmed": true,
            "blocked": true,
            "role": 1,
            "customerId": "1111111",
            "created_by": null,
            "updated_by": 1,
            "created_at": "2022-02-08T15:14:46.288Z",
            "updated_at": "2022-02-09T11:02:52.674Z"
        },
        "machine": {
            "id": 1,
            "vendorId": "XXXXXXXXXX",
            "label": "Kedge Paris 1",
            "created_by": 1,
            "updated_by": 1,
            "created_at": "2022-02-07T11:17:29.591Z",
            "updated_at": "2022-03-10T12:17:05.724Z"
        },
        "label": "Check State Success",
        "name": "check_machine_state_success",
        "type": "machine",
        "status": "success",
        "message": "Machine is available for API Dispensing",
        "data": {
            "command": "check_machine_state_success",
            "command_data": {
                "status": 1,
                "error_data": [],
                "json_data": {
                    "code": 1,
                    "message": "Machine is available for API Dispensing"
                }
            },
            "ref": "0.6924467254677906"
        },
        "created_by": null,
        "updated_by": null,
        "created_at": "2022-03-10T14:46:11.209Z",
        "updated_at": "2022-03-10T14:46:11.225Z"
    }
}
```

<div class="page"/>

## Open door for a customer

### Request

**POST** `http://localhost:1337/machines/{id}/status`

Request body:
the `transaction.id` has been received from the `/status` request

```json
{
    "customer": {
        "email": "john-doe@gmail.com",
        "customerId": "XXXXXXX"
    },
    "transaction": {
        "id": 28
    }
}
```

Curl

```
curl --location --request POST 'http://localhost:1337/machines/1/open' \
--header 'accept: application/json' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customer": {
        "email": "john-doe@gmail.com",
        "customerId": "XXXXXXX"
    },
    "transaction": {
        "id": 28
    }
}'
```
<div class="page"/>

### Response

```json
{
    "success": true,
    "message": {
        "command": "smart_fridge_door_open_success",
        "command_data": {
            "status": 1,
            "error_data": [],
            "json_data": {
                "code": 1,
                "message": "Door is succesfully unlocked",
                "data": [
                    {
                        "door_status": "UNLOCKED"
                    }
                ]
            }
        },
        "ref": "0.3955353339669512"
    },
    "machine": {
        "id": 1,
        "vendorId": "XXXXXXXXX",
        "label": "Kedge Paris 1",
        "created_at": "2022-02-07T11:17:29.591Z",
        "updated_at": "2022-03-10T12:17:05.724Z"
    },
    "user": {
        "id": 3,
        "username": "john-doe@gmail.com",
        "email": "john-doe@gmail.com",
        "provider": null,
        "confirmed": true,
        "blocked": true,
        "role": {
            "id": 1,
            "name": "Authenticated",
            "description": "Default role given to authenticated user.",
            "type": "authenticated"
        },
        "customerId": "1111111",
        "created_at": "2022-02-08T15:14:46.288Z",
        "updated_at": "2022-02-09T11:02:52.674Z",
        "transactions": [
            {
                "id": 48,
                "user": 3,
                "machine": 1,
                "status": "success",
                "products": null,
                "created_at": "2022-03-07T16:24:01.323Z",
                "updated_at": "2022-03-07T16:24:21.609Z"
            },
            {
                "id": 49,
                "user": 3,
                "machine": 1,
                "status": "purchasing",
                "products": null,
                "created_at": "2022-03-10T10:38:52.382Z",
                "updated_at": "2022-03-10T10:38:52.402Z"
            }
        ]
    },
    "transactionEvent": {
        "id": 214,
        "transaction": {
            "id": 86,
            "user": 3,
            "machine": 1,
            "status": "purchasing",
            "products": null,
            "created_by": null,
            "updated_by": null,
            "created_at": "2022-03-10T12:31:06.190Z",
            "updated_at": "2022-03-10T12:31:06.207Z"
        },
        "user": {
            "id": 3,
            "username": "john-doe@gmail.com",
            "email": "john-doe@gmail.com",
            "provider": null,
            "password": null,
            "resetPasswordToken": null,
            "confirmationToken": null,
            "confirmed": true,
            "blocked": true,
            "role": 1,
            "customerId": "1111111",
            "created_by": null,
            "updated_by": 1,
            "created_at": "2022-02-08T15:14:46.288Z",
            "updated_at": "2022-02-09T11:02:52.674Z"
        },
        "machine": {
            "id": 1,
            "vendorId": "XXXXXXXXXXXXX",
            "label": "Kedge Paris 1",
            "created_by": 1,
            "updated_by": 1,
            "created_at": "2022-02-07T11:17:29.591Z",
            "updated_at": "2022-03-10T12:17:05.724Z"
        },
        "label": "Door Open Success",
        "name": "smart_fridge_door_open_success",
        "type": "transaction",
        "status": "success",
        "message": "Door is succesfully unlocked",
        "data": {
            "command": "smart_fridge_door_open_success",
            "command_data": {
                "status": 1,
                "error_data": [],
                "json_data": {
                    "code": 1,
                    "message": "Door is succesfully unlocked",
                    "data": [
                        {
                            "door_status": "UNLOCKED"
                        }
                    ]
                }
            },
            "ref": "0.3955353339669512"
        },
        "created_by": null,
        "updated_by": null,
        "created_at": "2022-03-10T14:50:11.717Z",
        "updated_at": "2022-03-10T14:50:11.732Z"
    }
}
```


## Full swagger:

![swagger](/public/swagger.PNG)

## Transactions CRUDS:

![cruds](/public/transactions.PNG)