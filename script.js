const check = document.querySelector('#box')
check.addEventListener('change', () => {
    document.body.classList.toggle('dark')
})

const Modal = {
    modal() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finace:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem(
            'dev.finace:transactions',
            JSON.stringify(transactions) //
        )
    }
}

// Objeto com a soma dos valores de cada item (entrada, saida, total)
const Transaction = {
    // Lista de objetos com as informações dos cards
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                // pegando so as transações positivas
                income += transaction.amount // inserindo na variavel o valor total
            }
        })

        return income // retornando o valor para usalo
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                // pegando so as transações negativas
                expense += transaction.amount // inserindo na variavel o valor total
            }
        })

        return expense // retornando o valor para usalo
    },

    total() {
        return Transaction.incomes() + Transaction.expenses() // dimunuindo as despesas das entradas
    }
}

const DOM = {
    // pegando o tbody da tabela
    transactionsContainer: document.querySelector('#table-date tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr') // criando um novo elemento tr (linha da tabela)
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) // adicionando o template dinamico com a função criada abaixo, ultilizando o parametro a lista de objetos com as informações acima.

        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr) // adicionando o elemento ao tbody
    },

    // ========= criando template dinamico da tabela =============
    innerHTMLTransaction(transaction, index) {
        // se o valor adicionado for positivo sera adicionado a class "income"
        // se o valor adicionado for negativo sera adicionado a class "expense"
        // assim serão estilizadas conforme o resultado
        const CSSClass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount) // formatando o amount para brl

        const html = `
        <td class="description">${transaction.description}</td> 
        <td class="${CSSClass}">${amount}</td> 
        <td class="date">${transaction.date}</td> 
        <td>
            <img onclick="Transaction.remove(${index})"
                src="assets/minus.svg"
                alt="remover transação"
            />
        </td>
        `

        return html
    },

    // ========= atualizando o balanço ===========
    updateBalance() {
        // pegando pelo id e adicinando pelas funçoes do objeto Transaction
        document.querySelector('#incomeDisplay').innerHTML =
            Utils.formatCurrency(Transaction.incomes())
        document.querySelector('#expenseDisplay').innerHTML =
            Utils.formatCurrency(Transaction.expenses())
        document.querySelector('#totalDisplay').innerHTML =
            Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

// ========== formatando valores para brl =======
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        // se o numero for negativo, sera add o -
        // se for positivo não sera add nada
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '') // tirando qualquer caracter que não seja numero

        value = Number(value) / 100 // dividindo o valor por 100 para que fique com as casas decimais corretas (lembrando que as casas decimais devem estar todas juntas (500000 ex: cinco mil))

        //formatando para brl
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value // retornando o valor mais o sinal (se tiver)
    }
}

// formatando e enviando o formulario
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        // trim (retira os espaços vazios)
        if (
            description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === ''
        ) {
            throw new Error('Preencha todos os campos por favor')
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            // formatar dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulario
            Form.clearFields()
            // modal feche
            Modal.modal()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // ========== fazendo um loop em todas linhas criadas e add na tabela.
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        // atualizando o balanço
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
