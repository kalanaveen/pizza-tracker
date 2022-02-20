import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from './apiService';
import {CardWidget} from './CardWidget';

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51IkTYJSINlcHSX6mZoUvxTTnyEb2WeqwxSWWPTcZbsoAgK31ugUQ4IeX3cSn6OLe9mSCwCYU2jSS6cdvIDkWh2UG00u5Sv8tXl');
    let card = null

    const paymentType = document.querySelector('#paymentType');

    if (!paymentType) {
        return;
    }
    paymentType.addEventListener('change',  (e) => {
        if (e.target.value === 'card') {
            // display widget
            card = new CardWidget(stripe)
            card.mount()
            // mountWidget();
        } else {
            card.destroy();
        }
    })
    // ajax call 
    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {};
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }

            if (!card) {
                placeOrder(formObject);
                return;
            }
            
            const token = await card.createToken();
                formObject.stripeToken = token.id;
                placeOrder(formObject);
        })

    }

}