const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

// Update the totals (income, expense, balance)
function updateTotal() {
  fetch('/api/transactions')
    .then(response => response.json())
    .then(transactions => {
      const incomeTotal = transactions
        .filter((transact) => transact.type === "income")
        .reduce((total, transact) => total + transact.amount, 0);

      const expenseTotal = transactions
        .filter((transact) => transact.type === "expense")
        .reduce((total, transact) => total + transact.amount, 0);

      const balanceTotal = incomeTotal - expenseTotal;

      // Update the UI
      balance.textContent = formatter.format(balanceTotal).substring(1);  
      balance.style.color = balanceTotal >= 0 ? "white" : "#D21404"; 

      income.textContent = formatter.format(incomeTotal);
      expense.textContent = formatter.format(expenseTotal * -1);  
    });
}

// Render transaction list
function renderList() {
  list.innerHTML = "";
  
  fetch('/api/transactions')
    .then(response => response.json())
    .then(transactions => {
      if (transactions.length === 0) {
        status.textContent = "No transactions.";
        return;
      }

      transactions.forEach(({ id, name, amount, date, type }) => {
        const sign = type === "income" ? 1 : -1;

        const li = document.createElement("li");

        li.innerHTML = `
          <div class="name">
            <h4>${name}</h4>
            <p>${new Date(date).toLocaleDateString()}</p>
          </div>
          
          <div class="amount ${type}">
            <span>${formatter.format(amount * sign)}</span>
          </div>
        
          <div class="action">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        `;
        
        list.appendChild(li);
      });

      updateTotal();
    });
}

// Delete a transaction
function deleteTransaction(id) {
  fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
 
    .then(response => {
      if (response.ok) {
        updateTotal();
        renderList();
      } else {
        status.textContent = "Failed to delete transaction.";
      }
    })
    .catch(error => console.error('Error:', error));
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
  
  const newTransaction = {
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: formData.get("date"),
    type: formData.get("type") === "on" ? "income" : "expense",
  };

  // Send the transaction to the server
  fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTransaction),
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Transaction added successfully') {
        renderList(); 
      } else {
        status.textContent = "Failed to add transaction.";
      }
    })
    .catch(error => console.error('Error:', error));
}


document.addEventListener("DOMContentLoaded", () => {
  renderList(); 
});
