FROM python
WORKDIR /app
COPY . /app
CMD ["python3", "Expense.py"]