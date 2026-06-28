import random
import time
import requests

URL = "http://127.0.0.1:8000/webhooks/logs"

SERVICES = {
    "payment-service": [
        "Database connection timeout",
        "Payment gateway unavailable",
        "Transaction rollback detected",
        "High API latency",
    ],
    "auth-service": [
        "JWT validation failed",
        "Multiple login failures detected",
        "Authentication service timeout",
        "User session expired",
    ],
    "inventory-service": [
        "Inventory synchronization failed",
        "Redis cache unavailable",
        "Stock update delayed",
        "Warehouse API timeout",
    ],
    "notification-service": [
        "Email delivery failed",
        "SMS queue backlog",
        "Notification worker restarted",
        "Push notification timeout",
    ],
    "gateway-service": [
        "502 Bad Gateway",
        "504 Gateway Timeout",
        "Reverse proxy unavailable",
        "High request latency",
    ],
}

LEVELS = ["INFO", "WARNING", "ERROR", "CRITICAL"]


def generate_payload():
    return {
        "cpu": random.randint(15, 100),
        "memory": random.randint(20, 100),
        "disk": random.randint(20, 100),
        "latency": random.randint(20, 900),
        "team_id": 1,
    }


while True:

    service = random.choice(list(SERVICES.keys()))

    data = {
        "service": service,
        "level": random.choice(LEVELS),
        "message": random.choice(SERVICES[service]),
        "payload": generate_payload(),
    }

    print("\n" + "=" * 70)
    print("Sending Webhook")
    print(f"Service  : {data['service']}")
    print(f"Level    : {data['level']}")
    print(f"Message  : {data['message']}")
    print(f"Payload  : {data['payload']}")

    try:

        response = requests.post(
            URL,
            json=data,
            timeout=10
        )

        print(f"\nStatus : {response.status_code}")

        if response.status_code == 200:

            result = response.json()
            print("\nWebhook Stored")

            if result["analysis"]:
                print("\nAI Summary")
                print(result["analysis"]["summary"])
                print(f"Severity : {result['analysis']['severity']}")
                print(f"Confidence : {result['analysis']['confidence']}")

            if result["incident"]:
                print("\nIncident Created")
                print(result["incident"]["title"])
            else:
                print("\nNo Incident Created")

        else:
            print(response.text)

    except Exception as e:
        print(f"Error : {e}")

    time.sleep(5)