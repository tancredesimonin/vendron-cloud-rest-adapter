# Usage of the restified Vendron websocket API

## Check status of a machine as a customer

### Request

**POST** `http://localhost:1337/machines/{id}/status`

Request body

```json
{
    "customer": {
        "email": "john-doe@gmail.com",
        "customerId": "1111111"
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
    "error": false,
    "transactionId": 38,
    "ref": "0.08384071701617679",
    "machineStatus": {
        "code": 1,
        "message": "Machine is available for API Dispensing"
    },
    "machine": {
        "id": 1,
        "vendorId": "machine_uid",
    },
    "rawResponse": {
        "command": "check_machine_state_success",
        "command_data": {
            "status": 1,
            "error_data": [],
            "json_data": {
                "code": 1,
                "message": "Machine is available for API Dispensing"
            }
        },
        "ref": "0.08384071701617679"
    },
    "transactionEvent": {
        // all details here
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
    "error": false,
    "ref": "0.4298766217258716",
    "machineStatus": {
        "code": 1,
        "message": "Smart Fridge Door is unlocked",
        "data": [
            {
                "door_status": "OPENED"
            }
        ]
    },
    "machine": {
        "id": 1,
        "vendorId": "machine_uid"
    },
    "rawResponse": {
        "command": "smart_fridge_door_open_success",
        "command_data": {
            "status": 1,
            "error_data": [],
            "json_data": {
                "code": 1,
                "message": "Smart Fridge Door is unlocked",
                "data": [
                    {
                        "door_status": "OPENED"
                    }
                ]
            }
        },
        "ref": "0.4298766217258716"
    },
    "transactionEvent": {
        // more details here
    }
}
```
