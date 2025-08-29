let currentUser = {
    name: "Itumeleng Maharala",
    accounts: [
        {
            type: "Cheque Account",
            number: "****-7831",
            balance: 15420.50,
            currency: "ZAR"
        },
        {
            type: "Savings Account", 
            number: "****-9245",
            balance: 45800.00,
            currency: "ZAR"
        },
        {
            type: "Credit Card",
            number: "****-3421", 
            balance: 8250.00,
            currency: "ZAR"
        }
    ],
    transactions: [
        {
            id: 1,
            description: "Pick n Pay Menlyn",
            amount: -850.75,
            date: "2025-08-26",
            time: "14:32",
            category: "Groceries",
            type: "expense"
        },
        {
            id: 2,
            description: "Salary - ABC Corporate",
            amount: 28500.00,
            date: "2025-08-25",
            time: "09:00",
            category: "Salary",
            type: "income"
        },
        {
            id: 3,
            description: "Shell Garage - Fuel",
            amount: -680.00,
            date: "2025-08-24",
            time: "16:45",
            category: "Fuel",
            type: "expense"
        },
        {
            id: 4,
            description: "Vodacom - Internet",
            amount: -599.00,
            date: "2025-08-23",
            time: "08:15",
            category: "Utilities",
            type: "expense"
        },
        {
            id: 5,
            description: "Uber Eats - Nando's",
            amount: -185.50,
            date: "2025-08-22",
            time: "19:30",
            category: "Entertainment",
            type: "expense"
        }
    ]
};

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; 
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
        
        const form = modal.querySelector('.modal-form');
        if (form) {
            form.reset();
        }
    }
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

function handleTransfer(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const fromAccount = formData.get('fromAccount') || form.querySelector('select').value;
    const toAccount = formData.get('toAccount') || form.querySelector('input[placeholder="Account number or beneficiary"]').value;
    const amount = parseFloat(formData.get('amount') || form.querySelector('input[type="number"]').value);
    const reference = formData.get('reference') || form.querySelector('input[placeholder="Payment reference"]').value;
    
    if (!toAccount || !amount || amount <= 0) {
        showNotification('Please fill in all required fields with valid values.', 'error');
        return;
    }
    
    showNotification('Processing transfer...', 'info');
    
    setTimeout(() => {
        const newTransaction = {
            id: Date.now(),
            description: `Transfer to ${toAccount}`,
            amount: -amount,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            category: 'Transfer',
            type: 'expense',
            reference: reference
        };
        
        currentUser.transactions.unshift(newTransaction);
        updateTransactionsList();
        updateAccountBalances(-amount, fromAccount);
        
        showNotification(`Transfer of R ${amount.toFixed(2)} completed successfully!`, 'success');
        closeModal('transferModal');
    }, 2000);
}

function handleBillPayment(event) {
    event.preventDefault();
    
    const form = event.target;
    const billType = form.querySelector('select').value;
    const accountNumber = form.querySelector('input[placeholder="Bill account number"]').value;
    const amount = parseFloat(form.querySelector('input[type="number"]').value);
    
    if (!billType || !accountNumber || !amount || amount <= 0) {
        showNotification('Please fill in all required fields with valid values.', 'error');
        return;
    }
    
    showNotification('Processing bill payment...', 'info');
    
    setTimeout(() => {
        const newTransaction = {
            id: Date.now(),
            description: `${billType} - ${accountNumber}`,
            amount: -amount,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            category: 'Utilities',
            type: 'expense'
        };
        
        currentUser.transactions.unshift(newTransaction);
        updateTransactionsList();
        updateAccountBalances(-amount, 'Cheque Account (****-7831)');
        
        showNotification(`Bill payment of R ${amount.toFixed(2)} completed successfully!`, 'success');
        closeModal('billModal');
    }, 2000);
}

function handleAddTransaction(event) {
    event.preventDefault();
    
    const form = event.target;
    const transactionType = form.querySelector('select[name="type"]') ? form.querySelector('select[name="type"]').value : form.querySelector('select').value;
    const description = form.querySelector('input[placeholder="Transaction description"]').value;
    const category = form.querySelector('select').options[form.querySelector('select').selectedIndex].text;
    const amount = parseFloat(form.querySelector('input[type="number"]').value);
    const date = form.querySelector('input[type="date"]').value;
    
    if (!description || !amount || amount <= 0 || !date) {
        showNotification('Please fill in all required fields with valid values.', 'error');
        return;
    }
    
    const transactionAmount = transactionType === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    const newTransaction = {
        id: Date.now(),
        description: description,
        amount: transactionAmount,
        date: date,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        category: category,
        type: transactionType
    };
    
    currentUser.transactions.unshift(newTransaction);
    updateTransactionsList();
    updateAccountBalances(transactionAmount, 'Cheque Account (****-7831)');
    
    showNotification(`Transaction added successfully!`, 'success');
    closeModal('transactionModal');

}
function updateTransactionsList() {
    const transactionsList = document.querySelector('.transactions-list');
    if (!transactionsList) return;
    
    transactionsList.innerHTML = '';
    
    const recentTransactions = currentUser.transactions.slice(0, 5);
    
    recentTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transactionsList.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const iconClass = getTransactionIcon(transaction.category);
    const typeClass = transaction.type;
    const amountText = transaction.amount >= 0 ? `+R ${transaction.amount.toFixed(2)}` : `-R ${Math.abs(transaction.amount).toFixed(2)}`;
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon ${typeClass}">
                <i class="${iconClass}"></i>
            </div>
            <div class="transaction-details">
                <h4>${transaction.description}</h4>
                <span>${formatDate(transaction.date)}, ${transaction.time}</span>
            </div>
        </div>
        <div class="transaction-amount ${typeClass}">${amountText}</div>
    `;
    
    return div;
}

function getTransactionIcon(category) {
    const icons = {
        'Groceries': 'fas fa-shopping-cart',
        'Salary': 'fas fa-building',
        'Fuel': 'fas fa-gas-pump',
        'Utilities': 'fas fa-wifi',
        'Entertainment': 'fas fa-utensils',
        'Transfer': 'fas fa-exchange-alt',
        'Other': 'fas fa-receipt'
    };
    
    return icons[category] || 'fas fa-receipt';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

function updateAccountBalances(amount, accountIdentifier) {
    const chequeAccountCard = document.querySelector('.account-card.checking .account-balance');
    if (chequeAccountCard && accountIdentifier.includes('7831')) {
        currentUser.accounts[0].balance += amount;
        chequeAccountCard.textContent = `R ${currentUser.accounts[0].balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
    }
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1001;
        max-width: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        background-color: ${getNotificationColor(type)};
        color: white;
        padding: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle',
        'warning': 'fas fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10B981',
        'error': '#EF4444',
        'info': '#3B82F6',
        'warning': '#F59E0B'
    };
    return colors[type] || colors.info;
}

function initializeNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            this.classList.add('active');
            
            const page = this.textContent.trim();
            console.log(`Navigate to: ${page}`);
        });
    });
}

function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                showNotification('Logging out...', 'info');
                setTimeout(() => {
                    alert('You have been logged out successfully!');
                    location.reload();
                }, 1500);
            }
        });
    }
}

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0 5px;
        }
        
        .notification-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

function initializeQuickActions() {
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach(btn => {
        if (!btn.getAttribute('onclick')) {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span').textContent.trim();
                
                switch(action) {
                    case 'Buy Airtime':
                        showNotification('Airtime purchase feature coming soon!', 'info');
                        break;
                    case 'View Statement':
                        showNotification('Opening statement viewer...', 'info');
                        break;
                    case 'Account Settings':
                        showNotification('Account settings feature coming soon!', 'info');
                        break;
                    default:
                        console.log(`Action: ${action}`);
                }
            });
        }
    });
}

function initializeFormHandlers() {
    const transferForm = document.querySelector('#transferModal .modal-form');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }
    
    const billForm = document.querySelector('#billModal .modal-form');
    if (billForm) {
        billForm.addEventListener('submit', handleBillPayment);
    }
    
    const transactionForm = document.querySelector('#transactionModal .modal-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleAddTransaction);
    }
}

function updateDashboardTime() {
    const dashboardHeader = document.querySelector('.dashboard-header p');
    if (dashboardHeader) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-GB', options);
        dashboardHeader.textContent = `Today is ${dateString}. Here's your financial summary.`;
    }
}

function initializeDashboard() {
    console.log('Initializing MyBank SA Dashboard...');
    
    initializeNavigation();
    initializeLogout();
    initializeQuickActions();
    initializeFormHandlers();
    updateDashboardTime();
    addNotificationStyles();
    
    setTimeout(() => {
        showNotification(`Welcome back, ${currentUser.name}!`, 'success');
    }, 1000);
    
    console.log('Dashboard initialized successfully!');
}

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal,
        handleTransfer,
        handleBillPayment,
        handleAddTransaction,
        showNotification
    };
}