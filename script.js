const modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const storage = {
    get() {
        console.log(localStorage)
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction.all))
    },
}

const transaction = {

    all: storage.get(),

    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    remove(index) {
        transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        this.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        this.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        let total = 0
        total = this.incomes() + this.expenses()
        return total
    }

}

const dom = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = this.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        this.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {

        const cssClass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td> <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação"></td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(transaction.total())
    },

    clearTransactions() {
        this.transactionsContainer.innerHTML = ""
    }
}

const utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        }
    },

    formatDate() {
        console.log('formatar os dados')
    },

    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("preencha todos os campos")
        }
        console.log(description)
    },

    formatValues() {
        let { description, amount, date } = this.getValues()
        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            this.validateFields()
            const transactions = this.formatValues()
            transaction.add(transactions)
            this.clearFields()

            modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        transaction.all.forEach((transaction, index) => {
            dom.addTransaction(transaction, index)
            dom.updateBalance()
        })


    },
    reload() {
        dom.clearTransactions()
        storage.set(transaction)
        dom.updateBalance()
        App.init()
    },
}
App.init()






