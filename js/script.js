'use strict';
import { accounts } from './db.js';
/////////////////////////////////////////////////
const loginPage = document.querySelector('.loginPage');
const applayout = document.querySelector('.applayout');
const signIn = document.getElementById('signIn');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
/////////////////////////////////////////////////
let timer;
const displayDate = function () {
  let date = new Date();
  let year = date.getFullYear();
  let dateDay = date.getDate();
  let day = daysOfWeek[date.getDay()];
  let month = date.getMonth();
  return `${dateDay}/${month}/${year}  ${day.toUpperCase().slice(0, 3)}`;
};
const handleTimer = function () {
  let minute = 5;
  let seconds = 0;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    labelTimer.innerHTML =
      `${minute < 10 ? '0' : ''}${minute}:` +
      `${seconds < 10 ? '0' : ''}${seconds}`;

    if (seconds > 0) {
      seconds--;
    } else {
      seconds = 59;
      minute--;
    }

    if (minute < 0) {
      clearInterval(timer);
      logout();
    }
  }, 1000);
};
const logout = function () {
  containerApp.style.display = 'none';
  loginPage.style.display = 'none';
  applayout.style.display = 'flex';
  signIn.innerText = 'Sign In';
  labelTimer.innerHTML = '';
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
};

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

const updateUI = function (acc) {
  displayMovements(acc.movements);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

createUsernames(accounts);
///////////////////////////////////////

let currentAccount;
signIn.addEventListener('click', function () {
  loginPage.style.display = 'flex';
  applayout.style.display = 'none';
  labelTimer.innerHTML = handleTimer();
  if (signIn.innerText === 'Log Out') {
    logout();
  }
});
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    loginPage.style.display = 'none';
    signIn.innerText = 'Log Out';
    labelTimer.innerHTML = handleTimer();
    labelDate.innerHTML = displayDate();
    containerApp.style.display = 'block';
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    updateUI(currentAccount);
  }
});
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);

    logout();
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
