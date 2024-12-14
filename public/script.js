const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach(transaction => {
        if (transaction.type === 'Income') {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });
      const totalBalance = totalIncome - totalExpense;
      balance.textContent = formatter.format(Math.abs(totalBalance));
      income.textContent = formatter.format(totalIncome);
      expense.textContent = formatter.format(totalExpense);

      // Change the color of the balance text if negative
      if (totalBalance < 0) {
        balance.classList.add('negative');
      } else {
        balance.classList.remove('negative');
      }
    });
}

// Render transaction list
function renderList() {
  const tableBody = document.querySelector('.content-header tbody');
  tableBody.innerHTML = "";
  
  fetch('/api/transactions')
    .then(response => response.json())
    .then(transactions => {
      transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${transaction.id}</td>
          <td>${transaction.type}</td>
          <td>${transaction.name}</td>
          <td>${formatter.format(transaction.amount)}</td>
          <td>${dateFormat(transaction.date)}</td>
          <td>
            <button class="btn btn-view" onclick='viewTransaction(${JSON.stringify(transaction)})'>View</button>
            <button class="btn btn-update" onclick='showUpdateModal(${JSON.stringify(transaction)})'>Update</button>
            <button class="btn btn-delete" onclick='deleteTransaction(${transaction.id})'>Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
      updateTotal();
    });
}

// Delete a transaction
function deleteTransaction(id) {
  fetch(`/api/transactions/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    renderList();
  })
  .catch(error => console.error('Error:', error));
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const newTransaction = {
    type: formData.get("type") ? "Income" : "Expense",
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: formData.get("date")
  };

  fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTransaction),
  })
  .then(response => response.json())
  .then(data => {
    form.reset();
    renderList();
  })
  .catch(error => console.error('Error:', error));
}

function viewTransaction(transaction) {
    const modal = document.getElementById("viewModal");
    const viewDetails = document.getElementById("viewDetails");
    viewDetails.innerHTML = `
        <p>ID: ${transaction.id}</p>
        <p>Type: ${transaction.type}</p>
        <p>Name: ${transaction.name}</p>
        <p>Amount: ${formatter.format(transaction.amount)}</p>
        <p>Date: ${dateFormat(transaction.date)}</p>
    `;
    modal.style.display = "block";
}

function showUpdateModal(transaction) {
  const modal = document.getElementById("updateModal");
  document.getElementById("updateId").value = transaction.id;
  document.getElementById("updateName").value = transaction.name;
  document.getElementById("updateAmount").value = transaction.amount;
  document.getElementById("updateDate").value = transaction.date;

  if (transaction.type === 'Income') {
      document.getElementById("updateTypeIncome").checked = true;
  } else {
      document.getElementById("updateTypeExpense").checked = true;
  }

  modal.style.display = "block";
}

function showUpdateModal(transaction) {
  const modal = document.getElementById("updateModal");
  document.getElementById("updateId").value = transaction.id;
  document.getElementById("updateName").value = transaction.name;
  document.getElementById("updateAmount").value = transaction.amount;
  document.getElementById("updateDate").value = transaction.date;

  modal.style.display = "block";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

function updateTransaction(event) {
    event.preventDefault();
    const form = document.getElementById("updateForm");
    const formData = new FormData(form);
    const updatedTransaction = {
        id: formData.get("id"),
        name: formData.get("name"),
        amount: parseFloat(formData.get("amount")),
        date: formData.get("date")
    };

    fetch(`/update/${updatedTransaction.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction),
    })
    .then(response => {
        if (response.ok) {
            closeModal('updateModal');
            renderList();
        } else {
            console.error('Failed to update transaction');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Format date to MM/DD/YYYY
function dateFormat(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Close the modal when the user clicks outside of it
window.onclick = function(event) {
    const viewModal = document.getElementById("viewModal");
    const updateModal = document.getElementById("updateModal");
    if (event.target == viewModal) {
        viewModal.style.display = "none";
    }
    if (event.target == updateModal) {
        updateModal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderList(); 
});