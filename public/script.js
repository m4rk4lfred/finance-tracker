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

let confirmModal = document.getElementById("confirmModal");
let confirmYes = document.getElementById("confirmYes");
let confirmNo = document.getElementById("confirmNo");

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
      balance.textContent = formatter.format(totalBalance);
      income.textContent = formatter.format(totalIncome);
      expense.textContent = formatter.format(totalExpense);

      if (totalBalance < 0) {
        balance.classList.remove('positive'); 
      } else {
        balance.classList.add('positive');
      }
    });
}

function renderListRecent() {
  list.innerHTML = "";

  fetch('/api/transactions')
    .then(response => response.json())
    .then(transactions => {
      if (transactions.length === 0) {
        status.textContent = "No transactions.";
        return;
      }

      status.textContent = ""; // Clear the "No transactions" message

      // Sort transactions by date in descending order (most recent first)
      const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Limit to 5 most recent transactions
      const recentTransactions = sortedTransactions.slice(0, 5);

      recentTransactions.forEach(({ id, name, amount, date, type }) => {
        const sign = type === "Income" ? 1 : -1;

        const li = document.createElement("li");

        // Apply color based on transaction type
        const amountClass = type === "Income" ? "green" : "red"; // Green for Income, Red for Expense

        li.innerHTML = `
          <div class="name">
            <h4>${name}</h4>
            <p>${new Date(date).toLocaleDateString()}</p>
          </div>
          
          <div class="amount ${amountClass}">
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
    })
    .catch(error => {
      console.error('Error:', error);
      status.textContent = "Failed to load transactions.";
    });
}

// Function to show the custom confirmation modal
function showConfirmModal(callback) {
    confirmModal.style.display = "flex"; 

    confirmYes.onclick = () => {
        callback(true); 
        closeConfirmModal();
    };

    confirmNo.onclick = () => {
        callback(false); 
        closeConfirmModal();
    };
}

// Function to close the confirmation modal
function closeConfirmModal() {
    confirmModal.style.display = "none"; 
}

// Modify deleteTransaction function to use the custom modal
function deleteTransaction(id) {
    showConfirmModal((confirmed) => {
        if (confirmed) {
            fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    renderListRecent();
                    renderList();
                } else {
                    status.textContent = "Failed to delete transaction.";
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            console.log('Transaction deletion canceled.');
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

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const newTransaction = {
    type: document.getElementById("typeCheckbox").checked ? "Expense" : "Income",
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
    renderListRecent();
    renderList();
  })
  .catch(error => console.error('Error:', error));
}

// Function to open a modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('active'); 
}

// Function to close a modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active'); 
}

// Example functions to handle modal actions
function viewTransaction(transaction) {
  const details = `
    <strong>ID:</strong> ${transaction.id}<br>
    <strong>Type:</strong> ${transaction.type}<br>
    <strong>Name:</strong> ${transaction.name}<br>
    <strong>Amount:</strong> ${transaction.amount}<br>
    <strong>Date:</strong>  ${dateFormat(transaction.date)}<br>
  `;
  document.getElementById('viewDetails').innerHTML = details;
  openModal('viewModal');
}

function showUpdateModal(transactionData) {
  const modal = document.getElementById('updateModal');
  const transaction = transactionData;

  document.getElementById('updateId').value = transaction.id;
  document.getElementById('updateType').value = transaction.type;
  updateModalNameOptions();
  document.getElementById('updateName').value = transaction.name;
  document.getElementById('updateAmount').value = transaction.amount;
  document.getElementById('updateDate').value = transaction.date;

  modal.classList.add('active');
}

function updateModalNameOptions() {
  const type = document.getElementById('updateType').value;
  const nameDropdown = document.getElementById('updateName');
  nameDropdown.innerHTML = '';
  const options = type === 'Income'
    ? ['Salary', 'Freelance', 'Business Income', 'Commissions', 'Interest', 'Rental Income', 'Pensions', 'Bonus', 'Others']
    : ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Insurance', 'Healthcare', 'Entertainment', 'Education', 'Home Maintenance', 'Others'];
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    nameDropdown.appendChild(opt);
  });
}

function updateTransaction(event) {
  event.preventDefault(); 
  
  const id = document.getElementById('updateId').value;
  const type = document.getElementById('updateType').value; 
  const name = document.getElementById('updateName').value;
  const amount = document.getElementById('updateAmount').value;
  const date = document.getElementById('updateDate').value;

  const updatedTransaction = {
      id: id,
      type: type, 
      name: name,
      amount: amount,
      date: date
  };

  fetch('/update', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTransaction),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Transaction updated successfully');
          location.reload(); 
      } else {
          alert('Error updating transaction');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('There was an error updating the transaction');
  });
}


// Format date to MM/DD/YYYY
function dateFormat(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

window.onclick = function(event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.classList.remove("active"); 
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
    renderListRecent();
    renderList(); 
});