import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += action.payload;
      state.isLoading = false;
    },

    withdraw(state, action) {
      state.balance -= action.payload;
    },

    // We do this because the function only accepts action.payload and here we have action.payload.amount and action.payload.purpose. It is 1 of the disadvantages of having this opinated structure. So we prepare the data before it reaches the reducer. So now it will receive more than 1 arguement.

    requestLoan: {
      prepare(amount, purpose) {
        return { payload: { amount, purpose } };
      },

      reducer(state, action) {
        if (state.loan > 0) return state;

        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance = state.balance + action.payload.amount;
      },
    },

    payLoan(state) {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },

    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
});

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

// // Thunks is automatically provided in @reduxjs/toolkit, so this works
export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };
  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    // API call
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=USD`,
    );
    const data = await res.json();
    // console.log(data);

    const converted = Number((amount * data.rates.USD).toFixed(2));
    // console.log(converted);

    // Return action
    dispatch({ type: "account/deposit", payload: converted });
  };
}

// console.log(accountSlice);

export default accountSlice.reducer;
