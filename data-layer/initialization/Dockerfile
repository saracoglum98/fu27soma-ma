FROM python:3.11-slim

WORKDIR /app

COPY initialization/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY initialization/script.py .
COPY initialization/seed.sql .

CMD ["python", "script.py"] 