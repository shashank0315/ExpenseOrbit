from datetime import datetime
from collections import defaultdict

expenses = []
budgets = {}

def log_expense():
    date = input("Enter date (YYYY-MM-DD): ")
    category = input("Enter category (e.g., Food, Transport): ").title()
    try:
        amount = float(input("Enter amount spent: "))
    except ValueError:
        print("Invalid amount. Try again.")
        return

    expenses.append({
        "date": date,
        "category": category,
        "amount": amount
    })

    # Check against budget
    month = date[:7]
    spent_this_month = sum(e["amount"] for e in expenses
                           if e["category"] == category and e["date"].startswith(month))

    if category in budgets:
        if spent_this_month > budgets[category]:
            print(f"⚠️ You have exceeded the budget for {category} (Spent: {spent_this_month}, Budget: {budgets[category]})")
    print("✅ Expense logged successfully.\n")

def set_budget():
    category = input("Enter category to set budget for: ").title()
    try:
        amount = float(input("Enter monthly budget amount: "))
        budgets[category] = amount
        print(f"✅ Budget set for {category}: {amount}\n")
    except ValueError:
        print("Invalid amount. Try again.")

def show_report():
    month = input("Enter month to view report (YYYY-MM): ")
    print(f"\n📊 Report for {month}")

    total_spent = 0
    category_spending = defaultdict(float)

    for e in expenses:
        if e["date"].startswith(month):
            category_spending[e["category"]] += e["amount"]
            total_spent += e["amount"]

    print(f"\nTotal Spending: ₹{total_spent:.2f}\n")

    for category, spent in category_spending.items():
        budget = budgets.get(category, 0)
        status = "✅ Within Budget" if spent <= budget else "❌ Over Budget"
        print(f"{category}: Spent ₹{spent:.2f} / Budget ₹{budget:.2f} --> {status}")

    print()

def main():
    while True:
        print("====== Expense Tracker ======")
        print("1. Log Expense")
        print("2. Set Monthly Budget")
        print("3. Show Report")
        print("4. Exit")
        choice = input("Choose an option (1-4): ")

        if choice == '1':
            log_expense()
        elif choice == '2':
            set_budget()
        elif choice == '3':
            show_report()
        elif choice == '4':
            print("Goodbye! Stay within your budget. 💰")
            break
        else:
            print("Invalid choice. Try again.\n")

if __name__ == "__main__":
    main()
