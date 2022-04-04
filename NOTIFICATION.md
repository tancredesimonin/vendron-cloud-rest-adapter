# Notification Webhook

On each event `smart_fridge_request_completed` a payload will be sent to the webhook URL you configured.
This POST request will be sent with a bearer token of your choice if you want to keep the route private.

## Configuration:

Set the environment variables:

```
WEBHOOK_URL_TRANSACTION=
WEBHOOK_URL_BEARER=
```

## Request

- **POST** request sent to the URL defined in `WEBHOOK_URL_TRANSACTION`
- Header `Authorization` as: `Bearer <WEBHOOK_URL_BEARER>`

## Body

```json
{
    "id": 381, // the transactionEvent id
    "label": "Request Completed Success",
    "name": "smart_fridge_request_completed",
    "type": "transaction",
    "status": "success", // could be: error
    "message": "This Smart Fridge request has been completed & closed",
    "transaction": {
        "id": 133,
        "user": 6,
        "machine": 1,
        "status": "success",
        "products": [
            {
                "vpn": "PRODUCT_001",
                "unit_price": "1.60",
                "name": "100 Plus (Small)"
            },
            {
                "vpn": "PRODUCT_006",
                "unit_price": "2.10",
                "name": "Coca light (Small)"
            },
            {
                "vpn": "PRODUCT_009",
                "unit_price": "7.50",
                "name": "Sandwich Poulet"
            }
        ],
        "created_by": null,
        "updated_by": null,
        "created_at": "2022-04-04T09:34:00.044Z",
        "updated_at": "2022-04-04T09:34:22.604Z"
    },
    "user": {
        "id": 5,
        "username": "john-doe@gmail.com",
        "email": "john-doe@gmail.com",
        "customerId": "1111111", // your app ID
        "created_by": null,
        "updated_by": null,
        "created_at": "2022-03-10T15:46:10.423Z",
        "updated_at": "2022-03-10T15:46:10.439Z"
    },
    "machine": {
        "id": 1,
        "vendorId": "XXXXXXXX", // Your vendor ID
        "label": "Kedge Paris 1",
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2022-02-07T11:17:29.591Z",
        "updated_at": "2022-03-10T12:17:05.724Z"
    },
    "data": {
        "command": "smart_fridge_request_completed",
        "command_data": {
            "status": 1,
            "error_data": [],
            "json_data": {
                "code": 1,
                "message": "This Smart Fridge request has been completed & closed",
                "data": {
                    "transaction_id": "",
                    "transaction_status": 1,
                    "transaction_total": 1.5,
                    "transaction_product": [
                        {
                            "vpn": "PRODUCT_001",
                            "unit_price": "1.60",
                            "name": "100 Plus (Small)"
                        },
                        {
                            "vpn": "PRODUCT_006",
                            "unit_price": "2.10",
                            "name": "Coca light (Small)"
                        },
                        {
                            "vpn": "PRODUCT_009",
                            "unit_price": "7.50",
                            "name": "Sandwich Poulet"
                        }
                    ]
                }
            }
        },
        "ref": "user:5-1649064850569"
    },
    "created_by": null,
    "updated_by": null,
    "created_at": "2022-04-04T09:34:22.633Z",
    "updated_at": "2022-04-04T09:34:22.640Z"
}
```