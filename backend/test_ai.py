from app.ai.analyzer import analyze_log


result = analyze_log(

    service="payment-service",

    level="ERROR",

    message="Database timeout while connecting to PostgreSQL.",

    payload={
        "host": "server-01",
        "cpu": 94,
        "memory": 88,
        "database": "postgres"
    }

)

print(result)